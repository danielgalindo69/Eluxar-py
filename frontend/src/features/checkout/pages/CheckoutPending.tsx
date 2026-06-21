import { Link } from 'react-router';
import { Clock, ShoppingBag, ArrowRight, Mail } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Página de pago pendiente — MP redirige aquí cuando el pago está en revisión.
 * Ejemplo: PSE en proceso, tarjeta con verificación adicional.
 */
export const CheckoutPending = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-[var(--bg-base)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full text-center space-y-10"
      >
        {/* Icono pendiente */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center"
        >
          <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
            <Clock size={48} className="text-amber-500" strokeWidth={1} />
          </div>
        </motion.div>

        {/* Mensaje */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-500">
            Pago en Revisión
          </p>
          <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight">
            Procesando tu pago
          </h1>
          <p className="text-[#2B2B2B]/60 dark:text-white/50 text-sm font-light leading-relaxed">
            Tu pago está siendo procesado. Esto puede tardar unos minutos. Te notificaremos por correo cuando sea confirmado.
          </p>
        </div>

        {/* Aviso */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-6 text-left space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-amber-500 shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Recibirás una confirmación por correo cuando el pago sea verificado por tu banco.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-4">
          <Link
            to="/profile/orders"
            className="w-full bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-colors flex items-center justify-center gap-2"
          >
            Ver Estado del Pedido
            <ArrowRight size={14} />
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
