import { useState, useEffect } from "react";
import { paymentsAPI, Payment, formatPrice } from "../../../core/api/api";
import { toast } from "sonner";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { AdminPaginator } from "../../../shared/components/ui/AdminPaginator";
import { EmptyStateRow } from "../../../shared/components/ui/EmptyState";
import { Search, X, CreditCard, Filter } from "lucide-react";

const PAGE_SIZE = 15;

const statusColors: Record<string, string> = {
  'Pendiente': 'text-amber-500 bg-amber-500/10',
  'Confirmado': 'text-[#3A4A3F] bg-[#3A4A3F]/10',
  'Rechazado': 'text-red-400 bg-red-400/10',
};

const tableWrap = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8";
const thCls = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 px-6 py-4";

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: Payment['status'] } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    paymentsAPI.getAll().then(d => { setPayments(d); setIsLoading(false); });
  }, []);

  const handleUpdateStatus = async () => {
    if (!confirmAction) return;
    await paymentsAPI.updateStatus(confirmAction.id, confirmAction.status);
    setPayments(prev => prev.map(p => p.id === confirmAction.id ? { ...p, status: confirmAction.status } : p));
    toast.success(`Pago actualizado a: ${confirmAction.status}`);
    setConfirmAction(null);
  };

  const filtered = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.id.toString().toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const handleFilter = (val: string) => { setFilterStatus(val); setCurrentPage(1); };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Pagos</h1>
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Confirmación y gestión de estados de pago</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar por ID de pago o cliente..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white/30 transition-all"
            />
            {searchQuery && (
              <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 hover:text-[#111111] dark:text-white/40 dark:hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40" size={14} />
            <select
              value={filterStatus}
              onChange={(e) => handleFilter(e.target.value)}
              className="pl-8 pr-8 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white appearance-none cursor-pointer focus:border-[#111111] dark:focus:border-white/30 transition-all"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      <div className={tableWrap}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED]/50 dark:bg-white/5">
                {['ID Pago', 'Pedido', 'Cliente', 'Monto', 'Método', 'Estado', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40 dark:text-white/30">Cargando...</td></tr>
              ) : paginated.length > 0 ? (
                paginated.map(p => (
                  <tr key={p.id} className="border-b border-[#EDEDED] dark:border-white/8 last:border-0 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#111111] dark:text-white">{p.id}</td>
                    <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{p.orderId}</td>
                    <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{p.client}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#111111] dark:text-white">{formatPrice(p.amount)} COP</td>
                    <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40">{p.method}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 ${statusColors[p.status] || ''}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40">{p.date}</td>
                    <td className="px-6 py-4">
                      <select value={p.status}
                        onChange={e => setConfirmAction({ id: p.id, status: e.target.value as Payment['status'] })}
                        className="bg-transparent dark:bg-[#1A1A1A] border border-[#EDEDED] dark:border-white/10 text-[#111111] dark:text-white px-2 py-1 text-[10px] uppercase tracking-widest font-bold outline-none">
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyStateRow
                  icon={CreditCard}
                  title="Sin pagos registrados"
                  description={searchQuery || filterStatus ? "No hay resultados para tu búsqueda" : "Los pagos de los clientes aparecerán aquí una vez se realicen transacciones"}
                  colSpan={8}
                />
              )}
            </tbody>
          </table>
        </div>
        <AdminPaginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
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
