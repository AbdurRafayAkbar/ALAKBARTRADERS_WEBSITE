from django.contrib import admin
from django.shortcuts import redirect

from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = [
        (
            "Delivery and payment",
            {"fields": ["free_shipping_threshold", "max_cod_order_value"]},
        ),
        (
            "Stock and orders",
            {"fields": ["cream_expiry_cutoff_days", "pending_order_timeout_hours"]},
        ),
        (
            "Store contact",
            {"fields": ["store_name", "store_phone", "store_email", "store_address"]},
        ),
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        # A list of one row is pointless: open the row itself.
        settings = SiteSettings.load()
        return redirect("admin:core_sitesettings_change", settings.pk)
