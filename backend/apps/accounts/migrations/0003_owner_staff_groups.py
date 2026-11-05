"""
Create the Owner and Staff groups (Architecture.md §8, "Roles").

Owner gets every permission on the catalog and accounts models, because the
owner runs Django Admin (catalog, settings, users). Staff gets no model
permissions yet: staff work in the React screens under /staff/, and the
order and stock permissions they need arrive with those models in later
migrations. Staff never get price, settings or report permissions.

Django normally creates model permissions after all migrations finish (the
post_migrate signal). On a fresh database they do not exist yet when this
migration runs, so create them here first.
"""

from django.contrib.auth.management import create_permissions
from django.db import migrations

OWNER = "Owner"
STAFF = "Staff"
OWNER_APPS = ["catalog", "accounts"]


def create_groups(apps, schema_editor):
    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, verbosity=0)
        app_config.models_module = None

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")

    owner, _ = Group.objects.get_or_create(name=OWNER)
    owner.permissions.add(*Permission.objects.filter(content_type__app_label__in=OWNER_APPS))
    # Lets the owner pick a group on the user page in admin.
    owner.permissions.add(*Permission.objects.filter(codename="view_group"))
    Group.objects.get_or_create(name=STAFF)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_address"),
        ("catalog", "0003_rename_revery_to_rewari"),
        ("auth", "0012_alter_user_first_name_max_length"),
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        # Reverse leaves the groups: removing them would strip people of their role.
        migrations.RunPython(create_groups, migrations.RunPython.noop),
    ]
