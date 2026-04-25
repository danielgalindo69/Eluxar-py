import { Link } from "react-router";
import { ImageWithFallback } from "../../../shared/components/figma/ImageWithFallback";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";

export const Cart = () => {
   const { items, removeItem, updateQuantity, subtotal } = useCart();

   return (
      <main className="pt-32 pb-24 bg-white dark:bg-[#161616] min-h-screen px-6">
         <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-16">Tu Bolsa de Compra</h1>

            <div className="flex flex-col lg:flex-row gap-20">
               {/* List Section */}
               <div className="flex-1 space-y-12">
                  {items.length > 0 ? (
                     <>
                        <div className="hidden md:grid grid-cols-6 border-b border-[#EDEDED] dark:border-white/8 pb-6 text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/40 dark:text-white/40">
                           <div className="col-span-3">Producto</div>
                           <div className="text-center">Cantidad</div>
                           <div className="text-right">Precio</div>
                           <div className="text-right">Total</div>
                        </div>

                        {items.map((item) => (
                           <div key={`${item.productId}-${item.volume}`} className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center border-b border-[#EDEDED] dark:border-white/8 pb-12">
                              <div className="col-span-3 flex items-center space-x-6">
                                 <div className="w-24 aspect-square bg-[#EDEDED] dark:bg-white/5 overflow-hidden shrink-0">
                                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="space-y-1">
                                    <h3 className="text-sm font-bold uppercase tracking-widest">{item.name}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/40 font-bold">{item.type} | {item.volume}</p>
                                    <button
                                       onClick={() => removeItem(item.productId, item.volume)}
                                       className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/40 hover:text-red-500 pt-2 flex items-center space-x-2 transition-colors"
                                    >
                                       <Trash2 size={12} />
                                       <span>Eliminar</span>
                                    </button>
                                 </div>
                              </div>

                              <div className="flex justify-center">
                                 <div className="flex items-center space-x-4 border border-[#EDEDED] dark:border-white/8 px-3 py-1">
                                    <button
                                       onClick={() => updateQuantity(item.productId, item.volume, item.quantity - 1)}
                                       className="text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors"
                                    >
                                       <Minus size={12} />
                                    </button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button
                                       onClick={() => updateQuantity(item.productId, item.volume, item.quantity + 1)}
                                       className="text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors"
                                    >
                                       <Plus size={12} />
                                    </button>
                                 </div>
                              </div>

                              <div className="hidden md:block text-right text-xs font-bold">{item.price.toFixed(2)}€</div>
                              <div className="text-right text-sm font-bold">{(item.price * item.quantity).toFixed(2)}€</div>
                           </div>
                        ))}

                        <div className="pt-6">
                           <Link to="/catalog" className="text-[10px] uppercase tracking-widest font-bold border-b border-[#111111] pb-1 hover:opacity-50 transition-opacity">Continuar Comprando</Link>
                        </div>
                     </>
                  ) : (
                     <div className="text-center py-20 space-y-6">
                        <p className="text-[#2B2B2B]/40 dark:text-white/40 text-sm font-light uppercase tracking-widest">Tu bolsa está vacía</p>
                        <Link to="/catalog" className="inline-block bg-[#111111] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] transition-colors">Explorar Colección</Link>
                     </div>
                  )}
               </div>

               {/* Summary Section */}
               <div className="w-full lg:w-[400px]">
                  <div className="bg-[#EDEDED] dark:bg-white/5 p-10 space-y-10 sticky top-32">
                     <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white mb-8">Resumen del Pedido</h3>

                     <div className="space-y-6">
                        <div className="flex justify-between text-xs font-light uppercase tracking-widest">
                           <span>Subtotal</span>
                           <span className="font-bold">{subtotal.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-xs font-light uppercase tracking-widest">
                           <span>Envío Express</span>
                           <span className="text-[#3A4A3F] font-bold">Gratis</span>
                        </div>
                        <div className="flex justify-between text-xs font-light uppercase tracking-widest">
                           <span>Impuestos</span>
                           <span className="font-bold">Incluidos</span>
                        </div>
                        <div className="pt-6 border-t border-[#2B2B2B]/10 flex justify-between items-end">
                           <span className="text-[10px] uppercase tracking-widest font-bold">Total Estimado</span>
                           <span className="text-2xl font-light tracking-tight">{subtotal.toFixed(2)}€</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Link
                           to={items.length > 0 ? "/checkout" : "#"}
                           className={`w-full bg-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-black/5 ${items.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}
                        >
                           <span>Tramitar Pedido</span>
                           <ArrowRight size={14} />
                        </Link>

                        <div className="flex items-center justify-center space-x-2 text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest font-bold">
                           <ShieldCheck size={14} />
                           <span>Pago Seguro Garantizado</span>
                        </div>
                     </div>

                     <div className="pt-10 border-t border-[#2B2B2B]/10">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4">¿Tienes un código?</h4>
                        <div className="flex border-b border-[#2B2B2B]/20 dark:border-white/20 pb-2">
                           <input type="text" placeholder="INTRODUCIR CÓDIGO" className="bg-transparent border-none outline-none text-[10px] w-full font-bold uppercase placeholder:text-[#2B2B2B]/20" />
                           <button className="text-[10px] font-bold hover:text-[#3A4A3F] transition-colors">Aplicar</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </main>
   );
};
