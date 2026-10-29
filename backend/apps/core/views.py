from django.db import DatabaseError, connection
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class ApiRootView(APIView):
    """Lists the top-level API endpoints."""

    permission_classes = [AllowAny]

    @extend_schema(
        responses=inline_serializer(
            "ApiRoot",
            {"health": serializers.URLField(), "csrf": serializers.URLField()},
        )
    )
    def get(self, request):
        return Response(
            {
                "health": request.build_absolute_uri(reverse("api:health")),
                "csrf": request.build_absolute_uri(reverse("api:csrf")),
            }
        )


class HealthView(APIView):
    """Says whether the app and its database are up. Used by uptime checks."""

    permission_classes = [AllowAny]

    @extend_schema(
        responses={
            200: inline_serializer(
                "Health",
                {"status": serializers.CharField(), "database": serializers.CharField()},
            ),
            503: inline_serializer(
                "HealthDown",
                {"status": serializers.CharField(), "database": serializers.CharField()},
            ),
        }
    )
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except DatabaseError:
            return Response(
                {"status": "error", "database": "unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"status": "ok", "database": "ok"})


@method_decorator(ensure_csrf_cookie, name="get")
class CsrfView(APIView):
    """
    Sets the `csrftoken` cookie. React calls this once on start-up, then sends
    the cookie value in the X-CSRFToken header on every POST, PATCH and DELETE.
    """

    permission_classes = [AllowAny]

    @extend_schema(responses={204: None})
    def get(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)
