import { apiClient } from './client';

// ─── User Profile ─────────────────────────────────────────────
export const userAPI = {
  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<{ imageUrl: string }>('/usuarios/profile/image', {
      method: 'POST',
      body: formData,
    });
  },
};
