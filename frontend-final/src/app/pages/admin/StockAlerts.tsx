import { useState, useEffect } from "react";
import { stockAlertsAPI, StockAlert } from "../../services/api";
import { AlertTriangle, AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";

export const StockAlerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newThreshold, setNewThreshold] = useState('');

  useEffect(() => { stockAlertsAPI.getAlerts().then(d => { setAlerts(d); setIsLoading(false); }); }, []);

  const handleUpdateThreshold = async (productId: string) => {
    const val = parseInt(newThreshold);
    if (isNaN(val) || val < 1) { toast.error('Introduce un umbral válido'); return; }
    await stockAlertsAPI.updateThreshold(productId, val);
    setAlerts(prev => prev.map(a => a.productId === productId ? { ...a, threshold: val, severity: a.currentStock < val ? (a.currentStock <= val / 2 ? 'critical' : 'warning') : 'warning' } : a));
    setEditingId(null);
    setNewThreshold('');
    toast.success('Umbral actualizado');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] tracking-tight">Alertas de Stock</h1>
        <p className="text-sm text-[#2B2B2B]/60 mt-2">Productos con inventario por debajo del umbral mínimo</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-[#2B2B2B]/40">Cargando alertas...</p>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-[#EDEDED] p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-[#3A4A3F] mb-4" />
          <p className="text-sm text-[#2B2B2B]/60">No hay alertas de stock activas. ¡Todo en orden!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map(alert => (
            <div key={alert.productId} className={`bg-white border p-6 space-y-4 ${alert.severity === 'critical' ? 'border-red-300' : 'border-amber-300'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {alert.severity === 'critical' ? (
                    <AlertTriangle size={20} className="text-red-500" />
                  ) : (
                    <AlertCircle size={20} className="text-amber-500" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest">{alert.productName}</h3>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                      {alert.severity === 'critical' ? 'Stock Crítico' : 'Stock Bajo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#EDEDED] p-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 mb-1">Stock Actual</p>
                  <p className={`text-2xl font-light ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>{alert.currentStock}</p>
                </div>
                <div className="bg-[#EDEDED] p-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 mb-1">Umbral Mínimo</p>
                  <p className="text-2xl font-light text-[#111111]">{alert.threshold}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-2 bg-[#EDEDED] overflow-hidden">
                  <div className={`h-full transition-all ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min((alert.currentStock / alert.threshold) * 100, 100)}%` }} />
                </div>
                <p className="text-[10px] text-[#2B2B2B]/40 mt-1">{Math.round((alert.currentStock / alert.threshold) * 100)}% del umbral</p>
              </div>

              {/* Edit Threshold */}
              {editingId === alert.productId ? (
                <div className="flex gap-2">
                  <input type="number" min="1" value={newThreshold} onChange={e => setNewThreshold(e.target.value)} placeholder="Nuevo umbral"
                    className="flex-1 border border-[#EDEDED] px-3 py-2 text-sm outline-none" />
                  <button onClick={() => handleUpdateThreshold(alert.productId)} className="bg-[#111111] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold">Guardar</button>
                  <button onClick={() => { setEditingId(null); setNewThreshold(''); }} className="border border-[#EDEDED] px-4 py-2 text-[10px] uppercase tracking-widest font-bold">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => { setEditingId(alert.productId); setNewThreshold(String(alert.threshold)); }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 hover:text-[#111111] transition-colors">
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
