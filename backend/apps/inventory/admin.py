from django import forms
from django.contrib import admin

from . import services
from .models import StockMovement

Reason = StockMovement.Reason


class StockMovementForm(forms.ModelForm):
    """The owner's form: record a delivery or a shelf-count correction."""

    reason = forms.ChoiceField(
        choices=[(Reason.RECEIVED, "Received"), (Reason.ADJUSTED, "Stock count correction")]
    )

    class Meta:
        model = StockMovement
        fields = ["variant", "reason", "change", "note"]
        help_texts = {
            "change": "Received: how many arrived. Correction: + or - the difference.",
        }

    def clean(self):
        data = super().clean()
        variant, reason, change = data.get("variant"), data.get("reason"), data.get("change")
        if variant is None or change is None:
            return data
        if reason == Reason.RECEIVED and change <= 0:
            self.add_error("change", "A delivery must add at least 1.")
        if reason == Reason.ADJUSTED and not data.get("note", "").strip():
            self.add_error("note", "Say why the count changed.")
        if variant.stock_quantity + change < 0:
            self.add_error("change", f"Only {variant.stock_quantity} in stock.")
        return data


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    """The stock log. New rows go through the services; old rows never change."""

    form = StockMovementForm
    list_display = ["created_at", "variant", "change", "reason", "stock_after", "user", "note"]
    list_filter = ["reason", "variant__product__category"]
    search_fields = ["variant__sku", "variant__product__name", "note"]
    date_hierarchy = "created_at"
    list_select_related = ["variant__product", "user"]

    def save_model(self, request, obj, form, change):
        data = form.cleaned_data
        if data["reason"] == Reason.RECEIVED:
            movement = services.receive_stock(
                data["variant"], data["change"], user=request.user, note=data["note"]
            )
        else:
            movement = services.adjust_stock(
                data["variant"], data["change"], user=request.user, note=data["note"]
            )
        # Admin logs and redirects using obj, so point it at the saved row.
        obj.pk = movement.pk
        obj.stock_after = movement.stock_after
        obj.created_at = movement.created_at

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
