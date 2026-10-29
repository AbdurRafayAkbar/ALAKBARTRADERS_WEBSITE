import { useDeliveryInfo } from '../api/hooks'
import { formatPrice } from '../lib/money'
import { ErrorBlock, LoadingBlock } from './ui/StatusMessage'

// Zones with fees. Used on the home page and the delivery areas page.
export function DeliveryZoneList() {
  const { data, isPending, isError, refetch } = useDeliveryInfo()

  if (isPending) return <LoadingBlock label="Loading delivery areas" />
  if (isError) return <ErrorBlock onRetry={() => refetch()} />

  return (
    <div>
      <ul className="divide-y divide-secondary/40 overflow-hidden rounded-card border border-secondary/50 bg-card">
        {data.zones.map((zone) => (
          <li
            key={zone.id}
            className="group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-primary-50"
          >
            <span>
              <span className="flex items-center gap-2 font-semibold">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-4 text-primary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-accent"
                  fill="currentColor"
                >
                  <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                </svg>
                {zone.name}
              </span>
              {!zone.cream_allowed && (
                <span className="text-sm text-muted">
                  Milk cream not delivered here, it would not stay cold.
                </span>
              )}
            </span>
            <span className="font-narrow text-xl font-bold tabular-nums transition-colors group-hover:text-primary-900">
              {formatPrice(zone.fee)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-ink/80">
        Free delivery on orders of {formatPrice(data.free_shipping_threshold)} or more.
      </p>
    </div>
  )
}
