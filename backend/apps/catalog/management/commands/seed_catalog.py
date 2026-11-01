"""
Load the shop's starter categories and products.

Safe to run again: it only adds what is missing. It never changes a category
or product the owner has already edited, and it adds a drawn picture only to
products that have no image yet.

Prices are not set here. Products get their pack sizes and prices in admin.
"""

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.catalog import artwork
from apps.catalog.models import Category, Product, ProductImage

CATEGORIES = [
    ("rice", "Rice", "Kacha, steam and sela rice"),
    ("oil-ghee", "Oil & Ghee", "Cooking oil and banaspati ghee"),
    ("anmol-revery", "Anmol Revery", "Anmol revery"),
    ("milk-cream", "Milk Cream", "Fresh milk cream"),
    ("desi-ghee", "Desi Ghee", "Pure desi ghee"),
    ("honey", "Honey", "Pure honey"),
    ("dry-fruits", "Dry Fruits", "Dry fruits"),
]

# (category slug, product name, picture, perishable, featured)
PRODUCTS = [
    ("rice", "Kianat Kacha", lambda: artwork.rice("#fbfaf4", seed=1), False, True),
    ("rice", "Steam Kianat 1121", lambda: artwork.rice("#f4ecd6", seed=2), False, False),
    ("rice", "Steam Kianat 1509", lambda: artwork.rice("#f1e6c9", seed=3), False, False),
    ("rice", "Short Grain Steam", lambda: artwork.rice("#f6efdc", seed=4), False, False),
    ("rice", "Kianat Adhwar", lambda: artwork.rice("#efe7d4", seed=5), False, False),
    ("rice", "Kianat Sela", lambda: artwork.rice("#e8c97a", seed=6), False, False),
    ("oil-ghee", "Dalda Oil", lambda: artwork.bottle("#e8b923"), False, True),
    ("oil-ghee", "Dalda Ghee", lambda: artwork.tin("#2f6b3a"), False, False),
    (
        "oil-ghee",
        "Mezan Classic Oil",
        lambda: artwork.bottle("#f0c419", cap="#b23a2b"),
        False,
        False,
    ),
    ("oil-ghee", "Mezan Classic Ghee", lambda: artwork.tin("#b23a2b"), False, False),
    ("anmol-revery", "Revery Regular", lambda: artwork.sweets("#c58a4e", seed=7), False, True),
    ("anmol-revery", "Revery Special", lambda: artwork.sweets("#9c5f2e", seed=8), False, False),
    ("milk-cream", "Milk Cream", artwork.cream_cup, True, True),
    ("desi-ghee", "Desi Ghee", lambda: artwork.jar("#f3d98a", lid="#c08a2e"), False, True),
    ("honey", "Honey", lambda: artwork.jar("#c97a12"), False, True),
]


class Command(BaseCommand):
    help = "Add the starter categories and products. Safe to run more than once."

    @transaction.atomic
    def handle(self, *args, **options):
        categories = {}
        for order, (slug, name, summary) in enumerate(CATEGORIES):
            categories[slug], created = Category.objects.get_or_create(
                slug=slug, defaults={"name": name, "summary": summary, "sort_order": order}
            )
            if created:
                self.stdout.write(f"Added category {name}")

        for order, (category_slug, name, draw, perishable, featured) in enumerate(PRODUCTS):
            product, created = Product.objects.get_or_create(
                slug=slugify(name),
                defaults={
                    "name": name,
                    "category": categories[category_slug],
                    "is_perishable": perishable,
                    "is_featured": featured,
                    "sort_order": order,
                },
            )
            if created:
                self.stdout.write(f"Added product {name}")
            if not product.images.exists():
                ProductImage.objects.create(
                    product=product,
                    image=ContentFile(artwork.to_jpeg(draw()), name=f"{product.slug}.jpg"),
                    alt_text=f"Picture of {name}",
                )

        self.stdout.write(self.style.SUCCESS("Catalog is ready."))
