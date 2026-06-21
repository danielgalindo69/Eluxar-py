import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../../../core/api/api';
import { ImageWithFallback } from '../../../shared/components/figma/ImageWithFallback';

export const CartDrawer = () => {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  const FREE_SHIPPING_THRESHOLD = 200000;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountNeeded = FREE_SHIPPING_THRESHOLD - subtotal;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[var(--bg-base)] z-[101] shadow-2xl flex flex-col border-l border-[#EDEDED] dark:border-white/10"
          >
            {/* Header */}
            <div className="flex flex-col border-b border-[#EDEDED] dark:border-white/10">
              <div className="flex items-center justify-between p-6">
                <h2 className="text-xl font-light tracking-widest uppercase flex items-center gap-3 text-[#111111] dark:text-white">
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  Tu Bolsa
                </h2>
                <button 
                  onClick={closeDrawer}
                  className="p-2 text-[#2B2B2B]/60 dark:text-white/60 hover:text-[#111111] dark:hover:text-white transition-colors"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              {/* Free Shipping Gamification */}
              {items.length > 0 && (
                <div className="px-6 pb-6 space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-center text-[#111111] dark:text-white">
                    {progress >= 100 
                      ? "¡Felicidades! Tienes envío express gratuito." 
                      : `Te faltan $${formatPrice(amountNeeded)} COP para envío gratuito.`}
                  </p>
                  <div className="w-full h-1 bg-[#EDEDED] dark:bg-white/10 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full ${progress >= 100 ? 'bg-[#3A4A3F] dark:bg-[#A5BAA8]' : 'bg-[#111111] dark:bg-white'}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 h-full">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.length === 0 ? (
                    <motion.div 
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50"
                    >
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p className="text-sm uppercase tracking-widest font-bold">Tu bolsa está vacía</p>
                      <button 
                        onClick={closeDrawer}
                        className="mt-4 border-b border-current pb-1 text-[10px] uppercase tracking-widest font-bold"
                      >
                        Continuar Comprando
                      </button>
                    </motion.div>
                  ) : (
                    items.map((item) => (
                      <motion.div 
                        key={`${item.productId}-${item.volume}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ 
                          opacity: 0, 
                          x: -40, 
                          height: 0, 
                          marginTop: 0,
                          overflow: 'hidden',
                          transition: {
                            opacity: { duration: 0.2 },
                            x: { duration: 0.2 },
                            height: { delay: 0.2, duration: 0.25, ease: "easeInOut" },
                            marginTop: { delay: 0.2, duration: 0.25, ease: "easeInOut" }
                          }
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 group"
                      >
                        <Link to={`/product/${item.productId}`} onClick={closeDrawer} className="w-24 h-24 bg-[#F5F5F5] dark:bg-[var(--bg-surface)] shrink-0 overflow-hidden relative">
                          <ImageWithFallback 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <Link to={`/product/${item.productId}`} onClick={closeDrawer}>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] dark:text-white leading-tight hover:underline">
                                  {item.name}
                                </h3>
                              </Link>
                              <button 
                                onClick={() => removeItem(item.productId, item.volume)}
                                className="text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#E07A6B] transition-colors duration-200 cursor-pointer shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60 mt-1">
                              {item.volume}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-[#EDEDED] dark:border-white/10 bg-[#F5F5F5]/50 dark:bg-transparent">
                              <button 
                                onClick={() => updateQuantity(item.productId, item.volume, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-[#2B2B2B]/60 dark:text-white/60 hover:text-[#111111] dark:hover:text-white transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-xs font-bold dark:text-white">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.productId, item.volume, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-[#2B2B2B]/60 dark:text-white/60 hover:text-[#111111] dark:hover:text-white transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            
                            <p className="text-sm font-bold text-[#111111] dark:text-white">
                              ${formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#EDEDED] dark:border-white/10 p-6 bg-white dark:bg-[#141414] space-y-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_-10px_30px_rgba(255,255,255,0.02)]">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60">Subtotal</span>
                  <span className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">${formatPrice(subtotal)} COP</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/40 text-center">
                  Impuestos incluidos. El envío se calcula en el checkout.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors flex items-center justify-center gap-2 group"
                  >
                    Proceder al Pago
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link 
                    to="/cart"
                    onClick={closeDrawer}
                    className="w-full text-center py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white border border-[#EDEDED] dark:border-white/10 hover:border-[#111111] dark:hover:border-white transition-colors"
                  >
                    Ver Bolsa Completa
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
