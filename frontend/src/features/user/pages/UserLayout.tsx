import { Outlet, NavLink, useNavigate, Navigate } from "react-router";
import { User, Package, LogOut, Heart } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { authAPI } from "../../../core/api/api";
import { toast } from "sonner";

export const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Protect the entire profile section
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate("/");
      toast.success("Has cerrado sesión");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  const navItems = [
    { name: "Mi Perfil", path: "/profile", icon: User, exact: true },
    { name: "Mis Pedidos", path: "/profile/orders", icon: Package, exact: false },
    { name: "Favoritos", path: "/profile/wishlist", icon: Heart, exact: false },
  ];

  return (
    <main className="pt-32 pb-24 bg-[#FCFCFC] dark:bg-[var(--bg-base)] min-h-screen px-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-64 lg:min-w-[16rem] lg:max-w-[16rem] shrink-0">
          <div className="sticky top-32 space-y-8">
            {/* Header with logout icon on mobile */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight mb-2">Mi Cuenta</h1>
                <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest font-bold">Panel de Control</p>
              </div>
              <button
                onClick={handleLogout}
                className="lg:hidden text-red-500 hover:opacity-60 transition-opacity"
                aria-label="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </div>

            <nav>
              {/* Mobile: horizontal tabs */}
              <div className="flex lg:hidden gap-2">
                {navItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) => `
                      flex-1 flex flex-col items-center justify-center py-2.5 px-2 rounded-sm transition-all text-[10px] uppercase tracking-[0.15em] font-semibold text-center
                      ${isActive
                        ? "bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white shadow-sm border border-[#EDEDED] dark:border-white/15"
                        : "text-[#2B2B2B]/50 dark:text-white/40 border border-transparent hover:bg-[#EDEDED]/50 dark:hover:bg-white/5"
                      }
                    `}
                  >
                    <item.icon size={16} className="mb-1" />
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* Desktop: vertical links */}
              <div className="hidden lg:flex lg:flex-col lg:space-y-2">
                {navItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) => `
                      flex items-center gap-4 px-6 py-4 rounded-sm transition-all text-[11px] uppercase tracking-[0.2em] font-semibold
                      ${isActive
                        ? "bg-[#111111] text-white dark:bg-white dark:text-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                        : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#EDEDED] dark:hover:bg-white/5 hover:text-[#111111] dark:hover:text-white"
                      }
                    `}
                  >
                    <item.icon size={16} />
                    {item.name}
                  </NavLink>
                ))}

                <div className="pt-6 mt-6 border-t border-[#EDEDED] dark:border-white/10">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-sm transition-all text-[11px] uppercase tracking-[0.2em] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </main>
  );
};
