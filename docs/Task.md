# ALAKBARTRADERS — Task Roadmap

> **Status:** v0.2 (2026-10-28). Owner approved the drafts. Updated for the React frontend.
> Status: `[ ]` todo · `[~]` in progress · `[x]` done. **Only one task may be `[~]` at a time.**
> Mode: 🧑‍💻 You build (I review) · 🤝 Pair · 🤖 I build, you study.
> The mix starts mostly 🤖 / 🤝 and moves toward 🧑‍💻.

---

## Phase 0 — Design & setup

### [~] T0.1 System design documents
- **Description:** Write the six design files in `/docs`; owner reviews and approves.
- **Depends on:** —
- **Acceptance:** all six files approved; Step 3 review + quiz done; owner says "APPROVED".
- **Mode:** 🤖
- **Concepts:** system design docs, ERD, state machines, trade-off analysis.

### [x] T0.2 Local tools install
- **Description:** Install Python 3.14, `uv`, PostgreSQL 17, Node.js LTS + npm, Git config, VS Code extensions (Python, Ruff, Django, ESLint, Prettier, Tailwind CSS IntelliSense).
- **Depends on:** T0.1
- **Acceptance:** `python --version`, `uv --version`, `psql --version`, `node --version`, `npm --version` work; a test database can be created.
- **Mode:** 🧑‍💻
- **Concepts:** virtual environments, PATH, PostgreSQL roles and databases.

---

## Phase 1 — Project skeleton, settings, environments, Git, CI

### [x] T1.1 Create Django project
- **Description:** Decide Django version (Q1); `uv init`; install Django; `startproject config .`; `apps/` folder.
- **Depends on:** T0.2
- **Acceptance:** `runserver` shows the welcome page; structure matches rules.md §1.
- **Mode:** 🤖
- **Concepts:** project vs app, `manage.py`, WSGI/ASGI, request/response cycle.
- **Done (2026-10-29):** Django 5.2.18 on Python 3.14 via `uv`; `config/` project, empty `apps/` package, root `.gitignore`. Welcome page served on port 8000.

### [ ] T1.2 Settings split + env vars
- **Description:** `config/settings/{base,dev,prod}.py`; `django-environ`; `.env.example`; PostgreSQL connection.
- **Depends on:** T1.1
- **Acceptance:** dev runs on PostgreSQL; no secret in Git; `DJANGO_SETTINGS_MODULE` switches environments.
- **Mode:** 🤝
- **Concepts:** 12-factor config, secrets, `DATABASES`, `SECRET_KEY`, `DEBUG`.

### [ ] T1.3 Code quality tooling
- **Description:** Ruff config, pre-commit hooks, pytest + pytest-django + factory_boy, first smoke test.
- **Depends on:** T1.1
- **Acceptance:** `pre-commit run --all-files` and `pytest` pass.
- **Mode:** 🧑‍💻
- **Concepts:** linting vs formatting, pre-commit hooks, pytest fixtures.

### [ ] T1.4 Git + GitHub + CI
- **Description:** `.gitignore`, first commit and push to `origin`, branch protection on `main`, GitHub Actions running Ruff + pytest with a PostgreSQL service.
- **Depends on:** T1.3
- **Acceptance:** a pull request shows a green CI check.
- **Mode:** 🤝
- **Concepts:** CI, GitHub Actions services, branch protection, Conventional Commits.

### [ ] T1.5 `core` app + DRF setup
- **Description:** `TimeStampedModel`, `SiteSettings` singleton; install DRF + `drf-spectacular`; `/api/v1/` root, `health/` endpoint, shared error format, session auth + CSRF endpoint.
- **Depends on:** T1.2
- **Acceptance:** `GET /api/v1/health/` returns JSON; error shape test passes; `SiteSettings` editable in admin.
- **Mode:** 🤖
- **Concepts:** abstract models, DRF request/response, serializers, exception handlers, OpenAPI.

