import { useState, useEffect } from "react";
import { shippingAPI, Shipment } from "../../../core/api/api";
import { Truck, Package, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Preparando': { icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  'En tránsito': { icon: Truck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'Entregado': { icon: CheckCircle, color: 'text-[#3A4A3F]', bg: 'bg-[#3A4A3F]/10' },
  'Devuelto': { icon: RotateCcw, color: 'text-red-400', bg: 'bg-red-400/10' },
};

export const Shipping = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: Shipment['status'] } | null>(null);

  useEffect(() => { shippingAPI.getAll().then(d => { setShipments(d); setIsLoading(false); }); }, []);

  const handleUpdateStatus = async () => {
    if (!confirmAction) return;
    await shippingAPI.updateStatus(confirmAction.id, confirmAction.status);
    setShipments(prev => prev.map(s => s.id === confirmAction.id ? { ...s, status: confirmAction.status } : s));
    toast.success(`Envío actualizado a: ${confirmAction.status}`);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Envíos</h1>
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Gestión de despachos y seguimiento de órdenes</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-sm text-[#2B2B2B]/40 dark:text-white/30">Cargando envíos...</p>
        ) : shipments.map(s => {
          const config = statusConfig[s.status] || statusConfig['Preparando'];
          const Icon = config.icon;
          return (
            <div key={s.id} className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center ${config.bg}`}>
                    <Icon size={20} className={config.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-[#111111] dark:text-white">{s.id}</span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 ${config.color} ${config.bg}`}>{s.status}</span>
                    </div>
                    <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50">Pedido: {s.orderId} • Cliente: {s.client}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Tracking</p>
                    <p className="font-bold text-[#3A4A3F]">{s.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Transportista</p>
                    <p className="text-[#111111] dark:text-white/80">{s.carrier}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Entrega Est.</p>
                    <p className="text-[#111111] dark:text-white/80">{s.estimatedDelivery}</p>
                  </div>
                </div>

                <select value={s.status}
                  onChange={e => setConfirmAction({ id: s.id, status: e.target.value as Shipment['status'] })}
                  className="bg-transparent dark:bg-[#1A1A1A] border border-[#EDEDED] dark:border-white/10 text-[#111111] dark:text-white px-3 py-2 text-[10px] uppercase tracking-widest font-bold outline-none">
                  <option value="Preparando">Preparando</option>
                  <option value="En tránsito">En tránsito</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Devuelto">Devuelto</option>
                </select>
              </div>

              {/* Timeline */}
              <div className="mt-6 pt-4 border-t border-[#EDEDED] dark:border-white/8">
                <div className="flex gap-0">
                  {['Preparando', 'En tránsito', 'Entregado'].map((step, i) => {
                    const steps = ['Preparando', 'En tránsito', 'Entregado'];
                    const currentIdx = steps.indexOf(s.status);
                    const isCompleted = i <= currentIdx;
                    return (
                      <div key={step} className="flex-1 flex items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${isCompleted ? 'bg-[#3A4A3F]' : 'bg-[#EDEDED] dark:bg-white/15'}`} />
                        {i < 2 && <div className={`h-0.5 flex-1 ${i < currentIdx ? 'bg-[#3A4A3F]' : 'bg-[#EDEDED] dark:bg-white/10'}`} />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex mt-2">
                  {['Preparando', 'En tránsito', 'Entregado'].map(step => (
                    <span key={step} className="flex-1 text-[9px] text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest">{step}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Actualizar Estado de Envío"
        description={`¿Confirmas cambiar el estado del envío ${confirmAction?.id} a "${confirmAction?.status}"?`}
        onConfirm={handleUpdateStatus}
      />
    </div>
  );
};
