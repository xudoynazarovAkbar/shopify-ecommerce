// 📌 Full-Stack TypeScript Types & Interfaces for Shopify Multi-Vendor Marketplace

// --- ⚙️ Core Enums & Statuses ---

export type Role = 'BUYER' | 'VENDOR' | 'ADMIN';

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ProductStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type CouponDiscountType = 'PERCENTAGE' | 'FLAT';

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

// --- 👤 1. Authentication & Profiles (`/auth` / `/vendors`) ---

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  vendorProfile?: Vendor | null;
}

export interface Vendor {
  id: string;
  userId: string;
  shopName: string;
  shopDescription?: string | null;
  autoApproveProducts: boolean;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  averageRating?: number | null;
  reviewCount?: number;
  reviews?: Review[];
}

export interface RegisterPayload {
  email: string;
  password?: string;
  role?: Role;
  shopName?: string;
  shopDescription?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UpdateVendorStatusPayload {
  status: VendorStatus;
}

export interface UpdateVendorTrustPayload {
  autoApproveProducts: boolean;
}

// --- 🗂️ 2. Categories (`/categories`) ---

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

// --- 🍔 3. Products (`/products`) ---

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    shopName: string;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateProductPayload {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export interface UpdateProductPayload {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
}

export interface UpdateProductStatusPayload {
  status: ProductStatus;
}

// --- 🛒 4. Scoped Shopping Cart (`/cart`) ---

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string | null;
  };
}

export interface Cart {
  id: string;
  buyerId: string;
  vendorId: string | null;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    shopName: string;
  } | null;
  items: CartItem[];
}

export interface AddCartItemPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

// --- 🧾 5. Order Management & Checkout (`/orders`) ---

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image?: string | null;
  } | null;
}

export interface Order {
  id: string;
  orderNumber: number;
  buyerId: string;
  vendorId: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  review?: Review | null;
  buyer?: {
    id: string;
    email: string;
  } | null;
  vendor?: {
    id: string;
    shopName: string;
  } | null;
}

export interface CheckoutPayload {
  promoCode?: string;
  savedCardId?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

// --- 🎟️ 6. Promo Codes & Coupons (`/coupons`) ---

export interface Coupon {
  id: string;
  vendorId: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  isActive: boolean;
  expirationDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  expirationDate?: string;
}

export interface UpdateCouponPayload {
  isActive: boolean;
}

// --- 💳 7. Payment Card Vaulting (`/payments`) ---

export interface SavedCard {
  id: string;
  buyerId: string;
  cardToken: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCardPayload {
  cardToken: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

// --- ⭐ 8. Two-Way Customer Reviews (`/reviews`) ---

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  vendorId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    email: string;
  } | null;
  vendor?: {
    id: string;
    shopName: string;
  } | null;
}

export interface CreateReviewPayload {
  orderId: string;
  rating: number;
  comment?: string;
}

// --- 🔍 9. Centralized Search (`/search`) ---

export interface SearchResponse {
  products: Product[];
  vendors: Vendor[];
}
