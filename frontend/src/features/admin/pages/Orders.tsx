import React from "react";
import { Eye, Download } from "lucide-react";

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
          <h1 className="text-2xl font-light text-[#111111] tracking-tight">Gestión de Pedidos</h1>
          <p className="text-sm text-[#2B2B2B]/60 mt-2">Administra y monitorea todos los pedidos</p>
        </div>
        <button className="bg-white border border-[#EDEDED] text-[#2B2B2B] px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#EDEDED] transition-colors flex items-center gap-2">
          <Download size={16} />
          Exportar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#EDEDED] p-6">
          <div className="text-2xl font-light text-[#111111] mb-1">142</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60">Total Pedidos</div>
        </div>
        <div className="bg-white border border-[#EDEDED] p-6">
          <div className="text-2xl font-light text-[#3A4A3F] mb-1">89</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60">Entregados</div>
        </div>
        <div className="bg-white border border-[#EDEDED] p-6">
          <div className="text-2xl font-light text-[#1F2E3A] mb-1">28</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60">En Tránsito</div>
        </div>
        <div className="bg-white border border-[#EDEDED] p-6">
          <div className="text-2xl font-light text-[#2B2B2B] mb-1">25</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60">Procesando</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#EDEDED]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] bg-[#EDEDED]">
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">ID</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Fecha</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Cliente</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Producto</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Total</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Estado</th>
                <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-b border-[#EDEDED] hover:bg-[#EDEDED]/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]">{order.client}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]">{order.product}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B] font-bold">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${
                      order.status === "Entregado" ? "text-[#3A4A3F]" :
                      order.status === "Enviado" ? "text-[#1F2E3A]" :
                      order.status === "Cancelado" ? "text-red-600" :
                      "text-[#2B2B2B]/60"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[#EDEDED] transition-colors inline-flex items-center gap-2">
                      <Eye size={16} className="text-[#2B2B2B]" strokeWidth={1.5} />
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
