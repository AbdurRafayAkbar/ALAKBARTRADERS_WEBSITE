import { useState } from 'react'
import type { ProductSort } from '../../api/catalog'
import { usePackSizes } from '../../api/hooks'
import { Button } from '../../components/ui/Button'

export interface ShopFilterValues {
  sizes: string[]
  minPrice: string
  maxPrice: string
  inStock: boolean
}

export const SORT_LABELS: Record<ProductSort, string> = {
  popular: 'Most popular',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  newest: 'Newest',
}

const inputClass =
  'min-h-11 w-full min-w-0 rounded-lg border border-secondary bg-card px-3 transition-[border-color,box-shadow] focus:border-primary-900 focus:shadow-lg'

// The filter panel. On phones it folds away behind a "Filters" button; on
// wide screens it sits beside the products. Ticks apply at once; the price
// range waits for "Apply price" so each keystroke does not reload the list.
export function ShopFilters({
  category,
  values,
  onChange,
  onClear,
}: {
  category?: string
  values: ShopFilterValues
  onChange: (values: ShopFilterValues) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const sizes = usePackSizes(category)
  const active =
    values.sizes.length > 0 || values.minPrice !== '' || values.maxPrice !== '' || values.inStock

  function toggleSize(size: string) {
    const next = values.sizes.includes(size)
      ? values.sizes.filter((s) => s !== size)
      : [...values.sizes, size]
    onChange({ ...values, sizes: next })
  }

  return (
    <div>
      <Button
        className="w-full lg:hidden"
        aria-expanded={open}
        aria-controls="shop-filters"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide filters' : 'Filters'}
        {active && <span className="text-sm font-normal">(on)</span>}
      </Button>

      <section
        id="shop-filters"
        aria-label="Filters"
        className={`${open ? 'block' : 'hidden'} mt-4 space-y-6 rounded-card border border-secondary/60 bg-card p-5 lg:mt-0 lg:block`}
      >
        {sizes.data && sizes.data.length > 0 && (
          <fieldset>
            <legend className="font-display font-semibold">Pack size</legend>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 lg:flex-col">
              {sizes.data.map((size) => (
                <label key={size} className="flex min-h-11 items-center gap-2 lg:min-h-0">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary-900"
                    checked={values.sizes.includes(size)}
                    onChange={() => toggleSize(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <form
          aria-label="Price range"
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            let low = data.get('min')?.toString() ?? ''
            let high = data.get('max')?.toString() ?? ''
            // A swapped range is an easy slip; fix it instead of showing an error.
            if (low && high && Number(low) > Number(high)) [low, high] = [high, low]
            onChange({ ...values, minPrice: low, maxPrice: high })
          }}
          // Remount when the URL changes the range, so the boxes show it.
          key={`${values.minPrice}-${values.maxPrice}`}
        >
          <fieldset>
            <legend className="font-display font-semibold">Price (Rs)</legend>
            <div className="mt-3 flex items-center gap-2">
              <label className="sr-only" htmlFor="price-min">
                Lowest price
              </label>
              <input
                id="price-min"
                name="min"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Min"
                defaultValue={values.minPrice}
                className={inputClass}
              />
              <span aria-hidden>to</span>
              <label className="sr-only" htmlFor="price-max">
                Highest price
              </label>
              <input
                id="price-max"
                name="max"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Max"
                defaultValue={values.maxPrice}
                className={inputClass}
              />
            </div>
          </fieldset>
          <Button type="submit" className="mt-3 w-full">
            Apply price
          </Button>
        </form>

        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            className="size-4 accent-primary-900"
            checked={values.inStock}
            onChange={(e) => onChange({ ...values, inStock: e.target.checked })}
          />
          In stock only
        </label>

        {active && (
          <Button variant="ghost" className="w-full" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </section>
    </div>
  )
}
