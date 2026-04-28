import { UserPlus, Edit2, Ban } from "lucide-react";

const cardClass = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6";
const tableWrapClass = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8";
const thClass = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-6 py-4";

export const Users = () => {
  const users: any[] = [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Administra clientes y permisos</p>
        </div>
        <button className="bg-[#3A4A3F] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] dark:hover:bg-white dark:hover:text-[#111111] transition-colors flex items-center gap-2">
          <UserPlus size={16} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cardClass}>
          <div className="text-2xl font-light text-[#111111] dark:text-white mb-1">1,248</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Total Usuarios</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-[#3A4A3F] mb-1">1,235</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Clientes</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-blue-400 mb-1">13</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Administradores</div>
        </div>
      </div>

      {/* Users Table */}
      <div className={tableWrapClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED] dark:bg-white/5">
                <th className={thClass}>Nombre</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>Rol</th>
                <th className={thClass}>Registro</th>
                <th className={thClass}>Pedidos</th>
                <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#EDEDED] dark:border-white/8 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${
                      user.role === "Admin" ? "text-[#3A4A3F]" : "text-[#2B2B2B]/60 dark:text-white/40"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40">{user.joined}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{user.orders}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors">
                        <Edit2 size={16} className="text-[#2B2B2B] dark:text-white/60" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors">
                        <Ban size={16} className="text-[#2B2B2B] dark:text-white/60" strokeWidth={1.5} />
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
