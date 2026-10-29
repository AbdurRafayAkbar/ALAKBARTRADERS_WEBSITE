from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm

from .models import Address, User


class UserCreationForm(AdminUserCreationForm):
    class Meta:
        model = User
        fields = ["email"]


class UserEditForm(UserChangeForm):
    class Meta:
        model = User
        fields = "__all__"


class AddressInline(admin.StackedInline):
    model = Address
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Django's user admin, with email in place of username."""

    inlines = [AddressInline]
    form = UserEditForm
    add_form = UserCreationForm
    ordering = ["email"]
    list_display = ["email", "first_name", "last_name", "phone", "is_staff", "is_active"]
    search_fields = ["email", "first_name", "last_name", "phone"]
    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Personal info", {"fields": ["first_name", "last_name", "phone"]}),
        (
            "Permissions",
            {"fields": ["is_active", "is_staff", "is_superuser", "groups", "user_permissions"]},
        ),
        ("Important dates", {"fields": ["last_login", "date_joined"]}),
    ]
    add_fieldsets = [
        (None, {"classes": ["wide"], "fields": ["email", "password1", "password2"]}),
    ]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["__str__", "full_name", "phone", "user", "is_default"]
    list_filter = ["is_default"]
    search_fields = ["full_name", "phone", "colony", "user__email"]
    autocomplete_fields = ["user"]
