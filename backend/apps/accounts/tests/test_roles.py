import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser, Group
from rest_framework.response import Response
from rest_framework.test import APIClient, APIRequestFactory, force_authenticate
from rest_framework.views import APIView

from apps.accounts.permissions import IsOwner, IsStaff
from apps.accounts.selectors import user_role

pytestmark = pytest.mark.django_db

User = get_user_model()


def make_user(email, group=None, **extra):
    user = User.objects.create_user(email=email, password="Basmati-Sella-2026", **extra)
    if group:
        user.groups.add(Group.objects.get(name=group))
    return user


@pytest.fixture
def customer():
    return make_user("ali@example.com")


@pytest.fixture
def staff():
    return make_user("bilal@example.com", "Staff")


@pytest.fixture
def owner():
    return make_user("owner@example.com", "Owner")


# Stand-ins for the staff screens' API until the orders and stock apps exist.
class OrderQueueView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        return Response({"ok": True})


class SalesReportView(APIView):
    permission_classes = [IsOwner]

    def get(self, request):
        return Response({"ok": True})


def call(view, user):
    request = APIRequestFactory().get("/")
    if user:
        force_authenticate(request, user=user)
    return view.as_view()(request)


def test_migration_creates_both_groups():
    assert set(Group.objects.values_list("name", flat=True)) >= {"Owner", "Staff"}


def test_owner_can_edit_the_catalog_and_staff_cannot():
    owner_perms = Group.objects.get(name="Owner").permissions.values_list("codename", flat=True)
    assert {"change_product", "change_category", "change_user"} <= set(owner_perms)
    assert not Group.objects.get(name="Staff").permissions.exists()


def test_role_comes_from_the_group(customer, staff, owner):
    assert user_role(customer) == "customer"
    assert user_role(staff) == "staff"
    assert user_role(owner) == "owner"
    assert user_role(AnonymousUser()) == "customer"


def test_a_superuser_is_the_owner():
    boss = User.objects.create_superuser(email="boss@example.com", password="x")

    assert user_role(boss) == "owner"


def test_someone_in_both_groups_is_the_owner(staff):
    staff.groups.add(Group.objects.get(name="Owner"))

    assert user_role(staff) == "owner"


def test_a_guest_cannot_open_staff_screens():
    assert call(OrderQueueView, None).status_code in {401, 403}


def test_a_customer_gets_403_on_staff_screens(customer):
    response = call(OrderQueueView, customer)

    assert response.status_code == 403
    assert response.data["message"] == "Only shop staff can do this."


def test_staff_and_owner_open_staff_screens(staff, owner):
    assert call(OrderQueueView, staff).status_code == 200
    assert call(OrderQueueView, owner).status_code == 200


def test_staff_is_blocked_from_owner_only_screens(staff):
    assert call(SalesReportView, staff).status_code == 403


def test_owner_opens_owner_only_screens(owner):
    assert call(SalesReportView, owner).status_code == 200


def test_me_returns_the_role(staff):
    client = APIClient()
    client.force_login(staff)

    assert client.get("/api/v1/auth/me/").json()["role"] == "staff"
