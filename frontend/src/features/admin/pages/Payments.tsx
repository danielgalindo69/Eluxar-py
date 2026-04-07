import { useState, useEffect } from "react";
import { paymentsAPI, Payment } from "../../../core/api/api";
import { toast } from "sonner";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";

const statusColors: Record<string, string> = {
  'Pendiente': 'text-amber-600 bg-amber-50',
  'Confirmado': 'text-[#3A4A3F] bg-green-50',
  'Rechazado': 'text-red-500 bg-red-50',
};

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: Payment['status'] } | null>(null);

  useEffect(() => { paymentsAPI.getAll().then(d => { setPayments(d); setIsLoading(false); }); }, []);

  const handleUpdateStatus = async () => {
    if (!confirmAction) return;
    await paymentsAPI.updateStatus(confirmAction.id, confirmAction.status);
    setPayments(prev => prev.map(p => p.id === confirmAction.id ? { ...p, status: confirmAction.status } : p));
    toast.success(`Pago actualizado a: ${confirmAction.status}`);
    setConfirmAction(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] tracking-tight">Pagos</h1>
        <p className="text-sm text-[#2B2B2B]/60 mt-2">Confirmación y gestión de estados de pago</p>
      </div>

      <div className="bg-white border border-[#EDEDED]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED]">
                {['ID Pago', 'Pedido', 'Cliente', 'Monto', 'Método', 'Estado', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40">Cargando...</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} className="border-b border-[#EDEDED] last:border-0 hover:bg-[#EDEDED]/30">
                  <td className="px-6 py-4 text-sm font-bold">{p.id}</td>
                  <td className="px-6 py-4 text-sm">{p.orderId}</td>
                  <td className="px-6 py-4 text-sm">{p.client}</td>
                  <td className="px-6 py-4 text-sm font-bold">{p.amount.toFixed(2)}€</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60">{p.method}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 ${statusColors[p.status] || ''}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60">{p.date}</td>
                  <td className="px-6 py-4">
                    <select value={p.status}
                      onChange={e => setConfirmAction({ id: p.id, status: e.target.value as Payment['status'] })}
                      className="bg-transparent border border-[#EDEDED] px-2 py-1 text-[10px] uppercase tracking-widest font-bold outline-none">
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Actualizar Estado de Pago"
        description={`¿Confirmas cambiar el estado del pago ${confirmAction?.id} a "${confirmAction?.status}"?`}
        onConfirm={handleUpdateStatus}
      />
    </div>
  );
};
