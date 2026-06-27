import { useState } from "react";
import { ordersAPI, Order, formatPrice } from "../../../core/api/api";
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/AuthContext";

const PAGE_SIZE = 5;

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  'PENDIENTE': { icon: Clock, color: 'text-[#2B2B2B]/60 dark:text-white/40' },
  'CONFIRMADO': { icon: CheckCircle, color: 'text-amber-600 dark:text-amber-400' },
  'EN_PROCESO': { icon: Package, color: 'text-amber-600 dark:text-amber-400' },
  'ENVIADO': { icon: Truck, color: 'text-blue-600 dark:text-blue-400' },
  'ENTREGADO': { icon: CheckCircle, color: 'text-[#3A4A3F]' },
  'CANCELADO': { icon: Clock, color: 'text-red-600 dark:text-red-400' },
};

export const OrderHistory = () => {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['mis-pedidos', user?.id],
    queryFn: () => ordersAPI.getAll(),
    enabled: !!user?.id,
    staleTime: 30000,   // 30 segundos
    gcTime: 300000,      // 5 minutos
  });

  return (
    <div>
      <div className="w-full">
        <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-4">Mis Pedidos</h1>
        <p className="text-sm text-[#2B2B2B]/50 dark:text-white/40 font-light mb-16">Historial completo de tus compras</p>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-[#2B2B2B]/60 dark:text-[#EDEDED]/60">
            <Loader2 className="animate-spin" size={18} />
            <span>Cargando pedidos...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <Package size={48} className="mx-auto text-[#2B2B2B]/20 dark:text-white/20" />
            <p className="text-[#2B2B2B]/40 dark:text-white/30 text-sm font-light uppercase tracking-widest">No tienes pedidos aún</p>
            <Link to="/catalog" className="inline-block bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors">
              Explorar Colección
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
              </span>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border border-[#EDEDED] dark:border-white/10 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white px-3 py-2 outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="ENVIADO">Enviado</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            {/* Order list */}
            {(() => {
              const filtered = orders.filter(o =>
                filterStatus === '' || (o.estado || o.status) === filterStatus
              );
              const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
              const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
              return (
                <>
                  {paginated.length === 0 && (
                    <div className="text-center py-16 space-y-4">
                      <Package size={40} className="mx-auto text-[#2B2B2B]/15 dark:text-white/15" strokeWidth={1} />
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/30 dark:text-white/30">Sin pedidos con ese estado</p>
                    </div>
                  )}
                  {paginated.map(order => {
              const isExpanded = expandedId === String(order.id);
              const currentStatus = order.estado || order.status || '';
              const StatusIcon = statusConfig[currentStatus]?.icon || Clock;
              const statusColor = statusConfig[currentStatus]?.color || 'text-[#2B2B2B]/60';
              return (
                <div key={order.id} className="border border-[#EDEDED] dark:border-white/8 bg-white dark:bg-[#141414]">
                  <button onClick={() => setExpandedId(isExpanded ? null : String(order.id))}
                    className="w-full flex items-center justify-between p-6 hover:bg-[#EDEDED]/30 dark:hover:bg-white/3 transition-colors">
                    <div className="flex items-center gap-6 text-left">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-[#111111] dark:text-white">ORD-{order.id}</p>
                        <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest mt-1">
                          {new Date((order.creadoEn || order.date) as string).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 ${statusColor}`}>
                        <StatusIcon size={16} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">{(order as any).estado || order.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-[#111111] dark:text-white">
                      <span className="text-sm font-bold hidden sm:block">{order.total ? formatPrice(order.total) : '0'} COP</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#EDEDED] dark:border-white/8 p-6 bg-[#EDEDED]/20 dark:bg-[#111111]/60 space-y-6">
                          <div>
                            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-4">Productos</h3>
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="flex items-center justify-between py-3 border-b border-[#EDEDED] dark:border-white/8 last:border-0">
                                <div className="flex items-center gap-4">
                                  {item.imagenUrl && (
                                    <img src={item.imagenUrl} alt={item.productoNombre || item.name} className="w-10 h-10 object-cover" />
                                  )}
                                  <div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-[#111111] dark:text-white">{item.productoNombre || item.name}</p>
                                    <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest">{item.tamanoMl ? `${item.tamanoMl}ml` : item.volume} × {item.cantidad}</p>
                                  </div>
                                </div>
                                <span className="text-sm font-bold text-[#111111] dark:text-white">{formatPrice(item.precioUnitario * item.cantidad)} COP</span>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-2">Dirección</p>
                              <p className="text-sm text-[#2B2B2B]/80 dark:text-white/70 font-light">{(order as any).direccionEnvio || order.address || 'No especificada'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-2">Método de Pago</p>
                              <p className="text-sm text-[#2B2B2B]/80 dark:text-white/70 font-light">{(order as any).metodoPago || order.paymentMethod || 'No especificado'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-2">Total</p>
                              <p className="text-xl font-light text-[#111111] dark:text-white">{order.total ? formatPrice(order.total) : '0'} COP</p>
                            </div>
                          </div>

                          {order.trackingNumber && (
                            <div className="pt-4 border-t border-[#EDEDED] dark:border-white/8">
                              <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-2">Número de Seguimiento</p>
                              <p className="text-sm font-bold text-[#3A4A3F]">{order.trackingNumber}</p>
                            </div>
                          )}

                          {['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO'].includes((order as any).estado || order.status) && (
                            <Link to={`/order/${order.id}/edit-address`}
                              className="inline-block border border-[#111111] dark:border-white text-[#111111] dark:text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] dark:hover:bg-white hover:text-white dark:hover:text-[#111111] transition-colors mt-4">
                              Modificar Dirección de Envío
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-[#EDEDED] dark:border-white/8">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30">
                        Pág. {currentPage} de {totalPages}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 border border-[#EDEDED] dark:border-white/10 hover:bg-[#EDEDED] dark:hover:bg-white/8 transition-colors disabled:opacity-30"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-[#EDEDED] dark:border-white/10 hover:bg-[#EDEDED] dark:hover:bg-white/8 transition-colors disabled:opacity-30"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