### [~] T1.6 React app scaffold
- **Description:** Vite + React + TypeScript in `frontend/`; Tailwind with brand tokens (design.md §1.2); React Router; TanStack Query; API client sending `X-CSRFToken`; Vite proxy `/api` to Django; layout shell (header, footer), placeholder home, 404 page.
- **Depends on:** T1.5
- **Acceptance:** `npm run dev` shows the home page in brand colours and reads `/api/v1/health/` through the proxy; `npm run build` passes.
- **Mode:** 🤖
- **Concepts:** Vite dev server vs build, SPA routing, components and props, proxy, CSRF with fetch.
- **Progress (2026-10-28):** Done ahead of the backend, on mock data: Tailwind tokens, router, TanStack Query hooks, API client with `X-CSRFToken`, layout, home, shop, product, cart, delivery areas and 404 pages, tests. Redesign done: motion, CSS hero backdrop (three.js removed 2026-10-29), hover effects, per-page palette trial (design.md §1.2a–b). Left: owner picks one palette; Vite proxy check against a real `/api/v1/health/` once Django exists.

### [ ] T1.7 Django serves the SPA shell
- **Description:** Django view returns the built `index.html` for page routes, with `<title>` and meta tags filled in per URL; static files from the Vite build.
- **Depends on:** T1.6
- **Acceptance:** "View page source" on `/` shows the server-filled title; deep link `/p/test/` loads React, not a Django 404.
- **Mode:** 🤝
- **Concepts:** SPA fallback routing, static files, why crawlers and WhatsApp need server HTML.

### [ ] T1.8 Frontend tooling in CI
- **Description:** ESLint + Prettier, Vitest + React Testing Library + MSW, first component test; add `tsc`, lint, test, build jobs to GitHub Actions.
- **Depends on:** T1.6, T1.4
- **Acceptance:** CI runs backend and frontend jobs; both green.
- **Mode:** 🧑‍💻
- **Concepts:** type checking vs tests, mocking APIs, CI caching for `npm ci`.

---

## Phase 2 — Auth & user accounts

### [ ] T2.1 Custom User model
- **Description:** `accounts.User` with email login, phone field; set `AUTH_USER_MODEL` before the first migrate.
- **Depends on:** T1.5
- **Acceptance:** `createsuperuser` with email works; tests for user manager.
- **Mode:** 🤖
- **Concepts:** `AbstractUser` vs `AbstractBaseUser`, user managers, why the custom user must be first.

### [ ] T2.2 Signup, login, logout, password reset
- **Description:** Session-auth API endpoints (`auth/*`) + React forms and pages; `useMe()` hook; email backend prints to console in dev; rate limit login.
- **Depends on:** T2.1, T1.6
- **Acceptance:** full flow works in React; wrong password shows an error; API tests + component tests pass.
- **Mode:** 🤝
- **Concepts:** `login()`/`logout()`, sessions, CSRF with an SPA, password hashing, protected routes.

### [ ] T2.3 Addresses + profile
- **Description:** Address CRUD API + React screens (zone FK added in Phase 8; text placeholder until then), profile edit.
- **Depends on:** T2.2
- **Acceptance:** a user sees and edits only their own addresses (test proves another user gets 404).
- **Mode:** 🧑‍💻
- **Concepts:** ModelSerializer, `IsAuthenticated`, filtering querysets by `request.user`, object-level access.

### [ ] T2.4 Roles: Owner and Staff
- **Description:** Data migration creating `Owner`/`Staff` groups + permissions; DRF permission classes `IsStaff`, `IsOwner`; `auth/me/` returns the role so React shows the right menu.
- **Depends on:** T2.1
- **Acceptance:** permission tests: customer 403, staff allowed, staff blocked from owner-only endpoints.
- **Mode:** 🤝
- **Concepts:** Groups, permissions, data migrations, DRF permission classes.

---

## Phase 3 — Catalog & variants

### [ ] T3.1 Category + Product models
- **Description:** Models, slugs, `is_active`, `is_perishable`; admin.
- **Depends on:** T1.5
- **Acceptance:** owner creates Rice / Dry Fruits / Dairy Creams in admin; tests for slug uniqueness.
- **Mode:** 🧑‍💻
- **Concepts:** models, migrations, `SlugField`, ForeignKey + `on_delete`.

