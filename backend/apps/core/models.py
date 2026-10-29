from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class TimeStampedModel(models.Model):
    """Adds created_at and updated_at to any model that inherits from it."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SiteSettings(TimeStampedModel):
    """
    Shop-wide settings the owner edits in the admin, without a deploy.

    There is only ever one row (pk=1). Read it with SiteSettings.load().
    """

    SINGLETON_PK = 1

    free_shipping_threshold = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Orders at or above this subtotal (PKR) ship free. Empty means never free.",
    )
    max_cod_order_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Largest order total (PKR) accepted for cash on delivery. Empty means no limit.",
    )
    cream_expiry_cutoff_days = models.PositiveSmallIntegerField(
        default=2,
        help_text="Cream batches expiring within this many days are no longer sold.",
    )
    pending_order_timeout_hours = models.PositiveSmallIntegerField(
        default=24,
        help_text="Unconfirmed orders are flagged after this many hours.",
    )
    store_name = models.CharField(max_length=100, default="ALAKBARTRADERS")
    store_phone = models.CharField(max_length=20, blank=True)
    store_email = models.EmailField(blank=True)
    store_address = models.TextField(blank=True)

    class Meta:
        verbose_name = "site settings"
        verbose_name_plural = "site settings"
        constraints = [
            # Second safety net: the database refuses a second row.
            models.CheckConstraint(condition=models.Q(pk=1), name="site_settings_single_row"),
        ]

    def __str__(self):
        return "Site settings"

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        if self.created_at is None:
            # A fresh SiteSettings() would otherwise blank created_at on the existing row.
            self.created_at = (
                type(self).objects.filter(pk=self.pk).values_list("created_at", flat=True).first()
            )
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK)
        return obj
