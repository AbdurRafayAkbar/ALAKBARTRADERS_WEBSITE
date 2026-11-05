"""Reads about accounts. Roles come from Django groups (Architecture.md §8)."""

OWNER = "Owner"
STAFF = "Staff"


def user_role(user):
    """
    "owner", "staff" or "customer". A guest is a customer too.

    A superuser counts as the owner, so the account made with createsuperuser
    works before anyone joins it to a group. Someone in both groups is the owner.
    """
    if not user.is_authenticated:
        return "customer"
    if user.is_superuser:
        return "owner"
    groups = {group.name for group in user.groups.all()}
    if OWNER in groups:
        return "owner"
    if STAFF in groups:
        return "staff"
    return "customer"
