import { Link, useNavigate } from "react-router";
import { ImageWithFallback } from "../../../shared/components/figma/ImageWithFallback";
import { ChevronRight, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../cart/context/CartContext";
import { useAuth } from "../../auth/context/AuthContext";

export const Checkout = () => {
  const [activeStep, setActiveStep] = useState(1);
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    zip: '',
    province: '',
    country: 'España',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFinishOrder = () => {
    clearCart();
    navigate('/order-confirmation');
  };

  return (
    <main className="pt-24 pb-24 bg-white min-h-screen px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
        
        {/* Main Checkout Section */}
        <div className="flex-1 space-y-20">
           {/* Breadcrumbs */}
           <div className="flex items-center space-x-6 text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/40">
              <Link to="/cart" className="hover:text-[#111111] transition-colors">Bolsa</Link>
              <ChevronRight size={12} strokeWidth={3} />
              <span className={activeStep >= 1 ? "text-[#111111]" : ""}>Información</span>
              <ChevronRight size={12} strokeWidth={3} />
              <span className={activeStep >= 2 ? "text-[#111111]" : ""}>Dirección</span>
              <ChevronRight size={12} strokeWidth={3} />
              <span className={activeStep >= 3 ? "text-[#111111]" : ""}>Pago</span>
           </div>

           {/* Step 1: Personal Information */}
           {activeStep === 1 && (
             <div className="space-y-12">
               <h2 className="text-3xl font-light text-[#111111] tracking-tight">Información Personal</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Nombre</label>
                     <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                  </div>
                  <div className="flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Apellidos</label>
                     <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                  </div>
                  <div className="md:col-span-2 flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Correo Electrónico</label>
                     <input name="email" value={formData.email} onChange={handleChange} type="email" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                  </div>
                  <div className="md:col-span-2 flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Teléfono</label>
                     <input name="phone" value={formData.phone} onChange={handleChange} type="tel" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                  </div>
               </div>

               <div className="pt-10 flex items-center justify-between border-t border-[#EDEDED]">
                  <Link to="/cart" className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 hover:text-[#111111] transition-colors">
                     Volver al Carrito
                  </Link>
                  <button onClick={() => setActiveStep(2)} className="bg-[#111111] text-white px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all shadow-lg shadow-black/5">
                     Continuar
                  </button>
               </div>
             </div>
           )}

           {/* Step 2: Address */}
           {activeStep === 2 && (
             <div className="space-y-12">
               <h2 className="text-3xl font-light text-[#111111] tracking-tight">Dirección de Envío</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Dirección</label>
                     <input name="address" value={formData.address} onChange={handleChange} type="text" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                  </div>
                  <div className="flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Ciudad</label>
                     <input name="city" value={formData.city} onChange={handleChange} type="text" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                  </div>
                  <div className="flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Código Postal</label>
                     <input name="zip" value={formData.zip} onChange={handleChange} type="text" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                  </div>
                  <div className="flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Provincia</label>
                     <input name="province" value={formData.province} onChange={handleChange} type="text" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                  </div>
                  <div className="flex flex-col space-y-2">
                     <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">País</label>
                     <select name="country" value={formData.country} onChange={handleChange} className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all appearance-none cursor-pointer">
                        <option>España</option>
                        <option>Francia</option>
                        <option>Portugal</option>
                        <option>Italia</option>
                        <option>Alemania</option>
                        <option>Reino Unido</option>
                     </select>
                  </div>
               </div>

               <div className="pt-10 flex items-center justify-between border-t border-[#EDEDED]">
                  <button onClick={() => setActiveStep(1)} className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 hover:text-[#111111] transition-colors">
                     Anterior
                  </button>
                  <button onClick={() => setActiveStep(3)} className="bg-[#111111] text-white px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all shadow-lg shadow-black/5">
                     Continuar al Pago
                  </button>
               </div>
             </div>
           )}

           {/* Step 3: Payment Method */}
           {activeStep === 3 && (
             <div className="space-y-12">
               <h2 className="text-3xl font-light text-[#111111] tracking-tight">Método de Pago</h2>
               
               <div className="space-y-6">
                  <div className="border border-[#EDEDED] p-6 cursor-pointer hover:border-[#3A4A3F] transition-colors">
                     <div className="flex items-center space-x-4">
                        <div className="w-4 h-4 rounded-full border-2 border-[#3A4A3F] flex items-center justify-center">
                           <div className="w-2 h-2 rounded-full bg-[#3A4A3F]" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">Tarjeta de Crédito/Débito</span>
                     </div>
                  </div>

                  <div className="border border-[#EDEDED] p-6 space-y-6">
                     <div className="flex flex-col space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Número de Tarjeta</label>
                        <input type="text" placeholder="1234 5678 9012 3456" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-2">
                           <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Fecha Exp.</label>
                           <input type="text" placeholder="MM/AA" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                        </div>
                        <div className="flex flex-col space-y-2">
                           <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">CVV</label>
                           <input type="text" placeholder="123" className="bg-[#EDEDED] border-none outline-none p-4 text-sm font-medium focus:ring-1 focus:ring-[#3A4A3F] transition-all" />
                        </div>
                     </div>
                  </div>

                  <div className="border border-[#EDEDED] p-6 cursor-pointer hover:border-[#3A4A3F] transition-colors opacity-60">
                     <div className="flex items-center space-x-4">
                        <div className="w-4 h-4 rounded-full border-2 border-[#EDEDED]" />
                        <span className="text-sm font-bold uppercase tracking-widest">PayPal</span>
                     </div>
                  </div>
               </div>

               <div className="pt-10 flex items-center justify-between border-t border-[#EDEDED]">
                  <div className="flex items-center space-x-2 text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest font-bold">
                     <ShieldCheck size={14} />
                     <span>Pago 100% Seguro</span>
                  </div>
                  <button onClick={handleFinishOrder} className="bg-[#111111] text-white px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all shadow-lg shadow-black/5">
                     Finalizar Compra
                  </button>
               </div>
             </div>
           )}
        </div>

        {/* Sidebar Summary Section */}
        <div className="w-full lg:w-[450px]">
           <div className="bg-[#EDEDED] p-10 space-y-10 sticky top-32">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] mb-8">Pedido Eluxar</h3>
              
              <div className="space-y-6">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={`${item.productId}-${item.volume}`} className="flex space-x-4">
                       <div className="w-16 aspect-square bg-white shrink-0 overflow-hidden">
                          <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="flex justify-between items-start">
                             <h4 className="text-[10px] font-bold uppercase tracking-widest">{item.name}</h4>
                             <span className="text-[10px] font-bold">{(item.price * item.quantity).toFixed(2)}€</span>
                          </div>
                          <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-bold">{item.type} | {item.volume} × {item.quantity}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#2B2B2B]/40 font-light">Tu bolsa está vacía.</p>
                )}
              </div>

              <div className="pt-8 border-t border-[#2B2B2B]/10 space-y-4">
                 <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)}€</span>
                 </div>
                 <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span>Envío</span>
                    <span className="text-[#3A4A3F]">Gratis</span>
                 </div>
                 <div className="pt-6 border-t border-[#2B2B2B]/10 flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-widest font-bold">Total</span>
                    <span className="text-2xl font-light tracking-tight">{subtotal.toFixed(2)}€</span>
                 </div>
              </div>

              <div className="pt-10 flex flex-col space-y-4">
                 <div className="flex items-center space-x-3 text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest font-bold">
                    <Truck size={14} />
                    <span>Entrega estimada en 48-72h</span>
                 </div>
                 <div className="flex items-center space-x-3 text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest font-bold">
                    <CreditCard size={14} />
                    <span>Certificado de autenticidad incluido</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
};