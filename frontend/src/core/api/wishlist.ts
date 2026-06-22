import { apiClient } from './client';
import { mapProductoDTOToProduct } from './products';

// ─── Wishlist ────────────────────────────────────────────────
export const wishlistAPI = {
  async getAll() {
    const dtos = await apiClient<any[]>('/wishlist');
    return dtos.map(mapProductoDTOToProduct);
  },
  async getIds() {
    return apiClient<number[]>('/wishlist/ids');
  },
  async add(productId: string) {
    return apiClient<void>(`/wishlist/${productId}`, { method: 'POST' });
  },
  async remove(productId: string) {
    return apiClient<void>(`/wishlist/${productId}`, { method: 'DELETE' });
  }
};
