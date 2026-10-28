// Page palettes. The colours live in styles/index.css under [data-palette];
// this list names them for the route handles and the preview switcher.
export const palettes = [
  { id: 'emerald', name: 'Emerald', note: 'Logo green and gold', swatch: ['#035a3a', '#caa753', '#f5f9f6'] },
  { id: 'sage', name: 'Sage', note: 'Owner palette', swatch: ['#464e3d', '#cc5500', '#9caf88'] },
  { id: 'saffron', name: 'Saffron', note: 'Turmeric and chilli', swatch: ['#5b2e0e', '#b8321f', '#d9a441'] },
  { id: 'pistachio', name: 'Pistachio', note: 'Kernel and skin', swatch: ['#2d481a', '#8e3b62', '#93c572'] },
  { id: 'indus', name: 'Indus', note: 'River at sunset', swatch: ['#12394a', '#e98a3f', '#5b9aa9'] },
  { id: 'date', name: 'Date palm', note: 'Dates and leaf', swatch: ['#4a2c1a', '#2f7d6d', '#b07d56'] },
] as const

export type PaletteId = (typeof palettes)[number]['id']

export interface RouteHandle {
  palette?: PaletteId
}

export const isPaletteId = (value: unknown): value is PaletteId => palettes.some((p) => p.id === value)
