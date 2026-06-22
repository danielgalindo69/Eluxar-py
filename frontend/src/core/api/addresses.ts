import { apiClient } from './client';

// ─── Addresses ───────────────────────────────────────────────
export interface Address {
  id: string;
  label: string;       // Alias/nombre ("Casa", "Trabajo")
  street: string;      // Calle y número
  barrio: string;      // Barrio
  city: string;        // Ciudad
  state: string;       // Departamento
  zip: string;         // Código postal
  country: string;     // País
  isDefault: boolean;
}

export const addressAPI = {
  async getAll(): Promise<Address[]> {
    return apiClient<Address[]>('/usuarios/direcciones');
  },
  async create(address: Omit<Address, 'id'>): Promise<Address> {
    return apiClient<Address>('/usuarios/direcciones', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },
  async update(id: string, data: Partial<Address>): Promise<Address> {
    return apiClient<Address>(`/usuarios/direcciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async remove(id: string): Promise<{ success: boolean }> {
    return apiClient<{ success: boolean }>(`/usuarios/direcciones/${id}`, { method: 'DELETE' });
  },
  async setDefault(id: string): Promise<{ success: boolean }> {
    return apiClient<{ success: boolean }>(`/usuarios/direcciones/${id}/predeterminada`, { method: 'PUT' });
  },
};
