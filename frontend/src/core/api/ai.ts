import { apiClient } from './client';

// ─── AI ──────────────────────────────────────────────────────
export const aiAPI = {
  async fragranceTest(message: string, history: object[], step: number) {
    return apiClient<{
      response: string;
      question?: string;
      options?: string[];
      history: object[];
      step: number;
      finished: boolean;
      totalSteps: number;
    }>('/ia/fragrance-test', {
      method: 'POST',
      body: JSON.stringify({ message, history, step }),
    });
  },
  async getRecommendations() {
    return apiClient<Array<{
      id: number;
      productId: number | null;
      respuestaTexto: string;
      fechaCreacion: string;
    }>>('/ia/recomendaciones', { method: 'GET' });
  },
  async saveRecommendation(productId: number | null, respuestaTexto: string) {
    return apiClient<{
      id: number;
      productId: number | null;
      respuestaTexto: string;
      fechaCreacion: string;
    }>('/ia/recomendaciones', {
      method: 'POST',
      body: JSON.stringify({ productId, respuestaTexto }),
    });
  },
  async chatMessage(message: string, history: object[] = []) {
    const result = await apiClient<{ response: string; history: object[] }>('/ia/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
    return { reply: result.response, history: result.history };
  },
  async improveImage(productId: string | number, imagenId: number, style?: string, prompt?: string) {
    return apiClient<any>(`/productos/${productId}/imagenes/${imagenId}/mejorar-ia`, {
        method: 'POST',
        body: JSON.stringify({ style: style || '', additional_prompt: prompt || '' }),
    });
  },
  async healthCheck() {
    try {
      await apiClient('/ia/health', { method: 'GET' });
    } catch (e) {
      // Ignorar errores silenciosamente como fue solicitado
    }
  },
};
