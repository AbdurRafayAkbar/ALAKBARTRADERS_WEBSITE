import type { DeliveryInfo } from '../types'

// Sample delivery zones until the zones API exists.
// TODO(owner): every zone name and fee here is a placeholder.

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
