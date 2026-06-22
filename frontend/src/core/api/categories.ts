import { apiClient } from './client';

// ─── Categories & Brands ─────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  type: 'category' | 'brand';
  productCount: number;
}

export const categoriesAPI = {
  async getAll() {
    const list = await apiClient<any[]>('/categorias');
    return list.map(c => ({
      id: String(c.id),
      name: c.nombre,
      type: 'category',
      productCount: 0
    })) as Category[];
  },
  async create(data: { nombre: string; descripcion?: string }) {
    return apiClient<any>('/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const brandsAPI = {
  async getAll() {
    const list = await apiClient<any[]>('/marcas');
    return list.map(m => ({
      id: String(m.id),
      name: m.nombre,
      type: 'brand',
      productCount: 0
    })) as Category[];
  },
  async create(data: { nombre: string; descripcion?: string; logoUrl?: string }) {
    return apiClient<any>('/marcas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
