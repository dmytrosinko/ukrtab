export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  sku?: string | null;
  status: string;
  categoryId?: string | null;
  category?: Category | null;
  description?: string | null;
  image: string;
  images: string;
  unit: string;
  features: string;
  isFeatured: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  isFeatured: boolean;
  products?: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  productId?: string | null;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  city?: string | null;
  deliveryMethod: string;
  warehouseInfo?: string | null;
  paymentMethod: string;
  notes?: string | null;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: Date | string;
}

export interface Banner {
  id: string;
  title?: string | null;
  image: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface SiteSettings {
  id: string;
  companyName: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  reviewsCount: number;
  workHours: string;
}
