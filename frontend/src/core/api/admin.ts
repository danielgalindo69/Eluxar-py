import { apiClient } from './client';

// ─── Admin Users ──────────────────────────────────────────────
export const adminUsersAPI = {
  async getAll() {
    return apiClient<any[]>('/usuarios');
  },
  async updateRole(id: string, role: string) {
    return apiClient<any>(`/usuarios/${id}/rol`, {
      method: 'PUT',
      body: JSON.stringify({ rol: role }),
    });
  },
  async toggleActive(id: string) {
    return apiClient<any>(`/usuarios/${id}/toggle-active`, {
      method: 'PUT',
    });
  }
};

// ─── Admin Dashboard ──────────────────────────────────────────
export const adminDashboardAPI = {
  async getMetrics() {
    return apiClient<any>('/admin/dashboard');
  }
};
