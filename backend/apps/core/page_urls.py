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
    path("accounts/login/", shell.login, name="login"),
    path("accounts/signup/", shell.signup, name="signup"),
    path("accounts/password-reset/", shell.password_reset, name="password-reset"),
    path(
        "accounts/password-reset/<str:uid>/<str:token>/",
        shell.password_reset_confirm,
        name="password-reset-confirm",
    ),
    path("account/", shell.profile, name="profile"),
    path("account/addresses/", shell.addresses, name="addresses"),
    # Any other URL ending in a slash, except under /api/, which keeps its own 404.
    re_path(r"^(?!api/).+/$", shell.not_found),
]
