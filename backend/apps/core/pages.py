"""
What each customer page URL tells Google before React runs (design.md §8.1).

The title, heading and text here must match what the React page shows. Google
treats different content for crawlers and people as cloaking.
"""

from dataclasses import dataclass

from apps.catalog import selectors

# Same values as frontend/src/config/site.ts.
SITE_NAME = "ALAKBARTRADERS"
CITY = "Chashma"

DEFAULT_DESCRIPTION = (
    f"Order rice, oil and ghee, milk cream, desi ghee and honey online in {CITY}. "
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
            return f"{SITE_NAME} | Rice, ghee, cream and honey in {CITY}"
        return f"{self.title} | {SITE_NAME}"


HOME = Page(
    title="",
    heading="Fresh from the farm. Ready for your table.",
    text=(
        f"Rice, oil and ghee, fresh milk cream, desi ghee and honey, delivered in {CITY}. "
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

# Account pages: nothing here for Google to show, so all are noindex.
LOGIN = Page(
    title="Log in",
    heading="Log in",
    text="No account? You can still order as a guest.",
    index=False,
)
SIGNUP = Page(
    title="Create an account",
    heading="Create an account",
    text="An account is optional. You can still order as a guest.",
    index=False,
)
PASSWORD_RESET = Page(
    title="Reset your password",
    heading="Reset your password",
    text="Enter the email you signed up with. We will email you a link to choose a new password.",
    index=False,
)
PASSWORD_RESET_CONFIRM = Page(
    title="Choose a new password",
    heading="Choose a new password",
    index=False,
)
PROFILE = Page(title="Your account", heading="Your account", index=False)
ADDRESSES = Page(
    title="Saved addresses",
    heading="Saved addresses",
    text="Save the places we deliver to, so checkout fills them in for you.",
    index=False,
)

NOT_FOUND = Page(
    title="Page not found",
    heading="This page does not exist",
    text="The link may be old, or the product is no longer sold.",
    index=False,
    status=404,
)


# Categories and products come from the database, so the owner can add one in
# admin without a code change. Hidden ones get the 404 page, like the API.
def category_page(slug):
    category = selectors.active_categories().filter(slug=slug).first()
    if category is None:
        return NOT_FOUND
    lead = category.summary or category.name
    description = f"{lead.rstrip('.')}. {DEFAULT_DESCRIPTION}"
    return Page(
        title=category.name, heading=category.name, text=category.summary, description=description
    )


def search_page(query):
    # Google asks shops not to let their search result pages into its index.
    title = f'Results for "{query}"' if query else "Search"
    return Page(title=title, heading=title, index=False)


def product_page(slug):
    product = selectors.active_products().filter(slug=slug).first()
    if product is None:
        return NOT_FOUND
    text = product.description
    description = (
        f"{text} {DEFAULT_DESCRIPTION}" if text else f"{product.name}. {DEFAULT_DESCRIPTION}"
    )
    return Page(title=product.name, heading=product.name, text=text, description=description)
