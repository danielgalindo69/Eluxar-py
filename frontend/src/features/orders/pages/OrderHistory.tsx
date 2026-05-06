import { useState, useEffect } from "react";
import { ordersAPI, Order } from "../../../core/api/api";
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router";

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  'PENDIENTE': { icon: Clock, color: 'text-[#2B2B2B]/60 dark:text-white/40' },
  'CONFIRMADO': { icon: CheckCircle, color: 'text-amber-600 dark:text-amber-400' },
  'EN_PROCESO': { icon: Package, color: 'text-amber-600 dark:text-amber-400' },
  'ENVIADO': { icon: Truck, color: 'text-blue-600 dark:text-blue-400' },
  'ENTREGADO': { icon: CheckCircle, color: 'text-[#3A4A3F]' },
  'CANCELADO': { icon: Clock, color: 'text-red-600 dark:text-red-400' },
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
                      <span className="text-sm font-bold hidden sm:block">{order.total?.toFixed(2)}COP</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
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
                            <span className="text-sm font-bold text-[#111111] dark:text-white">{(item.precioUnitario * item.cantidad).toFixed(2)}COP</span>
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
                          <p className="text-xl font-light text-[#111111] dark:text-white">{order.total?.toFixed(2)}COP</p>
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
