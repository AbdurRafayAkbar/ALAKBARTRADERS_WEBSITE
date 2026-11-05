from decimal import Decimal

import pytest
from django.core.files.base import ContentFile
from rest_framework.test import APIClient

from apps.catalog.management.commands.seed_catalog import SEED_IMAGES
from apps.catalog.models import ProductImage

from .factories import CategoryFactory, ProductFactory, ProductVariantFactory

pytestmark = pytest.mark.django_db

CATEGORIES = "/api/v1/categories/"
PRODUCTS = "/api/v1/products/"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture(autouse=True)
def media_in_tmp(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


def test_categories_list_only_active_ones_in_order(client):
    CategoryFactory(name="Honey", sort_order=2)
    CategoryFactory(name="Rice", sort_order=1, summary="Kacha and sela")
    CategoryFactory(name="Hidden", is_active=False)

    response = client.get(CATEGORIES)

    assert response.status_code == 200
    assert response.json() == [
        {"slug": "rice", "name": "Rice", "summary": "Kacha and sela"},
        {"slug": "honey", "name": "Honey", "summary": ""},
    ]


def test_hidden_category_is_not_found(client):
    CategoryFactory(name="Hidden", is_active=False)
    assert client.get(f"{CATEGORIES}hidden/").status_code == 404


def test_product_shows_prices_as_strings_and_stock_state(client):
    product = ProductFactory(name="Kainat Sela")
    ProductVariantFactory(product=product, label="1 kg", price=Decimal("450.00"), stock_quantity=3)
    ProductVariantFactory(
        product=product, label="5 kg", price=Decimal("2150.00"), stock_quantity=0, sort_order=1
    )
    ProductVariantFactory(product=product, label="10 kg", is_active=False)

    body = client.get(f"{PRODUCTS}kainat-sela/").json()

    assert body["category"] == product.category.slug
    assert [(v["label"], v["price"], v["stock_state"]) for v in body["variants"]] == [
        ("1 kg", "450.00", "low_stock"),
        ("5 kg", "2150.00", "out_of_stock"),
    ]
    assert "stock_quantity" not in body["variants"][0]


def test_product_without_pack_sizes_has_no_variants(client):
    ProductFactory(name="Honey")
    assert client.get(f"{PRODUCTS}honey/").json()["variants"] == []


def test_image_url_is_absolute(client):
    product = ProductFactory(name="Honey")
    ProductImage.objects.create(
        product=product,
        image=ContentFile((SEED_IMAGES / "honey.jpg").read_bytes(), name="honey.jpg"),
        alt_text="Picture of Honey",
    )

    images = client.get(f"{PRODUCTS}honey/").json()["images"]

    assert images[0]["url"].startswith("http://testserver/media/products/honey")
    assert images[0]["alt_text"] == "Picture of Honey"


def test_products_hide_inactive_products_and_products_in_hidden_categories(client):
    ProductFactory(name="Dalda Oil")
    ProductFactory(name="Old Oil", is_active=False)
    ProductFactory(name="Secret Oil", category=CategoryFactory(is_active=False))

    slugs = [p["slug"] for p in client.get(PRODUCTS).json()["results"]]

    assert slugs == ["dalda-oil"]
    assert client.get(f"{PRODUCTS}old-oil/").status_code == 404
    assert client.get(f"{PRODUCTS}secret-oil/").status_code == 404


def test_products_filter_by_category_search_and_featured(client):
    rice = CategoryFactory(name="Rice")
    ProductFactory(name="Kainat Kacha", category=rice, is_featured=True)
    ProductFactory(name="Kainat Sela", category=rice, description="Golden parboiled rice")
    ProductFactory(name="Honey", is_featured=True)

    def slugs(query):
        return [p["slug"] for p in client.get(PRODUCTS, query).json()["results"]]

    assert slugs({"category": "rice"}) == ["kainat-kacha", "kainat-sela"]
    assert slugs({"q": "golden"}) == ["kainat-sela"]
    assert slugs({"featured": "true"}) == ["honey", "kainat-kacha"]


def test_product_list_query_count_does_not_grow(client, django_assert_max_num_queries):
    for _ in range(5):
        ProductVariantFactory()
    # Count, products, pack sizes and pictures, plus the savepoint and release.
    with django_assert_max_num_queries(6):
        client.get(PRODUCTS)
