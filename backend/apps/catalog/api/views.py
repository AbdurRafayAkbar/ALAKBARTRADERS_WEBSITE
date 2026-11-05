"""
Public catalogue reads (Architecture.md §6). Anyone can browse; nothing here writes.
"""

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import generics, serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

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


class ProductPagination(PageNumberPagination):
    # Fifteen products today; a page of 24 fills a 2-, 3- or 4-column grid evenly.
    page_size = 24


class ProductQuerySerializer(serializers.Serializer):
    """The shop's query string. A bad value gets a 400 that names the field."""

    category = serializers.SlugField(required=False)
    q = serializers.CharField(required=False, allow_blank=True, max_length=100)
    featured = serializers.BooleanField(required=False, default=False)
    size = serializers.ListField(child=serializers.CharField(max_length=50), required=False)
    min_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False
    )
    max_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False
    )
    in_stock = serializers.BooleanField(required=False, default=False)
    sort = serializers.ChoiceField(choices=selectors.SORTS, required=False)

    def validate(self, attrs):
        low, high = attrs.get("min_price"), attrs.get("max_price")
        if low is not None and high is not None and low > high:
            raise serializers.ValidationError({"max_price": "Must be at least the lowest price."})
        return attrs


@extend_schema_view(
    get=extend_schema(
        parameters=[
            OpenApiParameter("category", OpenApiTypes.STR, description="Category slug"),
            OpenApiParameter(
                "q",
                OpenApiTypes.STR,
                description="Words in the name or description; typos are allowed",
            ),
            OpenApiParameter("featured", OpenApiTypes.BOOL, description="Only home-page picks"),
            OpenApiParameter(
                "size",
                OpenApiTypes.STR,
                many=True,
                description='Pack size label, e.g. "5 kg"; repeat for more',
            ),
            OpenApiParameter(
                "min_price", OpenApiTypes.DECIMAL, description="Lowest pack price in PKR"
            ),
            OpenApiParameter(
                "max_price", OpenApiTypes.DECIMAL, description="Highest pack price in PKR"
            ),
            OpenApiParameter("in_stock", OpenApiTypes.BOOL, description="Only pack sizes in stock"),
            OpenApiParameter(
                "sort",
                OpenApiTypes.STR,
                enum=selectors.SORTS,
                description="Default: best match, else popular",
            ),
        ]
    )
)
class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):
        params = self.request.query_params
        query = ProductQuerySerializer(data={**params.dict(), "size": params.getlist("size")})
        query.is_valid(raise_exception=True)
        data = query.validated_data
        return selectors.active_products(
            category=data.get("category"),
            q=data.get("q", "").strip(),
            featured=data["featured"],
            sizes=data.get("size"),
            min_price=data.get("min_price"),
            max_price=data.get("max_price"),
            in_stock=data["in_stock"],
            sort=data.get("sort"),
        )


@extend_schema_view(
    get=extend_schema(
        parameters=[OpenApiParameter("category", OpenApiTypes.STR, description="Category slug")],
        responses={200: {"type": "array", "items": {"type": "string"}}},
    )
)
class PackSizeListView(APIView):
    """The pack size labels on sale, lightest first, for the shop's size filter."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response(selectors.pack_sizes(category=request.query_params.get("category")))


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return selectors.active_products()
