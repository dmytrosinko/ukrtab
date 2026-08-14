import { Product, CartItem } from '@/lib/types';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function extractCategoryName(cat: any): string {
  if (!cat) return 'Загальні';
  if (typeof cat === 'string') return cat;
  if (typeof cat === 'object') {
    if (typeof cat.name === 'string' && cat.name) return cat.name;
  }
  return 'Загальні';
}

function sendGtagEvent(eventName: string, params: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  // Try gtag function call
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch (e) {
      console.error('[GA4 Analytics] Error calling window.gtag:', e);
    }
  }

  // Also push to dataLayer directly for GTM / fallback analytics listeners
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  } catch (e) {
    console.error('[GA4 Analytics] Error pushing to dataLayer:', e);
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
      item_id: String(product.id),
      item_name: String(product.name),
      price: Number(product.price || 0),
      item_category: extractCategoryName(product.category),
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
        item_id: String(product.id),
        item_name: String(product.name),
        price: Number(product.price || 0),
        item_category: extractCategoryName(product.category),
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
    value: Number(product.price || 0),
    items: [
      {
        item_id: String(product.id),
        item_name: String(product.name),
        price: Number(product.price || 0),
        item_category: extractCategoryName(product.category),
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
    value: Number(product.price || 0) * quantity,
    items: [
      {
        item_id: String(product.id),
        item_name: String(product.name),
        price: Number(product.price || 0),
        item_category: extractCategoryName(product.category),
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
    value: Number(product.price || 0) * quantity,
    items: [
      {
        item_id: String(product.id),
        item_name: String(product.name),
        price: Number(product.price || 0),
        item_category: extractCategoryName(product.category),
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
    value: Number(totalPrice || 0),
    items: items.map((item: any) => {
      const p = item.product || item;
      return {
        item_id: String(p.id || item.productId || 'item'),
        item_name: String(p.name || item.productName || 'Товар'),
        price: Number(p.price || item.price || 0),
        item_category: extractCategoryName(p.category || item.category),
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
    value: Number(totalPrice || 0),
    items: items.map((item: any) => {
      const p = item.product || item;
      return {
        item_id: String(p.id || item.productId || 'item'),
        item_name: String(p.name || item.productName || 'Товар'),
        price: Number(p.price || item.price || 0),
        item_category: extractCategoryName(p.category || item.category),
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
      item_category: extractCategoryName(p.category || item.category),
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
  sendGtagEvent('purchase', payload);
}



