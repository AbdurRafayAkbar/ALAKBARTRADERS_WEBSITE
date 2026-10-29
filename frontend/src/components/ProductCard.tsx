import { useId, useState } from 'react'
import { Link } from 'react-router'
import { useAddToCart } from '../api/hooks'
import type { Product } from '../api/types'
import { formatPrice } from '../lib/money'
import { pointerGlow } from '../lib/motion'
import { Button } from './ui/Button'
import { CategoryIcon } from './CategoryIcon'

// One product with its pack sizes. The customer picks a size, then adds it.
export function ProductCard({ product }: { product: Product }) {
  const sellable = product.variants.filter((v) => v.stock_state !== 'out_of_stock')
  const [variantId, setVariantId] = useState(sellable[0]?.id ?? product.variants[0]?.id)
  const variant = product.variants.find((v) => v.id === variantId)
  const addToCart = useAddToCart()
  const groupId = useId()

  return (
    <article
      {...pointerGlow()}
      className="spotlight lift group flex h-full flex-col rounded-card border border-secondary/40 bg-card p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-12 shrink-0 sm:size-14 place-items-center rounded-xl bg-primary-100 text-primary-900 transition-[transform,background-color,color] duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary-900 group-hover:text-primary-50">
          <CategoryIcon slug={product.category} className="size-7 sm:size-8" />
        </div>
        {product.is_perishable && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-900">
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-primary" />
            Keep refrigerated
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug">
        <Link to={`/p/${product.slug}/`} className="link-grow">
          {product.name}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-[0.95rem] text-muted">{product.description}</p>

      <fieldset className="mt-4">
        <legend className="text-sm text-muted">Pack size</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const out = v.stock_state === 'out_of_stock'
            return (
              <label
                key={v.id}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium transition-colors has-checked:border-primary-900 has-checked:bg-primary-900 has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-accent-700 ${
                  out
                    ? 'cursor-not-allowed border-secondary/50 text-muted line-through'
                    : 'border-secondary hover:border-primary-900'
                }`}
              >
                <input
                  type="radio"
                  name={groupId}
                  value={v.id}
                  checked={v.id === variantId}
                  disabled={out}
                  onChange={() => setVariantId(v.id)}
                  className="sr-only"
                />
                {v.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4 sm:pt-5">
        {variant && (
          <p className="leading-tight">
            {/* Keyed by variant so the price pops when the pack size changes. */}
            <span
              key={variant.id}
              className="animate-pop inline-block font-narrow text-2xl font-bold tabular-nums"
            >
              {formatPrice(variant.price)}
            </span>
            {variant.compare_at_price && (
              <s className="ml-2 text-sm text-muted">{formatPrice(variant.compare_at_price)}</s>
            )}
            {variant.stock_state === 'low_stock' && (
              <span className="block text-sm font-medium text-accent-700">Only a few left</span>
            )}
          </p>
        )}
        <Button
          onClick={() => variant && addToCart.mutate({ variantId: variant.id })}
          disabled={!variant || variant.stock_state === 'out_of_stock' || addToCart.isPending}
          aria-label={variant ? `Add ${product.name}, ${variant.label}, to cart` : undefined}
        >
          {addToCart.isPending ? 'Adding…' : addToCart.isSuccess ? 'Added' : 'Add to cart'}
        </Button>
      </div>
    </article>
  )
}
