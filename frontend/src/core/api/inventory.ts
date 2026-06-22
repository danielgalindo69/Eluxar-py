import { apiClient, getStoredToken, API_URL } from './client';

// ─── Inventory ───────────────────────────────────────────────
export interface InventoryItem {
  id: number;
  varianteId: number;
  sku: string;
  productoNombre: string;
  tamanoMl: number;
  stockActual: number;
  stockReservado: number;
  stockMinimo: number;
  stockBajo: boolean;
}

export interface InventoryMovement {
  id: number;
  varianteId: number;
  productoNombre: string;
  tamanoMl: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'RESERVA' | 'LIBERACION';
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: string;
}

export interface StockAlert {
  varianteId: number;
  sku: string;
  productoNombre: string;
  tamanoMl: number;
  stockActual: number;
  stockMinimo: number;
}

export const inventoryAPI = {
  async getAll(): Promise<InventoryItem[]> {
    return apiClient<InventoryItem[]>('/inventario');
  },
  async getMovements(desde?: string, hasta?: string): Promise<InventoryMovement[]> {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient<InventoryMovement[]>(`/inventario/movimientos${query}`);
  },
  async getAlerts(): Promise<StockAlert[]> {
    return apiClient<StockAlert[]>('/inventario/alertas');
  },
  async update(varianteId: number | string, data: { stockActual: number; stockMinimo?: number; motivo?: string }) {
    return apiClient<InventoryItem>(`/inventario/${varianteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  /** Descarga el reporte de movimientos como archivo Excel */
  async exportarExcel(desde?: string, hasta?: string): Promise<void> {
    const token = getStoredToken();
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const query = params.toString() ? `?${params.toString()}` : '';
    // Usa URL absoluta para que funcione tanto en dev como en producción
    const response = await fetch(`${API_URL}/inventario/movimientos/exportar${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al exportar Excel');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movimientos_inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },
  /** Archiva (oculta de la vista) movimientos anteriores a la fecha dada */
  async archivarMovimientos(antes: string): Promise<void> {
    await apiClient(`/inventario/movimientos/archivar?antes=${antes}`, { method: 'PATCH' });
  },
};
