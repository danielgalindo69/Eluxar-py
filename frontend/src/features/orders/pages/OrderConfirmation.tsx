import { Link } from "react-router";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useCart } from "../../cart/context/CartContext";
import { motion } from "motion/react";

export const OrderConfirmation = () => {
  const { items, subtotal, clearCart } = useCart();
  const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Snapshot items at render time, then clear cart on first render
  const orderItems = items.length > 0 ? items : [];

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[#161616] min-h-screen px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex justify-center mb-10"
        >
          <div className="w-24 h-24 bg-[#3A4A3F] flex items-center justify-center">
            <CheckCircle size={48} className="text-white" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-4">¡Pedido Confirmado!</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/60 font-light mb-2">
            Tu pedido ha sido procesado exitosamente
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] mb-16">
            Número de orden: {orderId}
          </p>
        </motion.div>

        {/* Order Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-[#EDEDED] dark:bg-white/5 p-10 text-left space-y-8 mb-12">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white">Resumen del Pedido</h2>

          {orderItems.length > 0 ? (
            <div className="space-y-6">
              {orderItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[#2B2B2B]/10 pb-4 last:border-0">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest">{item.name}</p>
                    <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest">{item.volume} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold">{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#2B2B2B]/40 dark:text-white/40 font-light">Los detalles del pedido han sido registrados.</p>
          )}

          <div className="pt-4 border-t border-[#2B2B2B]/10 flex justify-between items-end">
            <span className="text-[10px] uppercase tracking-widest font-bold">Total</span>
            <span className="text-2xl font-light tracking-tight">{subtotal > 0 ? subtotal.toFixed(2) : '0.00'}€</span>
          </div>
        </motion.div>

        {/* Delivery Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-3 mb-12 text-[#2B2B2B]/60 dark:text-white/60">
          <Package size={18} />
          <span className="text-sm font-light">Entrega estimada: 3-5 días hábiles</span>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/order-history"
            className="border border-[#111111] px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white transition-colors">
            Ver Mis Pedidos
          </Link>
          <Link to="/catalog"
            className="bg-[#111111] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] transition-colors flex items-center justify-center gap-2">
            Seguir Comprando <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
};
