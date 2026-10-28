import { useProducts } from '../../api/hooks'
import { formatPrice } from '../../lib/money'
import { STAR_PATH } from '../../lib/star'

// A moving strip of today's rates under the hero, like the board behind a
// shop counter. Decoration only: the same rates are on the rate board.
export function PriceTicker() {
  const { data: products } = useProducts({ featured: true })
  const items = (products ?? []).flatMap((product) => {
    const variant = product.variants[0]
    return variant ? [{ key: product.slug, name: product.name, label: variant.label, price: variant.price }] : []
  })
  if (items.length === 0) return null

  // Two copies side by side so the loop has no seam.
  const run = (copy: number) =>
    items.map((item) => (
      <span key={`${copy}-${item.key}`} className="flex shrink-0 items-center gap-3 px-6">
        <svg viewBox="0 0 100 100" className="size-4 shrink-0">
          <path d={STAR_PATH} fill="var(--color-accent)" />
        </svg>
        <span className="font-semibold">{item.name}</span>
        <span className="text-primary-100">{item.label}</span>
        <span className="font-narrow text-lg font-bold tabular-nums text-accent">{formatPrice(item.price)}</span>
      </span>
    ))

  return (
    <div aria-hidden className="marquee overflow-hidden border-y border-white/10 bg-primary-900 py-3 text-white">
      <div className="marquee-track flex w-max">
        {run(0)}
        {run(1)}
      </div>
    </div>
  )
}
