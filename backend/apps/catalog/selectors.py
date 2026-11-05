"""
Catalogue reads for the shop front.

Customers only see active categories, active products in active categories,
and active pack sizes. Admin sees everything.
"""

from django.contrib.postgres.search import (
    SearchQuery,
    SearchRank,
    SearchVector,
    TrigramWordSimilarity,
)
from django.db.models import Exists, F, OuterRef, Prefetch, Q, Subquery, Value

from .models import Category, Product, ProductImage, ProductVariant

# How alike a typed word and a word in the name must be (0 to 1). "basmti"
# against "Basmati" scores 0.5; unrelated words score under 0.2.
TYPO_THRESHOLD = 0.3

# Trigram matching looks at this many typed words at most.
MAX_WORDS = 5

SORTS = ["popular", "price_asc", "price_desc", "newest"]


def active_categories():
    return Category.objects.filter(is_active=True)


def pack_sizes(*, category=None):
    """The pack sizes on sale, lightest first, for the size filter."""
    variants = ProductVariant.objects.filter(
        is_active=True, product__is_active=True, product__category__is_active=True
    )
    if category:
        variants = variants.filter(product__category__slug=category)
    rows = variants.order_by(F("weight_grams").asc(nulls_last=True), "label").values_list(
        "label", flat=True
    )
    return list(dict.fromkeys(rows))


def active_products(
    *,
    category=None,
    q=None,
    featured=False,
    sizes=None,
    min_price=None,
    max_price=None,
    in_stock=False,
    sort=None,
):
    """
    The products a customer can see, searched, filtered and sorted.

    The size, price and stock filters apply to one pack size together:
    "5 kg, in stock, under Rs 2,000" needs a single pack size that is all
    three, not a 5 kg pack that is sold out plus a 1 kg pack that is cheap.
    """
    on_sale = ProductVariant.objects.filter(product=OuterRef("pk"), is_active=True)
    products = (
        Product.objects.filter(is_active=True, category__is_active=True)
        .select_related("category")
        .prefetch_related(
            Prefetch(
                "variants",
                queryset=ProductVariant.objects.filter(is_active=True).order_by(
                    "sort_order", "price"
                ),
            ),
            Prefetch("images", queryset=ProductImage.objects.order_by("sort_order", "id")),
        )
        # The cheapest priced pack size: the "from" price on the card and the price sort.
        .annotate(
            from_price=Subquery(
                on_sale.filter(price__isnull=False).order_by("price").values("price")[:1]
            )
        )
    )
    if category:
        products = products.filter(category__slug=category)
    if featured:
        products = products.filter(is_featured=True)

    wanted = on_sale
    if sizes:
        wanted = wanted.filter(label__in=sizes)
    if min_price is not None:
        wanted = wanted.filter(price__gte=min_price)
    if max_price is not None:
        wanted = wanted.filter(price__lte=max_price)
    if in_stock:
        wanted = wanted.filter(stock_quantity__gt=0)
    if wanted is not on_sale:
        products = products.filter(Exists(wanted))

    if q:
        products = _search(products, q)

    return _sort(products, sort, searching=bool(q))


def _search(products, q):
    """
    Full-text search on the name and description, plus a trigram match on the
    name so a typo ("basmti") or half a word ("basm") still finds the product.

    For the trigram match every typed word must look like a word in the name,
    so "biryani masala" does not match "Kainat Basmati" on shared letters.
    """
    vector = SearchVector("name", weight="A", config="english") + SearchVector(
        "description", weight="B", config="english"
    )
    query = SearchQuery(q, search_type="websearch", config="english")
    words = q.split()[:MAX_WORDS]
    likeness = {
        f"likeness_{i}": TrigramWordSimilarity(word, "name") for i, word in enumerate(words)
    }
    every_word_alike = Q(**{f"{name}__gte": TYPO_THRESHOLD for name in likeness})
    # Filter on the match itself (@@), not rank > 0: ts_rank gives a tiny
    # non-zero number (1e-20) even when nothing matches.
    return (
        products.annotate(search=vector, rank=SearchRank(vector, query), **likeness)
        .filter(Q(search=query) | every_word_alike | Q(name__icontains=q))
        .annotate(likeness=sum((F(name) for name in likeness), Value(0.0)))
    )


def _sort(products, sort, *, searching):
    if sort == "price_asc":
        return products.order_by(F("from_price").asc(nulls_last=True), "name")
    if sort == "price_desc":
        return products.order_by(F("from_price").desc(nulls_last=True), "name")
    if sort == "newest":
        return products.order_by("-created_at", "name")
    if searching and sort is None:
        # Best match first when the customer picked no sort.
        return products.order_by("-rank", "-likeness", "name")
    # "Popular" until there are sales to count: home-page picks first, then
    # the owner's order from admin.
    return products.order_by("-is_featured", "sort_order", "name")
