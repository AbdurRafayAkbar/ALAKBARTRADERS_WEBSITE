// Shop contact details shown in the header, footer and FAQ.
// TODO(owner): replace the remaining placeholders (address, hours, email) before launch.
export const site = {
  name: 'ALAKBARTRADERS',
  city: 'Chashma',
  phone: '0333-6839509',
  // International form for wa.me links: country code 92, then the number without the 0.
  whatsapp: '923336839509',
  address: 'Main Bazaar, Chashma',
  hours: 'Every day, 9 am to 9 pm',
  email: 'orders@example.com',
} as const

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`