### [ ] T3.2 ProductVariant + ProductImage
- **Description:** Pack-size variants with SKU, price (Decimal), weight; images with alt text; inline admin.
- **Depends on:** T3.1
- **Acceptance:** a product with 4 sizes created in one admin screen; price is Decimal; constraint tests.
- **Mode:** 🤝
- **Concepts:** DecimalField, `UniqueConstraint`, `CheckConstraint`, admin inlines, `ImageField` + Pillow.

### [ ] T3.3 Category listing + product detail (API + React pages)
- **Description:** Selectors, serializers, read-only API endpoints; React listing and detail pages; pack-size selector updating price from loaded variant data; server-filled meta tags for product URLs.
- **Depends on:** T3.2, T1.7
- **Acceptance:** pages work on mobile; at most 10 queries per API call (test); inactive products return 404; page source shows the product title.
- **Mode:** 🤝
- **Concepts:** DRF generic views, serializers, selectors, `select_related`/`prefetch_related`, React state, `useQuery`.

### [ ] T3.4 Search + filters + sorting
- **Description:** PostgreSQL full-text search; filters by size, price, in stock; sorting; pagination; filters stored in the URL query string in React.
- **Depends on:** T3.3
- **Acceptance:** "basmti" typo and "basmati" both find Basmati (trigram); filters combine correctly.
- **Mode:** 🧑‍💻
- **Concepts:** `SearchVector`, trigram similarity, query params, pagination.

---

## Phase 4 — Inventory (stock, batches, expiry)

### [ ] T4.1 StockMovement + stock services
- **Description:** `inventory.services.receive_stock / adjust_stock / deduct_stock / restore_stock`; append-only movements; `CHECK stock >= 0`.
- **Depends on:** T3.2
- **Acceptance:** every stock change writes a movement; negative stock impossible (test).
- **Mode:** 🤖
- **Concepts:** service layer, `transaction.atomic`, audit logs, DB constraints.

### [ ] T4.2 StockBatch + FEFO for creams
- **Description:** Batch model, receive batch, FEFO allocation, sellable stock = batches outside cut-off (Q6).
- **Depends on:** T4.1
- **Acceptance:** tests: oldest valid batch used first; expired and cut-off batches never sold.
- **Mode:** 🤝
- **Concepts:** FEFO, aggregate queries (`Sum`), date logic, timezones.

### [ ] T4.3 Concurrency-safe deduction
- **Description:** `select_for_update` in sorted order; a test with two threads buying the last unit.
- **Depends on:** T4.2
- **Acceptance:** concurrency test passes: exactly one buyer succeeds.
- **Mode:** 🤖
- **Concepts:** race conditions, row locks, deadlocks, `TransactionTestCase`.

### [ ] T4.4 Low-stock and expiry reports
- **Description:** Management commands `low_stock_report` and `expiry_report`; staff stock and expiry API + React screens.
- **Depends on:** T4.2, T2.4
- **Acceptance:** command output correct with test data; screens visible to staff only.
- **Mode:** 🧑‍💻
- **Concepts:** management commands, cron, reports.

---

## Phase 5 — Cart

### [ ] T5.1 Cart models + services
- **Description:** Cart for user or session; add, update, remove; quantity limited by sellable stock.
- **Depends on:** T4.2
- **Acceptance:** guest cart survives page reloads; tests for each service.
- **Mode:** 🤝
- **Concepts:** sessions, session keys, `get_or_create`.

### [ ] T5.2 Cart API + React cart UI
- **Description:** Cart endpoints; add-to-cart button, cart page, header count, free-delivery hint; all through one `useCart()` query + mutations.
- **Depends on:** T5.1, T3.3
- **Acceptance:** adding an item updates the header count without reload; cart survives reload; out-of-stock error from the API is shown; tests.
- **Mode:** 🧑‍💻
- **Concepts:** `useMutation`, cache invalidation, optimistic updates (and why not for stock), CSRF header.

### [ ] T5.3 Merge cart on login + price-change notice
- **Description:** Merge the guest cart into the user cart; flag items whose price changed.
- **Depends on:** T5.1, T2.2
- **Acceptance:** tests for merge rules (sum quantities, cap at stock).
- **Mode:** 🧑‍💻
- **Concepts:** `user_logged_in` signal (an allowed decoupled use), edge cases.

