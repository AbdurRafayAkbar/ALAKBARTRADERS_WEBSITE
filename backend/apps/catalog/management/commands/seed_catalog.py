"""
Load the shop's starter categories and products.

Safe to run again: it only adds what is missing. It never changes a category
or product the owner has already edited, and it adds a starter photo only to
products that have no image yet.

The starter photos live in apps/catalog/seed_images/ (free Unsplash photos,
see the README there). They are generic stand-ins until the owner uploads
real pack photos in admin. Run with --replace-images to swap the pictures an
earlier seed added for the current starter photos; images the owner uploaded
are never touched.

Prices are not set here. Products get their pack sizes and prices in admin.
"""

from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.catalog.models import Category, Product, ProductImage

SEED_IMAGES = Path(__file__).resolve().parents[2] / "seed_images"

CATEGORIES = [
    ("rice", "Rice", "Kacha, steam and sela rice"),
    ("oil-ghee", "Oil & Ghee", "Cooking oil and banaspati ghee"),
    ("anmol-rewari", "Anmol Rewari", "Sesame sweets made with pure ghee and green cardamom"),
    ("milk-cream", "Milk Cream", "Fresh milk cream"),
    ("desi-ghee", "Desi Ghee", "Pure desi ghee"),
    ("honey", "Honey", "Pure honey"),
    ("dry-fruits", "Dry Fruits", "Dry fruits"),
]

# (category slug, product name, perishable, featured)
# Each product's photo is seed_images/<product slug>.jpg.
PRODUCTS = [
    ("rice", "Kainat Kacha", False, True),
    ("rice", "Steam Kainat 1121", False, False),
    ("rice", "Steam Kainat 1509", False, False),
    ("rice", "Short Grain Steam", False, False),
    ("rice", "Kainat Adhwar", False, False),
    ("rice", "Kainat Sela", False, False),
    ("oil-ghee", "Dalda Oil", False, True),
    ("oil-ghee", "Dalda Ghee", False, False),
    ("oil-ghee", "Mezan Classic Oil", False, False),
    ("oil-ghee", "Mezan Classic Ghee", False, False),
    ("anmol-rewari", "Rewari Regular", False, True),
    ("anmol-rewari", "Rewari Special", False, False),
    ("milk-cream", "Milk Cream", True, True),
    ("desi-ghee", "Desi Ghee", False, True),
    ("honey", "Honey", False, True),
]


ALT_PREFIX = "Picture of "


def seed_alt_text(name):
    return f"{ALT_PREFIX}{name}"


def is_seed_image(image):
    # The seed gives each picture the alt text "Picture of <name>" and the
    # file name products/<slug of that name>.jpg (Django may add a suffix such
    # as honey_Ab12Cd.jpg). The name may be an older spelling of the product,
    # for example "Kianat Kacha" before it became "Kainat Kacha".
    if not image.alt_text.startswith(ALT_PREFIX):
        return False
    old_slug = slugify(image.alt_text.removeprefix(ALT_PREFIX))
    return bool(old_slug) and Path(image.image.name).name.startswith(old_slug)


class Command(BaseCommand):
    help = "Add the starter categories and products. Safe to run more than once."

    def add_arguments(self, parser):
        parser.add_argument(
            "--replace-images",
            action="store_true",
            help="Replace pictures an earlier seed added. Owner uploads are kept.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        categories = {}
        for order, (slug, name, summary) in enumerate(CATEGORIES):
            categories[slug], created = Category.objects.get_or_create(
                slug=slug, defaults={"name": name, "summary": summary, "sort_order": order}
            )
            if created:
                self.stdout.write(f"Added category {name}")

        for order, (category_slug, name, perishable, featured) in enumerate(PRODUCTS):
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

            if options["replace_images"]:
                for image in product.images.all():
                    if is_seed_image(image):
                        image.image.delete(save=False)
                        image.delete()
                        self.stdout.write(f"Removed old picture of {name}")

            if not product.images.exists():
                photo = (SEED_IMAGES / f"{product.slug}.jpg").read_bytes()
                ProductImage.objects.create(
                    product=product,
                    image=ContentFile(photo, name=f"{product.slug}.jpg"),
                    alt_text=seed_alt_text(name),
                )

        self.stdout.write(self.style.SUCCESS("Catalog is ready."))
