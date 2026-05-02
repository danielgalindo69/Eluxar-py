import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { Navbar } from "../../shared/components/layout/Navbar";
import { Footer } from "../../shared/components/layout/Footer";
import { Home } from "../../features/home/pages/Home";
import { Catalog } from "../../features/products/pages/Catalog";
import { ProductDetail } from "../../features/products/pages/ProductDetail";
import { Cart } from "../../features/cart/pages/Cart";
import { Checkout } from "../../features/checkout/pages/Checkout";
import { Auth } from "../../features/auth/pages/Auth";
import { Register } from "../../features/auth/pages/Register";
import { ForgotPassword } from "../../features/auth/pages/ForgotPassword";
import { Profile } from "../../features/user/pages/Profile";
import { Addresses } from "../../features/user/pages/Addresses";
import { Search } from "../../features/products/pages/Search";
import { OrderConfirmation } from "../../features/orders/pages/OrderConfirmation";
import { OrderHistory } from "../../features/orders/pages/OrderHistory";
import { EditOrderAddress } from "../../features/orders/pages/EditOrderAddress";
import { FragranceTest } from "../../features/IA/pages/FragranceTest";
import { Recommendations } from "../../features/IA/pages/Recommendations";
import { Chat } from "../../features/IA/pages/Chat";
import { AdminLayout } from "../../features/admin/pages/AdminLayout";
import { AdminAuth } from "../../features/admin/pages/AdminAuth";
import { Dashboard } from "../../features/admin/pages/Dashboard";
import { Products } from "../../features/admin/pages/Products";
import { Orders } from "../../features/admin/pages/Orders";
import { Users } from "../../features/admin/pages/Users";
import { Inventory } from "../../features/admin/pages/Inventory";
import { StockAlerts } from "../../features/admin/pages/StockAlerts";
import { Payments } from "../../features/admin/pages/Payments";
import { Shipping } from "../../features/admin/pages/Shipping";
import { Prices } from "../../features/admin/pages/Prices";
import { Images } from "../../features/admin/pages/Images";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { NotFound } from "../../features/shared/pages/NotFound";
import { ScrollToTop } from "../../shared/components/ScrollToTop";


const Layout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] font-sans text-[#2B2B2B] dark:text-[#EDEDED] antialiased selection:bg-[#3A4A3F] selection:text-white">
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

// Wrapper that redirects already-authenticated admins away from /admin/auth
const AdminAuthGuard = () => {
  const stored = localStorage.getItem('eluxar_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    } catch { /* ignore */ }
  }
  return <AdminAuth />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      // ─── Public routes ───────────────────────────────────────
      { index: true, Component: Home },
      { path: "catalog", Component: Catalog },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "auth", Component: Auth },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "search", Component: Search },
      { path: "fragrance-test", Component: FragranceTest },
      { path: "recommendations", Component: Recommendations },
      { path: "chat", Component: Chat },

      // ─── Protected routes (require login) ────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          { path: "checkout", Component: Checkout },
          { path: "order-confirmation", Component: OrderConfirmation },
          { path: "order-history", Component: OrderHistory },
          { path: "order/:id/edit-address", Component: EditOrderAddress },
          { path: "profile", Component: Profile },
          { path: "profile/addresses", Component: Addresses },
        ],
      },

      // ─── 404 ────────────────────────────────────────────────
      { path: "*", Component: NotFound },
    ],
  },

  // ─── Admin routes ────────────────────────────────────────────
  { path: "admin/auth", Component: AdminAuthGuard },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "products", Component: Products },
      { path: "orders", Component: Orders },
      { path: "users", Component: Users },
      { path: "inventory", Component: Inventory },
      { path: "stock-alerts", Component: StockAlerts },
      { path: "payments", Component: Payments },
      { path: "shipping", Component: Shipping },
      { path: "prices", Component: Prices },
      { path: "images", Component: Images },
    ],
  },
]);