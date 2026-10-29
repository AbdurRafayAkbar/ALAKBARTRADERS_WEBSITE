# ALAKBARTRADERS — Project Rules

> **Status:** v0.2 (2026-10-28). Owner approved the drafts. Updated for the React frontend.
> Each rule has a **Why** so the reason is clear, not only the rule.

---

## 1. Project structure

```
ALAKBARTRADERS_Website/
├── backend/                # Django project (run all Python commands from here)
│   ├── config/                 # Django project package
│   │   ├── settings/
│   │   │   ├── base.py         # shared settings
│   │   │   ├── dev.py
│   │   │   └── prod.py
│   │   ├── urls.py
│   │   └── wsgi.py / asgi.py
│   ├── apps/
│   │   └── <app_name>/
│   │       ├── models.py
│   │       ├── services.py     # write operations + business rules
│   │       ├── selectors.py    # read queries
│   │       ├── api/
│   │       │   ├── serializers.py  # validate input, shape JSON output
│   │       │   ├── views.py        # thin: validate, call service/selector, return JSON
│   │       │   └── urls.py
│   │       ├── admin.py
│   │       ├── management/commands/
│   │       └── tests/
│   ├── templates/              # only: SPA shell with meta tags, emails, invoice PDF
│   ├── media/                  # uploads (never committed)
│   ├── .env.example            # all env vars with dummy values
│   ├── pyproject.toml          # dependencies + Ruff + pytest config
│   ├── manage.py
│   ├── uv.lock                 # exact package versions
│   └── .python-version         # Python 3.14 for uv
├── frontend/               # React app (Vite + TypeScript)
│   ├── src/
│   │   ├── api/            # typed API client + TanStack Query hooks
│   │   ├── components/     # reusable UI (ProductCard, QuantityStepper)
│   │   ├── pages/          # one file per route (ProductDetailPage)
│   │   ├── routes/         # React Router config
│   │   ├── hooks/          # shared hooks (useCart, useDebounce)
│   │   ├── styles/         # Tailwind theme tokens (design.md §1.2)
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts      # dev proxy /api to Django
│   ├── package.json + package-lock.json
│   └── tsconfig.json
├── docs/                   # these design files
├── deploy/                 # systemd units, gunicorn and nginx config (Phase 14)
└── .gitignore
```
**Why:** every developer (and every AI session) knows where code goes without asking.

## 2. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Apps | plural, lower_snake | `orders`, `catalog` |
| Models | singular PascalCase | `ProductVariant` |
| Fields, functions | lower_snake | `stock_quantity`, `place_order()` |
| Constants / choices | UPPER_SNAKE / `TextChoices` | `OrderStatus.CONFIRMED` |
| URLs names | `app:verb_noun` style | `orders:order_detail` |
| API URLs | `/api/v1/<plural-resource>/`, kebab-case | `/api/v1/products/`, `/api/v1/blocked-phones/` |
| Serializers | `<Model><Purpose>Serializer` | `ProductDetailSerializer`, `CheckoutInputSerializer` |
| JSON fields | snake_case (same as Python) | `unit_price`, `stock_state` |
| React components / files | PascalCase | `ProductCard.tsx` |
| React pages | `<Name>Page` | `CheckoutPage.tsx` |
| Hooks | `useX`, camelCase | `useCart()`, `useProduct(slug)` |
| TS variables / functions | camelCase | `cartTotal`, `formatPrice()` |
| Branches | `<type>/<task-id>-short-slug` | `feat/T5.2-cart-add-item` |

**Why:** consistent names make search and review fast.

## 3. Coding standards

- PEP 8, enforced by **Ruff** (lint + format; replaces Black/isort/flake8). **Why:** one fast tool, no style debates.
- **Type hints** on all service and selector functions. **Why:** catches wrong-argument bugs early and documents intent.
- **Docstrings** on every service function: what it does, what it raises. **Why:** services hold the business rules, so they need explaining.
- **pre-commit** runs Ruff before every commit. **Why:** bad formatting never reaches the repo.
- Functions should do one thing; prefer about 40 lines or fewer. **Why:** small functions are easier to test and review.
- No commented-out code in commits. **Why:** Git already keeps history.