---

## Phase 6 — Checkout & orders

### [ ] T6.1 Order, OrderItem, OrderStatusHistory models
- **Description:** Models with snapshots, order number generator, `PROTECT` on variant.
- **Depends on:** T5.1
- **Acceptance:** migrations + model tests; admin read-only view.
- **Mode:** 🤝
- **Concepts:** denormalisation (snapshots), `PROTECT`, unique order numbers.

### [ ] T6.2 `place_order` service
- **Description:** Validate, lock, deduct stock (FEFO), calculate totals, create order + payment, idempotency token, `on_commit` email hook.
- **Depends on:** T6.1, T4.3
- **Acceptance:** tests: success, out of stock, blocked phone, over max COD (Q5), double-submit creates one order.
- **Mode:** 🤖
- **Concepts:** transactions, idempotency, `on_commit`, validation errors in services.

### [ ] T6.3 Checkout API + React checkout and thank-you pages
- **Description:** `checkout/quote/` and `checkout/` endpoints; single-page React checkout for guest and logged-in users; Pakistan phone validation on both sides; idempotency key per checkout page visit; button disabled while submitting.
- **Depends on:** T6.2
- **Acceptance:** guest can place an order end-to-end; field errors from the API appear next to fields; a repeated request with the same key returns the same order.
- **Mode:** 🧑‍💻
- **Concepts:** controlled forms, client vs server validation, idempotency keys, mapping API errors to fields.

### [ ] T6.4 Order state machine
- **Description:** `transition_order` with allowed transitions, history rows, stock restore on cancel/return.
- **Depends on:** T6.2
- **Acceptance:** every allowed and forbidden transition tested.
- **Mode:** 🤝
- **Concepts:** finite state machines, `TextChoices`, invariants.

### [ ] T6.5 Customer order history + tracking page
- **Description:** Account order list/detail API + React pages; public tracking by order number + phone (rate limited).
- **Depends on:** T6.4
- **Acceptance:** a user cannot see another user's order; wrong phone shows "not found".
- **Mode:** 🧑‍💻
- **Concepts:** object-level permissions, information leakage, rate limiting.

### [ ] T6.6 Stale order auto-cancel
- **Description:** `cancel_stale_orders` management command (Q7).
- **Depends on:** T6.4
- **Acceptance:** test with time freezing: old pending orders cancelled and stock restored.
- **Mode:** 🧑‍💻
- **Concepts:** time-based logic, `freezegun`/`time-machine`, cron.

---

## Phase 7 — Payments

### [ ] T7.1 COD payment flow
- **Description:** Payment record lifecycle: PENDING → COLLECTED on delivery; staff marks collected.
- **Depends on:** T6.4
- **Acceptance:** delivered order always has a collected payment (test).
- **Mode:** 🧑‍💻
- **Concepts:** payment records vs order status, reconciliation.

### [ ] T7.2 Refunds (partial and full)
- **Description:** Refund service per item or amount, `refund_status`, cannot refund more than paid.
- **Depends on:** T7.1
- **Acceptance:** tests for partial, full, and over-refund rejection.
- **Mode:** 🤝
- **Concepts:** money invariants, Decimal arithmetic.

### [ ] T7.3 (Later) Online gateway: JazzCash / Easypaisa
- **Description:** Gateway adapter, webhook view with signature check, idempotency, reconciliation command.
- **Depends on:** T7.1, merchant account
- **Acceptance:** sandbox payments succeed; duplicate webhook ignored; bad signature rejected.
- **Mode:** 🤝
- **Concepts:** webhooks, HMAC signatures, idempotency keys, adapter pattern.

---

## Phase 8 — Shipping & delivery zones

### [ ] T8.1 DeliveryZone model + admin
- **Description:** Chashma zones with fee and `cream_allowed` (Q3); connect Address and Order.
- **Depends on:** T6.1
- **Acceptance:** owner manages zones in admin; inactive zones hidden at checkout.
- **Mode:** 🧑‍💻
- **Concepts:** reference data, data migrations for seed data.

