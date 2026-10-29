"""Everything under /api/v1/. Each app adds its own urls.py here."""

from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

app_name = "api"

urlpatterns = [
    path("", include("apps.core.urls")),
    path("", include("apps.accounts.api.urls")),
    # OpenAPI schema. Open to all in dev, staff only in prod (SPECTACULAR_SETTINGS).
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("schema/docs/", SpectacularSwaggerView.as_view(url_name="api:schema"), name="docs"),
]
