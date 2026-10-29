from django.urls import path

from . import views

urlpatterns = [
    path("", views.ApiRootView.as_view(), name="root"),
    path("health/", views.HealthView.as_view(), name="health"),
    path("auth/csrf/", views.CsrfView.as_view(), name="csrf"),
]
