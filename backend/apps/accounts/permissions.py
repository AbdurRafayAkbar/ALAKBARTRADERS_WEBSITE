"""
DRF permission classes for the staff API (Architecture.md §7).

A guest gets 401 or 403 from DRF before these run their check; a logged-in
customer gets 403.
"""

from rest_framework.permissions import BasePermission

from .selectors import user_role


class IsStaff(BasePermission):
    """Staff and the owner: order queue, stock, COD confirmation."""

    message = "Only shop staff can do this."

    def has_permission(self, request, view):
        return user_role(request.user) in {"staff", "owner"}


class IsOwner(BasePermission):
    """The owner only: sales reports, prices, settings."""

    message = "Only the owner can do this."

    def has_permission(self, request, view):
        return user_role(request.user) == "owner"
