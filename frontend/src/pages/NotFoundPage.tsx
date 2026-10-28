import { ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { STAR_PATH } from '../lib/star'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <Container className="relative grid gap-10 py-14 sm:py-20 md:grid-cols-[1fr_auto] md:items-center">
      <div className="animate-page-in">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">This page does not exist</h1>
        <p className="mt-4 text-lg text-ink/80">The link may be old, or the product is no longer sold.</p>
        <ButtonLink to="/shop/" className="mt-8">
          Go to the shop
        </ButtonLink>
      </div>
      {/* A lost star drifting: the brand mark, slowly turning. */}
      <svg aria-hidden viewBox="0 0 100 100" className="animate-float mx-auto size-48 md:size-64">
        <g style={{ animation: 'spin-slow 40s linear infinite', transformOrigin: '50px 50px' }}>
          <path d={STAR_PATH} fill="var(--color-accent)" opacity={0.85} />
        </g>
      </svg>
    </Container>
  )
}
