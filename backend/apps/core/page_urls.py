"""
Customer page URLs. They mirror the React routes in frontend/src/routes/routes.tsx.

Each one returns the React app with that page's title and meta tags (shell.py).
Page URLs must not change once the site is live: Google ranks the URL.
"""

from django.urls import path, re_path

from . import shell

urlpatterns = [
    path("", shell.home, name="home"),
    path("shop/", shell.shop, name="shop"),
    path("c/<slug:slug>/", shell.category, name="category"),
    path("search/", shell.search, name="search"),
    path("p/<slug:slug>/", shell.product, name="product"),
    path("cart/", shell.cart, name="cart"),
    path("delivery-areas/", shell.delivery_areas, name="delivery-areas"),
    # Any other URL ending in a slash, except under /api/, which keeps its own 404.
    re_path(r"^(?!api/).+/$", shell.not_found),
]
