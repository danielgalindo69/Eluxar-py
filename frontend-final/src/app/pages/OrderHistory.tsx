import { useState, useEffect } from "react";
import { ordersAPI, Order } from "../services/api";
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router";

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  'Pendiente': { icon: Clock, color: 'text-[#2B2B2B]/60' },
  'Procesando': { icon: Package, color: 'text-amber-600' },
  'Enviado': { icon: Truck, color: 'text-blue-600' },
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
    <main className="pt-32 pb-24 bg-white min-h-screen px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light text-[#111111] tracking-tight mb-4">Mis Pedidos</h1>
        <p className="text-sm text-[#2B2B2B]/50 font-light mb-16">Historial completo de tus compras</p>

        {isLoading ? (
          <div className="text-center py-20"><p className="text-[#2B2B2B]/40 text-sm font-light uppercase tracking-widest">Cargando pedidos...</p></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <Package size={48} className="mx-auto text-[#2B2B2B]/20" />
            <p className="text-[#2B2B2B]/40 text-sm font-light uppercase tracking-widest">No tienes pedidos aún</p>
            <Link to="/catalog" className="inline-block bg-[#111111] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold">Explorar Colección</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const isExpanded = expandedId === order.id;
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              const statusColor = statusConfig[order.status]?.color || 'text-[#2B2B2B]/60';

              return (
                <div key={order.id} className="border border-[#EDEDED] bg-white">
                  {/* Order Header */}
                  <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-[#EDEDED]/30 transition-colors">
                    <div className="flex items-center gap-6 text-left">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest">{order.id}</p>
                        <p className="text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest mt-1">{order.date}</p>
                      </div>
                      <div className={`flex items-center gap-2 ${statusColor}`}>
                        <StatusIcon size={16} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">{order.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-bold hidden sm:block">{order.total.toFixed(2)}€</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Order Detail */}
                  {isExpanded && (
                    <div className="border-t border-[#EDEDED] p-6 bg-[#EDEDED]/20 space-y-6">
                      {/* Items */}
                      <div>
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 mb-4">Productos</h3>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b border-[#EDEDED] last:border-0">
                            <div>
                              <p className="text-sm font-bold uppercase tracking-widest">{item.name}</p>
                              <p className="text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest">{item.volume} × {item.quantity}</p>
                            </div>
                            <span className="text-sm font-bold">{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                        ))}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 mb-2">Dirección</p>
                          <p className="text-sm text-[#2B2B2B]/80 font-light">{order.address}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 mb-2">Método de Pago</p>
                          <p className="text-sm text-[#2B2B2B]/80 font-light">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 mb-2">Total</p>
                          <p className="text-xl font-light">{order.total.toFixed(2)}€</p>
                        </div>
                      </div>

                      {order.trackingNumber && (
                        <div className="pt-4 border-t border-[#EDEDED]">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 mb-2">Número de Seguimiento</p>
                          <p className="text-sm font-bold text-[#3A4A3F]">{order.trackingNumber}</p>
                        </div>
                      )}

                      {order.status === 'Procesando' && (
                        <Link to={`/order/${order.id}/edit-address`}
                          className="inline-block border border-[#111111] px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white transition-colors">
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
