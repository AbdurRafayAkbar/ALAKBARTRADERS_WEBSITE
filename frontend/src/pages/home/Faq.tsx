import { Reveal } from '../../components/motion/Reveal'
import { Container } from '../../components/ui/Container'
import { site, whatsappLink } from '../../config/site'

// TODO(owner): confirm these answers before launch.
const questions = [
  {
    q: 'How do I pay?',
    a: 'Cash on delivery only. Pay the rider when your order arrives. We do not take card or online payments yet.',
  },
  {
    q: 'When will my order arrive?',
    a: `Orders placed before 5 pm reach most of ${site.city} the same day. Later orders arrive the next morning.`,
  },
  {
    q: 'How do you keep milk cream fresh?',
    a: 'Cream leaves the fridge last and travels in an ice box. Put it in your fridge as soon as it arrives.',
  },
  {
    q: 'Can I change or cancel my order?',
    a: 'Yes, until the rider leaves the shop. Tell us on the confirmation call or message us on WhatsApp.',
  },
  {
    q: 'Why can the price change?',
    a: 'Rice and dry fruit rates follow the market. Your order keeps the price shown at checkout.',
  },
]

export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="py-14 sm:py-20">
      <Container className="max-w-3xl">
        <Reveal>
          <h2 id="faq-title" className="font-display text-3xl font-bold sm:text-4xl">
            Questions customers ask
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-3">
          {questions.map((item, i) => (
            <Reveal key={item.q} index={i}>
              <details className="group rounded-card border border-secondary/40 bg-card px-5 transition-[border-color,box-shadow] hover:border-primary open:border-primary-900 open:shadow-lg">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-2 text-lg font-semibold">
                  {item.q}
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-100 text-xl text-primary-900 transition-[transform,background-color,color] duration-300 group-hover:bg-primary-900 group-hover:text-primary-50 group-open:rotate-45 group-open:bg-accent group-open:text-on-accent"
                  >
                    +
                  </span>
                </summary>
                <p className="animate-page-in pb-5 text-ink/80">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-ink/80">
          Other question?{' '}
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="link-grow font-semibold text-primary-900">
            Message us on WhatsApp
          </a>
        </p>
      </Container>
    </section>
  )
}
