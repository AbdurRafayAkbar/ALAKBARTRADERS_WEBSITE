# ALAKBARTRADERS — Project Memory

> Read this file and `Learning.md` at the start of **every** session. Update both at the end of every step.

## 1. Project summary

ALAKBARTRADERS is a family trading business in **Chashma** selling rice (Basmati, Sella, Kainat, broken),
dry fruits (almonds, cashews, pistachios, walnuts, raisins, mixes), and dairy milk creams (perishable).
We are building a production-ready Django monolith shop for retail customers in Chashma only.
Payment at launch: Cash on Delivery only. Delivery: the shop's own riders.
Scale: about 100 customers per month. The developer (owner of this repo) is learning Django while building,
with the AI as architect and mentor following the teaching rules in `rules.md` §10.

## 2. Confirmed decisions log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-28 | B2C only; no wholesale at launch | Owner choice; keeps pricing simple |
| 2026-10-28 | Fixed pack sizes only; each size is a `ProductVariant` with its own SKU, price, stock | Matches how stock is bought and sold |
| 2026-10-28 | About 20–50 variants at launch; no options beyond size | Owner estimate |
| 2026-10-28 | Creams tracked by batch + expiry, sold FEFO, stop selling N days before expiry; no batches for rice/dry fruits | Food safety for perishables only |
| 2026-10-28 | Mixed orders (creams + dry goods) allowed | Owner choice |
| 2026-10-28 | Delivery only in Chashma; zone-based flat fee + free-shipping threshold | Single city |
| 2026-10-28 | Own riders; staff update statuses; no rider login at launch | Simplicity |
| 2026-10-28 | COD only at launch; online gateways later; currency PKR | Owner choice |
| 2026-10-28 | COD controls: phone confirmation before dispatch, max COD value, blocked phones | Reduce fake orders |
| 2026-10-28 | Partial refunds per item, paid manually, recorded in the system | Spoiled perishables |
| 2026-10-28 | Guest checkout (phone required) + optional email/password account; OTP later | Low friction |
| 2026-10-28 | Roles: Owner (full), Staff (orders + stock only) | Owner choice |
| 2026-10-28 | Email notifications at launch; WhatsApp/SMS later | Cost |
| 2026-10-28 | Launch features: search + filters, PDF invoice, basic sales report. Later: coupons, reviews, wishlist | Scope control |
| 2026-10-28 | English at launch, code i18n-ready for Urdu | Scope control |
| 2026-10-28 | No Redis/Celery at launch | ~3–4 orders per day |
| 2026-10-28 | Dev on plain Windows + venv + local PostgreSQL; Docker only for deploy | Lower setup cost |
| 2026-10-28 | Start mostly 🤖 "I build, you study", shift to 🧑‍💻 | Owner choice |
| 2026-10-28 | Domain: owner will buy (register in own name, 2FA). Hosting decided at Phase 14 | Budget; no hosting cost during development |
| 2026-10-28 | Git repo initialised on branch `main`, remote `origin` = github.com/AbdurRafayAkbar/ALAKBARTRADERS_WEBSITE | Owner request |
| 2026-10-28 | Frontend: React (Vite + TypeScript) SPA + Django REST Framework API at `/api/v1/`, same-origin session auth + CSRF | Owner choice over the recommended templates + HTMX. Costs and SEO mitigation recorded in Architecture.md §2.1–2.2 |
| 2026-10-28 | Brand palette: `#9CAF88` sage (main), `#A7A7A7` grey (secondary), `#CC5500` burnt orange (third), plus darker text-safe shades | Owner colours; shades added to pass WCAG AA. **Superseded 2026-10-30** by the logo palette |
| 2026-10-28 | Step 2 draft documents approved by the owner (now v0.2) | Owner approval |
| 2026-10-28 | Q1: Django 5.2 LTS | Owner accepted the default; long support window |
| 2026-10-28 | Q12: Vite SPA, Django fills meta tags, session auth + CSRF, TypeScript strict, TanStack Query + React Router + Tailwind v4 | Owner accepted the recommended defaults |
| 2026-10-28 | Build the frontend first against mock data in `frontend/src/api/`; build the backend in the next phase | Owner request. The mock layer has the same shapes as the planned DRF API, so only `src/api/` changes later |
| 2026-10-28 | Step 3 quiz postponed; default questions stay in Learning.md and the owner will change them later | Owner request |
| 2026-10-28 | Font: Archivo (variable, self-hosted). Wide width for headings, narrow width for prices | One family, legible on cheap phones, no Google Fonts request |
| 2026-10-29 | Font changed to Bricolage Grotesque (variable, self-hosted); `font-wide` renamed `font-display` | Owner asked for a different font. Same rules: one family, self-hosted |
| 2026-10-29 | Hero background is CSS/SVG (`HeroBackdrop`); three.js removed | Owner asked to change it. Lighter on cheap phones, about 490 kB less JavaScript |
| 2026-10-29 | Header spans the full window: logo left, nav centred, search and cart right. `Container` widened to 88rem | Owner said the nav should fill the screen, not sit in the middle |
| 2026-10-28 | Logo (green `#035A3A` + gold `#CAA753`) is used as an image; the site keeps the owner palette | Owner said to try their palette first; revisit if the two clash. **Superseded 2026-10-30:** the site now uses the logo palette |
| 2026-10-28 | Phone layout: swipe row for featured products, compact category rows, two-row cart lines, smaller section padding below `sm` | Owner said cards looked bad on phones |
| 2026-10-28 | Frontend preview hosted on Cloudflare Pages (Git integration: root `frontend`, build `npm run build`, output `dist`). SPA fallback via `public/_redirects`. Backend hosting still decided at Phase 14 | Owner request. Free static hosting; mock data is bundled, so no API is needed yet |
| 2026-10-29 | Hosting: one self-managed 1 GB VPS (RackNerd or IONOS VPS XS, about $2–3/month), bought at Phase 14. No Docker on the server: Nginx, Gunicorn and PostgreSQL run as systemd services with 2 GB swap. React is built on the PC and `dist/` is uploaded. Owner maintains the server. Replaces the earlier "Docker for deploy" plan | Owner budget is $2–3/month; 1 GB RAM cannot comfortably run Docker plus the stack |
| 2026-10-29 | SEO goal: income comes from **sales** driven by Google Search and free Google Merchant Center listings. No ads (AdSense) on the shop. The site follows Google Search Essentials: Django puts the real page content and meta tags in the HTML it sends (the same content React shows, so no cloaking), URLs stay stable with canonical tags, and there is no hidden text, keyword stuffing or fake reviews. Details in design.md §8 | Owner wants SEO and income "according to Google's rules". Ads on a small shop earn little and slow the pages; Merchant Center listings are free and show products with price in Google |
| 2026-10-29 | `/shop/` (all products) is a page URL and stays | The frontend already links to it; changing page URLs later costs search ranking |
| 2026-10-30 | Frontend linter stays **oxlint** (not ESLint), with Prettier for formatting; both run in CI | The Vite template already set up oxlint; it is much faster and covers the rules we need |
| 2026-10-30 | Customers order without logging in (no Google/Gmail sign-in). Checkout address: house number (e.g. "House#999"), block/category (e.g. "CAT-V"), colony name, all required; the house name written outside the house is optional; landmark optional | Owner request. Matches how addresses are written in Chashma and lets riders find the house |
| 2026-10-30 | Site palette is the logo's green `#035A3A` and gold `#CAA753` (Emerald) on every page. The other trial palettes, per-route palettes and the palette switcher are removed. Replaces the sage palette of 2026-10-28 (design.md §1.2) | Owner chose the logo theme after the per-page trial |
| 2026-10-28 | Work is pushed to GitHub (`AbdurRafayAkbar/ALAKBARTRADERS_WEBSITE`, branch `main`) as small, separate commits | Owner wants each change easy to review or revert |

