import { useState, useEffect } from "react";
import { inventoryAPI, StockAlert } from "../../../core/api/api";
import { AlertTriangle, AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";

export const StockAlerts = () => {
  const [alerts, setAlerts] = useState<(StockAlert & { severity: 'warning' | 'critical' })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newThreshold, setNewThreshold] = useState('');

  useEffect(() => {
    inventoryAPI.getAlerts()
      .then((data) => {
        const formatted = data.map(d => ({
          ...d,
          severity: (d.stockActual <= d.stockMinimo / 2 ? 'critical' : 'warning') as 'critical' | 'warning',
        }));
        setAlerts(formatted);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        toast.error('Error al cargar alertas de stock');
      });
  }, []);

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

      setAlerts(prev => prev.map(a =>
        a.varianteId === varianteId
          ? { ...a, stockMinimo: val, severity: (a.stockActual <= val / 2 ? 'critical' : 'warning') as 'critical' | 'warning' }
          : a
      ));
      setEditingId(null);
      setNewThreshold('');
      toast.success('Umbral actualizado');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar umbral');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Alertas de Stock</h1>
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Productos con inventario por debajo del umbral mínimo</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#2B2B2B]/40 dark:text-white/30">Cargando alertas...</p>
      ) : alerts.length === 0 ? (
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-[#3A4A3F] mb-4" />
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40">No hay alertas de stock activas. ¡Todo en orden!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map(alert => (
            <div key={alert.varianteId} className={`bg-white dark:bg-[#161616] border p-6 space-y-4 ${alert.severity === 'critical' ? 'border-red-400/50' : 'border-amber-400/50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {alert.severity === 'critical' ? (
                    <AlertTriangle size={20} className="text-red-500" />
                  ) : (
                    <AlertCircle size={20} className="text-amber-500" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#111111] dark:text-white">{alert.productoNombre} — {alert.tamanoMl}ml</h3>
                    <p className="text-[9px] text-[#2B2B2B]/40 dark:text-white/30 mt-0.5">SKU: {alert.sku}</p>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                      {alert.severity === 'critical' ? 'Stock Crítico' : 'Stock Bajo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#EDEDED] dark:bg-[#111111] p-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 mb-1">Stock Actual</p>
                  <p className={`text-2xl font-light ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>{alert.stockActual}</p>
                </div>
                <div className="bg-[#EDEDED] dark:bg-[#111111] p-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 mb-1">Umbral Mínimo</p>
                  <p className="text-2xl font-light text-[#111111] dark:text-white">{alert.stockMinimo}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-2 bg-[#EDEDED] dark:bg-white/10 overflow-hidden">
                  <div className={`h-full transition-all ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min((alert.stockActual / alert.stockMinimo) * 100, 100)}%` }} />
                </div>
                <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 mt-1">{Math.round((alert.stockActual / alert.stockMinimo) * 100)}% del umbral</p>
              </div>

              {/* Edit Threshold */}
              {editingId === alert.varianteId ? (
                <div className="flex gap-2">
                  <input type="number" min="1" value={newThreshold} onChange={e => setNewThreshold(e.target.value)} placeholder="Nuevo umbral"
                    className="flex-1 border border-[#EDEDED] dark:border-white/10 dark:bg-[#111111] dark:text-white px-3 py-2 text-sm outline-none" />
                  <button onClick={() => handleUpdateThreshold(alert.varianteId)} className="bg-[#111111] dark:bg-white dark:text-[#111111] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold">Guardar</button>
                  <button onClick={() => { setEditingId(null); setNewThreshold(''); }} className="border border-[#EDEDED] dark:border-white/10 dark:text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => { setEditingId(alert.varianteId); setNewThreshold(String(alert.stockMinimo)); }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white transition-colors">
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
