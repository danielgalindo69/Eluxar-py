/**
 * paymentService.ts
 * Centraliza todas las llamadas REST al backend relacionadas con pagos.
 * Sigue el patrón establecido en api.ts del proyecto.
 */

const API_BASE = '/api';

// ─── Tipos ──────────────────────────────────────────────────────

export interface PaymentItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePreferenceRequest {
  payerName: string;
  payerEmail: string;
  items: PaymentItem[];
}

export interface CreatePreferenceResponse {
  preferenceId: string;
  sandboxInitPoint: string;
}

// ─── API Client local (no necesita auth para /api/payments) ─────

async function paymentApiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody?.message ?? `Error del servidor: ${response.status}`
    );
  }

  const json = await response.json();
  // El backend envuelve la respuesta en { status, message, data }
  return json.data ?? json;
}

// ─── paymentService ──────────────────────────────────────────────

export const paymentService = {
  /**
   * Solicita al backend la creación de una preferencia de pago en MP.
   * @returns preferenceId para inicializar el Checkout Brick
   */
  async createPreference(
    request: CreatePreferenceRequest
  ): Promise<CreatePreferenceResponse> {
    return paymentApiClient<CreatePreferenceResponse>('/payments/create-preference', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
