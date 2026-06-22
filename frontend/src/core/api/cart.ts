import { apiClient } from './client';

// ─── Cart ────────────────────────────────────────────────────
export const cartAPI = {
  async getActive() {
    return apiClient<any>('/carrito');
  },
  async addItem(varianteId: number, cantidad: number) {
    return apiClient<any>('/carrito/agregar', {
      method: 'POST',
      body: JSON.stringify({ varianteId, cantidad }),
    });
  },
  async updateItem(itemId: number, cantidad: number) {
    return apiClient<any>(`/carrito/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad }),
    });
  },
  async removeItem(itemId: number) {
    return apiClient<any>(`/carrito/item/${itemId}`, {
      method: 'DELETE',
    });
  }
};
