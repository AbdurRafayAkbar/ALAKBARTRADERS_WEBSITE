import { Container } from '../../components/ui/Container'
import { useReveal } from '../../hooks/useReveal'

// A real sequence, so numbered steps are honest here.
const steps = [
  { title: 'Pick your items', body: 'Choose pack sizes and add them to your cart.' },
  { title: 'Place the order', body: 'Give your name, phone and address. No payment online.' },
  { title: 'We call to confirm', body: 'A short call checks the order and the delivery time.' },
  { title: 'Pay at your door', body: 'Our rider brings the order. Pay the rider in cash.' },
]

export function HowItWorks() {
  // One reveal for the whole row: the connector draws, then steps follow it.
  const ref = useReveal<HTMLOListElement>()

  return (
    <section aria-labelledby="how-title" className="relative overflow-hidden bg-primary-100 py-20">
      <Container>
        <h2 id="how-title" className="font-wide text-3xl font-bold sm:text-4xl">
          How ordering works
        </h2>
        <ol ref={ref} className="group/steps relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <span
            aria-hidden
            className="absolute left-[1.375rem] right-[12%] top-[1.375rem] hidden h-0.5 origin-left scale-x-0 bg-primary-900/40 transition-transform duration-[1400ms] ease-out group-[.is-visible]/steps:scale-x-100 lg:block"
          />
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="group relative flex translate-y-6 gap-4 opacity-0 transition-[opacity,transform] duration-700 group-[.is-visible]/steps:translate-y-0 group-[.is-visible]/steps:opacity-100 lg:block"
              style={{ transitionDelay: `${300 + i * 200}ms` }}
            >
              <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary-900 bg-primary-100 font-narrow text-xl font-bold text-primary-900 transition-colors duration-300 group-hover:text-primary-50">
                <span
                  aria-hidden
                  className="absolute inset-0 scale-0 rounded-full bg-primary-900 transition-transform duration-500 group-hover:scale-100"
                />
                <span className="relative">{i + 1}</span>
              </span>
              <span>
                <span className="block text-lg font-semibold lg:mt-5">{step.title}</span>
                <span className="mt-1 block text-ink/80">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
