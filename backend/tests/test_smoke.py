"""Smoke tests: the project boots, talks to PostgreSQL and serves a page."""

import pytest
from django.db import connection


@pytest.mark.django_db
def test_database_is_postgresql():
    assert connection.vendor == "postgresql"


@pytest.mark.django_db
def test_admin_login_page_loads(client):
    response = client.get("/admin/login/")
    assert response.status_code == 200
