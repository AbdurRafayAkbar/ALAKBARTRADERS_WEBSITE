import { Link } from 'react-router'
import { SplitWords } from '../../components/motion/SplitWords'
import { ButtonLink } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'
import { site } from '../../config/site'
import { HeroBackdrop } from './HeroBackdrop'
import { RateBoard } from './RateBoard'

const promises = [
  { title: 'Cash on delivery', detail: 'No card needed' },
  { title: 'Same-day in town', detail: 'Orders before 5 pm' },
  { title: 'Cream kept cold', detail: 'Packed in ice boxes' },
]

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary-900 text-white">
      <HeroBackdrop />

      <Container className="grid items-center gap-10 py-10 sm:min-h-[calc(100dvh-6.75rem)] sm:gap-12 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <p
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm text-primary-100 backdrop-blur"
            style={{ animation: 'fade-up 0.8s var(--ease-out-expo) 0.1s both' }}
          >
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-accent" />
            Taking orders today in {site.city}
          </p>
          <h1 className="mt-6 font-display text-4xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <SplitWords text={`Rice, dry fruits and fresh cream, at your door in ${site.city}.`} delay={150} />
          </h1>
          <p
            className="mt-6 max-w-xl text-primary-100 sm:mt-7 sm:text-lg"
            style={{ animation: 'fade-up 0.9s var(--ease-out-expo) 0.9s both' }}
          >
            Order online and pay cash when it arrives. We call to confirm every order before our rider leaves the
            shop.
          </p>
          <div
            className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 sm:mt-9"
            style={{ animation: 'fade-up 0.9s var(--ease-out-expo) 1.05s both' }}
          >
            <ButtonLink to="/shop/" variant="primary" className="px-8">
              Shop all products
            </ButtonLink>
            <Link to="/delivery-areas/" className="link-grow pb-1 font-semibold text-white">
              See delivery areas
            </Link>
          </div>
          <ul className="mt-10 grid max-w-xl grid-cols-3 gap-2 sm:mt-12 sm:gap-3">
            {promises.map((item, i) => (
              <li
                key={item.title}
                className="group rounded-xl border border-white/10 bg-white/5 px-2.5 py-2.5 leading-snug backdrop-blur sm:px-4 sm:py-3 transition-colors duration-300 hover:border-accent/60 hover:bg-white/10"
                style={{ animation: `fade-up 0.8s var(--ease-out-expo) ${1.2 + i * 0.1}s both` }}
              >
                <span className="block text-sm font-semibold transition-colors group-hover:text-accent sm:text-base">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs text-primary-100 sm:text-sm">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ animation: 'fade-up 1s var(--ease-out-expo) 0.7s both' }}>
          <RateBoard />
        </div>
      </Container>
    </section>
  )
}
