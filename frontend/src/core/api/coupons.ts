import { apiClient } from './client';

// ─── Coupons ───────────────────────────────────────────────
export interface Coupon {
  id?: number;
  codigo: string;
  descuento: number;   // Porcentaje 0-100 o valor fijo
  tipo: 'PORCENTAJE' | 'VALOR_FIJO';
  montoMinimo?: number;
  limiteUsos?: number;
  usosActuales?: number;
  activo?: boolean;
  fechaExpiracion?: string;
  creadoEn?: string;
}

export const couponAPI = {
  async validate(codigo: string): Promise<Coupon> {
    return apiClient<Coupon>(`/cupones/validar/${codigo}`);
  },
  async getAllAdmin(): Promise<Coupon[]> {
    return apiClient<Coupon[]>('/cupones');
  },
  async create(data: Partial<Coupon>): Promise<Coupon> {
    return apiClient<Coupon>('/cupones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: number, data: Partial<Coupon>): Promise<Coupon> {
    return apiClient<Coupon>(`/cupones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async remove(id: number): Promise<void> {
    return apiClient<void>(`/cupones/${id}`, {
      method: 'DELETE',
    });
  }
};
