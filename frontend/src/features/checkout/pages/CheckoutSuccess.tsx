import { Link, useSearchParams } from 'react-router';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Página de éxito — redirige aquí Mercado Pago tras un pago aprobado.
 * MP envía query params: payment_id, status, merchant_order_id, etc.
 */
export const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const paymentId = params.get('payment_id');
  const merchantOrderId = params.get('merchant_order_id');

  return (
    <main className="min-h-screen bg-white dark:bg-[var(--bg-base)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="max-w-md w-full text-center space-y-10"
      >
        {/* Icono de éxito */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          <div className="w-24 h-24 bg-[#3A4A3F]/10 dark:bg-[#A5BAA8]/10 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-[#3A4A3F] dark:text-[#A5BAA8]" strokeWidth={1} />
          </div>
        </motion.div>

        {/* Mensaje principal */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#3A4A3F] dark:text-[#A5BAA8]">
            Pago Confirmado
          </p>
          <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-[#2B2B2B]/60 dark:text-white/50 text-sm font-light leading-relaxed">
            Tu pedido ha sido procesado exitosamente. Recibirás un correo con los detalles y el seguimiento de tu fragancia.
          </p>
        </div>

        {/* Detalles del pago (sandbox) */}
        {(paymentId || merchantOrderId) && (
          <div className="bg-[#EDEDED] dark:bg-white/5 p-6 text-left space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">
              Referencia del Pago
            </p>
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-xs text-[#2B2B2B]/60 dark:text-white/50">ID de Pago</span>
                <span className="text-xs font-bold dark:text-white font-mono">{paymentId}</span>
              </div>
            )}
            {merchantOrderId && (
              <div className="flex justify-between">
                <span className="text-xs text-[#2B2B2B]/60 dark:text-white/50">Orden</span>
                <span className="text-xs font-bold dark:text-white font-mono">{merchantOrderId}</span>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-4">
          <Link
            to="/profile/orders"
            className="w-full bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors flex items-center justify-center gap-2"
          >
            Ver Mis Pedidos
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/catalog"
            className="w-full py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-[#111111] dark:text-white border border-[#EDEDED] dark:border-white/10 hover:border-[#111111] dark:hover:border-white transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
            Seguir Comprando
          </Link>
        </div>
      </motion.div>
    </main>
  );
};
