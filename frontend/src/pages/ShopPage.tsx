import { useRef } from 'react'
import { useParams, useSearchParams } from 'react-router'
import type { ProductSort } from '../api/catalog'
import { ApiRequestError } from '../api/client'
import { useCategories, useProducts } from '../api/hooks'
import { Reveal } from '../components/motion/Reveal'
import { ProductCard } from '../components/ProductCard'
import { Button } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { ErrorBlock, LoadingBlock, MessageBlock } from '../components/ui/StatusMessage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFoundPage from './NotFoundPage'
import { SORT_LABELS, ShopFilters, type ShopFilterValues } from './shop/ShopFilters'

// Matches ProductPagination.page_size in the backend (catalog/api/views.py).
const PAGE_SIZE = 24

// The URL holds every filter, so a filtered list can be shared or bookmarked
// and the back button undoes a change. Bad values in the URL are dropped.
const PRICE = /^\d+(\.\d{1,2})?$/

function readFilters(params: URLSearchParams) {
  const sort = params.get('sort') ?? ''
  const page = Number(params.get('page'))
  const price = (key: string) => {
    const value = params.get(key) ?? ''
    return PRICE.test(value) ? value : ''
  }
  return {
    sizes: params.getAll('size'),
    minPrice: price('min'),
    maxPrice: price('max'),
    inStock: params.get('stock') === '1',
    sort: (sort in SORT_LABELS ? sort : 'popular') as ProductSort,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

// One page for /shop/, /c/<slug>/ and /search/?q=.
export default function ShopPage({ mode }: { mode: 'all' | 'category' | 'search' }) {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const q = mode === 'search' ? (params.get('q') ?? '') : ''
  const { data: categories } = useCategories()
  const category = mode === 'category' ? categories?.find((c) => c.slug === slug) : undefined

  const filters = readFilters(params)
  const products = useProducts({
    category: mode === 'category' ? slug : undefined,
    q: q || undefined,
    ...filters,
  })
  const topRef = useRef<HTMLDivElement>(null)

  // Write the filters back into the URL. Any change other than the page
  // number starts again at page 1.
  function update(change: Partial<ShopFilterValues & { sort: ProductSort; page: number }>) {
    const next = { ...filters, page: 1, ...change }
    const out = new URLSearchParams()
    if (q) out.set('q', q)
    for (const size of next.sizes) out.append('size', size)
    if (next.minPrice) out.set('min', next.minPrice)
    if (next.maxPrice) out.set('max', next.maxPrice)
    if (next.inStock) out.set('stock', '1')
    if (next.sort !== 'popular') out.set('sort', next.sort)
    if (next.page > 1) out.set('page', String(next.page))
    setParams(out)
  }

  function goToPage(page: number) {
    update({ page })
    topRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  const page = products.data
  const pageCount = page ? Math.max(1, Math.ceil(page.count / PAGE_SIZE)) : 1
  // DRF answers 404 for a page past the end, e.g. an old bookmark.
  const pastTheEnd =
    products.error instanceof ApiRequestError && products.error.status === 404 && filters.page > 1

  const title =
    mode === 'search' ? (q ? `Results for "${q}"` : 'Search') : (category?.name ?? 'All products')
  useDocumentTitle(title)

  if (mode === 'category' && categories && !category) return <NotFoundPage />

  return (
    <Container className="py-10 sm:py-14">
      <div className="animate-page-in">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
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
            placeholder="Rice, ghee, honey…"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-secondary bg-card px-4 transition-[border-color,box-shadow] focus:border-primary-900 focus:shadow-lg"
          />
          <Button type="submit">Search</Button>
        </form>
      )}

      <div ref={topRef} className="mt-8 grid scroll-mt-24 gap-6 lg:grid-cols-[16rem_1fr]">
        <ShopFilters
          category={mode === 'category' ? slug : undefined}
          values={filters}
          onChange={(values) => update(values)}
          onClear={() => update({ sizes: [], minPrice: '', maxPrice: '', inStock: false })}
        />

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted" aria-live="polite">
              {page && `${page.count} ${page.count === 1 ? 'product' : 'products'}`}
            </p>
            <label className="flex items-center gap-2">
              <span className="text-muted">Sort by</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as ProductSort })}
                className="min-h-11 rounded-lg border border-secondary bg-card px-3 focus:border-primary-900"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {products.isPending && <LoadingBlock label="Loading products" />}
          {pastTheEnd && (
            <MessageBlock title="This page is empty">
              <button
                type="button"
                className="link-grow font-semibold text-primary-900"
                onClick={() => goToPage(1)}
              >
                Go to the first page
              </button>
            </MessageBlock>
          )}
          {products.isError && !pastTheEnd && <ErrorBlock onRetry={() => products.refetch()} />}
          {page?.results.length === 0 && (
            <MessageBlock title={q ? `Nothing matches "${q}"` : 'No products match'}>
              Try a shorter word, clear a filter, or see everything we sell on the shop page.
            </MessageBlock>
          )}
          {page && page.results.length > 0 && (
            <div
              className={`grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${products.isPlaceholderData ? 'opacity-60' : ''}`}
            >
              {page.results.map((product, i) => (
                <Reveal key={product.slug} index={i % 3}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          )}

          {page && pageCount > 1 && (
            <nav aria-label="Pages" className="mt-8 flex items-center justify-between gap-3">
              <Button disabled={!page.previous} onClick={() => goToPage(filters.page - 1)}>
                Previous
              </Button>
              <span className="text-muted">
                Page {filters.page} of {pageCount}
              </span>
              <Button disabled={!page.next} onClick={() => goToPage(filters.page + 1)}>
                Next
              </Button>
            </nav>
          )}
        </div>
      </div>
    </Container>
  )
}
