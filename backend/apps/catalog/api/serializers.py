from rest_framework import serializers

from ..models import Category, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["slug", "name", "summary"]
        read_only_fields = fields


class ProductVariantSerializer(serializers.ModelSerializer):
    """One pack size. The exact stock count stays private; the shop shows a state."""

    stock_state = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ["id", "label", "sku", "price", "compare_at_price", "stock_state"]
        read_only_fields = fields

    def get_stock_state(self, variant) -> str:
        if variant.stock_quantity <= 0:
            return "out_of_stock"
        if variant.stock_quantity <= variant.low_stock_threshold:
            return "low_stock"
        return "in_stock"


class ProductImageSerializer(serializers.ModelSerializer):
    # A full URL (http://host/media/...), so React can use it as an <img> src.
    url = serializers.ImageField(source="image", read_only=True)

    class Meta:
        model = ProductImage
        fields = ["url", "alt_text"]
        read_only_fields = fields


class ProductSerializer(serializers.ModelSerializer):
    """A product with its pack sizes. No pack sizes yet means no price yet."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "slug",
            "name",
            "category",
            "description",
            "is_perishable",
            "is_featured",
            "variants",
            "images",
        ]
        read_only_fields = fields
