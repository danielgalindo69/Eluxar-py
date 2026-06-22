import { delay } from './client';

// ─── Shipping (Admin) ────────────────────────────────────────
export interface Shipment {
  id: string;
  orderId: string;
  client: string;
  address: string;
  carrier: string;
  trackingNumber: string;
  status: 'Preparando' | 'En tránsito' | 'Entregado' | 'Devuelto';
  date: string;
  estimatedDelivery: string;
}

export const MOCK_SHIPMENTS: Shipment[] = [];

export const shippingAPI = {
  async getAll() { await delay(); return [...MOCK_SHIPMENTS]; },
  async updateStatus(id: string, status: Shipment['status']) { await delay(); return { success: true, id, status }; },
};
