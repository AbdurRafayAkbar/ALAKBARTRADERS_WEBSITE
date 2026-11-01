import pytest
from django.core.management import call_command

from apps.catalog.models import Category, Product, ProductImage

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def media_in_tmp(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


def test_seed_adds_categories_products_and_pictures():
    call_command("seed_catalog")

    assert Category.objects.count() == 7
    assert Product.objects.count() == 15
    assert ProductImage.objects.count() == 15
    assert Product.objects.get(slug="milk-cream").is_perishable
    assert not Category.objects.get(slug="dry-fruits").products.exists()


def test_seed_can_run_twice_and_keeps_owner_edits():
    call_command("seed_catalog")
    Product.objects.filter(slug="honey").update(name="Sidr Honey", is_active=False)

    call_command("seed_catalog")

    assert Product.objects.count() == 15
    assert ProductImage.objects.count() == 15
    honey = Product.objects.get(slug="honey")
    assert honey.name == "Sidr Honey"
    assert not honey.is_active
