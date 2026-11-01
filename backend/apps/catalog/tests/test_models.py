from decimal import Decimal

import pytest
from django.db import IntegrityError, transaction
from django.db.models import ProtectedError

from .factories import CategoryFactory, ProductFactory, ProductVariantFactory

pytestmark = pytest.mark.django_db


def test_slug_is_made_from_the_name():
    assert CategoryFactory(name="Oil & Ghee").slug == "oil-ghee"
    assert ProductFactory(name="Steam Kianat 1121").slug == "steam-kianat-1121"


def test_a_given_slug_is_kept():
    assert CategoryFactory(name="Rice", slug="chawal").slug == "chawal"


def test_category_slug_is_unique():
    CategoryFactory(name="Rice")
    with pytest.raises(IntegrityError):
        CategoryFactory(name="Rice")


def test_product_slug_is_unique():
    ProductFactory(name="Honey")
    with pytest.raises(IntegrityError):
        ProductFactory(name="Honey")


def test_category_with_products_cannot_be_deleted():
    product = ProductFactory()
    with pytest.raises(ProtectedError):
        product.category.delete()


def test_negative_price_is_rejected():
    with pytest.raises(IntegrityError):
        ProductVariantFactory(price=Decimal("-1.00"))


def test_compare_at_price_must_be_above_price():
    with transaction.atomic(), pytest.raises(IntegrityError):
        ProductVariantFactory(price=Decimal("500.00"), compare_at_price=Decimal("500.00"))
    variant = ProductVariantFactory(price=Decimal("500.00"), compare_at_price=Decimal("550.00"))
    assert variant.compare_at_price == Decimal("550.00")


def test_pack_label_is_unique_per_product():
    variant = ProductVariantFactory(label="5 kg")
    with pytest.raises(IntegrityError):
        ProductVariantFactory(product=variant.product, label="5 kg")
