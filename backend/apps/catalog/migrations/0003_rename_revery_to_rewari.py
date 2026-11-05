"""
Spell the Anmol sesame sweets "Rewari", as the pack does (owner, 2026-11-06).

Only rows that still carry the old starter name are renamed, so a name the
owner has already changed in admin is left alone. The slug follows the name.
"""

from django.db import migrations

CATEGORY = ("anmol-revery", "Anmol Revery", "anmol-rewari", "Anmol Rewari")

PRODUCTS = [
    ("revery-regular", "Revery Regular", "rewari-regular", "Rewari Regular"),
    ("revery-special", "Revery Special", "rewari-special", "Rewari Special"),
]


def rename_revery(apps, schema_editor):
    Category = apps.get_model("catalog", "Category")
    Product = apps.get_model("catalog", "Product")

    old_slug, old_name, new_slug, new_name = CATEGORY
    if not Category.objects.filter(slug=new_slug).exists():
        Category.objects.filter(slug=old_slug, name=old_name).update(slug=new_slug, name=new_name)

    for old_slug, old_name, new_slug, new_name in PRODUCTS:
        if Product.objects.filter(slug=new_slug).exists():
            continue
        Product.objects.filter(slug=old_slug, name=old_name).update(slug=new_slug, name=new_name)


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0002_rename_kianat_to_kainat"),
    ]

    operations = [
        migrations.RunPython(rename_revery, migrations.RunPython.noop),
    ]
