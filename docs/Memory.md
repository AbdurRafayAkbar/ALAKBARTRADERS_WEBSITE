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
| 2026-10-28 | Brand palette: `#9CAF88` sage (main), `#A7A7A7` grey (secondary), `#CC5500` burnt orange (third), plus darker text-safe shades | Owner colours; shades added to pass WCAG AA (design.md §1.2) |
| 2026-10-28 | Step 2 draft documents approved by the owner (now v0.2) | Owner approval |
| 2026-10-28 | Q1: Django 5.2 LTS | Owner accepted the default; long support window |
| 2026-10-28 | Q12: Vite SPA, Django fills meta tags, session auth + CSRF, TypeScript strict, TanStack Query + React Router + Tailwind v4 | Owner accepted the recommended defaults |
| 2026-10-28 | Build the frontend first against mock data in `frontend/src/api/`; build the backend in the next phase | Owner request. The mock layer has the same shapes as the planned DRF API, so only `src/api/` changes later |
| 2026-10-28 | Step 3 quiz postponed; default questions stay in Learning.md and the owner will change them later | Owner request |
| 2026-10-28 | Font: Archivo (variable, self-hosted). Wide width for headings, narrow width for prices | One family, legible on cheap phones, no Google Fonts request |
| 2026-10-28 | Logo (green `#035A3A` + gold `#CAA753`) is used as an image; the site keeps the owner palette | Owner said to try their palette first; revisit if the two clash |

## 3. Open questions / pending decisions

See `Architecture.md` §10. Q1 and Q12 are decided (see the log above). Still open:
- Q11: product photos (owner will share later). Logo received.
- Real product names, prices, delivery zones, phone, address and FAQ answers. Placeholders are marked `TODO(owner)` in `frontend/src/api/mock/data.ts`, `frontend/src/config/site.ts` and `frontend/src/pages/home/Faq.tsx`.
- Which palette wins the per-page trial (design.md §1.2a). The owner will choose after viewing the pages.

## 4. Current position

- **Phase:** 1 — Frontend first (backend next)
- **Task:** T1.6 React app scaffold `[~]`
- **Step:** Frontend redesigned with motion and a per-page palette trial. Waiting for the owner to pick a palette.

## 5. Last completed step

- 2026-10-28: Redesign after owner feedback ("too simple, add animation, background, hover effects").
  - Home: intro curtain, three.js hero (instanced rice grains and stars, lazy chunk), word-by-word headline, marquee, scroll reveals.
  - All pages: palette per route (design.md §1.2a), hover effects and motion (design.md §1.2b), bottom-left palette switcher.
  - Checks: `npm run typecheck`, `npm test` (6 tests), `npm run build` pass. Lint shows only the existing fast-refresh warnings.
  - Nothing committed yet.

- 2026-10-28: Customer frontend built in `frontend/` on mock data.
  - Layout: header (top bar, nav, search, cart count, mobile menu), footer, skip link.
  - Home: hero with the "Today's rates" board, categories, featured products, how ordering works, delivery areas, FAQ.
  - Pages: shop (all / category / search), product detail with pack sizes and add to cart, cart with quantity changes, delivery areas, 404. All pages except home load lazily.
  - Checks: `npm run typecheck`, `npm test` (6 tests), `npm run build` and `npm run lint` pass. Lint shows 6 fast-refresh warnings only.
- Nothing committed yet.

## 6. Known issues / technical debt

- Checkout button is a placeholder until the orders API exists (Phase 6).
- Mock cart lives in memory and resets on page reload.
- Watch: WeasyPrint needs GTK on Windows. PDF development may need WSL or Docker (decide at T10.2).

## 7. Next step

Owner runs `npm run dev` in `frontend/`, reviews the pages, picks one palette (then all routes use it and the others are deleted), and sends real content and photos. Then the backend phase starts: T0.2 (tools install), T1.1 (Django project), and the real API behind `frontend/src/api/`.
