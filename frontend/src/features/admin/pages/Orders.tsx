import { Eye, Download, Search, X, ShoppingBag, Filter, Loader2, MapPin, Package, CreditCard, Tag, Hash, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersAPI } from "../../../core/api/api";
import { toast } from "sonner";
import { AdminPaginator } from "../../../shared/components/ui/AdminPaginator";
import { EmptyStateRow } from "../../../shared/components/ui/EmptyState";
import { format, subDays, subMonths } from "date-fns";
import { AnimatePresence, motion } from "motion/react";

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

// ─── Tipos ────────────────────────────────────────────────────
interface MappedOrder {
  id: string;
  rawId: number;
  date: string;
  createdAt: Date;
  client: string;
  product: string;
  quantity: number;
  total: string;
  rawTotal: number;
  status: string;
  paymentMethod: string;
  // Campos de detalle
  direccionEnvio: string;
  trackingNumber: string;
  paymentId: string;
  preferenceId: string;
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  cupon: string;
  items: {
    id: number;
    productoNombre: string;
    tamanoMl: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    imagenUrl?: string;
  }[];
}

// ─── Modal de Detalle de Pedido ───────────────────────────────
const OrderDetailModal = ({
  order,
  onClose,
}: {
  order: MappedOrder;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!order.direccionEnvio) return;
    navigator.clipboard.writeText(order.direccionEnvio).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatCOP = (value: number) =>
    new Intl.NumberFormat("es-CO", { minimumFractionDigits: 0 }).format(value);

  const statusColor =
    order.status === "ENTREGADO"
      ? "text-[#3A4A3F]"
      : order.status === "ENVIADO"
      ? "text-amber-500"
      : order.status === "CANCELADO"
      ? "text-red-400"
      : "text-blue-400";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="bg-white dark:bg-[var(--bg-surface)] w-full max-w-2xl max-h-[92vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[var(--bg-surface)] border-b border-[#EDEDED] dark:border-white/8 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">
              Pedido
            </p>
            <h2 className="text-xl font-light text-[#111111] dark:text-white tracking-tight">
              {order.id}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] uppercase tracking-widest font-bold ${statusColor}`}>
              {order.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors"
            >
              <X size={18} className="text-[#2B2B2B]/60 dark:text-white/40" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* ── Información del cliente ── */}
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 flex items-center gap-2">
              <Package size={12} /> Cliente
            </h3>
            <div className="bg-[#EDEDED]/50 dark:bg-white/5 p-4 space-y-1">
              <p className="text-sm font-bold text-[#111111] dark:text-white">{order.client}</p>
              <p className="text-xs text-[#2B2B2B]/50 dark:text-white/40">{order.date}</p>
              {order.paymentMethod && (
                <p className="text-xs text-[#2B2B2B]/50 dark:text-white/40 uppercase tracking-widest font-bold">
                  Método: {order.paymentMethod}
                </p>
              )}
            </div>
          </section>

          {/* ── Dirección de entrega ── */}
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 flex items-center gap-2">
              <MapPin size={12} /> Dirección de Entrega
            </h3>
            {order.direccionEnvio ? (
              <div className="bg-[#EDEDED]/50 dark:bg-white/5 p-4 flex items-start justify-between gap-4">
                <p className="text-sm text-[#111111] dark:text-white leading-relaxed flex-1">
                  {order.direccionEnvio}
                </p>
                <button
                  onClick={copyAddress}
                  title="Copiar dirección"
                  className="shrink-0 p-1.5 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white"
                >
                  {copied ? (
                    <CheckCircle2 size={15} className="text-[#3A4A3F]" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-[#EDEDED]/50 dark:bg-white/5 p-4">
                <p className="text-sm text-[#2B2B2B]/40 dark:text-white/30 italic">
                  Sin dirección registrada
                </p>
              </div>
            )}
          </section>

          {/* ── Productos del pedido ── */}
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 flex items-center gap-2">
              <Tag size={12} /> Productos ({order.items.length})
            </h3>
            <div className="border border-[#EDEDED] dark:border-white/8 divide-y divide-[#EDEDED] dark:divide-white/8">
              {order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    {item.imagenUrl ? (
                      <img
                        src={item.imagenUrl}
                        alt={item.productoNombre}
                        className="w-12 h-12 object-cover shrink-0 bg-[#EDEDED]"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#EDEDED] dark:bg-white/10 shrink-0 flex items-center justify-center">
                        <Package size={16} className="text-[#2B2B2B]/30 dark:text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#111111] dark:text-white truncate">
                        {item.productoNombre}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/30 font-bold">
                        {item.tamanoMl}ml × {item.cantidad} ud
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#111111] dark:text-white">
                        ${formatCOP(item.subtotal)}
                      </p>
                      <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30">
                        ${formatCOP(item.precioUnitario)} c/u
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#2B2B2B]/40 dark:text-white/30 p-4 italic">Sin detalle de productos</p>
              )}
            </div>
          </section>

          {/* ── Resumen financiero ── */}
          <section className="space-y-3">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 flex items-center gap-2">
              <CreditCard size={12} /> Resumen del Pago
            </h3>
            <div className="bg-[#EDEDED]/50 dark:bg-white/5 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#2B2B2B]/60 dark:text-white/40">Subtotal</span>
                <span className="dark:text-white">${formatCOP(order.subtotal)} COP</span>
              </div>
              {order.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#3A4A3F] dark:text-[var(--color-gold)]">
                    Descuento {order.cupon ? `(${order.cupon})` : ''}
                  </span>
                  <span className="text-[#3A4A3F] dark:text-[var(--color-gold)]">
                    − ${formatCOP(order.descuento)} COP
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#2B2B2B]/60 dark:text-white/40">Envío</span>
                <span className="text-[#3A4A3F]">
                  {order.costoEnvio === 0 ? "Gratis" : `$${formatCOP(order.costoEnvio)} COP`}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#EDEDED] dark:border-white/10">
                <span className="text-[#111111] dark:text-white">Total</span>
                <span className="text-[#111111] dark:text-white text-base">
                  ${formatCOP(order.rawTotal)} COP
                </span>
              </div>
            </div>
          </section>

          {/* ── Referencias técnicas ── */}
          {(order.paymentId || order.trackingNumber || order.preferenceId) && (
            <section className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 flex items-center gap-2">
                <Hash size={12} /> Referencias
              </h3>
              <div className="bg-[#EDEDED]/50 dark:bg-white/5 p-4 space-y-2">
                {order.paymentId && (
                  <div className="flex justify-between gap-4 text-xs">
                    <span className="text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest font-bold">
                      Payment ID (MP)
                    </span>
                    <span className="font-mono text-[#111111] dark:text-white truncate max-w-[220px]">
                      {order.paymentId}
                    </span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex justify-between gap-4 text-xs">
                    <span className="text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest font-bold">
                      Tracking
                    </span>
                    <span className="font-mono text-[#111111] dark:text-white truncate max-w-[220px]">
                      {order.trackingNumber}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Componente Principal ─────────────────────────────────────
export const Orders = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [filterDesde, setFilterDesde] = useState("");
  const [filterHasta, setFilterHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MappedOrder | null>(null);

  const { data: orders = [], isLoading } = useQuery<MappedOrder[]>({
    queryKey: ["admin-pedidos"],
    queryFn: async () => {
      const data = await ordersAPI.getAllAdmin();
      return data.map((o: any): MappedOrder => ({
        id: `#${o.id}`,
        rawId: o.id,
        date: new Date(o.creadoEn).toLocaleDateString("es-CO"),
        createdAt: new Date(o.creadoEn),
        client: o.clienteNombre || "Cliente Desconocido",
        product: o.items?.length
          ? o.items.map((i: any) => i.productoNombre).join(", ")
          : "N/A",
        quantity: o.items?.length
          ? o.items.reduce((sum: number, i: any) => sum + (i.cantidad || 0), 0)
          : 0,
        total: `${new Intl.NumberFormat("es-CO").format(o.total)} COP`,
        rawTotal: o.total ?? 0,
        status: o.estado,
        paymentMethod: o.metodoPago || "—",
        // ── Campos de detalle ──
        direccionEnvio: o.direccionEnvio || "",
        trackingNumber: o.trackingNumber || "",
        paymentId: o.paymentId || "",
        preferenceId: o.preferenceId || "",
        subtotal: o.subtotal ?? 0,
        descuento: o.descuento ?? 0,
        costoEnvio: o.costoEnvio ?? 0,
        cupon: o.cuponAplicado?.codigo || o.cupon || "",
        items: (o.items || []).map((i: any) => ({
          id: i.id ?? 0,
          productoNombre: i.productoNombre ?? "N/A",
          tamanoMl: i.tamanoMl ?? 0,
          cantidad: i.cantidad ?? 0,
          precioUnitario: i.precioUnitario ?? 0,
          subtotal: i.subtotal ?? 0,
          imagenUrl: i.imagenUrl,
        })),
      }));
    },
    staleTime: 0,
    gcTime: 60000,
    refetchOnWindowFocus: true,
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await ordersAPI.updateStatus(String(id), newStatus);
      toast.success("Estado actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "" || o.status === filterStatus;
    let matchesDate = true;
    if (filterDesde || filterHasta) {
      const d = o.createdAt;
      if (filterDesde && d < new Date(filterDesde + "T00:00:00"))
        matchesDate = false;
      if (filterHasta && d > new Date(filterHasta + "T23:59:59"))
        matchesDate = false;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handleFilter = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };
  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    setCurrentPage(1);
    if (preset === "all") {
      setFilterDesde("");
      setFilterHasta("");
    } else if (preset === "today") {
      const today = format(new Date(), "yyyy-MM-dd");
      setFilterDesde(today);
      setFilterHasta(today);
    } else if (preset === "week") {
      const today = new Date();
      setFilterHasta(format(today, "yyyy-MM-dd"));
      setFilterDesde(format(subDays(today, 7), "yyyy-MM-dd"));
    } else if (preset === "month") {
      const today = new Date();
      setFilterHasta(format(today, "yyyy-MM-dd"));
      setFilterDesde(format(subMonths(today, 1), "yyyy-MM-dd"));
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const ids = filtered.map((o) => o.rawId);
      await ordersAPI.exportarExcel(ids);
      toast.success("Reporte Excel descargado correctamente");
    } catch {
      toast.error("Error al generar el reporte Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">
              Gestión de Pedidos
            </h1>
            <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">
              Administra y monitorea todos los pedidos
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-[#3A4A3F] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#2C3830] dark:hover:bg-[#4A5C4F] transition-all duration-300 shadow-sm hover:shadow-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isExporting ? "Exportando..." : "Exportar"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={cardClass}>
            <div className="text-2xl font-light text-[#111111] dark:text-white mb-1">
              {orders.length}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">
              Total Pedidos
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-2xl font-light text-[#3A4A3F] mb-1">
              {orders.filter((o) => o.status === "ENTREGADO").length}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">
              Entregados
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-2xl font-light text-blue-500 mb-1">
              {orders.filter((o) => o.status === "ENVIADO").length}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">
              Enviados
            </div>
          </div>
          <div className={cardClass}>
            <div className="text-2xl font-light text-[#2B2B2B] dark:text-white/80 mb-1">
              {
                orders.filter(
                  (o) =>
                    o.status === "PENDIENTE" || o.status === "CONFIRMADO"
                ).length
              }
            </div>
            <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">
              Pendientes
            </div>
          </div>
        </div>        {/* Filters */}
        <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 group-focus-within:text-[#3A4A3F] dark:group-focus-within:text-[var(--color-gold)] transition-colors"
                size={18}
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Buscar por ID o nombre de cliente..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white focus:border-[#3A4A3F] dark:focus:border-[var(--color-gold)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 hover:text-[#111111] dark:text-white/40 dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40"
                size={14}
              />
              <select
                value={filterStatus}
                onChange={(e) => handleFilter(e.target.value)}
                className="pl-8 pr-8 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white appearance-none cursor-pointer focus:border-[#3A4A3F] dark:focus:border-[var(--color-gold)] transition-all"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: "all", label: "Todos" },
            { value: "today", label: "Hoy" },
            { value: "week", label: "Última semana" },
            { value: "month", label: "Último mes" },
            { value: "custom", label: "Personalizar" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleDatePreset(opt.value)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                datePreset === opt.value
                  ? "bg-[#3A4A3F] text-white shadow-sm"
                  : "border border-[#EDEDED] dark:border-white/15 text-[#2B2B2B]/70 dark:text-white/70 hover:border-[#3A4A3F] dark:hover:border-white/30"
              }`}
            >
              {opt.label}
            </button>
          ))}

          {datePreset === "custom" && (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-[#EDEDED] dark:border-white/10">
              <input
                type="date"
                value={filterDesde}
                onChange={(e) => {
                  setFilterDesde(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border border-[#EDEDED] dark:border-white/10 px-3 py-2 text-sm text-[#111111] dark:text-white outline-none [&::-webkit-calendar-picker-indicator]:dark:invert"
              />
              <span className="text-[#2B2B2B]/30 dark:text-white/30">—</span>
              <input
                type="date"
                value={filterHasta}
                onChange={(e) => {
                  setFilterHasta(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border border-[#EDEDED] dark:border-white/10 px-3 py-2 text-sm text-[#111111] dark:text-white outline-none [&::-webkit-calendar-picker-indicator]:dark:invert"
              />
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className={tableWrapClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED] dark:bg-white/5">
                  <th className={thClass}>ID</th>
                  <th className={thClass}>Fecha</th>
                  <th className={thClass}>Cliente</th>
                  <th className={thClass}>Producto</th>
                  <th className={thClass}>Cant.</th>
                  <th className={thClass}>Total</th>
                  <th className={thClass}>Pago</th>
                  <th className={thClass}>Dirección</th>
                  <th className={thClass}>Estado</th>
                  <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 text-[#2B2B2B]/60 dark:text-[#EDEDED]/60">
                        <Loader2 className="animate-spin" size={18} />
                        <span>Cargando pedidos...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((order) => (
                    <tr
                      key={order.rawId}
                      className="border-b border-[#EDEDED] dark:border-white/8 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className={tdClass}>{order.id}</td>
                      <td className={tdMutedClass}>{order.date}</td>
                      <td className={tdClass}>{order.client}</td>
                      <td className={`${tdClass} max-w-[160px] truncate`} title={order.product}>
                        {order.product}
                      </td>
                      <td className={tdClass}>{order.quantity}</td>
                      <td className="px-4 py-2 text-sm text-[#2B2B2B] dark:text-white font-bold">
                        {order.total}
                      </td>
                      <td className={tdClass}>
                        <span className="text-[10px] uppercase tracking-widest font-bold">
                          {order.paymentMethod}
                        </span>
                      </td>
                      {/* ── Columna de Dirección ── */}
                      <td className={`${tdMutedClass} max-w-[180px]`}>
                        {order.direccionEnvio ? (
                          <span
                            className="block truncate text-xs"
                            title={order.direccionEnvio}
                          >
                            {order.direccionEnvio}
                          </span>
                        ) : (
                          <span className="text-[#2B2B2B]/30 dark:text-white/20 italic text-xs">
                            Sin dirección
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              order.status === "ENTREGADO"
                                ? "bg-green-500"
                                : order.status === "ENVIADO"
                                ? "bg-amber-500"
                                : order.status === "CANCELADO"
                                ? "bg-red-500"
                                : "bg-blue-400"
                            }`}
                          />
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.rawId, e.target.value)
                            }
                            className={`bg-transparent text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer ${
                              order.status === "ENTREGADO"
                                ? "text-[#3A4A3F]"
                                : order.status === "ENVIADO"
                                ? "text-amber-500"
                                : order.status === "CANCELADO"
                                ? "text-red-400"
                                : "text-[#2B2B2B]/60 dark:text-white/60"
                            }`}
                          >
                            <option
                              className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white"
                              value="PENDIENTE"
                            >
                              Pendiente
                            </option>
                            <option
                              className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white"
                              value="CONFIRMADO"
                            >
                              Confirmado
                            </option>
                            <option
                              className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white"
                              value="EN_PROCESO"
                            >
                              En Proceso
                            </option>
                            <option
                              className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white"
                              value="ENVIADO"
                            >
                              Enviado
                            </option>
                            <option
                              className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white"
                              value="ENTREGADO"
                            >
                              Entregado
                            </option>
                            <option
                              className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white"
                              value="CANCELADO"
                            >
                              Cancelado
                            </option>
                          </select>
                        </div>
                      </td>
                      {/* ── Botón Ver Detalles ── */}
                      <td className="px-4 py-2 text-right">
                        <button
                          id={`order-detail-${order.rawId}`}
                          title="Ver detalles del pedido"
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors inline-flex items-center gap-2"
                        >
                          <Eye
                            size={16}
                            className="text-[#2B2B2B] dark:text-white/60"
                            strokeWidth={1.5}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyStateRow
                    icon={ShoppingBag}
                    title="No hay pedidos"
                    description={
                      searchQuery || filterStatus
                        ? "Intenta con otros filtros"
                        : "Aún no se han registrado pedidos"
                    }
                    colSpan={10}
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
      </div>

      {/* ── Modal de Detalle de Pedido ── */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
