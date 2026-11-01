from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


class SluggedModel(TimeStampedModel):
    """A name, a unique URL slug made from it, and an on/off switch."""

    name = models.CharField(max_length=120)
    slug = models.SlugField(
        max_length=140,
        unique=True,
        blank=True,
        help_text="Part of the page address. Filled in from the name when left empty.",
    )
    # Deactivate instead of deleting, so past orders keep their links (rules.md).
    is_active = models.BooleanField(default=True, help_text="Untick to hide it from the shop.")
    sort_order = models.PositiveSmallIntegerField(default=0, help_text="Lower numbers show first.")

    class Meta:
        abstract = True
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Category(SluggedModel):
    """A shop section, e.g. Rice or Oil & Ghee. One level deep for now."""

    parent = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="children",
    )
    summary = models.CharField(max_length=200, blank=True, help_text="One line for the shop page.")

    class Meta(SluggedModel.Meta):
        verbose_name_plural = "categories"


class Product(SluggedModel):
    """One item the shop sells. Its pack sizes and prices are its variants."""

    # PROTECT: a category that still has products cannot be deleted by mistake.
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    description = models.TextField(blank=True)
    is_perishable = models.BooleanField(
        default=False, help_text="Tick for items that expire, like milk cream."
    )
    is_featured = models.BooleanField(default=False, help_text="Tick to show it on the home page.")


class ProductVariant(TimeStampedModel):
    """One pack size of a product, with its own SKU, price and stock."""

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    label = models.CharField(max_length=50, help_text='What the customer picks, e.g. "5 kg".')
    weight_grams = models.PositiveIntegerField(null=True, blank=True)
    sku = models.CharField("SKU", max_length=40, unique=True)
    price = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))]
    )
    compare_at_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Old price shown crossed out. Must be higher than the price.",
    )
    stock_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True, help_text="Untick to stop selling this size.")
    sort_order = models.PositiveSmallIntegerField(default=0, help_text="Lower numbers show first.")

    class Meta:
        ordering = ["sort_order", "id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(price__gte=0), name="variant_price_not_negative"
            ),
            models.CheckConstraint(
                condition=models.Q(compare_at_price__isnull=True)
                | models.Q(compare_at_price__gt=models.F("price")),
                name="variant_compare_at_above_price",
            ),
            models.UniqueConstraint(
                fields=["product", "label"], name="variant_label_unique_per_product"
            ),
        ]

    def __str__(self):
        return f"{self.product.name} {self.label}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt_text = models.CharField(
        max_length=200, help_text="Describe the photo for screen readers and search engines."
    )
    sort_order = models.PositiveSmallIntegerField(
        default=0, help_text="The first image is the cover."
    )

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.alt_text
