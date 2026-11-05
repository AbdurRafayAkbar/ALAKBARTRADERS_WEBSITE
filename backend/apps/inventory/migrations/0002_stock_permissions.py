"""
Let the Owner and Staff groups see the stock log and add to it.

Memory.md says staff handle orders and stock, so both groups get "view" and
"add" on StockMovement. Nobody gets "change" or "delete": the log is
append-only (the admin also refuses both). Permissions are created here first
for the same reason as in accounts 0003.
"""

from django.contrib.auth.management import create_permissions
from django.db import migrations

CODENAMES = ["view_stockmovement", "add_stockmovement"]


def grant(apps, schema_editor):
    app_config = apps.get_app_config("inventory")
    app_config.models_module = True
    create_permissions(app_config, verbosity=0)
    app_config.models_module = None

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")
    perms = Permission.objects.filter(
        content_type__app_label="inventory", codename__in=CODENAMES
    )
    for name in ["Owner", "Staff"]:
        group, _ = Group.objects.get_or_create(name=name)
        group.permissions.add(*perms)


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0001_initial"),
        ("accounts", "0003_owner_staff_groups"),
    ]

    operations = [migrations.RunPython(grant, migrations.RunPython.noop)]
