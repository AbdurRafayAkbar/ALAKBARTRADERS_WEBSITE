import pytest
from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


@pytest.fixture
def api():
    return APIClient()


def test_health_returns_ok_json(api):
    response = api.get("/api/v1/health/")

    assert response.status_code == 200
    assert response["Content-Type"] == "application/json"
    assert response.json() == {"status": "ok", "database": "ok"}


def test_api_root_lists_endpoints(api):
    response = api.get("/api/v1/")

    assert response.status_code == 200
    assert response.json()["health"].endswith("/api/v1/health/")


def test_csrf_endpoint_sets_cookie(api):
    response = api.get(reverse("api:csrf"))

    assert response.status_code == 204
    assert "csrftoken" in response.cookies


def test_unsafe_request_without_csrf_token_is_refused():
    api = APIClient(enforce_csrf_checks=True)

    response = api.post("/api/v1/health/", {}, format="json")

    assert response.status_code == 403
    assert response.json()["code"] == "permission_denied"
    assert "CSRF" in response.json()["message"]


def test_unsafe_request_with_csrf_token_passes_the_check():
    api = APIClient(enforce_csrf_checks=True)
    token = api.get(reverse("api:csrf")).cookies["csrftoken"].value

    response = api.post("/api/v1/health/", {}, format="json", HTTP_X_CSRFTOKEN=token)

    # Past the CSRF check; health simply has no POST.
    assert response.status_code == 405


def test_schema_is_staff_only_outside_dev(api, admin_user):
    assert api.get(reverse("api:schema")).status_code == 403

    api.force_authenticate(admin_user)
    assert api.get(reverse("api:schema")).status_code == 200


def test_schema_builds_without_warnings(tmp_path):
    call_command("spectacular", "--validate", "--fail-on-warn", "--file", tmp_path / "s.yml")
