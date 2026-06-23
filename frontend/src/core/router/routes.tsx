import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { Navbar } from "../../shared/components/layout/Navbar";
import { Footer } from "../../shared/components/layout/Footer";
import { lazy, Suspense } from "react";
import { PageLoader } from "../../shared/components/ui/PageLoader";

const Home = lazy(() => import("../../features/home/pages/Home").then(m => ({ default: m.Home })));
const Catalog = lazy(() => import("../../features/products/pages/Catalog").then(m => ({ default: m.Catalog })));
const ProductDetail = lazy(() => import("../../features/products/pages/ProductDetail").then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import("../../features/cart/pages/Cart").then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import("../../features/checkout/pages/Checkout").then(m => ({ default: m.Checkout })));
const Auth = lazy(() => import("../../features/auth/pages/Auth").then(m => ({ default: m.Auth })));
const Register = lazy(() => import("../../features/auth/pages/Register").then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import("../../features/auth/pages/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const Profile = lazy(() => import("../../features/user/pages/Profile").then(m => ({ default: m.Profile })));
const Addresses = lazy(() => import("../../features/user/pages/Addresses").then(m => ({ default: m.Addresses })));
const Wishlist = lazy(() => import("../../features/user/pages/Wishlist").then(m => ({ default: m.Wishlist })));
const UserLayout = lazy(() => import("../../features/user/pages/UserLayout").then(m => ({ default: m.UserLayout })));
const Search = lazy(() => import("../../features/products/pages/Search").then(m => ({ default: m.Search })));
const OrderConfirmation = lazy(() => import("../../features/orders/pages/OrderConfirmation").then(m => ({ default: m.OrderConfirmation })));
const OrderHistory = lazy(() => import("../../features/orders/pages/OrderHistory").then(m => ({ default: m.OrderHistory })));
const CheckoutSuccess = lazy(() => import("../../features/checkout/pages/CheckoutSuccess").then(m => ({ default: m.CheckoutSuccess })));
const CheckoutPending = lazy(() => import("../../features/checkout/pages/CheckoutPending").then(m => ({ default: m.CheckoutPending })));
const CheckoutFailure = lazy(() => import("../../features/checkout/pages/CheckoutFailure").then(m => ({ default: m.CheckoutFailure })));
const EditOrderAddress = lazy(() => import("../../features/orders/pages/EditOrderAddress").then(m => ({ default: m.EditOrderAddress })));
const FragranceTest = lazy(() => import("../../features/IA/pages/FragranceTest").then(m => ({ default: m.FragranceTest })));
const Recommendations = lazy(() => import("../../features/IA/pages/Recommendations").then(m => ({ default: m.Recommendations })));
const Chat = lazy(() => import("../../features/IA/pages/Chat").then(m => ({ default: m.Chat })));
const Dashboard = lazy(() => import("../../features/admin/pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Products = lazy(() => import("../../features/admin/pages/Products").then(m => ({ default: m.Products })));
const Orders = lazy(() => import("../../features/admin/pages/Orders").then(m => ({ default: m.Orders })));
const Users = lazy(() => import("../../features/admin/pages/Users").then(m => ({ default: m.Users })));
const Inventory = lazy(() => import("../../features/admin/pages/Inventory").then(m => ({ default: m.Inventory })));
const StockAlerts = lazy(() => import("../../features/admin/pages/StockAlerts").then(m => ({ default: m.StockAlerts })));
const Payments = lazy(() => import("../../features/admin/pages/Payments").then(m => ({ default: m.Payments })));
const Shipping = lazy(() => import("../../features/admin/pages/Shipping").then(m => ({ default: m.Shipping })));
const Images = lazy(() => import("../../features/admin/pages/Images").then(m => ({ default: m.Images })));
const Coupons = lazy(() => import("../../features/admin/pages/Coupons").then(m => ({ default: m.Coupons })));
import { AdminLayout } from "../../features/admin/pages/AdminLayout";
import { AdminAuth } from "../../features/admin/pages/AdminAuth";
import { ProtectedRoute } from "../../features/auth/components/ProtectedRoute";
import { NotFound } from "../../features/shared/pages/NotFound";
import { ScrollToTop } from "../../shared/components/ScrollToTop";


import { CartDrawer } from "../../features/cart/components/CartDrawer";

import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router';

const PageTransition = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col"
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const Layout = () => {
  const location = useLocation();
  const hideFooterRoutes = ['/chat', '/fragrance-test'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--bg-base)] font-sans text-[#2B2B2B] dark:text-[#EDEDED] antialiased selection:bg-[#3A4A3F] selection:text-white flex flex-col">
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <PageTransition />
      {!shouldHideFooter && <Footer />}
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
          { path: "checkout/success", Component: CheckoutSuccess },
          { path: "checkout/pending", Component: CheckoutPending },
          { path: "checkout/failure", Component: CheckoutFailure },
          { path: "order-confirmation", Component: OrderConfirmation },
          { path: "order/:id/edit-address", Component: EditOrderAddress },
          {
            path: "profile",
            Component: UserLayout,
            children: [
              { index: true, Component: Profile },
              { path: "orders", Component: OrderHistory },
              { path: "wishlist", Component: Wishlist },
              { path: "addresses", Component: Addresses },
            ]
          }
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
      { path: "images", Component: Images },
      { path: "coupons", Component: Coupons },
    ],
  },
]);