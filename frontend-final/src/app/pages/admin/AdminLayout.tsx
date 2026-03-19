import React, { useState } from "react";
import { Link, Outlet, useLocation, Navigate } from "react-router";
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Warehouse, AlertTriangle, CreditCard, Truck, Image, Tag, DollarSign, Megaphone, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AdminLayout = () => {
  const { user, hasRole, isLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#EDEDED] font-sans text-[#2B2B2B] antialiased flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#EDEDED] z-50 flex items-center justify-between p-4">
        <Link to="/" className="text-lg font-light tracking-[0.3em] uppercase text-[#111111]">Eluxar</Link>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#2B2B2B]">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-[#EDEDED] fixed h-full flex flex-col z-40 transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-[#EDEDED] hidden lg:block">
          <Link to="/" className="text-xl font-light tracking-[0.3em] uppercase text-[#111111]">Eluxar</Link>
          <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 mt-2">Panel Admin</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto mt-16 lg:mt-0">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <li key={item.path}>
                  <Link to={item.path} onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      active ? "bg-[#3A4A3F] text-white" : "text-[#2B2B2B] hover:bg-[#EDEDED]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span className="uppercase tracking-widest text-[10px] font-bold">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#EDEDED]">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm text-[#2B2B2B] hover:bg-[#EDEDED] transition-colors">
            <LogOut size={18} strokeWidth={1.5} />
            <span className="uppercase tracking-widest text-[10px] font-bold">Salir</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-8 mt-14 lg:mt-0">
        <Outlet />
      </main>
    </div>
  );
};
