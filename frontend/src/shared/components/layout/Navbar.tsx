import { Link, useLocation, useNavigate } from "react-router";
import { Search, ShoppingBag, Menu, X, User, ChevronDown, LogOut, MapPin, ClipboardList, Settings, Sparkles, MessageCircle, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { useCart } from "../../../features/cart/context/CartContext";
import { useTheme } from "next-themes";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { itemCount } = useCart();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); setIsUserMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrolled = isScrolled || location.pathname !== "/";

  return (
        <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? "bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md py-4 border-[#111111]/5 dark:border-white/5 shadow-sm" : "bg-transparent py-6 border-transparent"}`}
    >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button className="lg:hidden text-[#2B2B2B] dark:text-[#EDEDED]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Links - Left */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/catalog" className="text-[#2B2B2B] dark:text-[#EDEDED] text-sm uppercase tracking-widest hover:opacity-60 transition-opacity">Colección</Link>
            <Link to="/fragrance-test" className="text-[#2B2B2B] dark:text-[#EDEDED] text-sm uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-2">
              <Sparkles size={14} />Test Olfativo
            </Link>
          </div>

          {/* Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <Link to="/" className="text-2xl font-light tracking-[0.3em] uppercase text-[#111111] dark:text-white">Eluxar</Link>
          </div>

          {/* Icons - Right */}
          <div className="flex items-center space-x-6">
            <Link to="/search" className="text-[#2B2B2B] dark:text-[#EDEDED] hover:opacity-60 transition-opacity">
              <Search size={20} strokeWidth={1.5} />
            </Link>
            <Link to="/chat" className="hidden sm:block text-[#2B2B2B] dark:text-[#EDEDED] hover:opacity-60 transition-opacity">
              <MessageCircle size={20} strokeWidth={1.5} />
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="hidden sm:block text-[#2B2B2B] dark:text-[#EDEDED] hover:opacity-60 transition-opacity"
              aria-label="Cambiar tema"
            >
              {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>

            {/* User Menu */}
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="text-[#2B2B2B] dark:text-[#EDEDED] hover:opacity-60 transition-opacity flex items-center gap-1">
                <User size={20} strokeWidth={1.5} />
                {isAuthenticated && <ChevronDown size={12} />}
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-4 bg-white dark:bg-[#1A1A1A] border border-[#EDEDED] dark:border-white/10 shadow-lg shadow-black/5 min-w-[220px] z-50"
                  >
                    {isAuthenticated ? (
                      <div className="py-2">
                        <div className="px-5 py-3 border-b border-[#EDEDED] dark:border-white/10">
                          <p className="text-xs font-bold text-[#111111] dark:text-white uppercase tracking-widest truncate">{user?.name}</p>
                          <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 mt-1 truncate">{user?.email}</p>
                        </div>
                        <Link to="/profile" className="flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-[#2B2B2B] dark:text-[#EDEDED] hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors">
                          <Settings size={14} />Mi Perfil
                        </Link>
                        <Link to="/profile/addresses" className="flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-[#2B2B2B] dark:text-[#EDEDED] hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors">
                          <MapPin size={14} />Direcciones
                        </Link>
                        <Link to="/order-history" className="flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-[#2B2B2B] dark:text-[#EDEDED] hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors">
                          <ClipboardList size={14} />Mis Pedidos
                        </Link>
                        <Link to="/recommendations" className="flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-[#2B2B2B] dark:text-[#EDEDED] hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors">
                          <Sparkles size={14} />Recomendaciones
                        </Link>
                        {hasRole('ADMIN', 'EMPLEADO') && (
                          <Link to="/admin" className="flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-[#3A4A3F] font-bold hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors border-t border-[#EDEDED] dark:border-white/10">
                            Panel Admin
                          </Link>
                        )}
                        <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full border-t border-[#EDEDED] dark:border-white/10">
                          <LogOut size={14} />Cerrar Sesión
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Link to="/auth" className="flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-[#2B2B2B] dark:text-[#EDEDED] hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors">
                          Iniciar Sesión
                        </Link>
                        <Link to="/register" className="flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-[#2B2B2B] dark:text-[#EDEDED] hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors">
                          Crear Cuenta
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/cart" className="text-[#2B2B2B] dark:text-[#EDEDED] hover:opacity-60 transition-opacity relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#3A4A3F] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-[#111111] border-b border-[#EDEDED] dark:border-white/10 lg:hidden"
            >
              <div className="flex flex-col p-6 space-y-4">
                <Link to="/catalog" className="text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest">Colección</Link>
                <Link to="/fragrance-test" className="text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} />Test Olfativo</Link>
                <Link to="/search" className="text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest">Buscar</Link>
                <Link to="/chat" className="text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest">Chat IA</Link>
                <Link to="/cart" className="text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest">Bolsa ({itemCount})</Link>
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="flex items-center gap-2 text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  {isDark ? "Modo Claro" : "Modo Oscuro"}
                </button>
                <div className="border-t border-[#EDEDED] dark:border-white/10 pt-4">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className="block text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest mb-4">Mi Perfil</Link>
                      <Link to="/order-history" className="block text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest mb-4">Mis Pedidos</Link>
                      {hasRole('ADMIN', 'EMPLEADO') && (
                        <Link to="/admin" className="block text-[#3A4A3F] text-lg uppercase tracking-widest font-bold mb-4">Panel Admin</Link>
                      )}
                      <button onClick={handleLogout} className="text-red-500 text-lg uppercase tracking-widest">Cerrar Sesión</button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" className="block text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest mb-4">Cuenta</Link>
                      <Link to="/register" className="block text-[#2B2B2B] dark:text-[#EDEDED] text-lg uppercase tracking-widest">Registrarse</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
  );
};