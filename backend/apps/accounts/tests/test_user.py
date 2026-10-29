"""Custom User: email login, case-insensitive unique email (T2.1)."""

import pytest
from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.db import IntegrityError

pytestmark = pytest.mark.django_db

User = get_user_model()


def test_auth_user_model_is_ours():
    assert User._meta.label == "accounts.User"
    assert User.USERNAME_FIELD == "email"
    assert User.username is None


def test_create_user_hashes_password_and_normalises_domain():
    user = User.objects.create_user("Ali@EXAMPLE.com", "s3cret-pass", phone="0300-1234567")

    assert user.email == "Ali@example.com"
    assert user.phone == "0300-1234567"
    assert user.check_password("s3cret-pass")
    assert user.password != "s3cret-pass"
    assert not user.is_staff
    assert not user.is_superuser
    assert str(user) == "Ali@example.com"


def test_create_user_without_email_fails():
    with pytest.raises(ValueError, match="email"):
        User.objects.create_user("", "s3cret-pass")


def test_create_superuser_sets_flags():
    admin = User.objects.create_superuser("owner@example.com", "s3cret-pass")

    assert admin.is_staff
    assert admin.is_superuser


@pytest.mark.parametrize("flag", ["is_staff", "is_superuser"])
def test_create_superuser_refuses_false_flags(flag):
    with pytest.raises(ValueError, match=flag):
        User.objects.create_superuser("owner@example.com", "s3cret-pass", **{flag: False})


def test_email_is_unique_ignoring_case():
    User.objects.create_user("ali@example.com", "s3cret-pass")

    with pytest.raises(IntegrityError):
        User.objects.create_user("ALI@example.com", "s3cret-pass")


def test_full_clean_reports_duplicate_email_ignoring_case():
    User.objects.create_user("ali@example.com", "s3cret-pass")

    with pytest.raises(ValidationError, match="already exists"):
        User(email="ALI@example.com").validate_constraints()


def test_login_ignores_email_case():
    User.objects.create_user("ali@example.com", "s3cret-pass")

    assert authenticate(username="ALI@Example.com", password="s3cret-pass") is not None
    assert authenticate(username="ali@example.com", password="wrong") is None


def test_createsuperuser_command_with_email(monkeypatch):
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "s3cret-pass")

    call_command("createsuperuser", "--noinput", "--email", "owner@example.com")

    admin = User.objects.get(email="owner@example.com")
    assert admin.is_superuser
    assert admin.check_password("s3cret-pass")


def test_admin_add_user_page_loads(admin_client):
    assert admin_client.get("/admin/accounts/user/add/").status_code == 200
