from django.contrib import admin

from .models import Category, Product, ProductImage, ProductVariant


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "parent", "sort_order", "is_active"]
    list_editable = ["sort_order", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ["name"]}


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    # Stock changes only through Inventory > Stock movements, so each one is logged.
    readonly_fields = ["stock_quantity"]
    fields = [
        "label",
        "weight_grams",
        "sku",
        "price",
        "compare_at_price",
        "stock_quantity",
        "low_stock_threshold",
        "sort_order",
        "is_active",
    ]


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["image", "alt_text", "sort_order"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """One screen for a product, all its pack sizes and its photos."""

    inlines = [ProductVariantInline, ProductImageInline]
    list_display = ["name", "category", "is_featured", "is_perishable", "is_active"]
    list_editable = ["is_featured", "is_active"]
    list_filter = ["category", "is_active", "is_featured", "is_perishable"]
    search_fields = ["name", "slug", "variants__sku"]
    prepopulated_fields = {"slug": ["name"]}
    autocomplete_fields = ["category"]
