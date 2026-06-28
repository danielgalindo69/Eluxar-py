import { Download, Search, X, ShoppingBag, Filter, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersAPI } from "../../../core/api/api";
import { toast } from "sonner";
import { AdminPaginator } from "../../../shared/components/ui/AdminPaginator";
import { EmptyStateRow } from "../../../shared/components/ui/EmptyState";
import { format, subDays, subMonths } from "date-fns";



const PAGE_SIZE = 15;

const cardClass = "bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-6";
const tableWrapClass = "bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8";
const thClass = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3";
const tdClass = "px-4 py-2 text-sm text-[#2B2B2B] dark:text-white/80";
const tdMutedClass = "px-4 py-2 text-sm text-[#2B2B2B]/60 dark:text-white/40";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "CANCELADO", label: "Cancelado" },
];

export const Orders = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [datePreset, setDatePreset] = useState('all');
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-pedidos'],
    queryFn: async () => {
      const data = await ordersAPI.getAllAdmin();
      return data.map((o: any) => ({
        id: `#${o.id}`,
        rawId: o.id,
        date: new Date(o.creadoEn).toLocaleDateString(),
        createdAt: new Date(o.creadoEn),
        client: o.clienteNombre || 'Cliente Desconocido',
        product: o.items?.length ? o.items.map((i: any) => i.productoNombre).join(', ') : 'N/A',
        quantity: o.items?.length ? o.items.reduce((sum: number, i: any) => sum + (i.cantidad || 0), 0) : 0,
      total: `${o.total} COP`,
      status: o.estado,
      paymentMethod: o.metodoPago || '—',
      direccionEnvio: o.direccionEnvio || '—'
      }));
    },
    staleTime: 0,
    gcTime: 60000,
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      toast.success("Estado actualizado");
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos'] });
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const filtered = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "" || o.status === filterStatus;
    let matchesDate = true;
    if (filterDesde || filterHasta) {
      const d = o.createdAt;
      if (filterDesde && d < new Date(filterDesde + 'T00:00:00')) matchesDate = false;
      if (filterHasta && d > new Date(filterHasta + 'T23:59:59')) matchesDate = false;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const handleFilter = (val: string) => { setFilterStatus(val); setCurrentPage(1); };
  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    setCurrentPage(1);
    if (preset === 'all') {
      setFilterDesde('');
      setFilterHasta('');
    } else if (preset === 'today') {
      const today = format(new Date(), 'yyyy-MM-dd');
      setFilterDesde(today);
      setFilterHasta(today);
    } else if (preset === 'week') {
      const today = new Date();
      setFilterHasta(format(today, 'yyyy-MM-dd'));
      setFilterDesde(format(subDays(today, 7), 'yyyy-MM-dd'));
    } else if (preset === 'month') {
      const today = new Date();
      setFilterHasta(format(today, 'yyyy-MM-dd'));
      setFilterDesde(format(subMonths(today, 1), 'yyyy-MM-dd'));
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const ids = filtered.map(o => o.rawId);
      await ordersAPI.exportarExcel(ids);
      toast.success('Reporte Excel descargado correctamente');
    } catch {
      toast.error('Error al generar el reporte Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Gestión de Pedidos</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Administra y monitorea todos los pedidos</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-[#3A4A3F] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#2C3830] dark:hover:bg-[#4A5C4F] transition-all duration-300 shadow-sm hover:shadow-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed w-full md:w-auto justify-center"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isExporting ? 'Exportando...' : 'Exportar'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={cardClass}>
          <div className="text-2xl font-light text-[#111111] dark:text-white mb-1">{orders.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Total Pedidos</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-[#3A4A3F] mb-1">{orders.filter(o => o.status === 'ENTREGADO').length}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Entregados</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-blue-500 mb-1">{orders.filter(o => o.status === 'ENVIADO').length}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Enviados</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-[#2B2B2B] dark:text-white/80 mb-1">{orders.filter(o => o.status === 'PENDIENTE' || o.status === 'CONFIRMADO').length}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Pendientes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 group-focus-within:text-[#3A4A3F] dark:group-focus-within:text-[var(--color-gold)] transition-colors" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar por ID o nombre de cliente..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white focus:border-[#3A4A3F] dark:focus:border-[var(--color-gold)] transition-all"
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
              className="pl-8 pr-8 py-3 bg-transparent dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white appearance-none cursor-pointer focus:border-[#3A4A3F] dark:focus:border-[var(--color-gold)] transition-all dark:[color-scheme:dark]"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'today', label: 'Hoy' },
          { value: 'week', label: 'Última semana' },
          { value: 'month', label: 'Último mes' },
          { value: 'custom', label: 'Personalizar' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => handleDatePreset(opt.value)}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
              datePreset === opt.value
                ? 'bg-[#3A4A3F] text-white shadow-sm'
                : 'border border-[#EDEDED] dark:border-white/15 text-[#2B2B2B]/70 dark:text-white/70 hover:border-[#3A4A3F] dark:hover:border-white/30'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {datePreset === 'custom' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-4 sm:pt-0 border-t sm:border-l border-[#EDEDED] dark:border-white/10 sm:pl-3">
            <input
              type="date"
              value={filterDesde}
              onChange={(e) => { setFilterDesde(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border border-[#EDEDED] dark:border-white/10 px-3 py-2 text-sm text-[#111111] dark:text-white outline-none [&::-webkit-calendar-picker-indicator]:dark:invert"
            />
            <span className="text-[#2B2B2B]/30 dark:text-white/30">—</span>
            <input
              type="date"
              value={filterHasta}
              onChange={(e) => { setFilterHasta(e.target.value); setCurrentPage(1); }}
              className="bg-transparent border border-[#EDEDED] dark:border-white/10 px-3 py-2 text-sm text-[#111111] dark:text-white outline-none [&::-webkit-calendar-picker-indicator]:dark:invert"
            />
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className={tableWrapClass + " hidden lg:block"}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED] dark:bg-white/5">
                <th className={thClass}>ID</th>
                <th className={thClass}>Fecha</th>
                <th className={thClass}>Cliente</th>
                <th className={thClass}>Producto</th>
                <th className={thClass}>Cantidad</th>
                <th className={thClass}>Total</th>
                <th className={thClass}>Método de Pago</th>
                <th className={thClass}>Dirección</th>
                <th className={thClass}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-8"><div className="flex items-center justify-center gap-2 text-[#2B2B2B]/60 dark:text-[#EDEDED]/60"><Loader2 className="animate-spin" size={18} /><span>Cargando pedidos...</span></div></td></tr>
              ) : paginated.length > 0 ? (
                paginated.map((order, index) => (
                  <tr key={index} className="border-b border-[#EDEDED] dark:border-white/8 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                    <td className={tdClass}>{order.id}</td>
                    <td className={tdMutedClass}>{order.date}</td>
                    <td className={tdClass}>{order.client}</td>
                    <td className={tdClass}>{order.product}</td>
                    <td className={tdClass}>{order.quantity}</td>
                    <td className="px-4 py-2 text-sm text-[#2B2B2B] dark:text-white font-bold">{order.total}</td>
                    <td className={tdClass}>
                      <span className="text-[10px] uppercase tracking-widest font-bold">{order.paymentMethod}</span>
                    </td>
                    <td className={tdMutedClass + " whitespace-normal max-w-[200px]"}>{order.direccionEnvio}</td>
                    <td className="px-4 py-2 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          order.status === "ENTREGADO" ? "bg-green-500" :
                          order.status === "ENVIADO" ? "bg-amber-500" :
                          order.status === "CANCELADO" ? "bg-red-500" : "bg-blue-400"
                        }`} />
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.rawId, e.target.value)}
                          className={`bg-transparent text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer dark:[color-scheme:dark] ${
                            order.status === "ENTREGADO" ? "text-[#3A4A3F]" :
                            order.status === "ENVIADO" ? "text-amber-500" :
                            order.status === "CANCELADO" ? "text-red-400" :
                            "text-[#2B2B2B]/60 dark:text-white/60"
                          }`}
                        >
                          <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="PENDIENTE">Pendiente</option>
                          <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="CONFIRMADO">Confirmado</option>
                          <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="EN_PROCESO">En Proceso</option>
                          <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="ENVIADO">Enviado</option>
                          <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="ENTREGADO">Entregado</option>
                          <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="CANCELADO">Cancelado</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyStateRow
                  icon={ShoppingBag}
                  title="No hay pedidos"
                  description={searchQuery || filterStatus ? "Intenta con otros filtros" : "Aún no se han registrado pedidos"}
                  colSpan={9}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="block lg:hidden space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[#2B2B2B]/60 dark:text-[#EDEDED]/60">
            <Loader2 className="animate-spin" size={18} />
            <span>Cargando pedidos...</span>
          </div>
        ) : paginated.length > 0 ? (
          paginated.map((order, index) => (
            <div
              key={index}
              className="border border-[#EDEDED] dark:border-white/10 rounded-sm p-4 space-y-3 bg-white dark:bg-[var(--bg-surface)]"
            >
              {/* Header: ID + status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#111111] dark:text-white">{order.id}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === "ENTREGADO" ? "bg-green-500" :
                    order.status === "ENVIADO" ? "bg-amber-500" :
                    order.status === "CANCELADO" ? "bg-red-500" : "bg-blue-400"
                  }`} />
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.rawId, e.target.value)}
                    className={`bg-transparent text-[13px] font-medium outline-none cursor-pointer dark:[color-scheme:dark] ${
                      order.status === "ENTREGADO" ? "text-[#3A4A3F]" :
                      order.status === "ENVIADO" ? "text-amber-500" :
                      order.status === "CANCELADO" ? "text-red-400" :
                      "text-[#2B2B2B]/60 dark:text-white/60"
                    }`}
                  >
                    <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="PENDIENTE">Pendiente</option>
                    <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="CONFIRMADO">Confirmado</option>
                    <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="EN_PROCESO">En Proceso</option>
                    <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="ENVIADO">Enviado</option>
                    <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="ENTREGADO">Entregado</option>
                    <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>
              <hr className="border-[#EDEDED] dark:border-white/10" />
              {/* Body: labeled rows */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Cliente</span>
                  <span className="text-sm text-[#2B2B2B] dark:text-white/80">{order.client}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Fecha</span>
                  <span className="text-sm text-[#2B2B2B] dark:text-white/80">{order.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Producto</span>
                  <span className="text-sm text-[#2B2B2B] dark:text-white/80 text-right max-w-[60%]">{order.product}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Cantidad</span>
                  <span className="text-sm text-[#2B2B2B] dark:text-white/80">{order.quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Total</span>
                  <span className="text-sm font-bold text-[#2B2B2B] dark:text-white">{order.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Método de pago</span>
                  <span className="text-sm text-[#2B2B2B] dark:text-white/80">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60 shrink-0">Dirección</span>
                  <span className="text-sm text-[#2B2B2B] dark:text-white/80 text-right max-w-[65%]">{order.direccionEnvio}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-[#EDEDED] dark:bg-white/5 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={28} className="text-[#2B2B2B]/20 dark:text-white/20" strokeWidth={1.2} />
            </div>
            <p className="text-sm font-light text-[#111111] dark:text-white mb-2">No hay pedidos</p>
            <p className="text-[13px] text-[#2B2B2B]/50 dark:text-white/40">
              {searchQuery || filterStatus ? "Intenta con otros filtros" : "Aún no se han registrado pedidos"}
            </p>
          </div>
        )}
      </div>

      <AdminPaginator
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
};
