import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.accounts.api.serializers import MAX_ADDRESSES
from apps.accounts.models import Address

pytestmark = pytest.mark.django_db

User = get_user_model()
PASSWORD = "Basmati-Sella-2026"
ADDRESSES = "/api/v1/account/addresses/"
PROFILE = "/api/v1/account/profile/"

HOME = {
    "full_name": "Ali Khan",
    "phone": "0300 1234567",
    "house_number": "House#999",
    "block": "CAT-V",
    "colony": "Chashma Colony",
}


@pytest.fixture(autouse=True)
def clear_throttle_counts():
    cache.clear()
    yield
    cache.clear()


class Browser:
    """An APIClient that checks CSRF and sends the token on every write."""

    def __init__(self, user=None):
        self.client = APIClient(enforce_csrf_checks=True)
        if user is not None:
            self.client.force_login(user)
        self.client.get("/api/v1/auth/csrf/")

    def _token(self):
        return {"HTTP_X_CSRFTOKEN": self.client.cookies["csrftoken"].value}

    def get(self, path):
        return self.client.get(path)

    def post(self, path, data):
        return self.client.post(path, data, format="json", **self._token())

    def patch(self, path, data):
        return self.client.patch(path, data, format="json", **self._token())

    def delete(self, path):
        return self.client.delete(path, **self._token())


@pytest.fixture
def ali():
    return User.objects.create_user(email="ali@example.com", password=PASSWORD, first_name="Ali")


@pytest.fixture
def sara():
    return User.objects.create_user(email="sara@example.com", password=PASSWORD)


@pytest.fixture
def browser(ali):
    return Browser(ali)


def add(user, **fields):
    return Address.objects.create(user=user, **{**HOME, "phone": "03001234567", **fields})


# Addresses


def test_guest_cannot_list_addresses():
    response = Browser().get(ADDRESSES)

    assert response.status_code == 403


def test_create_address_normalizes_phone_and_makes_first_default(browser, ali):
    response = browser.post(ADDRESSES, HOME)

    assert response.status_code == 201
    body = response.json()
    assert body["phone"] == "03001234567"
    assert body["is_default"] is True
    assert body["house_name"] == ""
    assert Address.objects.get().user == ali


def test_create_address_rejects_bad_phone(browser):
    response = browser.post(ADDRESSES, {**HOME, "phone": "12345"})

    assert response.status_code == 400
    assert response.json()["code"] == "validation_error"
    assert "phone" in response.json()["fields"]


def test_create_address_requires_house_block_and_colony(browser):
    response = browser.post(ADDRESSES, {"full_name": "Ali", "phone": "03001234567"})

    assert response.status_code == 400
    assert set(response.json()["fields"]) >= {"house_number", "block", "colony"}


def test_list_shows_only_own_addresses(browser, ali, sara):
    mine = add(ali)
    add(sara, colony="Other Colony")

    response = browser.get(ADDRESSES)

    assert response.status_code == 200
    assert [row["id"] for row in response.json()] == [mine.id]


@pytest.mark.parametrize("method", ["get", "patch", "delete"])
def test_other_users_address_is_not_found(browser, sara, method):
    theirs = add(sara)
    path = f"{ADDRESSES}{theirs.id}/"

    if method == "patch":
        response = browser.patch(path, {"colony": "Hacked"})
    else:
        response = getattr(browser, method)(path)

    assert response.status_code == 404
    theirs.refresh_from_db()
    assert theirs.colony == HOME["colony"]


def test_edit_address(browser, ali):
    address = add(ali)

    response = browser.patch(f"{ADDRESSES}{address.id}/", {"landmark": "Near the mosque"})

    assert response.status_code == 200
    address.refresh_from_db()
    assert address.landmark == "Near the mosque"


def test_put_is_not_allowed(browser, ali):
    address = add(ali)
    path = f"{ADDRESSES}{address.id}/"
    token = browser.client.cookies["csrftoken"].value

    response = browser.client.put(path, HOME, format="json", HTTP_X_CSRFTOKEN=token)

    assert response.status_code == 405


def test_setting_default_clears_the_old_one(browser, ali):
    first = add(ali, is_default=True)
    second = add(ali, colony="Second Colony")

    response = browser.patch(f"{ADDRESSES}{second.id}/", {"is_default": True})

    assert response.status_code == 200
    first.refresh_from_db()
    second.refresh_from_db()
    assert (first.is_default, second.is_default) == (False, True)


def test_new_default_on_create_clears_the_old_one(browser, ali):
    first = add(ali, is_default=True)

    browser.post(ADDRESSES, {**HOME, "colony": "New Colony", "is_default": True})

    first.refresh_from_db()
    assert first.is_default is False
    assert ali.addresses.filter(is_default=True).count() == 1


def test_default_cannot_be_switched_off_directly(browser, ali):
    address = add(ali, is_default=True)

    browser.patch(f"{ADDRESSES}{address.id}/", {"is_default": False})

    address.refresh_from_db()
    assert address.is_default is True


def test_deleting_default_promotes_newest(browser, ali):
    default = add(ali, is_default=True)
    add(ali, colony="Older")
    newest = add(ali, colony="Newest")

    response = browser.delete(f"{ADDRESSES}{default.id}/")

    assert response.status_code == 204
    newest.refresh_from_db()
    assert newest.is_default is True


def test_address_limit(browser, ali):
    for i in range(MAX_ADDRESSES):
        add(ali, colony=f"Colony {i}", is_default=i == 0)

    response = browser.post(ADDRESSES, HOME)

    assert response.status_code == 400
    assert ali.addresses.count() == MAX_ADDRESSES


# Profile


def test_guest_cannot_see_profile():
    assert Browser().get(PROFILE).status_code == 403


def test_profile_shows_own_details(browser):
    body = browser.get(PROFILE).json()

    assert body["email"] == "ali@example.com"
    assert body["first_name"] == "Ali"


def test_profile_edit_normalizes_phone_and_keeps_email(browser, ali):
    response = browser.patch(
        PROFILE,
        {"first_name": "Ali", "last_name": "Khan", "phone": "+92 300 1234567", "email": "x@y.com"},
    )

    assert response.status_code == 200
    ali.refresh_from_db()
    assert (ali.last_name, ali.phone, ali.email) == ("Khan", "03001234567", "ali@example.com")


def test_profile_rejects_bad_phone(browser):
    response = browser.patch(PROFILE, {"phone": "0300"})

    assert response.status_code == 400
    assert "phone" in response.json()["fields"]


def test_profile_phone_can_be_cleared(browser, ali):
    ali.phone = "03001234567"
    ali.save()

    response = browser.patch(PROFILE, {"phone": ""})

    assert response.status_code == 200
    ali.refresh_from_db()
    assert ali.phone == ""
