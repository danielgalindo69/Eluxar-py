import React from "react";
import { UserPlus, Edit2, Ban } from "lucide-react";

export const Users = () => {
  const users = [
    { id: "1", name: "Ana García", email: "ana.garcia@example.com", role: "Cliente", joined: "15 Ene 2026", orders: 12 },
    { id: "2", name: "Carlos López", email: "carlos.lopez@example.com", role: "Cliente", joined: "18 Ene 2026", orders: 8 },
    { id: "3", name: "María Torres", email: "maria.torres@example.com", role: "Cliente", joined: "22 Ene 2026", orders: 5 },
    { id: "4", name: "Jorge Ruiz", email: "jorge.ruiz@example.com", role: "Cliente", joined: "02 Feb 2026", orders: 3 },
    { id: "5", name: "Laura Sanz", email: "laura.sanz@example.com", role: "Cliente", joined: "05 Feb 2026", orders: 7 },
    { id: "6", name: "Pedro Martín", email: "pedro.martin@example.com", role: "Admin", joined: "10 Dic 2025", orders: 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-[#2B2B2B]/60 mt-2">Administra clientes y permisos</p>
        </div>
        <button className="bg-[#3A4A3F] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] transition-colors flex items-center gap-2">
          <UserPlus size={16} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#EDEDED] p-6">
          <div className="text-2xl font-light text-[#111111] mb-1">1,248</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60">Total Usuarios</div>
        </div>
        <div className="bg-white border border-[#EDEDED] p-6">
          <div className="text-2xl font-light text-[#3A4A3F] mb-1">1,235</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60">Clientes</div>
        </div>
        <div className="bg-white border border-[#EDEDED] p-6">
          <div className="text-2xl font-light text-[#1F2E3A] mb-1">13</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60">Administradores</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#EDEDED]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] bg-[#EDEDED]">
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Nombre</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Email</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Rol</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Registro</th>
                <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Pedidos</th>
                <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#EDEDED] hover:bg-[#EDEDED]/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${
                      user.role === "Admin" ? "text-[#1F2E3A]" : "text-[#2B2B2B]/60"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60">{user.joined}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]">{user.orders}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-[#EDEDED] transition-colors">
                        <Edit2 size={16} className="text-[#2B2B2B]" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 hover:bg-[#EDEDED] transition-colors">
                        <Ban size={16} className="text-[#2B2B2B]" strokeWidth={1.5} />
                      </button>
                    </div>
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
