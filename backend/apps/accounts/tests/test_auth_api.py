import re

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.cache import cache
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

User = get_user_model()
PASSWORD = "Basmati-Sella-2026"


@pytest.fixture(autouse=True)
def clear_throttle_counts():
    # The rate limits count requests in the cache; start every test at zero.
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api():
    """A client that checks CSRF like a real browser does."""
    client = APIClient(enforce_csrf_checks=True)
    client.get("/api/v1/auth/csrf/")
    return client


def post(api, path, data=None):
    # login() rotates the token, so read the cookie fresh on every request.
    token = api.cookies["csrftoken"].value
    return api.post(f"/api/v1/auth/{path}", data or {}, format="json", HTTP_X_CSRFTOKEN=token)


@pytest.fixture
def user():
    return User.objects.create_user(email="ali@example.com", password=PASSWORD, first_name="Ali")


# Signup


def test_signup_creates_user_and_logs_in(api):
    response = post(
        api, "signup/", {"email": "Sara@Example.com", "password": PASSWORD, "phone": "03001234567"}
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "Sara@example.com"
    assert body["phone"] == "03001234567"
    assert "password" not in body
    assert api.get("/api/v1/auth/me/").json()["email"] == "Sara@example.com"


def test_signup_stores_a_hash_not_the_password(api):
    post(api, "signup/", {"email": "sara@example.com", "password": PASSWORD})

    user = User.objects.get(email="sara@example.com")
    assert user.password != PASSWORD
    assert user.check_password(PASSWORD)


def test_signup_refuses_an_email_in_use_in_any_case(api, user):
    response = post(api, "signup/", {"email": "ALI@example.com", "password": PASSWORD})

    assert response.status_code == 400
    assert response.json()["fields"]["email"] == ["An account with this email already exists."]


def test_signup_refuses_a_weak_password(api):
    response = post(api, "signup/", {"email": "sara@example.com", "password": "12345678"})

    assert response.status_code == 400
    assert response.json()["code"] == "validation_error"
    assert "password" in response.json()["fields"]
    assert not User.objects.filter(email="sara@example.com").exists()


def test_signup_without_csrf_token_is_refused():
    api = APIClient(enforce_csrf_checks=True)

    response = api.post(
        "/api/v1/auth/signup/", {"email": "sara@example.com", "password": PASSWORD}, format="json"
    )

    assert response.status_code == 403
    assert not User.objects.exists()


# Login, me, logout


def test_me_is_204_for_a_guest(api):
    response = api.get("/api/v1/auth/me/")

    assert response.status_code == 204


def test_login_starts_a_session(api, user):
    response = post(api, "login/", {"email": "ALI@example.com", "password": PASSWORD})

    assert response.status_code == 200
    assert response.json() == {
        "id": user.pk,
        "email": "ali@example.com",
        "first_name": "Ali",
        "last_name": "",
        "phone": "",
    }
    assert api.get("/api/v1/auth/me/").json()["id"] == user.pk


def test_login_with_wrong_password_gives_one_message(api, user):
    response = post(api, "login/", {"email": "ali@example.com", "password": "wrong"})

    assert response.status_code == 400
    assert response.json() == {
        "code": "validation_error",
        "message": "Email or password is wrong.",
        "fields": {},
    }


def test_login_with_unknown_email_gives_the_same_message(api):
    response = post(api, "login/", {"email": "nobody@example.com", "password": PASSWORD})

    assert response.json()["message"] == "Email or password is wrong."


def test_login_refuses_an_inactive_user(api, user):
    user.is_active = False
    user.save()

    response = post(api, "login/", {"email": "ali@example.com", "password": PASSWORD})

    assert response.status_code == 400


def test_login_is_rate_limited(api, user):
    for _ in range(5):
        post(api, "login/", {"email": "ali@example.com", "password": "wrong"})

    response = post(api, "login/", {"email": "ali@example.com", "password": PASSWORD})

    assert response.status_code == 429
    assert response.json()["code"] == "throttled"


def test_logout_ends_the_session(api, user):
    post(api, "login/", {"email": "ali@example.com", "password": PASSWORD})

    response = post(api, "logout/")

    assert response.status_code == 204
    assert api.get("/api/v1/auth/me/").status_code == 204


def test_logout_as_guest_is_fine(api):
    assert post(api, "logout/").status_code == 204


# Password reset


def test_reset_request_emails_a_link(api, user):
    response = post(api, "password-reset/", {"email": "ALI@example.com"})

    assert response.status_code == 204
    assert len(mail.outbox) == 1
    message = mail.outbox[0]
    assert message.to == ["ali@example.com"]
    assert re.search(r"/accounts/password-reset/[\w-]+/[\w-]+/", message.body)


def test_reset_request_for_unknown_email_looks_the_same(api):
    response = post(api, "password-reset/", {"email": "nobody@example.com"})

    assert response.status_code == 204
    assert mail.outbox == []


def test_reset_link_uses_site_url(api, user, settings):
    settings.SITE_URL = "https://shop.example"

    post(api, "password-reset/", {"email": "ali@example.com"})

    assert "https://shop.example/accounts/password-reset/" in mail.outbox[0].body


def reset_data(user, password="New-Kainat-Rice-9"):
    return {
        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
        "token": default_token_generator.make_token(user),
        "password": password,
    }


def test_reset_confirm_sets_the_new_password(api, user):
    response = post(api, "password-reset/confirm/", reset_data(user))

    assert response.status_code == 204
    user.refresh_from_db()
    assert user.check_password("New-Kainat-Rice-9")


def test_reset_link_works_only_once(api, user):
    data = reset_data(user)
    post(api, "password-reset/confirm/", data)

    response = post(api, "password-reset/confirm/", {**data, "password": "Other-Pass-777"})

    assert response.status_code == 400
    assert response.json()["message"].startswith("This reset link is wrong or has expired.")


def test_reset_confirm_refuses_a_bad_token(api, user):
    response = post(api, "password-reset/confirm/", {**reset_data(user), "token": "nope"})

    assert response.status_code == 400
    user.refresh_from_db()
    assert user.check_password(PASSWORD)


def test_reset_confirm_refuses_a_bad_uid(api, user):
    response = post(api, "password-reset/confirm/", {**reset_data(user), "uid": "!!"})

    assert response.status_code == 400


def test_reset_confirm_refuses_a_weak_password(api, user):
    response = post(api, "password-reset/confirm/", reset_data(user, password="12345678"))

    assert response.status_code == 400
    assert "password" in response.json()["fields"]
