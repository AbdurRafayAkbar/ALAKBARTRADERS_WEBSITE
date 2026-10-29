"""
What each customer page URL tells Google before React runs (design.md §8.1).

The title, heading and text here must match what the React page shows. Google
treats different content for crawlers and people as cloaking.
"""

from dataclasses import dataclass

# Same values as frontend/src/config/site.ts.
SITE_NAME = "ALAKBARTRADERS"
CITY = "Chashma"

# Same as frontend/src/api/mock/data.ts until the catalog app exists (T3.1).
# TODO(T3.3): read the Category table instead, so new categories need no code change.
CATEGORIES = {
    "rice": ("Rice", "Basmati, Sella and everyday rice, cleaned and packed in the shop."),
    "dry-fruits": ("Dry fruits", "Almonds, cashews, pistachios and walnuts, sold by weight."),
    "milk-cream": ("Milk cream", "Fresh dairy cream from dated batches. Delivered chilled."),
}

DEFAULT_DESCRIPTION = (
    f"Order rice, dry fruits and fresh milk cream online in {CITY}. "
    "Pay cash on delivery. Our own riders deliver to your door."
)


@dataclass(frozen=True)
class Page:
    title: str  # Empty on the home page, which has its own full title.
    heading: str
    text: str = ""
    description: str = DEFAULT_DESCRIPTION
    # False for pages that should stay out of Google (cart, search results, 404).
    index: bool = True
    status: int = 200

    @property
    def full_title(self):
        if not self.title:
            return f"{SITE_NAME} | Rice, dry fruits and fresh cream in {CITY}"
        return f"{self.title} | {SITE_NAME}"


HOME = Page(
    title="",
    heading="Fresh from the farm. Ready for your table.",
    text=(
        f"Basmati rice, dry fruits and fresh milk cream, delivered in {CITY}. "
        "Order online and pay cash when it arrives."
    ),
)

SHOP = Page(title="All products", heading="All products")

DELIVERY_AREAS = Page(
    title="Delivery areas and fees",
    heading="Delivery areas and fees",
    text=(
        f"Our own riders deliver across {CITY}. Orders placed before 5 pm arrive the same "
        "day in town. Later orders arrive the next morning."
    ),
    description=f"Where we deliver in {CITY}, the fee for each area, and when your order arrives.",
)

CART = Page(title="Your cart", heading="Your cart", index=False)

NOT_FOUND = Page(
    title="Page not found",
    heading="This page does not exist",
    text="The link may be old, or the product is no longer sold.",
    index=False,
    status=404,
)


def category_page(slug):
    if slug not in CATEGORIES:
        return NOT_FOUND
    name, summary = CATEGORIES[slug]
    description = f"{summary} {DEFAULT_DESCRIPTION}"
    return Page(title=name, heading=name, text=summary, description=description)


def search_page(query):
    # Google asks shops not to let their search result pages into its index.
    title = f'Results for "{query}"' if query else "Search"
    return Page(title=title, heading=title, index=False)


def product_page(slug):
    # TODO(T3.3): look the product up, return NOT_FOUND for unknown or inactive
    # slugs, and fill in its name, price and description. Until then the page
    # stays out of Google, because it has no product content to show.
    return Page(title="Product", heading="Product", index=False)
