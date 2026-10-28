import { Link } from 'react-router'
import { DeliveryZoneList } from '../../components/DeliveryZoneList'
import { Reveal } from '../../components/motion/Reveal'
import { Container } from '../../components/ui/Container'
import { site } from '../../config/site'

export function DeliveryAreas() {
  return (
    <section aria-labelledby="areas-title" className="py-14 sm:py-20">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <h2 id="areas-title" className="font-display text-3xl font-bold sm:text-4xl">
            Where <span className="text-duo">we deliver</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-ink/80">
            Our own riders cover {site.city} and nearby villages. The fee depends on your area and is shown before you
            place the order.
          </p>
          <Link to="/delivery-areas/" className="link-grow mt-6 inline-block font-semibold text-primary-900">
            Delivery times and rules
          </Link>
        </Reveal>
        <Reveal index={1}>
          <DeliveryZoneList />
        </Reveal>
      </Container>
    </section>
  )
}
