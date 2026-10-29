# ALAKBARTRADERS — UI / UX Design

> **Status:** v0.2 (2026-10-28). Owner approved the drafts. Brand colours decided. Logo and photos are still **placeholders** (Q11).
> Frontend is React (Architecture.md §2.2). "Component" in this file means a React component.

---

## 1. Brand identity

### 1.1 Personality and tone
- **Trustworthy, fresh, local.** A family trading business from Chashma that sells honest food at fair prices.
- Tone of copy: warm, simple, direct. Short sentences. Prices and weights always clear.
  Example: "Premium Basmati, aged 1 year. Long grains, rich aroma. Delivered in Chashma."
- Avoid: hype ("BEST EVER!!!"), fake urgency, stock photos of people.

### 1.2 Colour tokens (logo palette, decided 2026-10-30)

The site uses the logo's own colours: **#035A3A green** and **#CAA753 gold**. The owner chose this on 2026-10-30 after the per-page palette trial (§1.2a). It replaces the first owner palette (sage `#9CAF88`, grey `#A7A7A7`, burnt orange `#CC5500`, decided 2026-10-28).

Tokens live in one place: the `@theme` block in `frontend/src/styles/index.css`. Components only use token names (`bg-primary-900`, `text-accent-700`), so changing a colour is a single edit.

**Contrast check (WCAG AA needs 4.5:1 for normal text, 3:1 for large/bold text and UI borders). Page background is `surface` `#F5F9F6`:**

| Token | Value | Contrast | Use |
|---|---|---|---|
| `--color-primary` | `#4F8A6E` | 3.81 on surface; ink on it 4.03 | Surfaces and large shapes only. Never small text on light backgrounds |
| `--color-primary-50` | `#EDF5F0` | 7.49 on `primary-900` | Light tint for info boxes, hover rows; light text on dark green |
| `--color-primary-100` | `#D4E7DC` | — | Slightly stronger tint |
| `--color-primary-700` | `#0B6B47` | 6.16 on surface | Links, icons, green text on light backgrounds |
| `--color-primary-900` | `#035A3A` | 7.82 on surface | Logo green: top bar, footer, dark panels (light text), strong text |
| `--color-ink` | `#10241A` | 15.33 on surface | Body text |
| `--color-secondary` | `#B6C6BC` | 1.68 | Borders and dividers only. Never text |
| `--color-muted` | `#52665A` | 5.80 on surface | Secondary text (sizes, "per kg", timestamps) |
| `--color-accent` | `#CAA753` | ink on it 7.11 | Logo gold: **main call to action** with dark `on-accent` text, badges |
| `--color-accent-700` | `#7D5F17` | 5.61 on surface | Gold at normal text size, focus ring, accent hover |
| `--color-on-accent` | `#10241A` | 7.11 on accent | Text on the gold fill |
| `--color-surface` | `#F5F9F6` | — | Page background |
| `--color-card` | `#FFFFFF` | — | Raised panels and cards |
| `--color-glow` | `#CAA753` | — | Hover light and particles (decoration) |
| `--color-spark-from` / `-to` | `#E9C46A` / `#A7E3C4` | — | Heading highlight on dark surfaces only |
| `--color-danger` | `#B42318` | 6.19 on surface | Errors, "Out of stock" |

**Usage rules**
- One gold button per screen: the main action. Everything else uses green or outline buttons. Gold loses meaning if it is everywhere.
- Gold buttons always use dark text (`on-accent`), never white (white on gold is 2.29, fails).
- Gold `#CAA753` is never used for text on light backgrounds. Use `accent-700` instead.
- `secondary` is never used for text. Use `muted` instead.
- Light text only on `primary-900` (or darker). Errors always also show an icon and text.

### 1.2a Palette trial (2026-10-28, closed 2026-10-30)