## 3. Open questions / pending decisions

See `Architecture.md` §10. Q1, Q10 and Q12 are decided (see the log above). Still open:
- Q11: product photos (owner will share later). Logo received.
- Real product names, prices, delivery zones, phone, address and FAQ answers. Placeholders are marked `TODO(owner)` in `frontend/src/api/mock/data.ts`, `frontend/src/config/site.ts` and `frontend/src/pages/home/Faq.tsx`.

## 4. Current position

- **Phase:** 1 — Frontend first (backend next)
- **Task:** T2.2 done. T1.6 done (owner chose the logo palette on 2026-10-30).
- **Step:** Customers can sign up, log in, log out and reset a password from React. Guests can still order. Next backend task is T2.3 (addresses and profile).

## 5. Last completed step

- 2026-10-30: Logo palette on every page.
  - `@theme` in `frontend/src/styles/index.css` holds the Emerald values; other palettes, `config/palettes.ts` and `PaletteSwitcher` deleted.
  - Checks: typecheck, tests (23), build pass. Lint shows only the existing warnings.

- 2026-10-30: T2.2 signup, login, logout and password reset.
  - Session-auth API under `/api/v1/auth/` with CSRF checked on every POST; React fetches the CSRF cookie before the first POST.
  - Rate limits: login 5/min, signup 10/hour, password reset 5/hour per IP.
  - Dev prints reset emails in the runserver terminal. Production needs a real email backend before launch.
  - React pages under `/accounts/`, `useMe()` hook, Log in / Log out in the header.
  - Checks: pytest (70), ruff, vitest (23), typecheck, lint and build pass.

