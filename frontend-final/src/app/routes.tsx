import { createBrowserRouter, Outlet } from "react-router";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Auth } from "./pages/Auth";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Profile } from "./pages/Profile";
import { Addresses } from "./pages/Addresses";
import { Search } from "./pages/Search";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { OrderHistory } from "./pages/OrderHistory";
import { EditOrderAddress } from "./pages/EditOrderAddress";
import { FragranceTest } from "./pages/FragranceTest";
import { Recommendations } from "./pages/Recommendations";
import { Chat } from "./pages/Chat";
import { AdminAuth } from "./pages/AdminAuth";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { Products } from "./pages/admin/Products";
import { Orders } from "./pages/admin/Orders";
import { Users } from "./pages/admin/Users";
import { Inventory } from "./pages/admin/Inventory";
import { StockAlerts } from "./pages/admin/StockAlerts";
import { Payments } from "./pages/admin/Payments";
import { Shipping } from "./pages/admin/Shipping";
import { Banners } from "./pages/admin/Banners";
import { Prices } from "./pages/admin/Prices";
import { Categories } from "./pages/admin/Categories";
import { Images } from "./pages/admin/Images";
import React from "react";

const Layout = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#2B2B2B] antialiased selection:bg-[#3A4A3F] selection:text-white">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "catalog", Component: Catalog },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "auth", Component: Auth },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "profile", Component: Profile },
      { path: "profile/addresses", Component: Addresses },
      { path: "search", Component: Search },
      { path: "order-confirmation", Component: OrderConfirmation },
      { path: "order-history", Component: OrderHistory },
      { path: "order/:id/edit-address", Component: EditOrderAddress },
      { path: "fragrance-test", Component: FragranceTest },
      { path: "recommendations", Component: Recommendations },
      { path: "chat", Component: Chat },
    ],
  },
  { path: "admin/auth", Component: AdminAuth },
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
      { path: "banners", Component: Banners },
      { path: "prices", Component: Prices },
      { path: "categories", Component: Categories },
      { path: "images", Component: Images },
    ],
  },
]);