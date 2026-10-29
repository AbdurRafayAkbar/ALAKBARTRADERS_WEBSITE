import pytest
from django.db import IntegrityError
from django.urls import reverse

from apps.core.models import SiteSettings

pytestmark = pytest.mark.django_db


def test_load_creates_the_single_row_once():
    first = SiteSettings.load()
    second = SiteSettings.load()

    assert first.pk == second.pk == SiteSettings.SINGLETON_PK
    assert SiteSettings.objects.count() == 1


def test_saving_a_new_instance_overwrites_the_single_row():
    SiteSettings.load()
    SiteSettings(store_phone="0300-1234567").save()

    assert SiteSettings.objects.count() == 1
    assert SiteSettings.load().store_phone == "0300-1234567"


def test_database_refuses_a_second_row():
    # bulk_create skips save(), so only the CHECK constraint stops this.
    with pytest.raises(IntegrityError):
        SiteSettings.objects.bulk_create([SiteSettings(pk=2)])


def test_admin_list_opens_the_settings_form(admin_client):
    response = admin_client.get(reverse("admin:core_sitesettings_changelist"))

    assert response.status_code == 302
    assert response.url == reverse("admin:core_sitesettings_change", args=[1])


def test_owner_can_edit_settings_in_admin(admin_client):
    url = reverse("admin:core_sitesettings_change", args=[1])
    SiteSettings.load()

    response = admin_client.post(
        url,
        {
            "free_shipping_threshold": "5000.00",
            "max_cod_order_value": "",
            "cream_expiry_cutoff_days": "3",
            "pending_order_timeout_hours": "24",
            "store_name": "ALAKBARTRADERS",
            "store_phone": "",
            "store_email": "",
            "store_address": "",
        },
    )

    assert response.status_code == 302
    assert str(SiteSettings.load().free_shipping_threshold) == "5000.00"


def test_admin_cannot_add_or_delete_settings(admin_client):
    SiteSettings.load()

    assert admin_client.get(reverse("admin:core_sitesettings_add")).status_code == 403
    assert admin_client.get(reverse("admin:core_sitesettings_delete", args=[1])).status_code == 403
