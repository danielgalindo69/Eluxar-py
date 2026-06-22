import { delay } from './client';

// ─── Payments (Admin) ────────────────────────────────────────
export interface Payment {
  id: string;
  orderId: string;
  client: string;
  amount: number;
  method: string;
  status: 'Pendiente' | 'Confirmado' | 'Rechazado';
  date: string;
}

export const MOCK_PAYMENTS: Payment[] = [];

export const paymentsAPI = {
  async getAll() { await delay(); return [...MOCK_PAYMENTS]; },
  async updateStatus(id: string, status: Payment['status']) { await delay(); return { success: true, id, status }; },
};
