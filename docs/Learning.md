# ALAKBARTRADERS — Learning Tracker

> Personal learning tracker. Updated at the end of every step.
> Status: 🔴 new · 🟡 practicing · 🟢 confident

## 1. Skill profile

| Skill | Start (2026-10-28) | Now |
|---|---|---|
| Python | Intermediate | Intermediate |
| Django | Intermediate | Intermediate |
| HTML / CSS / JS | Intermediate | Intermediate |
| SQL / PostgreSQL | Intermediate | Intermediate |
| Git | Intermediate | Intermediate |
| Linux / server deployment | Intermediate | Intermediate |
| Docker | Intermediate | Intermediate |
| React / TypeScript | Unknown (to confirm) | Unknown |
| Django REST Framework | Unknown (to confirm) | Unknown |

Also experienced with: APIs, webhooks, backend systems, automation (keep these explanations short).
Time: about 4 hours per day. Preferred start mode: mostly 🤖, moving toward 🧑‍💻.

## 2. Learning roadmap by phase

| Phase | Main concepts |
|---|---|
| 0 Design | System design docs, ERD, state machines, trade-offs |
| 1 Skeleton | Project vs app, settings split, env vars, pytest, Ruff, CI, DRF basics, Vite + React + TypeScript, Tailwind tokens, dev proxy, SPA shell |
| 2 Auth | Custom User, session login via API, CSRF with an SPA, password hashing, Groups/permissions, DRF permission classes, data migrations |
| 3 Catalog | Models, migrations, ForeignKey/`on_delete`, DecimalField, constraints, admin inlines, serializers, `select_related`, PostgreSQL search, `useQuery` |
| 4 Inventory | Service layer, `transaction.atomic`, `select_for_update`, race conditions, deadlocks, FEFO, aggregates, management commands |
| 5 Cart | Sessions, cart merge, TanStack Query mutations, cache invalidation, optimistic updates |
| 6 Orders | Snapshots, idempotency keys, `on_commit`, state machines, controlled forms, API error mapping, object-level permissions |
| 7 Payments | Payment vs order status, refunds, Decimal invariants, webhooks + HMAC (later) |
| 8 Shipping | Reference data, pricing rules, boundary testing |
| 9 Notifications | Email backends, deliverability, failure isolation |
| 10 Dashboard | Aggregation (`annotate`, `TruncDay`), PDF generation, CSV export |
| 11 Extras | ManyToMany + through models, `F()` expressions, moderation |
| 12 Hardening | Sitemaps, structured data, server-filled meta tags for an SPA, code-splitting, bundle size, caching, image optimisation, `check --deploy`, OWASP |
| 13 QA | Coverage, test strategy, manual QA |
| 14 Deploy | Docker, Gunicorn, Nginx, Linux hardening, DNS, TLS, backups, monitoring |

## 3. Concepts learned

| Concept | In my words | Where used | Status |
|---|---|---|---|
| Premature optimisation | Don't add Redis/Celery/microservices before the load needs them | Architecture §2 | 🔴 |
| Domain vs hosting | A domain is only a name; a server must run Django behind it | Architecture §9 | 🔴 |
| SPA vs server-rendered SEO | WhatsApp and many crawlers do not run JavaScript, so Django must put title and meta tags in the HTML | Architecture §2.2, design §8 | 🔴 |
| WCAG contrast | Text needs 4.5:1 against its background; brand colours that fail get darker text shades | design §1.2 | 🔴 |
| Mock API layer | Pages call hooks in `src/api/`; today the hooks read mock data, later they call Django, and pages do not change | frontend/src/api | 🔴 |
| TanStack Query | Caches server data by key; after add-to-cart we write the new cart into the cache so the header count updates | frontend/src/api/hooks.ts | 🔴 |
| Code splitting | `React.lazy` loads a page's code only when someone visits it, so the first load is smaller | frontend/src/routes/routes.tsx | 🔴 |
| Prices as strings | Money comes from the server as text like `"450.00"` and is only formatted, never calculated, in the browser | frontend/src/lib/money.ts | 🔴 |
| SVG pattern | One small shape is defined once inside `<pattern>` and the browser tiles it to fill any area; `useId` keeps the pattern id unique on the page | frontend/src/pages/home/HeroBackdrop.tsx | 🔴 |
| Palette as CSS variables | Components use tokens only, so one `@theme` block sets every colour. During the palette trial a `data-palette` attribute swapped blocks of variables per page (removed 2026-10-30) | frontend/src/styles/index.css | 🔴 |
| IntersectionObserver | The browser tells us when an element scrolls into view, without listening to every scroll event | frontend/src/components/motion/Reveal.tsx | 🔴 |
| Transform containing block | An element with `transform` becomes the reference box for `position: fixed` children, so overlays must live outside animated wrappers | Layout, IntroCurtain | 🔴 |
| Accessible name of split text | Separate word spans can lose their spaces in the accessible name; keep one `sr-only` sentence and hide the animated copy | frontend/src/components/motion/SplitWords.tsx | 🔴 |

## 4. Mistakes and lessons

_None yet._

## 5. Glossary

| Term | Definition |
|---|---|
| Monolith | One application and one deploy containing all features |
| Variant | One sellable version of a product, e.g. "Basmati 5 kg" |
| SKU | Stock Keeping Unit: a unique code for one variant |
| FEFO | First Expired, First Out: sell the batch that expires soonest first |
| COD | Cash on Delivery |
| Snapshot | Copying data (price, address) into the order so later changes don't alter it |
| Idempotency | Doing the same request twice has the same effect as doing it once |
| State machine | A fixed list of statuses and the allowed moves between them |
| Race condition | Two operations at the same time interfere, e.g. two buyers get the last bag |
| SPA | Single-Page Application: the browser loads one HTML page and React draws every screen |
| DRF | Django REST Framework: toolkit for building JSON APIs with Django |
| Serializer | DRF class that validates incoming JSON and converts models to JSON |
| CSRF token | Secret value sent in a header so other sites cannot make requests with the user's cookies |
| TanStack Query | React library that fetches, caches, and refreshes server data |
| WCAG contrast ratio | Measure of how readable text is on its background; AA needs 4.5:1 for normal text |

## 6. Questions to revisit

_None yet._

## 7. Official documentation links

- Django docs: https://docs.djangoproject.com/en/stable/
- Django design philosophies: https://docs.djangoproject.com/en/stable/misc/design-philosophies/
- Custom user model: https://docs.djangoproject.com/en/stable/topics/auth/customizing/#substituting-a-custom-user-model
- Transactions: https://docs.djangoproject.com/en/stable/topics/db/transactions/
- `select_for_update`: https://docs.djangoproject.com/en/stable/ref/models/querysets/#select-for-update
- Python `decimal`: https://docs.python.org/3/library/decimal.html
- PostgreSQL explicit locking: https://www.postgresql.org/docs/current/explicit-locking.html
- Django REST Framework: https://www.django-rest-framework.org/
- React: https://react.dev/
- Vite: https://vite.dev/
- TanStack Query: https://tanstack.com/query/latest
- Tailwind CSS: https://tailwindcss.com/docs
- WCAG contrast (minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

## 8. Quiz history

_No quizzes yet._
