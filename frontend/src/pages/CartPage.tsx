import { Link } from 'react-router'
import { useCart, useDeliveryInfo, useUpdateCartItem } from '../api/hooks'
import { Reveal } from '../components/motion/Reveal'
import { ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { ErrorBlock, LoadingBlock, MessageBlock } from '../components/ui/StatusMessage'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatPrice } from '../lib/money'

// Quantity buttons fill with the brand colour on hover.
const stepClass =
  'grid size-11 place-items-center rounded-full text-xl transition-colors hover:bg-primary-900 hover:text-primary-50 disabled:opacity-50'

export default function CartPage() {
  useDocumentTitle('Your cart')
  const { data: cart, isPending, isError, refetch } = useCart()
  const { data: delivery } = useDeliveryInfo()
  const update = useUpdateCartItem()

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="animate-page-in font-display text-3xl font-bold sm:text-4xl">Your <span className="text-duo">cart</span></h1>

      {isPending && <LoadingBlock label="Loading cart" />}
      {isError && <div className="mt-8"><ErrorBlock onRetry={() => refetch()} /></div>}

      {cart?.items.length === 0 && (
        <div className="mt-8">
          <MessageBlock title="Your cart is empty">
            <Link to="/shop/" className="link-grow font-semibold text-primary-900">Browse products</Link> and add the
            pack sizes you need.
          </MessageBlock>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_22rem] lg:gap-10">
          <ul className="grid gap-3">
            {cart.items.map((line, i) => (
              <Reveal
                as="li"
                key={line.id}
                index={i}
                // Phones: name and total on top, quantity and remove below. Wider: one row.
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 rounded-card border border-secondary/40 bg-card p-4 transition-[border-color,box-shadow] hover:border-primary hover:shadow-lg sm:flex sm:px-5"
              >
                <div className="min-w-0 sm:flex-1">
                  <Link to={`/p/${line.product_slug}/`} className="link-grow font-semibold">
                    {line.product_name}
                  </Link>
                  <p className="text-sm text-muted">
                    {line.variant_label}, {formatPrice(line.unit_price)} each
                  </p>
                </div>
                <span key={line.line_total} className="animate-pop font-narrow text-right text-xl font-bold tabular-nums sm:order-last sm:w-28">
                  {formatPrice(line.line_total)}
                </span>
                <div className="flex w-fit items-center rounded-full border border-secondary" role="group" aria-label={`Quantity of ${line.product_name}`}>
                  <button
                    type="button"
                    className={stepClass}
                    disabled={update.isPending}
                    onClick={() => update.mutate({ lineId: line.id, quantity: line.quantity - 1 })}
                    aria-label="Remove one"
                  >
                    −
                  </button>
                  <span key={line.quantity} className="animate-pop w-8 text-center font-semibold tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    className={stepClass}
                    disabled={update.isPending}
                    onClick={() => update.mutate({ lineId: line.id, quantity: line.quantity + 1 })}
                    aria-label="Add one"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="link-grow justify-self-end text-sm sm:order-last text-muted transition-colors hover:text-danger"
                  onClick={() => update.mutate({ lineId: line.id, quantity: 0 })}
                >
                  Remove<span className="sr-only"> {line.product_name}</span>
                </button>
              </Reveal>
            ))}
          </ul>

          <aside className="h-fit rounded-card border-t-4 border-accent bg-card p-5 shadow-lg sm:p-6 lg:sticky lg:top-32">
            <h2 className="font-display text-xl font-bold">Order summary</h2>
            <dl className="mt-4 grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2">
              <dt>Subtotal</dt>
              <dd className="text-right font-narrow text-xl font-bold tabular-nums">{formatPrice(cart.subtotal)}</dd>
              <dt className="text-muted">Delivery</dt>
              <dd className="text-right text-muted">Set by your area</dd>
            </dl>
            {delivery && (
              <p className="mt-4 text-sm text-muted">
                Free delivery on orders of {formatPrice(delivery.free_shipping_threshold)} or more.
              </p>
            )}
            {/* Checkout arrives with the backend (Phase 5). */}
            <ButtonLink to="/cart/" variant="primary" className="mt-6 w-full" aria-disabled onClick={(e) => e.preventDefault()}>
              Checkout opens soon
            </ButtonLink>
            <p className="mt-3 text-sm text-muted">Cash on delivery. We call to confirm before sending.</p>
          </aside>
        </div>
      )}
    </Container>
  )
}
