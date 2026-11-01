"""
Top-level URLs. The API lives in api_urls.py under /api/v1/.

Customer page URLs come last: their final pattern catches every unknown page
and returns the React app with a 404 status.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("config.api_urls")),
    # Uploaded product photos. static() adds nothing when DEBUG is off; in
    # production the web server or storage bucket serves media instead.
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
    path("", include("apps.core.page_urls")),
]
