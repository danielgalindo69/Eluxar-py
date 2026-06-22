import { apiClient, getStoredToken, setStoredToken, clearStoredAuth } from './client';

const TOKEN_KEY = 'eluxar_token';

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  async login(email: string, password: string) {
    const data = await apiClient<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Guarda el JWT y la información del usuario en localStorage
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);      // JWT → eluxar_token
      const user = {
        id: String(data.userId),
        name: data.nombre,
        lastName: data.apellido,
        email: data.email,
        role: data.rol,
        token: data.token,
        pictureUrl: data.pictureUrl ?? null,
      };
      localStorage.setItem('eluxar_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Login failed: No token received');
  },
  async register(data: { firstName: string; lastName: string; email: string; password: string }) {
    return apiClient<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nombre: data.firstName,
        apellido: data.lastName,
        email: data.email,
        password: data.password
      }),
    });
  },
  async registerAdmin(data: { firstName: string; lastName: string; email: string; password: string }) {
    return apiClient<any>('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify({
        nombre: data.firstName,
        apellido: data.lastName,
        email: data.email,
        password: data.password
      }),
    });
  },
  async logout() {
    clearStoredAuth();
    return { success: true };
  },
  async googleLogin(credential: string) {
    const data = await apiClient<any>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: credential }),
    });

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);      // JWT → eluxar_token
      const user = {
        id: String(data.userId),
        name: data.nombre,
        lastName: data.apellido,
        email: data.email,
        role: data.rol,
        token: data.token,
        pictureUrl: data.pictureUrl ?? null,
      };
      localStorage.setItem('eluxar_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Google login failed: No token received');
  },
  async forgotPassword(email: string) {
    return apiClient<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async verifyResetCode(email: string, code: string) {
    return apiClient<any>('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },
  async resetPassword(email: string, code: string, newPassword: string) {
    return apiClient<any>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },
  async updateProfile(data: { name?: string; email?: string }) {
    return apiClient<any>('/usuarios/perfil', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async changePassword(oldPassword: string, newPassword: string) {
    return apiClient<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },
};

// Re-export for consumers that import getStoredToken from this domain module
export { getStoredToken } from './client';
