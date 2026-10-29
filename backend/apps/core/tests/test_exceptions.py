"""Every API error uses {"code", "message", "fields"} (rules.md §4)."""

import pytest
from rest_framework import exceptions
from rest_framework.permissions import AllowAny
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework.views import APIView


def _call_view_raising(exc):
    class FailingView(APIView):
        permission_classes = [AllowAny]

        def get(self, request):
            raise exc

    return FailingView.as_view()(APIRequestFactory().get("/"))


def test_field_errors_are_listed_per_field_with_dotted_names():
    response = _call_view_raising(
        exceptions.ValidationError(
            {
                "phone": ["Enter a valid mobile number."],
                "address": {"city": ["We only deliver in Chashma."]},
            }
        )
    )

    assert response.status_code == 400
    assert response.data == {
        "code": "validation_error",
        "message": "Please check the highlighted fields.",
        "fields": {
            "phone": ["Enter a valid mobile number."],
            "address.city": ["We only deliver in Chashma."],
        },
    }


def test_non_field_error_becomes_the_message():
    response = _call_view_raising(
        exceptions.ValidationError({"non_field_errors": ["Passwords do not match."]})
    )

    assert response.data == {
        "code": "validation_error",
        "message": "Passwords do not match.",
        "fields": {},
    }


def test_plain_validation_error_without_fields():
    response = _call_view_raising(exceptions.ValidationError("Cart is empty."))

    assert response.data == {"code": "validation_error", "message": "Cart is empty.", "fields": {}}


def test_other_errors_keep_their_code():
    response = _call_view_raising(exceptions.NotFound())

    assert response.status_code == 404
    assert response.data == {"code": "not_found", "message": "Not found.", "fields": {}}


def test_custom_code_is_passed_through():
    response = _call_view_raising(
        exceptions.PermissionDenied("This phone number is blocked.", code="phone_blocked")
    )

    assert response.data["code"] == "phone_blocked"
    assert response.data["message"] == "This phone number is blocked."


@pytest.mark.django_db
def test_wrong_method_on_a_real_endpoint():
    response = APIClient().delete("/api/v1/health/")

    assert response.status_code == 405
    assert response.json() == {
        "code": "method_not_allowed",
        "message": 'Method "DELETE" not allowed.',
        "fields": {},
    }
