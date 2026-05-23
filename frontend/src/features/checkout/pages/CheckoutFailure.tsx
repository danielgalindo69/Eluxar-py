import { Link, useSearchParams } from 'react-router';
import { XCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Página de pago fallido — MP redirige aquí cuando el pago es rechazado.
 */
export const CheckoutFailure = () => {
  const [params] = useSearchParams();
  const paymentId = params.get('payment_id');

  return (
    <main className="min-h-screen bg-white dark:bg-[#0F0F0F] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full text-center space-y-10"
      >
        {/* Icono de error */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center"
        >
          <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <XCircle size={48} className="text-red-500" strokeWidth={1} />
          </div>
        </motion.div>

        {/* Mensaje */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-red-500">
            Pago Rechazado
          </p>
          <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight">
            No pudimos procesar tu pago
          </h1>
          <p className="text-[#2B2B2B]/60 dark:text-white/50 text-sm font-light leading-relaxed">
            Tu pago no fue aprobado. Verifica los datos de tu tarjeta o intenta con otro método de pago. Tu carrito está intacto.
          </p>
        </div>

        {/* Referencia si la hay */}
        {paymentId && (
          <div className="bg-[#EDEDED] dark:bg-white/5 p-4 text-left">
            <div className="flex justify-between">
              <span className="text-xs text-[#2B2B2B]/60 dark:text-white/50">Referencia</span>
              <span className="text-xs font-bold dark:text-white font-mono">{paymentId}</span>
            </div>
          </div>
        )}

        {/* Motivos comunes */}
        <div className="bg-[#EDEDED]/50 dark:bg-white/5 p-6 text-left space-y-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30">
            Motivos comunes
          </p>
          {[
            'Fondos insuficientes en la cuenta',
            'Datos de la tarjeta incorrectos',
            'Pago bloqueado por tu banco',
            'Límite diario de compras superado',
          ].map((reason) => (
            <p key={reason} className="text-xs text-[#2B2B2B]/60 dark:text-white/50 flex items-start gap-2">
              <span className="text-red-400 mt-0.5">—</span>
              {reason}
            </p>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-4">
          <Link
            to="/checkout"
            className="w-full bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} />
            Intentar de Nuevo
          </Link>
          <Link
            to="/catalog"
            className="w-full py-4 text-[10px] uppercase tracking-[0.3em] font-bold text-[#111111] dark:text-white border border-[#EDEDED] dark:border-white/10 hover:border-[#111111] dark:hover:border-white transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
            Volver al Catálogo
          </Link>
        </div>
      </motion.div>
    </main>
  );
};
