import { useId, useState } from 'react'
import { palettes, type PaletteId } from '../../config/palettes'

// Preview tool for choosing the final palette. "Page default" lets each page
// use its own palette; picking one forces it on every page.
export function PaletteSwitcher({
  value,
  pageDefault,
  onChange,
}: {
  value: PaletteId | null
  pageDefault: PaletteId
  onChange: (id: PaletteId | null) => void
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    // On phones it sits bottom-right as a small round button, away from text.
    <div className="fixed right-3 bottom-3 z-50 flex flex-col items-end text-sm sm:right-auto sm:bottom-4 sm:left-4 sm:items-start">
      {open && (
        <div
          id={panelId}
          className="animate-page-in mb-3 w-64 max-w-[calc(100vw-1.5rem)] rounded-card border border-secondary/60 bg-card/95 p-3 shadow-2xl backdrop-blur"
        >
          <p className="px-2 pb-2 font-semibold text-ink">Palette preview</p>
          <ul className="grid gap-1">
            <li>
              <PaletteOption
                active={value === null}
                label="Page default"
                note={palettes.find((p) => p.id === pageDefault)?.name ?? ''}
                onClick={() => onChange(null)}
              />
            </li>
            {palettes.map((p) => (
              <li key={p.id}>
                <PaletteOption
                  active={value === p.id}
                  label={p.name}
                  note={p.note}
                  swatch={p.swatch}
                  onClick={() => onChange(p.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        aria-label="Palette"
        className="group flex size-11 items-center justify-center gap-2 rounded-full border border-secondary/60 bg-card/90 font-semibold text-ink shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5 sm:w-auto sm:justify-start sm:pr-4 sm:pl-2"
      >
        <span
          aria-hidden
          className="size-7 rounded-full transition-transform duration-700 group-hover:rotate-180"
          style={{
            background:
              'conic-gradient(var(--color-primary-900) 0 33%, var(--color-accent) 0 66%, var(--color-primary) 0)',
          }}
        />
        <span aria-hidden className="hidden sm:inline">
          Palette
        </span>
      </button>
    </div>
  )
}

function PaletteOption({
  active,
  label,
  note,
  swatch,
  onClick,
}: {
  active: boolean
  label: string
  note: string
  swatch?: readonly string[]
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-primary-50 ${
        active ? 'bg-primary-100' : ''
      }`}
    >
      <span aria-hidden className="flex">
        {swatch ? (
          swatch.map((c, i) => (
            <span
              key={i}
              className="-ml-1.5 size-5 rounded-full border-2 border-card first:ml-0"
              style={{ background: c }}
            />
          ))
        ) : (
          <span className="size-5 rounded-full border-2 border-dashed border-muted" />
        )}
      </span>
      <span className="leading-tight">
        <span className="block font-medium text-ink">{label}</span>
        <span className="block text-xs text-muted">{note}</span>
      </span>
    </button>
  )
}
