from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.functions import Lower

from .managers import UserManager


class User(AbstractUser):
    """
    A customer, staff member or owner. Logs in with email, not a username.

    Customers can also order as guests without an account (Architecture.md §4).
    """

    username = None
    email = models.EmailField("email address", unique=True)
    phone = models.CharField(max_length=20, blank=True)

    USERNAME_FIELD = "email"
    # createsuperuser asks for the email and password only.
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        constraints = [
            # One account per address, whatever the letter case.
            # unique=True above only blocks exact copies; this also blocks "Ali@x.com"
            # when "ali@x.com" exists.
            models.UniqueConstraint(
                Lower("email"),
                name="user_email_ci_unique",
                violation_error_message="A user with this email address already exists.",
            ),
        ]

    def __str__(self):
        return self.email


class Address(models.Model):
    """
    A saved delivery address. Chashma only, so there is no city or province.

    Written the way people here write it: "House#999, CAT-V, <colony name>"
    (Architecture.md §4). `area` is free text until Phase 8 adds DeliveryZone;
    then a zone foreign key replaces it.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    house_number = models.CharField(max_length=30)
    block = models.CharField("block or category", max_length=50)
    colony = models.CharField(max_length=100)
    house_name = models.CharField("house name", max_length=100, blank=True)
    landmark = models.CharField(max_length=150, blank=True)
    area = models.CharField(max_length=100, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "addresses"
        ordering = ["-is_default", "-created_at"]
        constraints = [
            # At most one default per user; the API moves the flag, never doubles it.
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(is_default=True),
                name="address_one_default_per_user",
            ),
        ]

    def __str__(self):
        return f"{self.house_number}, {self.block}, {self.colony}"
