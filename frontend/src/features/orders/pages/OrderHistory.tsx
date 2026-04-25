import { useState, useEffect } from "react";
import { ordersAPI, Order } from "../../../core/api/api";
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router";

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  'Pendiente': { icon: Clock, color: 'text-[#2B2B2B]/60 dark:text-white/40' },
  'Procesando': { icon: Package, color: 'text-amber-600 dark:text-amber-400' },
  'Enviado': { icon: Truck, color: 'text-blue-600 dark:text-blue-400' },
  'Entregado': { icon: CheckCircle, color: 'text-[#3A4A3F]' },
};

export const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getAll().then(data => { setOrders(data); setIsLoading(false); });
  }, []);

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[#0F0F0F] min-h-screen px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-4">Mis Pedidos</h1>
        <p className="text-sm text-[#2B2B2B]/50 dark:text-white/40 font-light mb-16">Historial completo de tus compras</p>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-[#2B2B2B]/40 dark:text-white/30 text-sm font-light uppercase tracking-widest">Cargando pedidos...</p>
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
            {orders.map(order => {
              const isExpanded = expandedId === order.id;
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              const statusColor = statusConfig[order.status]?.color || 'text-[#2B2B2B]/60';
              return (
                <div key={order.id} className="border border-[#EDEDED] dark:border-white/8 bg-white dark:bg-[#141414]">
                  <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-[#EDEDED]/30 dark:hover:bg-white/3 transition-colors">
                    <div className="flex items-center gap-6 text-left">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-[#111111] dark:text-white">{order.id}</p>
                        <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest mt-1">{order.date}</p>
                      </div>
                      <div className={`flex items-center gap-2 ${statusColor}`}>
                        <StatusIcon size={16} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">{order.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-[#111111] dark:text-white">
                      <span className="text-sm font-bold hidden sm:block">{order.total.toFixed(2)}€</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#EDEDED] dark:border-white/8 p-6 bg-[#EDEDED]/20 dark:bg-[#111111]/60 space-y-6">
                      <div>
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-4">Productos</h3>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b border-[#EDEDED] dark:border-white/8 last:border-0">
                            <div>
                              <p className="text-sm font-bold uppercase tracking-widest text-[#111111] dark:text-white">{item.name}</p>
                              <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest">{item.volume} × {item.quantity}</p>
                            </div>
                            <span className="text-sm font-bold text-[#111111] dark:text-white">{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-2">Dirección</p>
                          <p className="text-sm text-[#2B2B2B]/80 dark:text-white/70 font-light">{order.address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-2">Método de Pago</p>
                          <p className="text-sm text-[#2B2B2B]/80 dark:text-white/70 font-light">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-2">Total</p>
                          <p className="text-xl font-light text-[#111111] dark:text-white">{order.total.toFixed(2)}€</p>
                        </div>
                      </div>

                      {order.trackingNumber && (
                        <div className="pt-4 border-t border-[#EDEDED] dark:border-white/8">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30 mb-2">Número de Seguimiento</p>
                          <p className="text-sm font-bold text-[#3A4A3F]">{order.trackingNumber}</p>
                        </div>
                      )}

                      {order.status === 'Procesando' && (
                        <Link to={`/order/${order.id}/edit-address`}
                          className="inline-block border border-[#111111] dark:border-white text-[#111111] dark:text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] dark:hover:bg-white hover:text-white dark:hover:text-[#111111] transition-colors">
                          Modificar Dirección de Envío
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