### [ ] T8.2 Shipping fee rules in checkout
- **Description:** Fee by zone, free above threshold (Q4), block creams in zones without cold delivery.
- **Depends on:** T8.1, T6.2
- **Acceptance:** tests for each rule; fee shown before placing the order.
- **Mode:** 🧑‍💻
- **Concepts:** pricing rules in services, boundary tests.

### [ ] T8.3 Delivery areas page
- **Description:** Public React page listing zones and fees from `zones/`.
- **Depends on:** T8.1
- **Acceptance:** page lists only active zones.
- **Mode:** 🧑‍💻
- **Concepts:** `ListAPIView`, `staleTime` for rarely changing data.

---

## Phase 9 — Notifications

### [ ] T9.1 Email setup + templates
- **Description:** Provider (Q8) via SMTP; HTML + text templates; SPF/DKIM notes for the domain.
- **Depends on:** T6.2
- **Acceptance:** real email received in dev from a test account; console backend in tests.
- **Mode:** 🤝
- **Concepts:** email backends, templates for email, deliverability (SPF/DKIM/DMARC).

### [ ] T9.2 Order emails on each status change
- **Description:** Customer emails on placed/confirmed/out-for-delivery/delivered/cancelled; staff email on new order; sent `on_commit`.
- **Depends on:** T9.1, T6.4
- **Acceptance:** tests check the outbox; an email failure never breaks the order.
- **Mode:** 🧑‍💻
- **Concepts:** `mail.outbox`, failure isolation, logging.

---

## Phase 10 — Staff dashboard & reports

### [ ] T10.1 Dashboard home + order queue
- **Description:** Staff API + React screens under `/staff/` (separate code-split chunk): counters, alert cards, queue by status, tap-to-call phone, transition buttons from the allowed next statuses returned by the API.
- **Depends on:** T6.4, T2.4
- **Acceptance:** staff process an order from PENDING to DELIVERED only with dashboard buttons; customer bundle does not contain staff code.
- **Mode:** 🤝
- **Concepts:** aggregation queries, DRF actions, permission classes, route-level code splitting.

### [ ] T10.2 PDF invoice
- **Description:** Django HTML invoice template rendered to PDF on the server (not in React); download link in React.
- **Depends on:** T6.4
- **Acceptance:** PDF shows snapshot data and correct totals.
- **Mode:** 🤖
- **Concepts:** HTML-to-PDF, `HttpResponse` content types, system libraries.

### [ ] T10.3 Sales report (owner)
- **Description:** Sales by period, top products, by zone; CSV export; React report screen with simple charts.
- **Depends on:** T10.1
- **Acceptance:** report numbers match a test dataset exactly.
- **Mode:** 🧑‍💻
- **Concepts:** `annotate`, `TruncDay`, CSV responses.

### [ ] T10.4 Block phone + COD controls
- **Description:** BlockedPhone admin + "block" button on order detail; checkout check.
- **Depends on:** T10.1, T6.2
- **Acceptance:** blocked phone cannot place an order (test).
- **Mode:** 🧑‍💻
- **Concepts:** normalising phone numbers, abuse prevention.

---

## Phase 11 — Promotions, reviews, wishlist (later)

### [ ] T11.1 Coupons
- **Description:** Percent or fixed coupons, min order, expiry, usage limits; applied in `place_order`.
- **Depends on:** T6.2
- **Acceptance:** tests for each limit; concurrent use cannot exceed the limit.
- **Mode:** 🧑‍💻
- **Concepts:** validation rules, `F()` expressions, locking.

### [ ] T11.2 Reviews
- **Description:** Verified-buyer reviews with moderation.
- **Depends on:** T6.5
- **Acceptance:** only buyers of the product can review; owner approves before display.
- **Mode:** 🧑‍💻
- **Concepts:** moderation workflow, aggregate ratings.

### [ ] T11.3 Wishlist
- **Description:** Save products; ManyToMany with a through model.
- **Depends on:** T2.2, T3.3
- **Acceptance:** add/remove works from product cards in React; tests.
- **Mode:** 🧑‍💻
- **Concepts:** ManyToMany, through models.

---

