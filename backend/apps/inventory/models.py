from django.conf import settings
from django.db import models


class StockMovement(models.Model):
    """
    One change to a pack size's stock: the append-only log behind every number.

    Rows are only ever added, through apps.inventory.services. Adding up the
    changes for a pack size explains its current stock ("where did 3 bags go?").
    The batch and order links arrive with T4.2 and the orders app.
    """

    class Reason(models.TextChoices):
        RECEIVED = "received", "Received"
        SOLD = "sold", "Sold"
        CANCELLED = "cancelled", "Order cancelled"
        RETURNED = "returned", "Returned"
        EXPIRED = "expired", "Expired or damaged"
        ADJUSTED = "adjusted", "Stock count correction"

    # PROTECT: a pack size with history cannot be deleted; untick "active" instead.
    variant = models.ForeignKey(
        "catalog.ProductVariant", on_delete=models.PROTECT, related_name="stock_movements"
    )
    change = models.IntegerField(help_text="Units added (positive) or taken away (negative).")
    reason = models.CharField(max_length=20, choices=Reason.choices)
    stock_after = models.PositiveIntegerField(help_text="The stock right after this change.")
    note = models.CharField(max_length=200, blank=True)
    # SET_NULL: removing a staff account keeps the history.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_movements",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [models.Index(fields=["variant", "-created_at"])]
        constraints = [
            models.CheckConstraint(condition=~models.Q(change=0), name="movement_change_not_zero"),
        ]

    def __str__(self):
        sign = "+" if self.change > 0 else ""
        return f"{self.variant} {sign}{self.change} ({self.get_reason_display()})"
