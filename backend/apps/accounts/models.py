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
