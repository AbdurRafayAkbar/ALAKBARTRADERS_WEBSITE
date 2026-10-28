import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useCart } from '../../api/hooks'
import logo from '../../assets/brand/logo-full.png'
import { site } from '../../config/site'

const nav = [
  { to: '/c/rice/', label: 'Rice' },
  { to: '/c/dry-fruits/', label: 'Dry fruits' },
  { to: '/c/milk-cream/', label: 'Milk cream' },
  { to: '/delivery-areas/', label: 'Delivery areas' },
]

// link-grow draws the underline on hover and keeps it on the current page.
// The header spans the whole window, wider than page content, so the logo and cart sit at the edges.
const edge = 'px-4 sm:px-6 lg:px-10'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `link-grow px-3 py-2 font-medium transition-colors hover:text-primary-900 ${isActive ? 'text-primary-900' : 'text-ink'}`

export function SiteHeader() {
  const { data: cart } = useCart()
  // Remember which page the menu was opened on, so it closes after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const location = useLocation()
  const count = cart?.item_count ?? 0
  const open = openOn === location.pathname

  return (
    <header className="sticky top-0 z-30 border-b border-secondary/40 bg-card/85 backdrop-blur-md">
      <div className="bg-primary-900 text-sm text-primary-50">
        <div className={`flex h-9 items-center justify-between gap-3 whitespace-nowrap ${edge}`}>
          <span className="truncate">
            Cash on delivery<span className="hidden sm:inline"> across {site.city}</span>
          </span>
          <a href={`tel:${site.phone}`} className="link-wipe shrink-0 font-medium">
            <span className="hidden sm:inline">Call </span>
            {site.phone}
          </a>
        </div>
      </div>

      <div className={`flex h-16 items-center gap-2 sm:h-[4.5rem] sm:gap-4 md:grid md:grid-cols-[1fr_auto_1fr] ${edge}`}>
        <Link to="/" className="group shrink-0 justify-self-start" aria-label={`${site.name} home`}>
          <img
            src={logo}
            alt=""
            width={140}
            height={48}
            className="h-10 w-auto transition-transform sm:h-12 duration-300 group-hover:scale-105"
          />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-1">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={navClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 justify-self-end sm:gap-2">
          <Link
            to="/search/"
            className="group grid size-11 place-items-center rounded-full transition-colors hover:bg-primary-50"
            aria-label="Search products"
          >
            <svg viewBox="0 0 24 24" className="size-6 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            to="/cart/"
            className="btn-fill flex h-10 items-center gap-2 rounded-full border-2 border-primary-900 px-3 font-semibold sm:h-11 sm:px-4 text-primary-900"
          >
            Cart
            {/* Keyed by count so the badge pops each time the cart changes. */}
            <span
              key={count}
              className="animate-pop grid min-w-6 place-items-center rounded-full bg-accent px-1.5 text-sm text-on-accent tabular-nums"
              data-testid="cart-count"
            >
              {count}
            </span>
            <span className="sr-only">{count === 1 ? 'item' : 'items'}</span>
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md hover:bg-primary-50 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpenOn(open ? null : location.pathname)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main" className="animate-page-in border-t border-secondary/40 bg-card md:hidden">
          <div className={`py-3 ${edge}`}>
            <ul className="grid gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={(s) => `block ${navClass(s)} py-3`}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  )
}
