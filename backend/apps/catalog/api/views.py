"""
Public catalogue reads (Architecture.md §6). Anyone can browse; nothing here writes.
"""

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .. import selectors
from .serializers import CategorySerializer, ProductSerializer


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer

    def get_queryset(self):
        return selectors.active_categories()


class CategoryDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    lookup_field = "slug"

    def get_queryset(self):
        return selectors.active_categories()


@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter("category", OpenApiTypes.STR, description="Category slug"),
            OpenApiParameter("q", OpenApiTypes.STR, description="Words in the name or description"),
            OpenApiParameter("featured", OpenApiTypes.BOOL, description="Only home-page picks"),
        ]
    )
)
class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer

    def get_queryset(self):
        params = self.request.query_params
        return selectors.active_products(
            category=params.get("category"),
            q=params.get("q", "").strip(),
            featured=params.get("featured") in ("1", "true"),
        )


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return selectors.active_products()