- 2026-10-30: T2.1 custom User model (`apps/accounts`).
  - Users log in with email, not a username; email is unique ignoring letter case; optional phone field.
  - `AUTH_USER_MODEL = "accounts.User"`; first `migrate` on the dev database done.
  - Admin pages for users. Checks: pytest (45, 11 of them for accounts), ruff check and ruff format pass.

- 2026-10-30: T1.8 frontend tooling in CI.
  - Prettier config and scripts; codebase formatted. Linter stays oxlint.
  - MSW tests for the API client (CSRF header, 204, error bodies).
  - New `frontend` CI job: `npm ci`, type check, lint, Prettier check, tests (11), build.

- 2026-10-30: T1.7 Django serves the SPA shell, built for Google Search (design.md §8.1).
  - Page URLs return the Vite `index.html` with the title, description, canonical, robots and Open Graph tags filled in, and the page heading and text inside `#root`.
  - Real 404 status for unknown pages; `noindex` on cart, search, 404 and product pages (until T3.3).
  - WhiteNoise serves the build; hashed `/assets/` files are cached for a year.
  - Checks: pytest (34), ruff check and ruff format pass; smoke test against the real build passes.

- 2026-10-29: Font, hero background and header changed after owner feedback.
  - Font is Bricolage Grotesque; three.js hero replaced by a CSS/SVG backdrop; header is full width with centred nav.
  - Removed packages: `three`, `@types/three`, `@fontsource-variable/archivo`.
  - Checks: typecheck, tests (6), build and lint pass. Lint shows only the existing fast-refresh warnings.

- 2026-10-28: Phone layout pass after owner feedback ("not responsive, cards don't look good on phone").
  - Header top bar no longer wraps; palette switcher is a small round button on phones.
  - Hero promise cards, rate board, category cards, featured products (swipe row), product page and cart reworked for 375 px screens.
  - Intro title breaks between words, not inside a word.
  - Added `frontend/public/_redirects` for Cloudflare Pages.
  - Checks: typecheck, tests (6) and build pass.

- 2026-10-28: Redesign after owner feedback ("too simple, add animation, background, hover effects").
  - Home: intro curtain, three.js hero (instanced rice grains and stars, lazy chunk), word-by-word headline, marquee, scroll reveals.
  - All pages: palette per route (design.md §1.2a), hover effects and motion (design.md §1.2b), bottom-left palette switcher.
  - Checks: `npm run typecheck`, `npm test` (6 tests), `npm run build` pass. Lint shows only the existing fast-refresh warnings.

- 2026-10-28: Customer frontend built in `frontend/` on mock data.
  - Layout: header (top bar, nav, search, cart count, mobile menu), footer, skip link.
  - Home: hero with the "Today's rates" board, categories, featured products, how ordering works, delivery areas, FAQ.
  - Pages: shop (all / category / search), product detail with pack sizes and add to cart, cart with quantity changes, delivery areas, 404. All pages except home load lazily.
  - Checks: `npm run typecheck`, `npm test` (6 tests), `npm run build` and `npm run lint` pass. Lint shows 6 fast-refresh warnings only.

## 6. Known issues / technical debt

- Checkout button is a placeholder until the orders API exists (Phase 6).
- Mock cart lives in memory and resets on page reload.
- Page text for crawlers in `backend/apps/core/pages.py` is a hand copy of the React page text. Change both together until T3.3 / T12.1 read it from the database.
- Watch: WeasyPrint needs GTK on Windows. PDF development may need WSL or Docker (decide at T10.2).

## 7. Next step

Next task: T2.3 addresses and profile (address fields follow the guest address format). Try the flow: run `uv run python manage.py runserver` in `backend/` and `npm run dev` in `frontend/`, then open http://localhost:5173/accounts/signup/. Reset emails print in the runserver terminal. Owner creates their own admin account with `uv run python manage.py createsuperuser` in `backend/`. Owner picks one logo intro option (1–7) from the test page and sends real content and photos. Then the backend phase starts: T0.2 (tools install), T1.1 (Django project), and the real API behind `frontend/src/api/`.
