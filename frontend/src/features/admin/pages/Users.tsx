import { UserPlus, Edit2, Ban, CheckCircle, Shield, User } from "lucide-react";
import { useState, useEffect } from "react";
import { adminUsersAPI } from "../../../core/api/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../../shared/components/ui/dropdown-menu";
import { Button } from "../../../shared/components/ui/button";

const cardClass = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6";
const tableWrapClass = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8";
const thClass = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-6 py-4";

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await adminUsersAPI.getAll();
      setUsers(data.map((u: any) => ({
        id: u.id,
        name: `${u.nombre} ${u.apellido}`,
        email: u.email,
        role: u.rol.replace('ROLE_', ''),
        joined: new Date(u.fechaRegistro).toLocaleDateString(),
        orders: 0, // Por ahora 0, luego se puede integrar si backend lo retorna
        active: u.activo
      })));
    } catch (error) {
      toast.error("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await adminUsersAPI.toggleActive(id);
      toast.success(currentActive ? "Usuario bloqueado" : "Usuario desbloqueado");
      fetchUsers();
    } catch (error) {
      toast.error("Error al actualizar estado del usuario");
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await adminUsersAPI.updateRole(id, newRole);
      toast.success("Rol actualizado correctamente");
      fetchUsers();
    } catch (error) {
      toast.error("Error al cambiar rol del usuario");
    }
  };

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
          <div className="text-2xl font-light text-[#111111] dark:text-white mb-1">{users.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Total Usuarios</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-[#3A4A3F] mb-1">{users.filter(u => u.role === 'USUARIO').length}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">Clientes</div>
        </div>
        <div className={cardClass}>
          <div className="text-2xl font-light text-blue-400 mb-1">{users.filter(u => u.role === 'ADMIN').length}</div>
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
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-[#2B2B2B]/40 dark:text-white/40">Cargando usuarios...</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className={`border-b border-[#EDEDED] dark:border-white/8 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors ${!user.active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${
                      user.role === "ADMIN" ? "text-[#3A4A3F]" : "text-[#2B2B2B]/60 dark:text-white/40"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40">{user.joined}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{user.orders}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            title="Cambiar Rol" 
                            className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors"
                          >
                            <Edit2 size={16} className="text-[#2B2B2B] dark:text-white/60" strokeWidth={1.5} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Asignar Rol</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, "USUARIO")}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <User size={14} />
                            <span>USUARIO</span>
                            {user.role === "USUARIO" && <CheckCircle size={14} className="ml-auto text-[#3A4A3F]" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, "ADMIN")}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Shield size={14} />
                            <span>ADMIN</span>
                            {user.role === "ADMIN" && <CheckCircle size={14} className="ml-auto text-[#3A4A3F]" />}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <button 
                        onClick={() => handleToggleActive(user.id, user.active)} 
                        title={user.active ? "Bloquear" : "Desbloquear"} 
                        className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors"
                      >
                        {user.active ? 
                          <Ban size={16} className="text-red-500" strokeWidth={1.5} /> :
                          <CheckCircle size={16} className="text-green-500" strokeWidth={1.5} />
                        }
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
