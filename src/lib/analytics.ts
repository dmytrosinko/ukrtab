import { Product, CartItem } from '@/lib/types';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Track when a user views a product page
 */
export function trackViewItem(product: Product) {
  if (typeof window === 'undefined' || !window.gtag || !product) return;
  window.gtag('event', 'view_item', {
    currency: 'UAH',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || 'Загальні',
        quantity: 1,
      },
    ],
  });
}

/**
 * Track when a user adds a product to the cart
 */
export function trackAddToCart(product: Product, quantity = 1) {
  if (typeof window === 'undefined' || !window.gtag || !product) return;
  window.gtag('event', 'add_to_cart', {
    currency: 'UAH',
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || 'Загальні',
        quantity: quantity,
      },
    ],
  });
}

/**
 * Track when a user completes a purchase
 */
export function trackPurchase(orderNumber: string | number, totalPrice: number, items: CartItem[]) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'purchase', {
    transaction_id: String(orderNumber),
    value: totalPrice,
    currency: 'UAH',
    items: items.map((item) => ({
      item_id: item.product.id,
      item_name: item.product.name,
      price: item.product.price,
      item_category: item.product.category || 'Загальні',
      quantity: item.quantity,
    })),
  });
}