### 3.1 Frontend (React) standards
- **TypeScript `strict: true`**, no `any` without a comment explaining why. **Why:** API shape mistakes fail at build time, not in front of a customer.
- **ESLint + Prettier**, run by pre-commit and CI. **Why:** same reason as Ruff.
- **All server data goes through TanStack Query hooks** in `src/api/`. Components never call `fetch` directly. **Why:** one place for caching, loading, errors, and the CSRF header.
- **The frontend never calculates money that matters.** It shows prices, line totals, and fees returned by the API (`checkout/quote/`). **Why:** the server is the only source of truth; client values can be edited in the browser.
- **Components stay small and presentational**; pages fetch data and pass it down. **Why:** small parts are easy to test and reuse.
- **Format money with one helper** (`formatPrice("1250.00")` gives "Rs 1,250"). Prices arrive as strings, never JS numbers. **Why:** JS numbers are floats (see §5).
- **No `dangerouslySetInnerHTML`** except sanitised content. **Why:** XSS.
- **Every page sets its title** and handles loading, empty, and error states. **Why:** see design.md §6.

## 4. Django conventions

- **Business logic lives in `services.py`**, never in API views, serializers, React code, model `save()`, or signals. **Why:** one place to read, test, and change a rule (e.g. "how stock is deducted").
- **Reads with business meaning go in `selectors.py`** (e.g. `get_sellable_stock(variant)`). **Why:** the same query is not rewritten in five views.
- **API views are thin:** validate input with a serializer, call one service or selector, return JSON. Serializers validate shape and format only; business rules (stock, COD limits) stay in services. **Why:** views are hard to unit test; services are easy.
- **One error shape** for all API errors: `{"code", "message", "fields"}` (Architecture.md §6). **Why:** React handles errors in one place.
- **API is versioned** (`/api/v1/`). **Why:** a future mobile app keeps working when the web changes.
- **No signals for business logic.** Use them only for decoupled side effects if really needed. **Why:** signals hide control flow; you cannot see what happens when an order is saved.
- **Custom User model from the first migration.** **Why:** switching later means rewriting migrations with live data.
- **Settings split** into `base/dev/prod`; environment-specific values only from env vars (`django-environ`). **Why:** the same code runs everywhere; secrets are never in Git.
- **Model choices** use `TextChoices`. **Why:** readable DB values and type-safe code.
- **`select_related` / `prefetch_related`** on list pages; check query count in tests. **Why:** avoids N+1 queries (one query per product row).
- **Migrations:** one migration per logical change, committed with the code, never edited after being pushed to `main`. **Why:** other environments have already applied them.
- **Deactivate, don't delete** products, variants, zones. **Why:** past orders reference them.

## 5. Money handling

- Only `DecimalField(max_digits=12, decimal_places=2)` and Python `Decimal`. **Never `float`.** **Why:** `0.1 + 0.2 != 0.3` in float; money must be exact.
- Create Decimals from strings: `Decimal("199.00")`, not `Decimal(199.0)`. **Why:** a float input carries the float error with it.
- Currency stored explicitly on `Order` (`"PKR"`). **Why:** if another currency is ever added, old orders stay correct.
- Totals are calculated **once**, in a service, and stored on the order. **Why:** the invoice must always show what the customer agreed to pay.
- Rounding: `ROUND_HALF_UP` to 2 decimal places, only at the end of a calculation. **Why:** rounding at each step accumulates errors.
- API sends money as **strings** (`"1250.00"`), DRF `DecimalField(coerce_to_string=True)`. **Why:** a JSON number becomes a float in JavaScript.

## 6. Stock and order integrity

- Every stock change goes through `inventory.services` and writes a `StockMovement`. **Why:** you can always explain the current stock number.
- Order placement runs inside `transaction.atomic()` with `select_for_update()` on variants, locked in id order. **Why:** stops two customers buying the same last item; sorted locking avoids deadlocks.
- Database `CHECK` constraint: stock never below 0. **Why:** a second safety net if code has a bug.
- Order status changes only through `orders.services.transition_order()`, which checks allowed transitions. **Why:** no order can jump from PENDING to DELIVERED by mistake.
- Side effects (emails) run with `transaction.on_commit()`. **Why:** no "order confirmed" email for an order that was rolled back.
- Checkout sends a one-time **idempotency key** (UUID made by React when the checkout page opens). The server stores it on the order with a unique constraint. **Why:** a double-click, retry, or refresh does not create two orders.
- Future payment webhooks: verify signature, unique `provider_txn_id`, amount check. **Why:** fake or repeated callbacks must not mark orders paid.

