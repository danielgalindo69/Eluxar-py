import { Eye, Download } from "lucide-react";

// Shared dark-compatible class strings
const cardClass = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6";
const tableWrapClass = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8";
const thClass = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3";
const tdClass = "px-4 py-2 text-sm text-[#2B2B2B] dark:text-white/80";
const tdMutedClass = "px-4 py-2 text-sm text-[#2B2B2B]/60 dark:text-white/40";

export const Orders = () => {
  const orders = [
    { id: "#1247", date: "22 Feb 2026", client: "Ana García", product: "Santal & Bergamot", total: "€185.00", status: "Enviado" },
    { id: "#1246", date: "22 Feb 2026", client: "Carlos López", product: "Oud Marine", total: "€210.00", status: "Procesando" },
    { id: "#1245", date: "21 Feb 2026", client: "María Torres", product: "Iris Concrete", total: "€155.00", status: "Entregado" },
    { id: "#1244", date: "21 Feb 2026", client: "Jorge Ruiz", product: "Black Amber", total: "€195.00", status: "Enviado" },
    { id: "#1243", date: "20 Feb 2026", client: "Laura Sanz", product: "Santal & Bergamot", total: "€185.00", status: "Entregado" },
    { id: "#1242", date: "20 Feb 2026", client: "Pedro Martín", product: "Oud Marine", total: "€210.00", status: "Entregado" },
    { id: "#1241", date: "19 Feb 2026", client: "Isabel Castro", product: "Iris Concrete", total: "€155.00", status: "Cancelado" },
    { id: "#1240", date: "19 Feb 2026", client: "Miguel Ángel", product: "Black Amber", total: "€195.00", status: "Enviado" },
  ];

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
          <div className="text-2xl font-light text-[#111111] dark:text-white mb-1">142</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Total Pedidos</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-[#3A4A3F] mb-1">89</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Entregados</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-blue-500 mb-1">28</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">En Tránsito</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-[#2B2B2B] dark:text-white/80 mb-1">25</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Procesando</div>
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
              {orders.map((order, index) => (
                <tr key={index} className="border-b border-[#EDEDED] dark:border-white/8 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                  <td className={tdClass}>{order.id}</td>
                  <td className={tdMutedClass}>{order.date}</td>
                  <td className={tdClass}>{order.client}</td>
                  <td className={tdClass}>{order.product}</td>
                  <td className="px-4 py-2 text-sm text-[#2B2B2B] dark:text-white font-bold">{order.total}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        order.status === "Entregado" ? "bg-green-500" :
                        order.status === "Enviado" ? "bg-amber-500" :
                        order.status === "Cancelado" ? "bg-red-500" :
                        "bg-gray-400"
                      }`} />
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${
                        order.status === "Entregado" ? "text-[#3A4A3F]" :
                        order.status === "Enviado" ? "text-blue-400" :
                        order.status === "Cancelado" ? "text-red-400" :
                        "text-[#2B2B2B]/60 dark:text-white/40"
                      }`}>
                        {order.status}
                      </span>
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
