import { useState } from "react";
import { Link, Outlet, useLocation, Navigate, useNavigate } from "react-router";
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Warehouse, AlertTriangle, CreditCard, Truck, Image, Tag, DollarSign, Megaphone, Menu, X } from "lucide-react";
import { useAuth } from '../../auth/context/AuthContext';
import { ScrollToTop } from '../../../shared/components/ScrollToTop';

export const AdminLayout = () => {
  const { user, hasRole, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!user || !hasRole("ADMIN")) return <Navigate to="/auth" state={{ from: location }} replace />;

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { path: "/admin/products", label: "Productos", icon: Package },
    { path: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
    { path: "/admin/users", label: "Usuarios", icon: Users },
    { path: "/admin/inventory", label: "Inventario", icon: Warehouse },
    { path: "/admin/stock-alerts", label: "Alertas Stock", icon: AlertTriangle },
    { path: "/admin/payments", label: "Pagos", icon: CreditCard },
    { path: "/admin/shipping", label: "Envíos", icon: Truck },
    { path: "/admin/banners", label: "Banners", icon: Megaphone },
    { path: "/admin/prices", label: "Precios", icon: DollarSign },
    { path: "/admin/categories", label: "Categorías", icon: Tag },
    { path: "/admin/images", label: "Imágenes", icon: Image },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#EDEDED] dark:bg-[#0A0A0A] font-sans text-[#2B2B2B] dark:text-[#EDEDED] antialiased flex">
      <ScrollToTop />
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#111111] border-b border-[#EDEDED] dark:border-white/10 z-50 flex items-center justify-between p-4">
        <Link to="/" className="text-lg font-light tracking-[0.3em] uppercase text-[#111111] dark:text-white">Eluxar</Link>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#2B2B2B]">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64 bg-white dark:bg-[#111111] border-r border-[#EDEDED] dark:border-white/8 fixed h-full flex flex-col z-40 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`p-6 border-b border-[#EDEDED] dark:border-white/8 hidden lg:flex items-center ${isDesktopCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          {!isDesktopCollapsed && (
            <div>
              <Link to="/" className="text-xl font-light tracking-[0.3em] uppercase text-[#111111] dark:text-white">Eluxar</Link>
              <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40 mt-2">Panel Admin</p>
            </div>
          )}
          <button onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} className="text-[#2B2B2B] hover:text-[#111111] transition-colors">
            <Menu size={20} />
          </button>
        </div>

        <nav className="admin-sidebar-nav flex-1 p-4 overflow-y-auto mt-16 lg:mt-0 overflow-x-hidden">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <li key={item.path} title={isDesktopCollapsed ? item.label : undefined}>
                  <Link to={item.path} onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-none ${
                      active ? "bg-[#3A4A3F] text-white" : "text-[#2B2B2B] dark:text-[#EDEDED] hover:bg-[#EDEDED] dark:hover:bg-white/8"
                    } ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
                  >
                    <Icon size={18} strokeWidth={1.5} className="shrink-0" />
                    <span className={`uppercase tracking-widest text-[10px] font-bold whitespace-nowrap transition-opacity duration-300 ${isDesktopCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#EDEDED] dark:border-white/8">
          <button
            onClick={handleLogout}
            title={isDesktopCollapsed ? "Cerrar Sesión" : undefined}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${isDesktopCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut size={18} strokeWidth={1.5} className="shrink-0" />
            <span className={`uppercase tracking-widest text-[10px] font-bold whitespace-nowrap transition-opacity duration-300 ${isDesktopCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isDesktopCollapsed ? 'lg:ml-20' : 'lg:ml-64'} p-4 lg:p-8 mt-14 lg:mt-0`}>
        <Outlet />
      </main>
    </div>
  );
};
