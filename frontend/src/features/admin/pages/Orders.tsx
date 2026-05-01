import { Eye, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { ordersAPI } from "../../../core/api/api";
import { toast } from "sonner";

// Shared dark-compatible class strings
const cardClass = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6";
const tableWrapClass = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8";
const thClass = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3";
const tdClass = "px-4 py-2 text-sm text-[#2B2B2B] dark:text-white/80";
const tdMutedClass = "px-4 py-2 text-sm text-[#2B2B2B]/60 dark:text-white/40";

export const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data.map((o: any) => ({
        id: `#${o.id}`,
        rawId: o.id,
        date: new Date(o.creadoEn).toLocaleDateString(),
        client: o.clienteNombre || 'Cliente Desconocido',
        product: o.items ? `${o.items.length} item(s)` : 'N/A',
        total: `${o.total} COP`,
        status: o.estado
      })));
    } catch (error) {
      toast.error("Error al cargar pedidos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      toast.success("Estado actualizado");
      fetchOrders();
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Gestión de Pedidos</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Administra y monitorea todos los pedidos</p>
        </div>
        <button className="bg-white dark:bg-[#1A1A1A] border border-[#EDEDED] dark:border-white/10 text-[#2B2B2B] dark:text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#EDEDED] dark:hover:bg-white/8 transition-colors flex items-center gap-2">
          <Download size={16} />
          Exportar
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
                <th className={thClass}>Total</th>
                <th className={thClass}>Estado</th>
                <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-[#2B2B2B]/40 dark:text-white/40">Cargando pedidos...</td></tr>
              ) : orders.map((order, index) => (
                <tr key={index} className="border-b border-[#EDEDED] dark:border-white/8 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                  <td className={tdClass}>{order.id}</td>
                  <td className={tdMutedClass}>{order.date}</td>
                  <td className={tdClass}>{order.client}</td>
                  <td className={tdClass}>{order.product}</td>
                  <td className="px-4 py-2 text-sm text-[#2B2B2B] dark:text-white font-bold">{order.total}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        order.status === "ENTREGADO" ? "bg-green-500" :
                        order.status === "ENVIADO" ? "bg-amber-500" :
                        order.status === "CANCELADO" ? "bg-red-500" :
                        "bg-blue-400"
                      }`} />
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.rawId, e.target.value)}
                        className={`bg-transparent text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer ${
                          order.status === "ENTREGADO" ? "text-[#3A4A3F]" :
                          order.status === "ENVIADO" ? "text-amber-500" :
                          order.status === "CANCELADO" ? "text-red-400" :
                          "text-[#2B2B2B]/60 dark:text-white/60"
                        }`}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="ENVIADO">Enviado</option>
                        <option value="ENTREGADO">Entregado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button title="Ver Detalles" className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                      <Eye size={16} className="text-[#2B2B2B] dark:text-white/60" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
