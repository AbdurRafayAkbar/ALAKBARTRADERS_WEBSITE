import type { Category, DeliveryInfo, Product, ProductVariant } from '../types'

// Sample catalogue for building the frontend before the Django API exists.
// TODO(owner): every name, price and zone here is a placeholder.

export const categories: Category[] = [
  {
    slug: 'rice',
    name: 'Rice',
    summary: 'Basmati, Sella and everyday rice, cleaned and packed in the shop.',
    pack_sizes: '1 kg, 5 kg, 10 kg and 25 kg bags',
    is_perishable: false,
  },
  {
    slug: 'dry-fruits',
    name: 'Dry fruits',
    summary: 'Almonds, cashews, pistachios and walnuts, sold by weight.',
    pack_sizes: '250 g, 500 g and 1 kg packs',
    is_perishable: false,
  },
  {
    slug: 'milk-cream',
    name: 'Milk cream',
    summary: 'Fresh dairy cream from dated batches. Delivered chilled.',
    pack_sizes: '250 g and 500 g tubs',
    is_perishable: true,
  },
]

let nextId = 1
function v(label: string, price: string, compare: string | null = null, low = false): ProductVariant {
  const id = nextId++
  return {
    id,
    label,
    sku: `SKU-${String(id).padStart(4, '0')}`,
    price,
    compare_at_price: compare,
    stock_state: low ? 'low_stock' : 'in_stock',
  }
}

export const products: Product[] = [
  {
    slug: 'super-kernel-basmati',
    name: 'Super Kernel Basmati',
    category: 'rice',
    description: 'Long grain, aged basmati. Cooks fluffy and separate. Our best seller for biryani and pulao.',
    is_perishable: false,
    is_featured: true,
    variants: [v('1 kg', '450.00'), v('5 kg', '2150.00', '2250.00'), v('10 kg', '4200.00'), v('25 kg', '10250.00')],
  },
  {
    slug: 'sella-basmati',
    name: 'Sella Basmati',
    category: 'rice',
    description: 'Parboiled golden sella. Firm grains that hold their shape in daigs and large cooking.',
    is_perishable: false,
    is_featured: true,
    variants: [v('5 kg', '1950.00'), v('10 kg', '3850.00'), v('25 kg', '9400.00')],
  },
  {
    slug: 'kainat-rice',
    name: 'Kainat Rice',
    category: 'rice',
    description: 'Extra long grain for everyday meals. Good value for families.',
    is_perishable: false,
    is_featured: false,
    variants: [v('5 kg', '1650.00'), v('10 kg', '3250.00')],
  },
  {
    slug: 'broken-rice',
    name: 'Broken Rice',
    category: 'rice',
    description: 'Broken basmati for kheer, khichdi and daily use.',
    is_perishable: false,
    is_featured: false,
    variants: [v('5 kg', '950.00'), v('10 kg', '1850.00', null, true)],
  },
  {
    slug: 'kaghzi-almonds',
    name: 'Kaghzi Almonds',
    category: 'dry-fruits',
    description: 'Thin-shell almonds that crack by hand. Sweet, fresh crop.',
    is_perishable: false,
    is_featured: true,
    variants: [v('250 g', '650.00'), v('500 g', '1250.00'), v('1 kg', '2400.00')],
  },
  {
    slug: 'roasted-pistachios',
    name: 'Roasted Pistachios',
    category: 'dry-fruits',
    description: 'Lightly salted, roasted in shell.',
    is_perishable: false,
    is_featured: true,
    variants: [v('250 g', '1100.00'), v('500 g', '2150.00', null, true)],
  },
  {
    slug: 'cashews',
    name: 'Cashews',
    category: 'dry-fruits',
    description: 'Whole white cashews, grade W320.',
    is_perishable: false,
    is_featured: false,
    variants: [v('250 g', '950.00'), v('500 g', '1850.00'), v('1 kg', '3600.00')],
  },
  {
    slug: 'walnut-kernels',
    name: 'Walnut Kernels',
    category: 'dry-fruits',
    description: 'Light halves, shelled and cleaned.',
    is_perishable: false,
    is_featured: false,
    variants: [v('250 g', '800.00'), v('500 g', '1550.00')],
  },
  {
    slug: 'fresh-milk-cream',
    name: 'Fresh Milk Cream',
    category: 'milk-cream',
    description: 'Thick dairy cream for tea, desserts and cooking. Keep refrigerated and use by the date on the tub.',
    is_perishable: true,
    is_featured: true,
    variants: [v('250 g', '380.00'), v('500 g', '740.00')],
  },
  {
    slug: 'malai-cream',
    name: 'Malai Cream',
    category: 'milk-cream',
    description: 'Rich malai skimmed from boiled milk. Made in small batches.',
    is_perishable: true,
    is_featured: false,
    variants: [v('250 g', '420.00')],
  },
]

export const deliveryInfo: DeliveryInfo = {
  free_shipping_threshold: '5000.00',
  zones: [
    { id: 1, name: 'Chashma Colony', fee: '100.00', cream_allowed: true },
    { id: 2, name: 'Main Bazaar', fee: '100.00', cream_allowed: true },
    { id: 3, name: 'CHASNUPP Colony', fee: '150.00', cream_allowed: true },
    { id: 4, name: 'Barrage Road', fee: '200.00', cream_allowed: true },
    { id: 5, name: 'Outer villages', fee: '300.00', cream_allowed: false },
  ],
}
