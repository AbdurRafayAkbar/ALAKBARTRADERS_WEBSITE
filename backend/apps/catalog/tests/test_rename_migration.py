import importlib

import pytest
from django.apps import apps

from apps.catalog.models import Category, Product

from .factories import CategoryFactory, ProductFactory

pytestmark = pytest.mark.django_db

migration = importlib.import_module("apps.catalog.migrations.0002_rename_kianat_to_kainat")


def test_old_starter_names_are_renamed_with_their_slug():
    ProductFactory(name="Kianat Sela")

    migration.rename_kianat(apps, None)

    product = Product.objects.get()
    assert product.name == "Kainat Sela"
    assert product.slug == "kainat-sela"


def test_a_name_the_owner_changed_is_kept():
    ProductFactory(name="Kianat Sela Premium", slug="kianat-sela")

    migration.rename_kianat(apps, None)

    product = Product.objects.get()
    assert product.name == "Kianat Sela Premium"
    assert product.slug == "kianat-sela"


def test_revery_gets_its_description():
    CategoryFactory(name="Anmol Revery", slug="anmol-revery", summary="Anmol revery")

    migration.describe_revery(apps, None)

    category = Category.objects.get()
    assert category.summary == "Sesame sweets made with pure ghee and green cardamom"
