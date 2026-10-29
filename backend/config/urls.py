"""
Top-level URLs. The API lives in api_urls.py under /api/v1/.

Customer page URLs come last: their final pattern catches every unknown page
and returns the React app with a 404 status.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("config.api_urls")),
    path("", include("apps.core.page_urls")),
]
