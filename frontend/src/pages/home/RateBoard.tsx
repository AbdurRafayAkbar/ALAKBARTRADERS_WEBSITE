import { Link } from 'react-router'
import { useProducts } from '../../api/hooks'
import { formatPrice } from '../../lib/money'
import { pointerGlow } from '../../lib/motion'
import { STAR_PATH } from '../../lib/star'

// The shop's price board: featured items with their smallest pack and price.
// Frosted glass over the hero; rows react on hover.
export function RateBoard() {
  const { data: products, isPending, isError } = useProducts({ featured: true })

  return (
    <section
      aria-labelledby="rates-title"
      {...pointerGlow()}
      className="spotlight relative overflow-hidden rounded-card border border-white/15 bg-white/5 p-5 text-primary-50 shadow-2xl backdrop-blur-md sm:p-8"
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute -right-10 -top-10 size-40 opacity-15"
        style={{ animation: 'spin-slow 40s linear infinite' }}
      >
        <path d={STAR_PATH} fill="var(--color-accent)" />
      </svg>
      <div className="flex items-baseline justify-between gap-4 border-b border-white/20 pb-4">
        <h2 id="rates-title" className="font-wide text-xl font-bold text-white">
          Today's rates
        </h2>
        <span className="text-sm text-primary-100">Per pack, in rupees</span>
      </div>

      {isPending && (
        <p role="status" className="py-8 text-primary-100">
          Loading rates…
        </p>
      )}
      {isError && <p className="py-8 text-primary-100">Rates did not load. Refresh the page to try again.</p>}

      {products && (
        <ul className="divide-y divide-white/10">
          {products.map((product) => {
            const variant = product.variants[0]
            if (!variant) return null
            return (
              <li key={product.slug}>
                {/* Phones stack the pack label under the name and drop the dotted leader. */}
                <Link to={`/p/${product.slug}/`} className="rate-row group flex items-center gap-3 py-3 sm:items-baseline sm:py-3.5">
                  <span className="min-w-0 flex-1 sm:flex sm:flex-none sm:items-baseline sm:gap-3">
                    <span className="block font-medium text-white transition-colors group-hover:text-accent">
                      {product.name}
                    </span>
                    <span className="block whitespace-nowrap text-sm text-primary-100">{variant.label}</span>
                  </span>
                  <span
                    aria-hidden
                    className="leader hidden min-w-6 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-white/30 sm:block"
                  />
                  <span className="price shrink-0 whitespace-nowrap font-narrow text-xl font-bold tabular-nums text-white sm:text-2xl">
                    {formatPrice(variant.price)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-4 border-t border-white/20 pt-4 text-sm text-primary-100">
        Rates change with the market. Your order keeps the price you see at checkout.
      </p>
    </section>
  )
}
