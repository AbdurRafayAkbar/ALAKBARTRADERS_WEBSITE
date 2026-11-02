"""
Fix the rice brand spelling from "Kianat" to "Kainat" and describe Anmol
Revery as the sesame sweets it is (owner, 2026-11-02).

Only rows that still carry the old starter name are renamed, so a name the
owner has already changed in admin is left alone. The slug follows the name.
"""

from django.db import migrations

RENAMES = {
    "kianat-kacha": ("kainat-kacha", "Kainat Kacha"),
    "steam-kianat-1121": ("steam-kainat-1121", "Steam Kainat 1121"),
    "steam-kianat-1509": ("steam-kainat-1509", "Steam Kainat 1509"),
    "kianat-adhwar": ("kainat-adhwar", "Kainat Adhwar"),
    "kianat-sela": ("kainat-sela", "Kainat Sela"),
}


def rename_kianat(apps, schema_editor):
    Product = apps.get_model("catalog", "Product")
    for old_slug, (new_slug, new_name) in RENAMES.items():
        old_name = new_name.replace("Kainat", "Kianat")
        if Product.objects.filter(slug=new_slug).exists():
            continue
        Product.objects.filter(slug=old_slug, name=old_name).update(slug=new_slug, name=new_name)


def describe_revery(apps, schema_editor):
    Category = apps.get_model("catalog", "Category")
    Category.objects.filter(slug="anmol-revery", summary="Anmol revery").update(
        summary="Sesame sweets made with pure ghee and green cardamom"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(rename_kianat, migrations.RunPython.noop),
        migrations.RunPython(describe_revery, migrations.RunPython.noop),
    ]