## 7. Security rules

- Never commit `.env`, secrets, DB dumps, or `media/`. **Why:** Git history is forever.
- `DEBUG=False` in prod, `ALLOWED_HOSTS` set, HTTPS + HSTS + secure cookies. **Why:** debug pages leak settings and code.
- Every staff API endpoint has a DRF permission class, and a test proves a customer gets 403. Hiding a React route is **not** security. **Why:** anyone can call the API directly.
- Never trust client input: price, totals, and stock always come from the database, not the request body. **Why:** anyone can edit a JSON request in browser dev tools.
- Session auth + CSRF header for every unsafe API method; no tokens in `localStorage`. **Why:** injected scripts cannot read `HttpOnly` cookies.
- Never put secrets in frontend env vars (`VITE_*`). **Why:** everything in the React build is public.
- No raw SQL with string formatting. Use the ORM or parameters. **Why:** SQL injection.
- Rate limit login, signup, checkout, and tracking. **Why:** brute force and fake COD orders.
- Personal data (phone, address) is shown only to the owner of the order and to staff. **Why:** privacy.

## 8. Testing rules

- **pytest + pytest-django + factory_boy** for the backend. **Why:** short tests; factories build test data quickly.
- **API tests** use DRF `APIClient` and check status code, error `code`, and JSON shape. **Why:** the API is the contract with React.
- **Vitest + React Testing Library** for the frontend: test what the user sees and clicks, not component internals. **Why:** tests survive refactors.
- Frontend tests mock the API with MSW (Mock Service Worker). **Why:** fast tests with no running Django.
- Every service function has tests for: the normal case, each error case, and edge cases. **Why:** services hold the rules that cost money if wrong.
- Concurrency-critical code (stock deduction) has a test that simulates two buyers. **Why:** race conditions don't appear in manual testing.
- Permission tests for every staff URL. **Why:** see Security.
- Target coverage: ≥ 90% for `services.py`, ≥ 75% overall. **Why:** focus where bugs are expensive.
- Tests run in CI on every push (pytest, Ruff, `tsc --noEmit`, ESLint, Vitest, `npm run build`); a red CI blocks the merge. **Why:** `main` is always deployable.
- Write the test first (TDD) for services. **Why:** you define the rule before writing the code.

## 9. Git rules

- `main` is always deployable; no direct commits after Phase 1 setup. **Why:** a broken `main` blocks deploys.
- One branch per task: `feat/T3.2-product-variant-model`. **Why:** small, reviewable changes.
- **Conventional Commits:** `feat(cart): add quantity update`, `fix(orders): restore stock on cancel`, `docs:`, `test:`, `refactor:`, `chore:`. **Why:** readable history; easy changelogs.
- Pull request per task with a checklist: tests pass, docs updated, migrations included. Merge with squash. **Why:** one clean commit per task on `main`.
- Never force-push to `main`. **Why:** it rewrites shared history.

## 10. AI working rules

- Read `docs/Memory.md` and `docs/Learning.md` at the start of every session. **Why:** no lost context between sessions.
- One task at a time; only one task `[~]` in `Task.md`. **Why:** focus, and small reviewable changes.
- Touch only files the current task needs. **Why:** unrelated edits hide in diffs and cause bugs.
- After each completed task, update `Task.md`, `Memory.md`, and `Learning.md`. **Why:** the docs stay true.
- Ask before deviating from `Architecture.md`; record any agreed change there. **Why:** the architecture is a contract.
- Never assume a business decision; ask the owner. **Why:** a wrong guess becomes wrong code.
- Follow the teaching rules on every step: What & Why first, concepts with shop examples, trade-offs, task mode (🧑‍💻 / 🤝 / 🤖), understanding check at the end, official doc links. **Why:** the goal is a working shop **and** a developer who understands it.
- Show verification evidence (test output, command output) before calling a task done. **Why:** "it should work" is not proof.
- Respect keyword commands: `EXPLAIN`, `SIMPLER`, `QUIZ`, `I'LL TRY`, `JUST BUILD`, `RECAP`.
