import { Link, useNavigate, useLocation } from "react-router";
import { ImageWithFallback } from "../../../shared/components/figma/ImageWithFallback";
import { formatPrice, ordersAPI, addressAPI, couponAPI, Address, Coupon } from "../../../core/api/api";
import { ChevronRight, ShieldCheck, Truck, CreditCard, Tag, CheckCircle, MapPin, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../../cart/context/CartContext";
import { useAuth } from "../../auth/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { MercadoPagoBrick } from "../components/MercadoPagoBrick";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SEOHead } from "../../../shared/components/seo/SEOHead";

type Step = 1 | 2 | 3;

const INPUT_CLS = "w-full bg-[#EDEDED] dark:bg-[var(--bg-surface)] border-none outline-none px-4 py-3.5 text-sm font-medium dark:text-white focus:ring-1 focus:ring-[#3A4A3F] transition-all placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/20";
const LABEL_CLS = "block text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60 mb-2";

export const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location }, replace: true });
    }
  }, [isAuthenticated]);

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MercadoPago
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);

  // Saved addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => addressAPI.getAll(),
    staleTime: 60000,
    gcTime: 300000,
    enabled: isAuthenticated && !!user?.id,
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find(a => a.isDefault);
      if (def) { setSelectedAddressId(def.id); setUseNewAddress(false); }
    }
  }, [addresses]);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFERENCIA' | 'CONTRAENTREGA'>('TRANSFERENCIA');

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    addressNotes: '',
    barrio: '',
    city: '',
    zip: '',
    department: '',
    country: 'Colombia',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Solo permite numéricos en campos phone y zip
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericOnly = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [name]: numericOnly }));
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const c = await couponAPI.validate(couponCode.trim().toUpperCase());
      setCoupon(c);
      toast.success(`Cupón aplicado: ${c.descuento}${c.tipo === 'PORCENTAJE' ? '%' : ' COP'} de descuento`);
    } catch {
      toast.error('Cupón inválido o expirado');
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const discount = coupon
    ? coupon.tipo === 'PORCENTAJE'
      ? Math.round(subtotal * (coupon.descuento / 100))
      : coupon.descuento
    : 0;
  const total = Math.max(0, subtotal - discount);

  const getShippingAddress = () => {
    if (!useNewAddress && selectedAddressId) {
      const a = addresses.find(x => x.id === selectedAddressId);
      if (a) return { direccion: a.street, barrio: a.barrio || '', ciudad: a.city, codigoPostal: a.zip, departamento: a.state, pais: a.country };
    }
    return { direccion: formData.address, barrio: formData.barrio, ciudad: formData.city, codigoPostal: formData.zip, departamento: formData.department, pais: formData.country };
  };

  const handleFinishOrder = async () => {
    const addr = getShippingAddress();
    if (!addr.direccion || !addr.ciudad) {
      toast.error('Completa la dirección de envío');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await ordersAPI.create({
        ...addr,
        metodoPago: paymentMethod,
        codigoDescuento: coupon?.codigo,
        notas: formData.addressNotes || '',
      });
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
      clearCart();
      navigate('/order-confirmation', { state: { order: res } });
    } catch (e: any) {
      toast.error(e.message || 'Error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  const getCheckoutTitle = () => {
    if (step === 1) return "Eluxar | Información de Envío";
    if (step === 2) return "Eluxar | Dirección de Envío";
    if (step === 3) return "Eluxar | Pago Seguro";
    return "Eluxar | Checkout";
  };

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6">
      <SEOHead title={getCheckoutTitle()} exactTitle />

      {/* Breadcrumb moved to top for consistency across all steps */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">
          <Link to="/cart" className="hover:text-[#111111] dark:hover:text-white transition-colors">Bolsa</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <span className={step >= 1 ? "text-[#111111] dark:text-white" : ""}>Información</span>
          <ChevronRight size={10} strokeWidth={3} />
          <span className={step >= 2 ? "text-[#111111] dark:text-white" : ""}>Dirección</span>
          <ChevronRight size={10} strokeWidth={3} />
          <span className={step >= 3 ? "text-[#111111] dark:text-white" : ""}>Pago</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">

        {/* ── Left: Form ── */}
        <div className="flex-1 space-y-14">

          {/* ── Step 1: Personal Info ── */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <h2 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight">Información Personal</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className={LABEL_CLS}>Nombres *</label>
                    <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={INPUT_CLS} placeholder="Juan" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={LABEL_CLS}>Apellidos *</label>
                    <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={INPUT_CLS} placeholder="García" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className={LABEL_CLS}>Correo Electrónico * <span className="normal-case tracking-normal font-normal opacity-60">(recibirás tu factura aquí)</span></label>
                    <input id="email" name="email" value={formData.email} onChange={handleChange} type="email" className={INPUT_CLS} placeholder="juan@correo.com" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="phone" className={LABEL_CLS}>Teléfono</label>
                    <input
                      id="phone" name="phone"
                      value={formData.phone}
                      onChange={handleNumericInput}
                      inputMode="numeric"
                      maxLength={15}
                      className={INPUT_CLS}
                      placeholder="3001234567"
                    />
                  </div>
                </div>

                {/* Coupon */}
                <div className="bg-[#EDEDED]/50 dark:bg-white/5 p-6 space-y-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60 flex items-center gap-2">
                    <label htmlFor="couponCode" className="flex items-center gap-2 cursor-pointer"><Tag size={12} /> Código de Descuento</label>
                  </p>
                  {coupon ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-[#3A4A3F]" />
                      <span className="text-sm font-bold dark:text-white">{coupon.codigo}</span>
                      <span className="text-sm text-[#3A4A3F] font-bold">
                        — {coupon.tipo === 'PORCENTAJE' ? `${coupon.descuento}% OFF` : `$${formatPrice(coupon.descuento)} COP OFF`}
                      </span>
                      <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="ml-auto text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60 hover:text-red-500 transition-colors">Quitar</button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input id="couponCode"
                        value={couponCode} onChange={e => setCouponCode(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleValidateCoupon()}
                        className={INPUT_CLS + " flex-1"} placeholder="ELUXAR20" />
                      <button onClick={handleValidateCoupon} disabled={couponLoading}
                        className="bg-[#111111] dark:bg-white dark:text-[#111111] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] transition-all disabled:opacity-50">
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-[#EDEDED] dark:border-white/8">
                  <button onClick={() => {
                    if (!formData.firstName || !formData.lastName || !formData.email) { toast.error('Completa tu nombre, apellido y correo'); return; }
                    setStep(2);
                  }} 
                  disabled={isSubmitting || isCreatingPreference}
                  className="bg-[#111111] dark:bg-white dark:text-[#111111] text-white px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Procesando...' : 'Continuar →'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Address ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <h2 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight">Dirección de Envío</h2>

                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-3">
                    <p className={LABEL_CLS + " flex items-center gap-2"}><MapPin size={12} /> Direcciones Guardadas</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <button key={addr.id} onClick={() => { setSelectedAddressId(addr.id); setUseNewAddress(false); }}
                          className={`text-left p-5 border transition-all ${!useNewAddress && selectedAddressId === addr.id ? 'border-[#3A4A3F] bg-[#3A4A3F]/5' : 'border-[#EDEDED] dark:border-white/10 hover:border-[#3A4A3F]/50'}`}>
                          <p className="text-[10px] uppercase tracking-widest font-bold dark:text-white mb-1">{addr.label}</p>
                          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light">{addr.street}</p>
                          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light">{addr.city}, {addr.state}</p>
                        </button>
                      ))}
                      <button onClick={() => setUseNewAddress(true)}
                        className={`text-left p-5 border border-dashed transition-all ${useNewAddress ? 'border-[#3A4A3F] bg-[#3A4A3F]/5' : 'border-[#EDEDED] dark:border-white/10 hover:border-[#3A4A3F]/50'}`}>
                        <p className="text-[10px] uppercase tracking-widest font-bold dark:text-white">+ Nueva dirección</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* New address form */}
                <AnimatePresence>
                  {(useNewAddress || addresses.length === 0) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                      <div className="md:col-span-2">
                        <label htmlFor="address" className={LABEL_CLS}>Dirección (Calle y Número) *</label>
                        <input id="address" name="address" value={formData.address} onChange={handleChange} className={INPUT_CLS} placeholder="Calle 80 # 12-34" />
                      </div>
                      <div>
                        <label htmlFor="barrio" className={LABEL_CLS}>Barrio *</label>
                        <input id="barrio" name="barrio" value={formData.barrio} onChange={handleChange} className={INPUT_CLS} placeholder="El Poblado" />
                      </div>
                      <div>
                        <label htmlFor="city" className={LABEL_CLS}>Ciudad *</label>
                        <input id="city" name="city" value={formData.city} onChange={handleChange} className={INPUT_CLS} placeholder="Medellín" />
                      </div>
                      <div>
                        <label htmlFor="department" className={LABEL_CLS}>Departamento</label>
                        <input id="department" name="department" value={formData.department} onChange={handleChange} className={INPUT_CLS} placeholder="Antioquia" />
                      </div>
                      <div>
                        <label htmlFor="zip" className={LABEL_CLS}>Código Postal</label>
                        <input
                          id="zip" name="zip"
                          value={formData.zip}
                          onChange={handleNumericInput}
                          inputMode="numeric"
                          maxLength={6}
                          className={INPUT_CLS}
                          placeholder="050001"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="addressNotes" className={LABEL_CLS}>
                          Notas adicionales de entrega
                          <span className="normal-case tracking-normal font-normal opacity-60 ml-1">(apartamento, torre, referencias...)</span>
                        </label>
                        <textarea
                          id="addressNotes" name="addressNotes"
                          value={formData.addressNotes}
                          onChange={handleChange}
                          rows={3}
                          maxLength={300}
                          className={INPUT_CLS + " resize-none"}
                          placeholder="Ej: Apto 402, Torre B, timbre no funciona, dejar con portería..."
                        />
                        <p className="text-right text-[9px] text-[#2B2B2B]/30 dark:text-white/20 mt-1 font-bold tracking-widest uppercase">
                          {formData.addressNotes.length}/300
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="country" className={LABEL_CLS}>País</label>
                        <div className="relative">
                          <select id="country" name="country" value={formData.country} onChange={handleChange}
                            className={INPUT_CLS + " appearance-none cursor-pointer"}>
                            <option value="Colombia">Colombia</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#2B2B2B]/40" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-6 border-t border-[#EDEDED] dark:border-white/8">
                  <button onClick={() => setStep(1)} disabled={isSubmitting || isCreatingPreference} className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/50 dark:text-white/50 hover:text-[#111111] dark:hover:text-white transition-colors disabled:opacity-50">
                    ← Anterior
                  </button>
                  <button onClick={() => {
                    const addr = getShippingAddress();
                    if (!addr.direccion || !addr.ciudad) { toast.error('Completa la dirección y ciudad'); return; }
                    setStep(3);
                  }} 
                  disabled={isSubmitting || isCreatingPreference}
                  className="bg-[#111111] dark:bg-white dark:text-[#111111] text-white px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Procesando...' : 'Continuar al Pago →'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Pago con Mercado Pago ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <h2 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight">Pago Seguro</h2>

                {/* Branding de seguridad */}
                <div className="flex flex-wrap items-center gap-6 py-4 border-y border-[#EDEDED] dark:border-white/8">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/50 dark:text-white/40">
                    <ShieldCheck size={14} className="text-[#3A4A3F] dark:text-[#A5BAA8]" />
                    <span>Pago 100% Seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/50 dark:text-white/40">
                    <CreditCard size={14} className="text-[#3A4A3F] dark:text-[#A5BAA8]" />
                    <span>Tarjeta Crédito / Débito / PSE</span>
                  </div>
                </div>

                {/* Checkout Brick de Mercado Pago */}
                {!preferenceId ? (
                  <div className="py-8 flex flex-col items-center gap-4">
                    <button
                      onClick={async () => {
                        const addr = getShippingAddress();
                        if (!addr.direccion || !addr.ciudad) {
                          toast.error('Completa la dirección de envío antes de pagar');
                          return;
                        }
                        setIsCreatingPreference(true);
                        try {
                          const res = await ordersAPI.create({
                            ...addr,
                            metodoPago: 'MERCADOPAGO',
                            codigoDescuento: coupon?.codigo,
                            notas: formData.addressNotes || '',
                          });
                          queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
                          setPreferenceId(res.preferenceId);
                        } catch (e: any) {
                          toast.error(e.message || 'Error al iniciar el pago. Intenta de nuevo.');
                        } finally {
                          setIsCreatingPreference(false);
                        }
                      }}
                      disabled={isCreatingPreference}
                      className="w-full bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isCreatingPreference ? (
                        <><span className="animate-pulse">Preparando pago seguro...</span></>
                      ) : (
                        <><CreditCard size={16} strokeWidth={1.5} /> Proceder al Pago con Mercado Pago</>
                      )}
                    </button>
                    <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/30 dark:text-white/20 font-bold">
                      Serás redirigido al módulo de pago seguro
                    </p>
                  </div>
                ) : (
                  <MercadoPagoBrick
                    preferenceId={preferenceId}
                    amount={total}
                    onSuccess={() => {
                      clearCart();
                      navigate('/checkout/success');
                    }}
                    onError={() => toast.error('Error en el procesamiento del pago')}
                  />
                )}

                <div className="pt-4">
                  <button onClick={() => setStep(2)} disabled={isSubmitting || isCreatingPreference} className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/50 dark:text-white/50 hover:text-[#111111] dark:hover:text-white transition-colors disabled:opacity-50">
                    ← Volver a Dirección
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-[#EDEDED] dark:bg-[#141414] p-8 space-y-8 sticky top-28">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white">Pedido Eluxar</h3>

            <div className="space-y-5">
              {items.length > 0 ? items.map(item => (
                <div key={`${item.productId}-${item.volume}`} className="flex gap-4">
                  <div className="w-16 h-16 bg-white dark:bg-[var(--bg-surface)] shrink-0 overflow-hidden">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest dark:text-white leading-tight">{item.name}</h4>
                      <span className="text-[10px] font-bold dark:text-white whitespace-nowrap">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/40 font-bold">{item.volume} × {item.quantity}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-[#2B2B2B]/40 dark:text-white/40">Tu bolsa está vacía.</p>
              )}
            </div>

            <div className="pt-6 border-t border-[#2B2B2B]/10 dark:border-white/10 space-y-3">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold dark:text-white">
                <span>Subtotal</span>
                <span>${formatPrice(subtotal)} COP</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F]">
                  <span>Descuento ({coupon.codigo})</span>
                  <span>− ${formatPrice(discount)} COP</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold dark:text-white">
                <span>Envío</span>
                <span className="text-[#3A4A3F]">Gratis</span>
              </div>
              <div className="pt-4 border-t border-[#2B2B2B]/10 dark:border-white/10 flex justify-between items-end dark:text-white">
                <span className="text-[10px] uppercase tracking-widest font-bold">Total</span>
                <span className="text-2xl font-light tracking-tight">${formatPrice(total)} COP</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest font-bold">
                <Truck size={13} /> <span>Entrega estimada 48–72h</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest font-bold">
                <CreditCard size={13} /> <span>Certificado de autenticidad</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};