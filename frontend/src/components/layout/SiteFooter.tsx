import { Link } from 'react-router'
import { site, whatsappLink } from '../../config/site'
import { STAR_PATH } from '../../lib/star'
import { Container } from '../ui/Container'

// Set once per page load; good enough for a copyright line.
const year = new Date().getFullYear()

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-primary-900 text-primary-50">
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -bottom-24 -right-16 size-80 opacity-10"
        style={{ animation: 'spin-slow 60s linear infinite' }}
      >
        <path d={STAR_PATH} fill="var(--color-accent)" />
      </svg>
      <Container className="relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-wide text-xl font-bold text-white">{site.name}</p>
          <p className="mt-3 max-w-sm">
            Family shop in {site.city} selling rice, dry fruits and fresh milk cream. Delivered by our own riders, paid in
            cash at your door.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white">Shop</p>
          <ul className="mt-3 grid gap-2">
            <li><Link to="/c/rice/" className="link-wipe">Rice</Link></li>
            <li><Link to="/c/dry-fruits/" className="link-wipe">Dry fruits</Link></li>
            <li><Link to="/c/milk-cream/" className="link-wipe">Milk cream</Link></li>
            <li><Link to="/delivery-areas/" className="link-wipe">Delivery areas and fees</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white">Contact</p>
          <ul className="mt-3 grid gap-2">
            <li><a href={`tel:${site.phone}`} className="link-wipe">{site.phone}</a></li>
            <li><a href={whatsappLink()} className="link-wipe" target="_blank" rel="noreferrer">WhatsApp us</a></li>
            <li>{site.address}</li>
            <li>{site.hours}</li>
          </ul>
        </div>
      </Container>
      <div className="relative border-t border-white/15">
        <Container className="py-5 text-sm text-primary-100">
          © {year} {site.name}. Prices in Pakistani rupees.
        </Container>
      </div>
    </footer>
  )
}
