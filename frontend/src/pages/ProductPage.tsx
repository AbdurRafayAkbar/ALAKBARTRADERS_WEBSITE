import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAddToCart, useProduct } from '../api/hooks'
import { CategoryIcon } from '../components/CategoryIcon'
import { Button, ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { ErrorBlock, LoadingBlock } from '../components/ui/StatusMessage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatPrice } from '../lib/money'
import { pointerGlow } from '../lib/motion'
import { STAR_PATH } from '../lib/star'
import NotFoundPage from './NotFoundPage'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, isPending, isError, refetch } = useProduct(slug)
  const [variantId, setVariantId] = useState<number>()
  const addToCart = useAddToCart()
  useDocumentTitle(product?.name ?? 'Product')

  if (isPending) return <Container><LoadingBlock label="Loading product" /></Container>
  if (isError) return <Container className="py-10"><ErrorBlock onRetry={() => refetch()} /></Container>
  if (!product) return <NotFoundPage />

  const firstSellable = product.variants.find((v) => v.stock_state !== 'out_of_stock')
  const variant = product.variants.find((v) => v.id === (variantId ?? firstSellable?.id))

  return (
    <Container className="py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/shop/" className="link-grow">Shop</Link>
        <span aria-hidden> / </span>
        <Link to={`/c/${product.category}/`} className="link-grow">{product.category.replace('-', ' ')}</Link>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Image stand-in: tilts toward the pointer, icon floats in front. */}
        <div
          {...pointerGlow(6)}
          className="spotlight tilt relative grid aspect-[4/3] place-items-center overflow-hidden sm:aspect-square rounded-card bg-primary-100 text-primary-900"
        >
          <svg aria-hidden viewBox="0 0 100 100" className="absolute size-[85%] opacity-15" style={{ animation: 'spin-slow 80s linear infinite' }}>
            <path d={STAR_PATH} fill="var(--color-accent)" />
          </svg>
          {/* Two layers: both effects use transform, so each needs its own element. */}
          <div className="tilt-pop">
            <div className="animate-float">
              <CategoryIcon slug={product.category} className="size-28 sm:size-40" />
            </div>
          </div>
        </div>

        <div className="animate-page-in">
          <h1 className="font-wide text-3xl font-bold sm:text-4xl">{product.name}</h1>
          {product.is_perishable && (
            <p className="mt-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-900">
              Keep refrigerated. Delivered in an ice box.
            </p>
          )}
          <p className="mt-4 text-lg text-ink/80">{product.description}</p>

          <fieldset className="mt-8">
            <legend className="font-semibold">Pack size</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.variants.map((v) => {
                const out = v.stock_state === 'out_of_stock'
                return (
                  <label
                    key={v.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border-2 bg-card px-4 py-3 transition-[border-color,background-color,transform] has-checked:scale-[1.02] has-checked:border-primary-900 has-checked:bg-primary-50 has-focus-visible:outline-3 has-focus-visible:outline-accent-700 ${
                      out ? 'cursor-not-allowed border-secondary/40 text-muted' : 'border-secondary/60 hover:-translate-y-0.5 hover:border-primary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="variant"
                      className="sr-only"
                      checked={v.id === variant?.id}
                      disabled={out}
                      onChange={() => setVariantId(v.id)}
                    />
                    <span className="font-medium">{v.label}{out && ' (sold out)'}</span>
                    <span className="font-narrow text-xl font-bold tabular-nums">{formatPrice(v.price)}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {variant?.stock_state === 'low_stock' && (
            <p className="mt-3 font-medium text-accent-700">Only a few left in this size.</p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              variant="primary"
              className="w-full px-8 sm:w-auto"
              disabled={!variant || addToCart.isPending}
              onClick={() => variant && addToCart.mutate({ variantId: variant.id })}
            >
              {addToCart.isPending ? 'Adding…' : 'Add to cart'}
            </Button>
            {addToCart.isSuccess && (
              <p role="status" className="animate-pop font-medium text-primary-900">
                Added to cart. <Link to="/cart/" className="link-grow">View cart</Link>
              </p>
            )}
            {addToCart.isError && (
              <p role="alert" className="font-medium text-danger">Could not add this item. Try again.</p>
            )}
          </div>
          <p className="mt-6 text-sm text-muted">Pay cash when the order arrives. We call to confirm first.</p>
          <ButtonLink to={`/c/${product.category}/`} variant="ghost" className="mt-4 px-0">
            More in this category
          </ButtonLink>
        </div>
      </div>
    </Container>
  )
}
