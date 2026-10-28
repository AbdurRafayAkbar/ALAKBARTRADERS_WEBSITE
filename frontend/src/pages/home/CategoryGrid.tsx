import { Link } from 'react-router'
import { useCategories } from '../../api/hooks'
import { CategoryIcon } from '../../components/CategoryIcon'
import { Reveal } from '../../components/motion/Reveal'
import { Container } from '../../components/ui/Container'
import { ErrorBlock, LoadingBlock } from '../../components/ui/StatusMessage'
import { pointerGlow } from '../../lib/motion'

export function CategoryGrid() {
  const { data: categories, isPending, isError, refetch } = useCategories()

  return (
    <section aria-labelledby="categories-title" className="py-20">
      <Container>
        <Reveal>
          <h2 id="categories-title" className="font-wide text-3xl font-bold sm:text-4xl">
            What we sell
          </h2>
          <p className="mt-3 max-w-xl text-lg text-muted">Three things, bought fresh and packed in the shop.</p>
        </Reveal>
        {isPending && <LoadingBlock />}
        {isError && <ErrorBlock onRetry={() => refetch()} />}
        {categories && (
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {categories.map((category, i) => (
              <Reveal as="li" key={category.slug} index={i}>
                <Link
                  to={`/c/${category.slug}/`}
                  {...pointerGlow(8)}
                  className="spotlight tilt group flex h-full flex-col rounded-card border border-secondary/40 bg-card p-7 hover:border-primary"
                >
                  <span className="tilt-pop grid size-20 place-items-center rounded-2xl bg-primary-100 text-primary-900 transition-colors duration-300 group-hover:bg-primary-900 group-hover:text-primary-50">
                    <CategoryIcon slug={category.slug} className="size-12 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                  </span>
                  <span className="tilt-pop mt-6 block font-wide text-2xl font-bold">{category.name}</span>
                  <span className="mt-2 block text-muted">{category.summary}</span>
                  <span className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm font-semibold text-primary-900">
                    <span>Packs: {category.pack_sizes}</span>
                    <span
                      aria-hidden
                      className="grid size-9 place-items-center rounded-full border border-primary-900/30 transition-[transform,background-color,color] duration-300 group-hover:translate-x-1 group-hover:bg-accent group-hover:text-on-accent"
                    >
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