The owner asked for a different palette on every page so they could pick the best one: Emerald (the logo's green and gold), Sage (the first owner palette), Saffron, Pistachio, Indus and Date palm, with a switcher to preview any palette on any page.

**Decided 2026-10-30:** the owner chose **Emerald, the logo palette**, for every page. The other palettes, the per-route `data-palette` attribute and the palette switcher were removed. The Emerald values are now the only tokens (§1.2).

### 1.2b Motion and effects (2026-10-28)

The owner found the first build too plain and asked for animation, a fitting background and varied hover effects.

- **Intro curtain:** on the home page only, a short curtain with the gold star plays once, then lifts to show the page. It sits outside the animated page wrapper (see Learning.md: transforms create a containing block).
- **Hero background:** `HeroBackdrop`, plain CSS and SVG: two large blurred colour fields drift slowly, a faint grid of logo stars fades in toward the right, and an SVG grain sits on top. It replaced the three.js scene on 2026-10-29 at the owner's request; no WebGL means no extra 490 kB chunk and no load on cheap phones. With reduced motion the colour fields stand still.
- **Scroll reveal:** the `Reveal` component adds `is-visible` when an element enters the viewport (IntersectionObserver). Lists stagger by `index`.
- **Headline:** `SplitWords` rises word by word. The full sentence is in an `sr-only` copy and the animated words are `aria-hidden`, so screen readers read one normal sentence.
- **Hover effects, by job:**
  - Buttons: `btn-sheen` (light sweep) for the main action, `btn-fill` (colour fills from below) for secondary buttons.
  - Text links: `link-grow` (underline grows) and `link-wipe` (colour wipe).
  - Cards: `lift` (rise and shadow), `spotlight` (glow follows the pointer through `--mx`/`--my`, set by `pointerGlow`), `tilt` with `tilt-pop` for 3D tilt toward the pointer.
  - Feedback: `animate-pop` when a quantity, a line total or "Added to cart" changes.
- **Rule:** two effects that both use `transform` go on separate nested elements, or one overrides the other.
- **Reduced motion:** every animation stops under `prefers-reduced-motion: reduce` (`prefersReducedMotion()` in `lib/motion.ts` for JavaScript effects).

### 1.3 Typography
- **Headings + body:** Bricolage Grotesque, a variable font served from our own build (no Google Fonts request). Big headings use `font-display` (optical sizing, tighter letter spacing); prices use `font-narrow` (75% width) with tabular numbers so columns of prices line up. Replaced Archivo on 2026-10-29 at the owner's request.
- **Urdu (later):** "Noto Nastaliq Urdu" or "Noto Naskh Arabic" (Naskh is easier to read at small sizes).
- Base size 16px; line-height 1.5; prices in semibold with tabular numbers.

### 1.4 Logo usage
- Header: spans the full window width (not the page container). Logo left, main links centred, search and cart right on desktop. Logo at most 40px tall on mobile.
- Page content: `Container` is at most 88rem wide, so wide screens show less empty margin.
- Needs a version that reads on both light and dark backgrounds and a square icon for the favicon/social share.
- The received logo is green `#035A3A` and gold `#CAA753`. It is shown as an image, and since 2026-10-30 the site colours are the same green and gold (§1.2).
- Home hero signature element: the "Today's rates" board, a price list with dotted leaders like a shop's rate board. Only one gold call to action per screen.

---

## 2. Layout rules (mobile first)

- Design for a **360px-wide phone first**; most customers will order from a phone.
- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- Product grid: 2 columns on mobile, 3 on tablet, 4 on desktop.
- Tap targets at least 44×44px.
- **Sticky bottom bar on mobile** for product detail ("Add to cart") and cart ("Checkout").
- Max content width 1200px on desktop.
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px only.
- Floating **WhatsApp contact** button (link to the shop number). Many local customers prefer to ask before ordering.

---

## 3. Customer pages (wireframe descriptions)

### Home
1. Header: logo, search icon, cart icon with count, menu.
2. Hero: one strong photo (rice or dry fruits), a one-line promise ("Fresh rice, dry fruits & cream, delivered in Chashma"), one button "Shop now".
3. Category tiles: Rice, Dry Fruits, Dairy Creams.
4. Best sellers (4–8 product cards).
5. Trust strip: "Cash on Delivery", "Delivery across Chashma", "Freshness guaranteed".
6. Footer: contact, delivery areas, policies, WhatsApp, social links.

### Category listing
- Title + short description.
- Filters (bottom sheet on mobile, side panel on desktop): pack size, price range, in stock only. Sort: popular, price low–high, price high–low, newest.
- Product cards: image, name, "from Rs X", pack sizes available, out-of-stock label.

### Product detail
- Image gallery (swipe on mobile).
- Name, short description, **pack-size selector as buttons** (1 kg | 5 kg | 10 kg | 25 kg), not a dropdown, so all options are visible.
- Price updates instantly when a size is picked (React state; variant data already loaded with the product); price per kg shown for comparison.
- Stock state: "In stock", "Only 3 left", "Out of stock".
- Creams: "Keep refrigerated" badge, "Best before" date of the batch that will be sent, delivery-zone note.
- Quantity stepper + "Add to cart" (sticky on mobile).
- Details: origin, grain length, storage tips. Related products.

### Search
- Search box with results as you type (TanStack Query, after 2+ characters, 300 ms debounce).
- Results page uses the same card grid. Empty state with category links.

### Cart
- Line items: image, name, size, unit price, quantity stepper, remove, line total.
- Price-change notice if a price changed since adding.
- Subtotal, "Delivery fee calculated at checkout", progress hint: "Add Rs 800 more for free delivery".
- Primary button "Checkout".

### Checkout (single page)
1. Contact: name, phone (required, Pakistan format), email (optional for guests, needed for email updates).
2. Delivery: zone dropdown (Chashma areas), house number (required, e.g. "House#999"), block or category (required, e.g. "CAT-V"), colony name (required), house name as written outside the house (optional), landmark (optional), delivery notes. No login or Google sign-in is needed to order.
3. Payment: Cash on Delivery (only option at launch, pre-selected).
4. Order summary with delivery fee and total.
5. "Place order" button; note: "Our team will call you to confirm your order."
- Guests can tick "Create an account" (password field appears).

### Order placed (thank you)
- Order number large and clear, summary, "We will call you on 03XX-XXXXXXX to confirm", link to track order, WhatsApp link.

### Order tracking
- Form: order number + phone. Result: status timeline (Placed → Confirmed → Packed → Out for delivery → Delivered).

### Login / Signup / Password reset
- Simple single-column forms, clear error messages, show/hide password.

### Customer account
- Orders list with status, order detail with timeline + invoice PDF download, saved addresses, profile, change password.

### About / Contact / Delivery areas / Policies
- About: story of the business, photos of the shop. Contact: phone, WhatsApp, address, hours, contact form.
- Delivery areas: list of Chashma zones with fees.
- Policies: returns (with special rules for perishables), privacy, terms.

---

## 4. Staff dashboard screens

- **Dashboard home:** counters for today (new orders, to confirm, out for delivery, delivered, revenue), alert cards (low stock, creams near expiry).
- **Order queue:** tabs by status; each row shows number, customer, phone (tap to call), zone, total, age. Oldest first.
- **Order detail:** items, address, notes, status history, action buttons for **only** the allowed next statuses, "Print invoice", "Block this phone".
- **Stock screen:** variants with stock levels, low-stock highlight; receive a cream batch (code, quantity, expiry date); stock adjustment with reason.
- **Expiry screen:** cream batches sorted by expiry, colour-coded (expired / within cut-off / OK).
- **Reports (owner):** sales by day/week/month, top products, orders by status, revenue by zone; CSV export.

Staff screens are **desktop and tablet first**, but must work on a phone for the owner.

---

## 5. Reusable components

Header, footer, mobile menu, search bar, product card, pack-size selector, price display (with price-per-kg),
quantity stepper, stock badge, cold-chain badge, cart line item, cart count (reads the cached cart query), order summary box,
form field (label + input + help + error), button (primary / secondary / danger), alert/toast messages,
status badge + status timeline, pagination, empty state, filter panel / bottom sheet, modal/confirm dialog,
data table (staff), stat card (staff), breadcrumbs.

---

## 6. Accessibility

- Target **WCAG 2.2 AA**.
- Semantic HTML (real `<button>`, `<label>`, headings in order).
- All images need `alt` text; decorative images use `alt=""`.
- Visible keyboard focus; every action works without a mouse.
- Errors are announced as text, not only by colour.
- Dynamic updates announced with `aria-live` regions (e.g. "Added to cart", cart count).
- On route change, React moves focus to the page `<h1>` and updates `document.title`, so screen readers know the page changed.
- Loading states use skeletons with `aria-busy`, not spinners alone.

## 7. Performance targets

- **Largest Contentful Paint < 2.5s** on a mid-range Android on 4G.
- Page weight < 1 MB on home and listing pages.
- Images: WebP, resized per screen (`srcset`), lazy-loaded below the fold.
- CSS: Tailwind build, under 30 KB gzipped.
- JS: first-load customer bundle under **150 KB gzipped**. Code-split by route (`React.lazy`). Staff screens are a separate chunk; customers never download them.
- At most 10 database queries per API request.
- Product and category pages show content from the API within one round trip (no request waterfalls).

## 8. SEO basics

- Clean slugs: `/p/super-basmati-rice/`.
- Unique `<title>` and meta description per page; Open Graph tags for WhatsApp/Facebook previews.
  Because the frontend is a React SPA, **Django fills these tags into `index.html` on the server** for product and category URLs. WhatsApp previews do not run JavaScript, so this is required (Architecture.md §2.2).
- `sitemap.xml` + `robots.txt`.
- **Product structured data** (JSON-LD `Product` with `Offer`, price in PKR, availability).
- **LocalBusiness** structured data for the Chashma shop (address, phone, hours).
- Canonical URLs on filtered listing pages.
- Google Business Profile for local search **[RECOMMENDED]** (outside the code).

### 8.1 Google rules and income (decided 2026-10-29)

Income comes from orders. Google brings buyers in two free ways: normal search results and **Google Merchant Center free listings** (products with price and photo in Google Search and the Shopping tab). There are no ads on the site.

The site follows Google Search Essentials:
- **Same content for Google and people.** Django puts the page's real heading, text and links inside `#root` in the HTML it sends. React then draws the same content. Showing Google something different from what people see is cloaking and is not allowed.
- **Real 404s.** Unknown pages return status 404, not a 200 page that says "not found" (a "soft 404").
- **Pages that should not be in search** (cart, checkout, search results, account) send `noindex`.
- **Stable URLs.** Page URLs never change once live. If one must change, a 301 redirect points to the new URL. Every page has a canonical URL without query strings.
- **No tricks:** no hidden text, no keyword stuffing, no fake or paid reviews, no copied product descriptions.
- **Fast pages** (Core Web Vitals): LCP under 2.5 s, CLS under 0.1, INP under 200 ms on a mid-range phone. See §7 and T12.2.

Merchant Center needs, before the shop applies (T12.1):
- A product feed (or product JSON-LD) with name, price in PKR, availability, image and link for every product.
- Public pages for shipping (delivery areas and fees), returns and refunds, privacy, terms, and contact with a phone number and the shop address.
- The price and stock in the feed must match the product page. Merchant Center suspends shops whose prices do not match.

## 9. UI/UX principles (why these choices)

- **Pack sizes as buttons, not a dropdown:** the customer sees all choices at once and compares prices in one glance.
- **Price per kg:** helps customers see that the 25 kg bag is better value, which raises order value honestly.
- **"We will call you to confirm":** sets expectations for COD and reduces fake orders, because people know a human will check.
- **Single-page checkout:** each extra step loses customers; we only need a few fields.
- **Free-delivery progress hint:** shows a clear goal ("add Rs 800 more") instead of a hidden rule.
- **Sticky action bar on mobile:** the main action is always reachable with a thumb.
