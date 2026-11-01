from decimal import Decimal

import factory

from apps.catalog.models import Category, Product, ProductVariant


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    category = factory.SubFactory(CategoryFactory)
    name = factory.Sequence(lambda n: f"Product {n}")


class ProductVariantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductVariant

    product = factory.SubFactory(ProductFactory)
    label = "1 kg"
    weight_grams = 1000
    sku = factory.Sequence(lambda n: f"SKU-{n}")
    price = Decimal("500.00")
