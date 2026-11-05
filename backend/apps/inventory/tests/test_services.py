import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import F

from apps.catalog.models import ProductVariant
from apps.catalog.tests.factories import ProductVariantFactory
from apps.inventory import services
from apps.inventory.exceptions import InsufficientStock, InvalidQuantity
from apps.inventory.models import StockMovement

pytestmark = pytest.mark.django_db

Reason = StockMovement.Reason


@pytest.fixture
def rice():
    return ProductVariantFactory(label="5 kg", stock_quantity=10)


@pytest.fixture
def owner():
    return get_user_model().objects.create_user(email="owner@example.com", password="x")


def stock_of(variant):
    return ProductVariant.objects.get(pk=variant.pk).stock_quantity


# receive_stock


def test_receive_stock_adds_and_writes_a_movement(rice, owner):
    movement = services.receive_stock(rice, 25, user=owner, note="Truck from Lahore")

    assert stock_of(rice) == 35
    assert movement.change == 25
    assert movement.reason == Reason.RECEIVED
    assert movement.stock_after == 35
    assert movement.user == owner
    assert movement.note == "Truck from Lahore"


def test_receive_stock_updates_the_object_passed_in(rice):
    services.receive_stock(rice, 5)

    assert rice.stock_quantity == 15


@pytest.mark.parametrize("quantity", [0, -3])
def test_receive_stock_refuses_zero_or_less(rice, quantity):
    with pytest.raises(InvalidQuantity):
        services.receive_stock(rice, quantity)

    assert stock_of(rice) == 10
    assert not StockMovement.objects.exists()


# deduct_stock


def test_deduct_stock_takes_away_and_records_a_sale(rice):
    movement = services.deduct_stock(rice, 4)

    assert stock_of(rice) == 6
    assert movement.change == -4
    assert movement.reason == Reason.SOLD
    assert movement.stock_after == 6


def test_deduct_stock_can_sell_the_last_unit(rice):
    services.deduct_stock(rice, 10)

    assert stock_of(rice) == 0


def test_deduct_stock_refuses_more_than_there_is(rice):
    with pytest.raises(InsufficientStock) as error:
        services.deduct_stock(rice, 11)

    assert error.value.available == 10
    assert error.value.requested == 11
    assert stock_of(rice) == 10
    assert not StockMovement.objects.exists()


def test_deduct_stock_checks_the_database_not_a_stale_object(rice):
    # Another request sold 8 bags after this object was loaded.
    ProductVariant.objects.filter(pk=rice.pk).update(stock_quantity=2)

    with pytest.raises(InsufficientStock):
        services.deduct_stock(rice, 5)


def test_deduct_stock_can_record_expired_stock(rice):
    movement = services.deduct_stock(rice, 2, reason=Reason.EXPIRED, note="Torn bags")

    assert movement.reason == Reason.EXPIRED
    assert stock_of(rice) == 8


def test_deduct_stock_refuses_a_reason_that_adds_stock(rice):
    with pytest.raises(ValueError):
        services.deduct_stock(rice, 1, reason=Reason.RECEIVED)


@pytest.mark.parametrize("quantity", [0, -1])
def test_deduct_stock_refuses_zero_or_less(rice, quantity):
    with pytest.raises(InvalidQuantity):
        services.deduct_stock(rice, quantity)


# restore_stock


@pytest.mark.parametrize("reason", [Reason.CANCELLED, Reason.RETURNED])
def test_restore_stock_puts_units_back(rice, reason):
    movement = services.restore_stock(rice, 3, reason=reason)

    assert stock_of(rice) == 13
    assert movement.change == 3
    assert movement.reason == reason


def test_restore_stock_refuses_other_reasons(rice):
    with pytest.raises(ValueError):
        services.restore_stock(rice, 3, reason=Reason.SOLD)


def test_restore_stock_refuses_zero_or_less(rice):
    with pytest.raises(InvalidQuantity):
        services.restore_stock(rice, 0, reason=Reason.CANCELLED)


# adjust_stock


def test_adjust_stock_up_after_a_count(rice, owner):
    movement = services.adjust_stock(rice, 2, user=owner, note="Count found 2 extra")

    assert stock_of(rice) == 12
    assert movement.reason == Reason.ADJUSTED
    assert movement.change == 2


def test_adjust_stock_down_after_a_count(rice, owner):
    services.adjust_stock(rice, -10, user=owner, note="Count found none")

    assert stock_of(rice) == 0


def test_adjust_stock_cannot_go_below_zero(rice, owner):
    with pytest.raises(InsufficientStock):
        services.adjust_stock(rice, -11, user=owner, note="Typo")

    assert stock_of(rice) == 10


def test_adjust_stock_needs_a_change(rice, owner):
    with pytest.raises(InvalidQuantity):
        services.adjust_stock(rice, 0, user=owner, note="Nothing")


def test_adjust_stock_needs_a_note(rice, owner):
    with pytest.raises(ValueError):
        services.adjust_stock(rice, 1, user=owner, note="  ")


# The log explains the number


def test_movements_add_up_to_the_stock(rice, owner):
    services.receive_stock(rice, 20)
    services.deduct_stock(rice, 7)
    services.restore_stock(rice, 2, reason=Reason.CANCELLED)
    services.adjust_stock(rice, -1, user=owner, note="One bag torn")

    total = sum(StockMovement.objects.filter(variant=rice).values_list("change", flat=True))
    assert 10 + total == stock_of(rice) == 24


def test_the_database_refuses_negative_stock(rice):
    # Even code that skips the services cannot store a negative number.
    with pytest.raises(IntegrityError), transaction.atomic():
        ProductVariant.objects.filter(pk=rice.pk).update(stock_quantity=F("stock_quantity") - 11)


def test_the_database_refuses_a_zero_movement(rice):
    with pytest.raises(IntegrityError), transaction.atomic():
        StockMovement.objects.create(variant=rice, change=0, reason=Reason.ADJUSTED, stock_after=10)
