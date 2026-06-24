import { apiClient, delay } from './client';

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
    await delay(800);
    return { recommendedProductIds: ['4', '1', '3', '2'], reasons: {
      '4': 'Tu perfil indica preferencia por notas cálidas y envolventes.',
      '1': 'Ideal para tu estilo versátil según tus compras anteriores.',
      '3': 'Coincide con tu preferencia por fragancias íntimas y elegantes.',
      '2': 'Recomendado por usuarios con gustos similares al tuyo.',
    }};
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
