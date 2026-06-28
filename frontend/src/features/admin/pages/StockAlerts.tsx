import { useState } from "react";
import { inventoryAPI, StockAlert } from "../../../core/api/api";
import { AlertTriangle, AlertCircle, Settings, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "../components/SearchBar";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const StockAlerts = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newThreshold, setNewThreshold] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const { data: alerts = [], isLoading, isFetching } = useQuery<(StockAlert & { severity: 'warning' | 'critical' })[]>({
    queryKey: ['admin-alertas'],
    queryFn: async () => {
      const data = await inventoryAPI.getAlerts();
      setLastRefreshed(new Date());
      return data.map(d => ({
        ...d,
        severity: (d.stockActual <= d.stockMinimo / 2 ? 'critical' : 'warning') as 'critical' | 'warning',
      }));
    },
    staleTime: 0,
    gcTime: 60000,
    refetchInterval: 30000,      // Revalidar cada 30 segundos automáticamente
    refetchOnWindowFocus: true,  // Revalidar al volver a la pestaña del navegador
  });

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-alertas'] });
  };

  const handleUpdateThreshold = async (varianteId: number) => {
    const val = parseInt(newThreshold);
    if (isNaN(val) || val < 1) { toast.error('Introduce un umbral válido'); return; }

    const alert = alerts.find(a => a.varianteId === varianteId);
    if (!alert) return;

    try {
      await inventoryAPI.update(varianteId, {
        stockActual: alert.stockActual,
        stockMinimo: val,
        motivo: 'Actualización de umbral mínimo desde alertas',
      });

      queryClient.invalidateQueries({ queryKey: ['admin-alertas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventario'] });
      setEditingId(null);
      setNewThreshold('');
      toast.success('Umbral actualizado');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar umbral');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const q = searchQuery.toLowerCase();
    return (
      alert.productoNombre.toLowerCase().includes(q) ||
      (alert.sku || "").toLowerCase().includes(q) ||
      alert.severity.includes(q) ||
      (q === 'critico' || q === 'crítico' ? alert.severity === 'critical' : false) ||
      (q === 'bajo' ? alert.severity === 'warning' : false)
    );
  });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Alertas de Stock</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Productos con inventario por debajo del umbral mínimo</p>
        </div>

        {/* Refresco manual + indicador de última actualización */}
        <div className="flex flex-col items-start md:items-end gap-1">
          <button
            onClick={handleManualRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 bg-[#3A4A3F] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#2C3830] dark:hover:bg-[#4A5C4F] transition-all duration-300 shadow-sm hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Actualizando...' : 'Refrescar'}
          </button>
          <p className="text-[9px] uppercase tracking-widest font-bold text-[#2B2B2B]/30 dark:text-white/20">
            Última act.: {formatTime(lastRefreshed)} · Auto cada 30s
          </p>
        </div>
      </div>

      {!isLoading && alerts.length > 0 && (
        <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-4">
          <SearchBar
            placeholder="Buscar por producto, SKU o nivel de alerta..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-[#2B2B2B]/60 dark:text-[#EDEDED]/60">
          <Loader2 className="animate-spin" size={18} />
          <span>Cargando alertas...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-[#3A4A3F] mb-4" />
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40">No hay alertas de stock activas. ¡Todo en orden!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAlerts.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-12 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/30 font-bold">
                No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : filteredAlerts.map(alert => (

            <div
              key={alert.varianteId}
              className={`bg-white dark:bg-[var(--bg-surface)] border p-6 space-y-4 ${
                alert.severity === 'critical' ? 'border-red-400/50' : 'border-amber-400/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {alert.severity === 'critical' ? (
                    <AlertTriangle size={20} className="text-red-500 shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="text-amber-500 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111] dark:text-white">
                      {alert.productoNombre} — {alert.tamanoMl}ml
                    </h3>
                    <p className="text-[9px] text-[#2B2B2B]/40 dark:text-white/30 mt-0.5">SKU: {alert.sku}</p>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${
                      alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {alert.severity === 'critical' ? 'Stock Crítico' : 'Stock Bajo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#EDEDED] dark:bg-[#111111] p-3 md:p-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 mb-1">Stock Actual</p>
                  <p className={`text-xl md:text-2xl font-light ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                    {alert.stockActual}
                  </p>

                </div>
                <div className="bg-[#EDEDED] dark:bg-[#111111] p-3 md:p-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 mb-1">Umbral Mínimo</p>
                  <p className="text-xl md:text-2xl font-light text-[#111111] dark:text-white">{alert.stockMinimo}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-2 bg-[#EDEDED] dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min((alert.stockActual / alert.stockMinimo) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 mt-1">
                  {Math.round((alert.stockActual / alert.stockMinimo) * 100)}% del umbral
                </p>
              </div>

              {/* Edit Threshold */}
              {editingId === alert.varianteId ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newThreshold}
                    onChange={e => setNewThreshold(e.target.value)}
                    placeholder="Nuevo umbral"
                    className="w-full sm:flex-1 border border-[#EDEDED] dark:border-white/10 dark:bg-[#111111] dark:text-white px-3 py-2 text-sm outline-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateThreshold(alert.varianteId)} className="flex-1 sm:flex-none bg-[#3A4A3F] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#2C3830] dark:hover:bg-[#4A5C4F] transition-all duration-300 shadow-sm hover:shadow-lg">Guardar</button>
                    <button onClick={() => { setEditingId(null); setNewThreshold(''); }} className="flex-1 sm:flex-none border border-[#EDEDED] dark:border-white/10 dark:text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold">Cancelar</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingId(alert.varianteId); setNewThreshold(String(alert.stockMinimo)); }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white transition-colors"
                >
                  <Settings size={12} /> Configurar Umbral
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
