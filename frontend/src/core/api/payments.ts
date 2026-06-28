import { apiClient } from './client';

// ─── Payment Brick — Process Payment ─────────────────────────────

/**
 * Estructura del formData que el Payment Brick de Mercado Pago
 * pasa al callback onSubmit cuando el usuario completa el formulario.
 * Solo exponemos lo que necesita el backend; el token nunca son datos de tarjeta crudos.
 */
export interface MercadoPagoBrickFormData {
  token: string;
  payment_method_id: string;
  issuer_id?: string;
  installments: number;
  transaction_amount: number;
  payer: {
    email: string;
    identification?: {
      type?: string;
      number?: string;
    };
  };
}

export interface ProcessPaymentResult {
  paymentId: number;
  status: 'approved' | 'rejected' | 'pending' | 'in_process';
  statusDetail: string;
}

export const paymentAPI = {
  /**
   * Envía los datos del formulario del Payment Brick al backend
   * para que este cree el pago real con la API de Mercado Pago.
   *
   * @param formData    Datos tokenizados del Brick (sin datos de tarjeta en crudo)
   * @param pedidoId    ID del pedido creado en nuestra BD (se usa como externalReference)
   */
  async processPayment(
    formData: MercadoPagoBrickFormData,
    pedidoId: number
  ): Promise<ProcessPaymentResult> {
    return apiClient<ProcessPaymentResult>('/payments/process-payment', {
      method: 'POST',
      body: JSON.stringify({
        token: formData.token,
        paymentMethodId: formData.payment_method_id,
        issuerId: formData.issuer_id ?? null,
        installments: formData.installments,
        transactionAmount: formData.transaction_amount,
        externalReference: String(pedidoId),
        payerEmail: formData.payer.email,
        payerIdentificationType: formData.payer.identification?.type ?? null,
        payerIdentificationNumber: formData.payer.identification?.number ?? null,
      }),
    });
  },
};
