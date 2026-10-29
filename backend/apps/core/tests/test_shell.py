"""Page URLs return the React index.html with per-page SEO tags (T1.7)."""

import pytest

# ATOMIC_REQUESTS opens a transaction for every request, page views included.
pytestmark = pytest.mark.django_db

# Same shape as frontend/index.html, including the description tag over several lines.
INDEX_HTML = """<!doctype html>
<html lang="en">
  <head>
    <title>Old title</title>
    <meta
      name="description"
      content="Old description."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>
"""


@pytest.fixture(autouse=True)
def frontend_build(settings, tmp_path):
    (tmp_path / "index.html").write_text(INDEX_HTML, encoding="utf-8")
    settings.FRONTEND_DIST_DIR = tmp_path
    settings.SITE_URL = ""
    return tmp_path


def test_home_has_server_filled_title_heading_and_canonical(client):
    response = client.get("/")
    html = response.content.decode()

    assert response.status_code == 200
    assert "<title>ALAKBARTRADERS | Rice, dry fruits and fresh cream in Chashma</title>" in html
    assert "Old title" not in html
    assert "Old description." not in html
    assert "<h1>Fresh from the farm. Ready for your table.</h1>" in html
    assert '<link rel="canonical" href="http://testserver/" />' in html
    assert 'name="robots"' not in html
    assert '<script type="module" src="/assets/index.js"></script>' in html


def test_category_page_uses_category_name(client):
    response = client.get("/c/rice/")
    html = response.content.decode()

    assert response.status_code == 200
    assert "<title>Rice | ALAKBARTRADERS</title>" in html
    assert "<h1>Rice</h1>" in html


def test_unknown_category_is_404(client):
    response = client.get("/c/shoes/")

    assert response.status_code == 404
    assert '<meta name="robots" content="noindex" />' in response.content.decode()


def test_product_deep_link_loads_the_app(client):
    response = client.get("/p/test/")
    html = response.content.decode()

    assert response.status_code == 200
    assert '<script type="module" src="/assets/index.js"></script>' in html
    # No product data until T3.3, so keep it out of Google for now.
    assert '<meta name="robots" content="noindex" />' in html


def test_unknown_page_returns_404_with_the_app(client):
    response = client.get("/no-such-page/")
    html = response.content.decode()

    assert response.status_code == 404
    assert "<h1>This page does not exist</h1>" in html
    assert '<meta name="robots" content="noindex" />' in html
    assert 'rel="canonical"' not in html


@pytest.mark.parametrize("url", ["/cart/", "/search/?q=rice"])
def test_cart_and_search_are_noindex(client, url):
    response = client.get(url)

    assert response.status_code == 200
    assert '<meta name="robots" content="noindex" />' in response.content.decode()


@pytest.mark.parametrize(
    ("url", "title"),
    [
        ("/accounts/login/", "Log in"),
        ("/accounts/signup/", "Create an account"),
        ("/accounts/password-reset/", "Reset your password"),
        ("/accounts/password-reset/MQ/abc-123/", "Choose a new password"),
        ("/account/", "Your account"),
        ("/account/addresses/", "Saved addresses"),
    ],
)
def test_account_pages_load_the_app_and_are_noindex(client, url, title):
    response = client.get(url)

    html = response.content.decode()
    assert response.status_code == 200
    assert f"<title>{title} | " in html
    assert '<meta name="robots" content="noindex" />' in html


def test_search_query_is_escaped(client):
    response = client.get("/search/", {"q": '<script>alert("x")</script>'})
    html = response.content.decode()

    assert "<script>alert" not in html
    assert "&lt;script&gt;alert" in html


def test_canonical_uses_site_url_and_drops_query(client, settings):
    settings.SITE_URL = "https://alakbartraders.pk/"

    html = client.get("/shop/", {"sort": "price"}).content.decode()

    assert '<link rel="canonical" href="https://alakbartraders.pk/shop/" />' in html
    assert '<meta property="og:url" content="https://alakbartraders.pk/shop/" />' in html


def test_unknown_api_url_is_not_the_app(client):
    response = client.get("/api/v1/nope/")

    assert response.status_code == 404
    assert 'id="root"' not in response.content.decode()


def test_missing_build_returns_503(client, frontend_build):
    (frontend_build / "index.html").unlink()

    response = client.get("/")

    assert response.status_code == 503
    assert "npm run build" in response.content.decode()


def test_post_is_rejected(client):
    assert client.post("/shop/").status_code == 405


def test_real_frontend_index_has_the_markers(settings):
    # Guards against frontend/index.html changing shape and breaking the shell.
    from django.conf import settings as django_settings

    from apps.core import shell

    real = django_settings.BASE_DIR.parent / "frontend" / "index.html"
    html = real.read_text(encoding="utf-8")

    assert len(shell.TITLE_RE.findall(html)) == 1
    assert len(shell.DESCRIPTION_RE.findall(html)) == 1
    assert html.count(shell.HEAD_END) == 1
    assert html.count(shell.EMPTY_ROOT) == 1
