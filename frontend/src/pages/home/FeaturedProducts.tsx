import { Link } from 'react-router'
import { useProducts } from '../../api/hooks'
import { ProductCard } from '../../components/ProductCard'
import { Reveal } from '../../components/motion/Reveal'
import { Container } from '../../components/ui/Container'
import { ErrorBlock, LoadingBlock } from '../../components/ui/StatusMessage'

export function FeaturedProducts() {
  const { data: products, isPending, isError, refetch } = useProducts({ featured: true })

  return (
    <section aria-labelledby="featured-title" className="py-20">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="featured-title" className="font-wide text-3xl font-bold sm:text-4xl">
            Most ordered this week
          </h2>
          <Link to="/shop/" className="link-grow font-semibold text-primary-900">
            See every product
          </Link>
        </Reveal>
        {isPending && <LoadingBlock />}
        {isError && <ErrorBlock onRetry={() => refetch()} />}
        {products && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <Reveal key={product.slug} index={i}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
