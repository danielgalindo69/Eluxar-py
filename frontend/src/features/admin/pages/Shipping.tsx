import { useState, useEffect } from "react";
import { shippingAPI, Shipment } from "../../../core/api/api";
import { Truck, Package, CheckCircle, RotateCcw, Search, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { AdminPaginator } from "../../../shared/components/ui/AdminPaginator";
import { EmptyStateBlock } from "../../../shared/components/ui/EmptyState";

const PAGE_SIZE = 15;

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Preparando': { icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  'En tránsito': { icon: Truck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  'Entregado': { icon: CheckCircle, color: 'text-[#3A4A3F] dark:text-[#C8A97E]', bg: 'bg-[#3A4A3F]/10 dark:bg-[#C8A97E]/10' },
  'Devuelto': { icon: RotateCcw, color: 'text-red-400', bg: 'bg-red-400/10' },
};

export const Shipping = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: Shipment['status'] } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    shippingAPI.getAll().then(d => { setShipments(d); setIsLoading(false); });
  }, []);

  const handleUpdateStatus = async () => {
    if (!confirmAction) return;
    await shippingAPI.updateStatus(confirmAction.id, confirmAction.status);
    setShipments(prev => prev.map(s => s.id === confirmAction.id ? { ...s, status: confirmAction.status } : s));
    toast.success(`Envío actualizado a: ${confirmAction.status}`);
    setConfirmAction(null);
  };

  const filtered = shipments.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.id.toLowerCase().includes(q) ||
      s.client.toLowerCase().includes(q) ||
      s.trackingNumber?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const handleFilter = (val: string) => { setFilterStatus(val); setCurrentPage(1); };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Envíos</h1>
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Gestión de despachos y seguimiento de órdenes</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 group-focus-within:text-[#3A4A3F] dark:group-focus-within:text-[#C8A97E] transition-colors" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar por ID, cliente o número de tracking..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white focus:border-[#3A4A3F] dark:focus:border-[#C8A97E] transition-all"
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
              className="pl-8 pr-8 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white appearance-none cursor-pointer focus:border-[#3A4A3F] dark:focus:border-[#C8A97E] transition-all"
            >
              <option className="bg-white dark:bg-[#161616] text-[#111111] dark:text-white" value="">Todos los estados</option>
              <option className="bg-white dark:bg-[#161616] text-[#111111] dark:text-white" value="Preparando">Preparando</option>
              <option className="bg-white dark:bg-[#161616] text-[#111111] dark:text-white" value="En tránsito">En tránsito</option>
              <option className="bg-white dark:bg-[#161616] text-[#111111] dark:text-white" value="Entregado">Entregado</option>
              <option className="bg-white dark:bg-[#161616] text-[#111111] dark:text-white" value="Devuelto">Devuelto</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-8 text-center">
          <p className="text-sm text-[#2B2B2B]/40 dark:text-white/30">Cargando envíos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8">
          <EmptyStateBlock
            icon={Truck}
            title={searchQuery || filterStatus ? "Sin resultados" : "Sin envíos registrados"}
            description={
              searchQuery || filterStatus
                ? "Intenta con otros términos de búsqueda o cambia el filtro"
                : "Los envíos aparecerán aquí cuando se despachen los pedidos confirmados"
            }
          />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {paginated.map(s => {
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
                        <p className="font-bold text-[#3A4A3F] dark:text-[#C8A97E]">{s.trackingNumber}</p>
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
                            <div className={`w-3 h-3 rounded-full shrink-0 ${isCompleted ? 'bg-[#3A4A3F] dark:bg-[#C8A97E]' : 'bg-[#EDEDED] dark:bg-white/15'}`} />
                            {i < 2 && <div className={`h-0.5 flex-1 ${i < currentIdx ? 'bg-[#3A4A3F] dark:bg-[#C8A97E]' : 'bg-[#EDEDED] dark:bg-white/10'}`} />}
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

          {/* Pagination as standalone block */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8">
              <AdminPaginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
              />
            </div>
          )}
        </>
      )}

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
