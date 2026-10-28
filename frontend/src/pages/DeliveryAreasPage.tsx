import { DeliveryZoneList } from '../components/DeliveryZoneList'
import { Reveal } from '../components/motion/Reveal'
import { Container } from '../components/ui/Container'
import { site, whatsappLink } from '../config/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function DeliveryAreasPage() {
  useDocumentTitle('Delivery areas and fees')
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <div className="animate-page-in">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Delivery areas and fees</h1>
        <p className="mt-4 text-lg text-ink/80">
          Our own riders deliver across {site.city}. Orders placed before 5 pm arrive the same day in town. Later orders
          arrive the next morning.
        </p>
      </div>
      <Reveal className="mt-8">
        <DeliveryZoneList />
      </Reveal>
      <Reveal className="mt-12 rounded-card border-l-4 border-accent bg-card p-6 shadow-lg">
        <div className="flex items-start gap-4">
          {/* Snowflake: cream travels cold. */}
          <svg aria-hidden viewBox="0 0 24 24" className="mt-1 size-8 shrink-0 text-primary-900 animate-float" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M12 2v20M4.9 6l14.2 12M19.1 6 4.9 18M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" />
          </svg>
          <div>
            <h2 className="font-display text-2xl font-bold">Milk cream</h2>
            <p className="mt-3 text-ink/80">
              Cream travels in an ice box and goes only to areas we reach quickly. Please be home to receive it.
            </p>
          </div>
        </div>
      </Reveal>
      <p className="mt-8 text-ink/80">
        Area not listed?{' '}
        <a href={whatsappLink('Do you deliver to my area?')} target="_blank" rel="noreferrer" className="link-grow font-semibold text-primary-900">
          Ask us on WhatsApp
        </a>
      </p>
    </Container>
  )
}
