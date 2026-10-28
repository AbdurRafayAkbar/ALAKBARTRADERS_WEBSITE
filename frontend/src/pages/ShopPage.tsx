import { useParams, useSearchParams } from 'react-router'
import { useCategories, useProducts } from '../api/hooks'
import type { CategorySlug } from '../api/types'
import { Reveal } from '../components/motion/Reveal'
import { ProductCard } from '../components/ProductCard'
import { Button } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { ErrorBlock, LoadingBlock, MessageBlock } from '../components/ui/StatusMessage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFoundPage from './NotFoundPage'

// One page for /shop/, /c/<slug>/ and /search/?q=.
export default function ShopPage({ mode }: { mode: 'all' | 'category' | 'search' }) {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const q = mode === 'search' ? (params.get('q') ?? '') : ''
  const { data: categories } = useCategories()
  const category = mode === 'category' ? categories?.find((c) => c.slug === slug) : undefined

  const products = useProducts({
    category: mode === 'category' ? (slug as CategorySlug) : undefined,
    q: q || undefined,
  })

  const title = mode === 'search' ? (q ? `Results for "${q}"` : 'Search') : (category?.name ?? 'All products')
  useDocumentTitle(title)

  if (mode === 'category' && categories && !category) return <NotFoundPage />

  return (
    <Container className="py-10 sm:py-14">
      <div className="animate-page-in">
        <h1 className="font-wide text-3xl font-bold sm:text-4xl">{title}</h1>
        {category && <p className="mt-3 max-w-2xl text-lg text-ink/80">{category.summary}</p>}
        <span aria-hidden className="mt-5 block h-1 w-20 rounded-full bg-accent" />
      </div>

      {mode === 'search' && (
        <form
          role="search"
          className="mt-6 flex max-w-xl gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const value = new FormData(e.currentTarget).get('q')?.toString().trim() ?? ''
            setParams(value ? { q: value } : {})
          }}
        >
          <label htmlFor="search-q" className="sr-only">
            Search products
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Basmati, almonds, cream…"
            className="min-h-11 flex-1 rounded-lg border border-secondary bg-card px-4 transition-[border-color,box-shadow] focus:border-primary-900 focus:shadow-lg"
          />
          <Button type="submit">Search</Button>
        </form>
      )}

      <div className="mt-8">
        {products.isPending && <LoadingBlock label="Loading products" />}
        {products.isError && <ErrorBlock onRetry={() => products.refetch()} />}
        {products.data?.length === 0 && (
          <MessageBlock title={q ? `Nothing matches "${q}"` : 'No products here yet'}>
            Try a shorter word, or browse rice, dry fruits and milk cream from the menu.
          </MessageBlock>
        )}
        {products.data && products.data.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.data.map((product, i) => (
              <Reveal key={product.slug} index={i % 3}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