## Phase 12 — SEO, performance, security hardening

### [ ] T12.1 SEO
- **Description:** Server-filled meta tags, Open Graph, Product + LocalBusiness JSON-LD in the SPA shell (from T1.7); sitemap, robots.txt, canonical URLs.
- **Depends on:** T3.4
- **Acceptance:** Google Rich Results test passes for a product page; WhatsApp link preview shows the product name, image, and price.
- **Mode:** 🧑‍💻
- **Concepts:** `django.contrib.sitemaps`, structured data, how crawlers see an SPA.

### [ ] T12.2 Performance
- **Description:** Image resizing to WebP + `srcset`, query count audit, route code-splitting, bundle size check (design.md §7), long cache headers for hashed assets.
- **Depends on:** T3.3
- **Acceptance:** Lighthouse mobile performance ≥ 90 on home and product pages; first-load JS under 150 KB gzipped.
- **Mode:** 🤝
- **Concepts:** image optimisation, bundle analysis, `React.lazy`, HTTP caching, Lighthouse.

### [ ] T12.3 Security hardening
- **Description:** `check --deploy` clean, security headers, rate limits, admin path, Sentry, `pip-audit`.
- **Depends on:** all launch features
- **Acceptance:** `python manage.py check --deploy` has no warnings; security review done.
- **Mode:** 🤝
- **Concepts:** HSTS, CSP basics, OWASP Top 10.

---

## Phase 13 — Testing & QA

### [ ] T13.1 Coverage + gap tests
- **Description:** Measure coverage; add missing tests to reach the targets in rules.md §8.
- **Depends on:** Phase 12
- **Acceptance:** coverage targets met in CI.
- **Mode:** 🧑‍💻
- **Concepts:** coverage reports, what not to test.

### [ ] T13.2 Manual QA checklist
- **Description:** Run every customer and staff flow on a real phone; fix bugs.
- **Depends on:** T13.1
- **Acceptance:** checklist 100% passed; bugs logged and fixed.
- **Mode:** 🧑‍💻
- **Concepts:** exploratory testing, bug reports.

---

## Phase 14 — Deployment & go-live

### [ ] T14.1 Production config
- **Description:** Production settings, Gunicorn config, `systemd` unit files, Nginx site config (serves `frontend/dist/`, proxies `/api` and `/admin` to Gunicorn) and a deploy script. No Docker (see Architecture §9).
- **Depends on:** T13.2
- **Acceptance:** `check --deploy` passes with prod settings; config files live in `deploy/`.
- **Mode:** 🤝
- **Concepts:** systemd services, reverse proxy, static vs dynamic files.

### [ ] T14.2 Server setup
- **Description:** Buy the 1 GB VPS (Q10 decided); create 2 GB swap; SSH keys, firewall, non-root user, automatic security updates.
- **Depends on:** T14.1
- **Acceptance:** SSH by key only; only ports 22/80/443 open.
- **Mode:** 🤝
- **Concepts:** Linux users, UFW, SSH hardening.

### [ ] T14.3 Domain, DNS, HTTPS
- **Description:** Point domain to the VPS; Let's Encrypt certificate; email DNS (SPF/DKIM/DMARC).
- **Depends on:** T14.2, domain bought
- **Acceptance:** site loads on `https://`; SSL Labs grade A.
- **Mode:** 🤝
- **Concepts:** DNS A/MX/TXT records, TLS certificates.

### [ ] T14.4 Deploy, cron, backups, monitoring
- **Description:** Deploy script, cron jobs (§5.7 of Architecture), daily off-site backups, **restore test**, uptime monitor, Sentry.
- **Depends on:** T14.3
- **Acceptance:** restore from backup to a fresh database works; alerts reach the owner.
- **Mode:** 🤝
- **Concepts:** Gunicorn workers, Nginx reverse proxy, backups, observability.

### [ ] T14.5 Go-live checklist
- **Description:** Real products + photos loaded, policies published, test order placed end-to-end, staff trained.
- **Depends on:** T14.4
- **Acceptance:** owner signs off; first real order processed.
- **Mode:** 🤝
- **Concepts:** launch planning, rollback plan.
