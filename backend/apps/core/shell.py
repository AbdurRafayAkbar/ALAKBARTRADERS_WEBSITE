"""
Serves the React app's index.html for customer page URLs (T1.7).

React only draws the page after its JavaScript runs. Google may index the page
before that, and WhatsApp link previews never run it. So Django fills the
title, meta tags and the page's heading and text into the HTML it sends.
React then replaces the content of #root with the same page.
"""

import re

from django.conf import settings
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.html import escape
from django.views.decorators.http import require_safe

from . import pages

TITLE_RE = re.compile(r"<title>.*?</title>", re.DOTALL)
# Prettier may wrap the tag over several lines, so allow any whitespace.
DESCRIPTION_RE = re.compile(r'<meta\s+name="description"\s+content="[^"]*"\s*/?>')
HEAD_END = "</head>"
EMPTY_ROOT = '<div id="root"></div>'

NOT_BUILT = (
    "The React app is not built. Run `npm run build` in frontend/, "
    "or use the Vite dev server on http://localhost:2004."
)


def _replace_once(pattern, html, new):
    # A lambda, so a backslash in a product name is not read as a regex group.
    html, count = pattern.subn(lambda _: new, html, count=1)
    if count != 1:
        raise ValueError(f"frontend index.html has no {pattern.pattern!r}")
    return html


def _insert_once(marker, html, new):
    if html.count(marker) != 1:
        raise ValueError(f"frontend index.html must contain {marker!r} exactly once")
    return html.replace(marker, new)


def _canonical_url(request):
    # No query string: /shop/?sort=price and /shop/ are one page to Google.
    origin = settings.SITE_URL or f"{request.scheme}://{request.get_host()}"
    return origin.rstrip("/") + request.path


def render_shell(request, page):
    index_file = settings.FRONTEND_DIST_DIR / "index.html"
    try:
        # Read on every request: about 1 kB, and a new build needs no restart.
        html = index_file.read_text(encoding="utf-8")
    except FileNotFoundError:
        return HttpResponse(NOT_BUILT, status=503, content_type="text/plain; charset=utf-8")

    context = {"page": page, "canonical": _canonical_url(request), "site_name": pages.SITE_NAME}
    head = render_to_string("core/shell_head.html", context)
    root = render_to_string("core/shell_root.html", context)

    html = _replace_once(TITLE_RE, html, f"<title>{escape(page.full_title)}</title>")
    html = _replace_once(
        DESCRIPTION_RE, html, f'<meta name="description" content="{escape(page.description)}" />'
    )
    html = _insert_once(HEAD_END, html, head + HEAD_END)
    html = _insert_once(EMPTY_ROOT, html, f'<div id="root">{root}</div>')
    return HttpResponse(html, status=page.status)


@require_safe
def home(request):
    return render_shell(request, pages.HOME)


@require_safe
def shop(request):
    return render_shell(request, pages.SHOP)


@require_safe
def category(request, slug):
    return render_shell(request, pages.category_page(slug))


@require_safe
def search(request):
    return render_shell(request, pages.search_page(request.GET.get("q", "").strip()))


@require_safe
def product(request, slug):
    return render_shell(request, pages.product_page(slug))


@require_safe
def cart(request):
    return render_shell(request, pages.CART)


@require_safe
def delivery_areas(request):
    return render_shell(request, pages.DELIVERY_AREAS)


@require_safe
def login(request):
    return render_shell(request, pages.LOGIN)


@require_safe
def signup(request):
    return render_shell(request, pages.SIGNUP)


@require_safe
def password_reset(request):
    return render_shell(request, pages.PASSWORD_RESET)


@require_safe
def password_reset_confirm(request, uid, token):
    # The API checks the uid and token when the form is sent, not here.
    return render_shell(request, pages.PASSWORD_RESET_CONFIRM)


@require_safe
def profile(request):
    # React sends guests to the login page; the HTML is the same for everyone.
    return render_shell(request, pages.PROFILE)


@require_safe
def addresses(request):
    return render_shell(request, pages.ADDRESSES)


@require_safe
def not_found(request):
    # React shows its 404 page; the status code tells Google the same.
    return render_shell(request, pages.NOT_FOUND)
