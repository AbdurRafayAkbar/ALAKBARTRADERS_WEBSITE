"""
Turn on the pg_trgm extension for typo-tolerant search (T3.4).

pg_trgm compares words by their three-letter pieces, so "basmti" still finds
"Basmati". It is a trusted extension since PostgreSQL 13, so the database
owner can create it without being a superuser.
"""

from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("catalog", "0003_rename_revery_to_rewari")]

    operations = [TrigramExtension()]
