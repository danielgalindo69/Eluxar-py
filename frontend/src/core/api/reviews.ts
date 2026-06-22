import { apiClient } from './client';

// ─── Reviews ──────────────────────────────────────────────────
export const reviewsAPI = {
  async getByProductId(productId: string, page = 0, size = 10) {
    return apiClient<any>(`/productos/${productId}/resenas?page=${page}&size=${size}`);
  },
  async createOrUpdate(productId: string, rating: number, comment: string) {
    return apiClient<any>(`/productos/${productId}/resenas`, {
      method: 'POST',
      body: JSON.stringify({ calificacion: rating, comentario: comment }),
    });
  }
};
