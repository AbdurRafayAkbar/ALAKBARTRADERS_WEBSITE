import { Link } from 'react-router'
import { useProducts } from '../../api/hooks'
import { ProductCard } from '../../components/ProductCard'
import { Reveal } from '../../components/motion/Reveal'
import { Container } from '../../components/ui/Container'
import { ErrorBlock, LoadingBlock } from '../../components/ui/StatusMessage'

export function FeaturedProducts() {
  const { data: products, isPending, isError, refetch } = useProducts({ featured: true })

  return (
    <section aria-labelledby="featured-title" className="py-14 sm:py-20">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="featured-title" className="font-display text-3xl font-bold sm:text-4xl">
            Most ordered <span className="text-duo">this week</span>
          </h2>
          <Link to="/shop/" className="link-grow font-semibold text-primary-900">
            See every product
          </Link>
        </Reveal>
        {isPending && <LoadingBlock />}
        {isError && <ErrorBlock onRetry={() => refetch()} />}
        {products && (
          // Phones: a swipeable row that peeks the next card. Wider screens: a grid.
          <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:mt-10 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {products.map((product, i) => (
              <Reveal
                key={product.slug}
                index={i}
                className="w-[82%] shrink-0 snap-start sm:w-auto"
              >
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
