// ─── Barrel file ─────────────────────────────────────────────
// Re-exports everything so existing imports like:
//   import { productsAPI, formatPrice } from '../../../core/api/api'
// continue working unchanged when pointing to this index.

export { API_URL, getStoredToken, formatPrice } from './client';
export { authAPI } from './auth';
export { productsAPI, searchAPI } from './products';
export { reviewsAPI } from './reviews';
export { addressAPI } from './addresses';
export type { Address } from './addresses';
export { couponAPI } from './coupons';
export type { Coupon } from './coupons';
export { ordersAPI } from './orders';
export type { Order, OrderItem } from './orders';
export { adminUsersAPI, adminDashboardAPI } from './admin';
export { inventoryAPI } from './inventory';
export type { InventoryItem, InventoryMovement, StockAlert } from './inventory';
export { paymentsAPI, MOCK_PAYMENTS } from './payments';
export type { Payment } from './payments';
export { shippingAPI, MOCK_SHIPMENTS } from './shipping';
export type { Shipment } from './shipping';
export { categoriesAPI, brandsAPI } from './categories';
export type { Category } from './categories';
export { aiAPI } from './ai';
export { userAPI } from './user';
export { wishlistAPI } from './wishlist';
export { cartAPI } from './cart';
