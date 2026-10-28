// Shop contact details shown in the header, footer and FAQ.
// TODO(owner): replace placeholders with real details before launch.
export const site = {
  name: 'ALAKBARTRADERS',
  city: 'Chashma',
  phone: '0300-0000000',
  whatsapp: '923000000000',
  address: 'Main Bazaar, Chashma',
  hours: 'Every day, 9 am to 9 pm',
  email: 'orders@example.com',
} as const

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`
