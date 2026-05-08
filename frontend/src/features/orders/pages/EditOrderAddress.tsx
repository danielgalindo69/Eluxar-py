import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import { ordersAPI, addressAPI, Address } from "../../../core/api/api";
import { toast } from "sonner";
import { motion } from "motion/react";

export const EditOrderAddress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  
  const [mode, setMode] = useState<'select' | 'new'>('select');
  const [selectedAddressStr, setSelectedAddressStr] = useState<string>('');
  
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Colombia',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await addressAPI.getAll();
        setAddresses(data);
        if (data.length > 0) {
          setMode('select');
        } else {
          setMode('new');
        }
      } catch (err) {
        setMode('new');
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  const validate = () => {
    if (mode === 'select') {
      if (!selectedAddressStr) {
        toast.error('Selecciona una dirección');
        return false;
      }
      return true;
    }
    
    const errs: Record<string, string> = {};
    if (!formData.street.trim()) errs.street = 'Calle requerida';
    if (!formData.city.trim()) errs.city = 'Ciudad requerida';
    if (!formData.state.trim()) errs.state = 'Departamento/Estado requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      let finalAddress = '';
      if (mode === 'select') {
        finalAddress = selectedAddressStr;
      } else {
        const zipPart = formData.zip.trim() ? ` ${formData.zip}` : '';
        finalAddress = `${formData.street}, ${formData.city}, ${formData.state}${zipPart}, ${formData.country}`.trim();
      }
      
      await ordersAPI.updateAddress(id || '', finalAddress);
      toast.success('Dirección de envío actualizada correctamente');
      navigate('/profile/orders');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar dirección. El pedido puede estar bloqueado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[#161616] min-h-screen px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/profile/orders" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors font-bold mb-10">
          <ArrowLeft size={14} /> Volver a Mis Pedidos
        </Link>

        <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-4">Modificar Dirección</h1>
        <p className="text-sm text-[#2B2B2B]/50 dark:text-white/50 font-light mb-2">Pedido: <span className="font-bold text-[#111111] dark:text-white">{id}</span></p>
        <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-10">
          Solo disponible antes del despacho
        </p>

        {isLoadingAddresses ? (
          <div className="py-10 text-center text-[#2B2B2B]/40 dark:text-white/40 text-sm uppercase tracking-widest">
            Cargando direcciones...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex border-b border-[#EDEDED] dark:border-white/10">
              <button
                type="button"
                className={`flex-1 py-4 text-[10px] uppercase tracking-widest font-bold transition-colors border-b-2 ${mode === 'select' ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white' : 'border-transparent text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white'}`}
                onClick={() => setMode('select')}
                disabled={addresses.length === 0}
              >
                Mis Direcciones {addresses.length === 0 && '(Vacío)'}
              </button>
              <button
                type="button"
                className={`flex-1 py-4 text-[10px] uppercase tracking-widest font-bold transition-colors border-b-2 ${mode === 'new' ? 'border-[#111111] dark:border-white text-[#111111] dark:text-white' : 'border-transparent text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white'}`}
                onClick={() => setMode('new')}
              >
                Nueva Dirección
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#EDEDED]/50 dark:bg-white/5 p-8 lg:p-10 space-y-8">
              {mode === 'select' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {addresses.map(addr => {
                    const zipPart = addr.zip ? ` ${addr.zip}` : '';
                    const fullStr = `${addr.street}, ${addr.city}, ${addr.state}${zipPart}, ${addr.country}`;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressStr(fullStr)}
                        className={`p-5 cursor-pointer border transition-colors ${selectedAddressStr === fullStr ? 'border-[#111111] dark:border-white bg-white dark:bg-[#1A1A1A]' : 'border-[#EDEDED] dark:border-white/10 bg-transparent hover:border-[#111111]/30 dark:hover:border-white/30'}`}
                      >
                        <div className="flex items-start gap-4">
                          <MapPin size={18} className={selectedAddressStr === fullStr ? 'text-[#111111] dark:text-white' : 'text-[#2B2B2B]/40 dark:text-white/40'} />
                          <div>
                            <p className="text-sm font-bold text-[#111111] dark:text-white uppercase tracking-widest mb-1">{addr.label || 'Dirección'}</p>
                            <p className="text-sm text-[#2B2B2B]/80 dark:text-white/70 font-light">{addr.street}</p>
                            <p className="text-sm text-[#2B2B2B]/80 dark:text-white/70 font-light">{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="text-sm text-[#2B2B2B]/80 dark:text-white/70 font-light">{addr.country}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {[
                    { key: 'street', label: 'Calle, Número y Detalles' },
                    { key: 'city', label: 'Ciudad' },
                    { key: 'state', label: 'Departamento / Provincia' },
                    { key: 'zip', label: 'Código Postal (Opcional)' },
                    { key: 'country', label: 'País' },
                  ].map(field => (
                    <div key={field.key} className="flex flex-col space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">{field.label}</label>
                      <div className="border-b border-[#2B2B2B]/10 dark:border-white/10 py-2 focus-within:border-[#111111] dark:focus-within:border-white transition-colors bg-white dark:bg-[#161616] px-3">
                        <input type="text" value={(formData as any)[field.key]}
                          onChange={e => { setFormData(prev => ({ ...prev, [field.key]: e.target.value })); if (errors[field.key]) setErrors(prev => { const n = { ...prev }; delete n[field.key]; return n; }); }}
                          className="bg-transparent border-none outline-none w-full text-sm dark:text-white font-medium" />
                      </div>
                      {errors[field.key] && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors[field.key]}</span>}
                    </div>
                  ))}
                </motion.div>
              )}

              <button type="submit" disabled={isSaving}
                className="w-full sm:w-auto bg-[#111111] dark:bg-white text-white dark:text-[#111111] py-4 px-10 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={14} />{isSaving ? 'Guardando...' : 'Confirmar Nueva Dirección'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
};
