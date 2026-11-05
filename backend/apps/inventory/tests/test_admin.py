import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse

from apps.catalog.models import ProductVariant
from apps.catalog.tests.factories import ProductVariantFactory
from apps.inventory.models import StockMovement

pytestmark = pytest.mark.django_db

ADD_URL = reverse("admin:inventory_stockmovement_add")


@pytest.fixture
def owner_client(client):
    user = get_user_model().objects.create_user(
        email="owner@example.com", password="x", is_staff=True
    )
    user.groups.add(Group.objects.get(name="Owner"))
    client.force_login(user)
    return client


@pytest.fixture
def rice():
    return ProductVariantFactory(stock_quantity=10)


def stock_of(variant):
    return ProductVariant.objects.get(pk=variant.pk).stock_quantity


def test_owner_records_a_delivery(owner_client, rice):
    response = owner_client.post(
        ADD_URL, {"variant": rice.pk, "reason": "received", "change": 30, "note": ""}
    )

    assert response.status_code == 302
    assert stock_of(rice) == 40
    movement = StockMovement.objects.get()
    assert movement.stock_after == 40
    assert movement.user.email == "owner@example.com"


def test_correction_needs_a_note(owner_client, rice):
    response = owner_client.post(
        ADD_URL, {"variant": rice.pk, "reason": "adjusted", "change": -2, "note": ""}
    )

    assert response.status_code == 200
    assert "Say why the count changed." in response.content.decode()
    assert stock_of(rice) == 10


def test_correction_cannot_go_below_zero(owner_client, rice):
    response = owner_client.post(
        ADD_URL, {"variant": rice.pk, "reason": "adjusted", "change": -11, "note": "x"}
    )

    assert "Only 10 in stock." in response.content.decode()
    assert stock_of(rice) == 10


def test_delivery_must_add_stock(owner_client, rice):
    response = owner_client.post(
        ADD_URL, {"variant": rice.pk, "reason": "received", "change": -1, "note": ""}
    )

    assert "A delivery must add at least 1." in response.content.decode()


def test_old_movements_cannot_be_edited_or_deleted(owner_client, rice):
    owner_client.post(ADD_URL, {"variant": rice.pk, "reason": "received", "change": 5})
    movement = StockMovement.objects.get()

    change = owner_client.post(
        reverse("admin:inventory_stockmovement_change", args=[movement.pk]), {"change": 999}
    )
    delete = owner_client.post(
        reverse("admin:inventory_stockmovement_delete", args=[movement.pk]), {"post": "yes"}
    )

    assert change.status_code == 403
    assert delete.status_code == 403
    assert StockMovement.objects.get().change == 5


def test_staff_group_can_add_stock_movements():
    staff = Group.objects.get(name="Staff")

    codenames = set(staff.permissions.values_list("codename", flat=True))
    assert {"view_stockmovement", "add_stockmovement"} <= codenames
    assert "change_stockmovement" not in codenames
    assert "delete_stockmovement" not in codenames
