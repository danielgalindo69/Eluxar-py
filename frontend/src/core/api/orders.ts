import { apiClient } from './client';

// ─── Orders ──────────────────────────────────────────────────
export interface OrderItem {
  id?: number;
  varianteId?: number;
  productoNombre?: string;
  tamanoMl?: number;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  imagenUrl?: string;
  // Campos antiguos para retrocompatibilidad
  productId?: string;
  name?: string;
  image?: string;
  volume?: string;
  price?: number;
}

export interface Order {
  id: string | number;
  date?: string;
  creadoEn?: string;
  status?: string;
  estado?: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  address?: string;
  direccionEnvio?: string;
  paymentMethod?: string;
  metodoPago?: string;
  trackingNumber?: string;
}

export const ordersAPI = {
  async getAll() {
    return apiClient<any[]>('/pedidos/mis-pedidos');
  },
  async getAllAdmin() {
    return apiClient<any[]>('/pedidos/todos');
  },
  async getById(id: string) {
    return apiClient<any>(`/pedidos/${id}`);
  },
  async updateStatus(id: string, status: string) {
    return apiClient<any>(`/pedidos/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado: status }),
    });
  },
  async updateAddress(orderId: string, address: string) {
    return apiClient<any>(`/pedidos/${orderId}/direccion`, {
      method: 'PATCH',
      body: JSON.stringify({ direccionEnvio: address }),
    });
  },
  async create(data: {
    direccion: string;
    barrio?: string;
    ciudad: string;
    codigoPostal?: string;
    departamento?: string;
    pais: string;
    metodoPago: string;
    codigoDescuento?: string;
    notas?: string;
  }) {
    return apiClient<any>('/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async cancel(id: string) {
    return apiClient<any>(`/pedidos/${id}/cancelar`, { method: 'PUT' });
  }
};
