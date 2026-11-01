"""
Catalogue reads for the shop front.

Customers only see active categories, active products in active categories,
and active pack sizes. Admin sees everything.
"""

from django.db.models import Prefetch, Q

from .models import Category, Product, ProductImage, ProductVariant


def active_categories():
    return Category.objects.filter(is_active=True)


def active_products(*, category=None, q=None, featured=False):
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
    )
    if category:
        products = products.filter(category__slug=category)
    if q:
        products = products.filter(Q(name__icontains=q) | Q(description__icontains=q))
    if featured:
        products = products.filter(is_featured=True)
    return products
