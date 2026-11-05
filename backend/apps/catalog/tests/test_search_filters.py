"""T3.4: search with typos, filters that combine, sorting and pages."""

from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from .factories import CategoryFactory, ProductFactory, ProductVariantFactory

pytestmark = pytest.mark.django_db

PRODUCTS = "/api/v1/products/"
SIZES = "/api/v1/pack-sizes/"


@pytest.fixture
def client():
    return APIClient()


def slugs(client, query=None):
    response = client.get(PRODUCTS, query or {})
    assert response.status_code == 200, response.json()
    return [p["slug"] for p in response.json()["results"]]


def pack(product, label, grams, price, stock=10, **extra):
    return ProductVariantFactory(
        product=product,
        label=label,
        weight_grams=grams,
        price=Decimal(price),
        stock_quantity=stock,
        **extra,
    )


@pytest.fixture
def shop():
    rice = CategoryFactory(name="Rice")
    honey_cat = CategoryFactory(name="Honey")
    basmati = ProductFactory(name="Kainat Basmati", category=rice, description="Long grain rice")
    sela = ProductFactory(name="Kainat Sela", category=rice, description="Golden parboiled rice")
    honey = ProductFactory(name="Sidr Honey", category=honey_cat, is_featured=True)
    pack(basmati, "1 kg", 1000, "450")
    pack(basmati, "5 kg", 5000, "2100", stock=0)
    pack(sela, "5 kg", 5000, "1900")
    pack(honey, "500 g", 500, "1200")
    return {"basmati": basmati, "sela": sela, "honey": honey}


def test_typo_and_correct_spelling_both_find_basmati(client, shop):
    assert slugs(client, {"q": "basmati"}) == ["kainat-basmati"]
    assert slugs(client, {"q": "basmti"}) == ["kainat-basmati"]
    assert slugs(client, {"q": "Basmti"}) == ["kainat-basmati"]


def test_search_finds_half_words_descriptions_and_plurals(client, shop):
    assert slugs(client, {"q": "basm"}) == ["kainat-basmati"]
    assert slugs(client, {"q": "golden"}) == ["kainat-sela"]
    assert "sidr-honey" in slugs(client, {"q": "honeys"})


def test_search_with_no_match_is_empty(client, shop):
    assert slugs(client, {"q": "biryani masala"}) == []


def test_best_match_comes_first(client, shop):
    # Both rice products say "rice"; only one has "Sela" in its name.
    assert slugs(client, {"q": "sela rice"})[0] == "kainat-sela"


def test_size_filter_takes_one_or_more_sizes(client, shop):
    assert slugs(client, {"size": "5 kg"}) == ["kainat-basmati", "kainat-sela"]
    assert slugs(client, {"size": ["500 g", "1 kg"]}) == ["sidr-honey", "kainat-basmati"]


def test_price_range(client, shop):
    assert slugs(client, {"max_price": "500"}) == ["kainat-basmati"]
    assert slugs(client, {"min_price": "1000", "max_price": "2000"}) == [
        "sidr-honey",
        "kainat-sela",
    ]


def test_in_stock(client, shop):
    pack(ProductFactory(name="Sold Out Ghee"), "1 kg", 1000, "900", stock=0)

    assert "sold-out-ghee" not in slugs(client, {"in_stock": "true"})
    assert "sold-out-ghee" in slugs(client)


def test_filters_combine_on_the_same_pack_size(client, shop):
    # Basmati's 5 kg is sold out, so "5 kg and in stock" leaves only Sela.
    assert slugs(client, {"size": "5 kg", "in_stock": "1"}) == ["kainat-sela"]
    # Basmati is under Rs 500 only as 1 kg, so "5 kg under 500" finds nothing.
    assert slugs(client, {"size": "5 kg", "max_price": "500"}) == []
    assert slugs(
        client, {"category": "rice", "q": "kainat", "max_price": "2000", "in_stock": "1"}
    ) == [
        "kainat-basmati",
        "kainat-sela",
    ]


def test_hidden_pack_sizes_do_not_count(client, shop):
    pack(shop["sela"], "10 kg", 10000, "3800", is_active=False)

    assert slugs(client, {"size": "10 kg"}) == []


def test_sorts(client, shop):
    # No pack sizes yet means no price yet ("Price coming soon").
    ProductFactory(name="New Desi Ghee")

    assert slugs(client, {"sort": "price_asc"}) == [
        "kainat-basmati",
        "sidr-honey",
        "kainat-sela",
        "new-desi-ghee",
    ]
    # Products with no price yet go last both ways.
    assert slugs(client, {"sort": "price_desc"}) == [
        "kainat-sela",
        "sidr-honey",
        "kainat-basmati",
        "new-desi-ghee",
    ]
    assert slugs(client, {"sort": "newest"})[0] == "new-desi-ghee"
    assert slugs(client, {"sort": "popular"})[0] == "sidr-honey"


def test_bad_values_get_a_400(client):
    for query in (
        {"sort": "cheapest"},
        {"min_price": "abc"},
        {"min_price": "900", "max_price": "100"},
    ):
        assert client.get(PRODUCTS, query).status_code == 400


def test_pages_of_24(client):
    for _ in range(25):
        ProductFactory()

    first = client.get(PRODUCTS).json()
    second = client.get(PRODUCTS, {"page": 2}).json()

    assert first["count"] == 25
    assert len(first["results"]) == 24
    assert first["next"] and not first["previous"]
    assert len(second["results"]) == 1


def test_pack_sizes_lightest_first(client, shop):
    assert client.get(SIZES).json() == ["500 g", "1 kg", "5 kg"]
    assert client.get(SIZES, {"category": "honey"}).json() == ["500 g"]
