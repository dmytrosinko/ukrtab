import { Product, CartItem } from '@/lib/types';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function sendGtagEvent(eventName: string, params: Record<string, any>) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }
}

/**
 * Track when a user views a list of products (Catalog, Search, Featured)
 */
export function trackViewItemList(products: Product[], listName = 'Каталог товарів') {
  if (!products || products.length === 0) return;
  sendGtagEvent('view_item_list', {
    item_list_name: listName,
    items: products.slice(0, 30).map((product, index) => ({
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_category: product.category || 'Загальні',
      index: index + 1,
    })),
  });
}

/**
 * Track when a user clicks on a product item from a list
 */
export function trackSelectItem(product: Product, listName = 'Каталог товарів') {
  if (!product) return;
  sendGtagEvent('select_item', {
    item_list_name: listName,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || 'Загальні',
      },
    ],
  });
}

/**
 * Track when a user views a product detail page
 */
export function trackViewItem(product: Product) {
  if (!product) return;
  sendGtagEvent('view_item', {
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
  if (!product) return;
  sendGtagEvent('add_to_cart', {
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
 * Track when a user removes a product from the cart
 */
export function trackRemoveFromCart(product: Product, quantity = 1) {
  if (!product) return;
  sendGtagEvent('remove_from_cart', {
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
 * Track when a user opens/views the shopping cart
 */
export function trackViewCart(items: CartItem[], totalPrice: number) {
  if (!items || items.length === 0) return;
  sendGtagEvent('view_cart', {
    currency: 'UAH',
    value: totalPrice,
    items: items.map((item: any) => {
      const p = item.product || item;
      return {
        item_id: p.id || item.productId || 'item',
        item_name: p.name || item.productName || 'Товар',
        price: Number(p.price || item.price || 0),
        item_category: p.category || item.category || 'Загальні',
        quantity: Number(item.quantity || 1),
      };
    }),
  });
}

/**
 * Track when a user enters the checkout page
 */
export function trackBeginCheckout(items: CartItem[], totalPrice: number) {
  if (!items || items.length === 0) return;
  sendGtagEvent('begin_checkout', {
    currency: 'UAH',
    value: totalPrice,
    items: items.map((item: any) => {
      const p = item.product || item;
      return {
        item_id: p.id || item.productId || 'item',
        item_name: p.name || item.productName || 'Товар',
        price: Number(p.price || item.price || 0),
        item_category: p.category || item.category || 'Загальні',
        quantity: Number(item.quantity || 1),
      };
    }),
  });
}

/**
 * Track when a user completes a purchase
 */
export function trackPurchase(orderNumber: string | number, totalPrice: number, items: CartItem[]) {
  if (!items || items.length === 0) return;

  const formattedItems = items.map((item: any) => {
    const p = item.product || item;
    return {
      item_id: String(p.id || item.productId || 'item'),
      item_name: String(p.name || item.productName || 'Товар'),
      price: Number(p.price || item.price || 0),
      item_category: String(p.category || item.category || 'Загальні'),
      quantity: Number(item.quantity || 1),
    };
  });

  const payload = {
    transaction_id: String(orderNumber),
    value: Number(totalPrice),
    currency: 'UAH',
    items: formattedItems,
  };

  console.log('[GA4 Analytics] Sending purchase event:', payload);

  // 1. Send via sendGtagEvent (gtag API)
  sendGtagEvent('purchase', payload);

  // 2. Also push standard GA4 dataLayer ecommerce object as fallback
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: payload,
    });
  }
}


