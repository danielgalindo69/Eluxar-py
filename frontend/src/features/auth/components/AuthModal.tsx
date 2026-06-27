import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  title = "Inicia Sesión Requerido",
  message = "Inicia sesión para acceder a nuestras herramientas de Inteligencia Artificial."
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white dark:bg-[#111111] border border-[#EDEDED] dark:border-white/10 shadow-2xl overflow-hidden"
          >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-[#2B2B2B]/40 hover:text-[#111111] dark:text-white/40 dark:hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>

          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#3A4A3F]/10 dark:bg-[#A5BAA8]/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-[#3A4A3F] dark:text-[#A5BAA8]" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-xl font-light text-[#111111] dark:text-white mb-4 uppercase tracking-widest">
              {title}
            </h2>
            
            <p className="text-[#2B2B2B]/60 dark:text-white/60 text-sm font-light mb-8 leading-relaxed">
              {message}
            </p>

            <div className="w-full space-y-4">
              <button
                onClick={() => {
                  onClose();
                  navigate('/auth');
                }}
                className="w-full bg-[#3A4A3F] text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#2C3830] dark:hover:bg-[#4A5C4F] transition-all duration-300"
              >
                Iniciar Sesión
              </button>
              
              <button
                onClick={onClose}
                className="w-full border border-[#2B2B2B]/20 dark:border-white/20 text-[#111111] dark:text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
