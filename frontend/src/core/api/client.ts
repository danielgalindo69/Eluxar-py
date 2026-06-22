// URL base del backend Spring Boot, ya incluye el prefijo /api.
// En producción apunta a https://eluxar-py.onrender.com/api; en dev a http://localhost:8081/api.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Clave única de localStorage para el JWT
const TOKEN_KEY = 'eluxar_token';

/** Devuelve el JWT almacenado o null si no existe */
export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);

/** Elimina el JWT y el usuario del localStorage */
export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('eluxar_user');
};

/** Guarda el JWT en localStorage */
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

// Simulate network delay (kept for compatibility with remaining mock services)
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const formatPrice = (price: number) => {
  return price.toLocaleString('es-CO');
};

// ─── API Client ──────────────────────────────────────────────
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    // Siempre envía el JWT si existe — el proxy de Vite lo reenvía a Spring Boot
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;

  const result = await response.json();
  // Backend might wrap responses in ApiResponse { status, message, data }
  // or return the data directly
  return result.data !== undefined ? result.data : result;
}
