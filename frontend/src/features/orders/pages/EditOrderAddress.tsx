import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { ordersAPI } from "../../../core/api/api";
import { toast } from "sonner";

export const EditOrderAddress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    street: 'Calle del Perfume 42',
    city: 'Madrid',
    state: 'Madrid',
    zip: '28001',
    country: 'España',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.street.trim()) errs.street = 'Calle requerida';
    if (!formData.city.trim()) errs.city = 'Ciudad requerida';
    if (!formData.zip.trim()) errs.zip = 'Código postal requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`;
      await ordersAPI.updateAddress(id || '', fullAddress);
      toast.success('Dirección de envío actualizada');
      navigate('/order-history');
    } catch {
      toast.error('Error al actualizar dirección');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="pt-32 pb-24 bg-white min-h-screen px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/order-history" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 hover:text-[#111111] transition-colors font-bold mb-10">
          <ArrowLeft size={14} /> Volver a Mis Pedidos
        </Link>

        <h1 className="text-4xl font-light text-[#111111] tracking-tight mb-4">Modificar Dirección</h1>
        <p className="text-sm text-[#2B2B2B]/50 font-light mb-2">Pedido: <span className="font-bold text-[#111111]">{id}</span></p>
        <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-16">
          Solo disponible antes del despacho
        </p>

        <form onSubmit={handleSubmit} className="bg-[#EDEDED] p-10 space-y-8">
          {[
            { key: 'street', label: 'Calle y Número' },
            { key: 'city', label: 'Ciudad' },
            { key: 'state', label: 'Provincia/Estado' },
            { key: 'zip', label: 'Código Postal' },
            { key: 'country', label: 'País' },
          ].map(field => (
            <div key={field.key} className="flex flex-col space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">{field.label}</label>
              <div className="border-b border-[#2B2B2B]/10 py-2 focus-within:border-[#111111] transition-colors bg-white px-3">
                <input type="text" value={(formData as any)[field.key]}
                  onChange={e => { setFormData(prev => ({ ...prev, [field.key]: e.target.value })); if (errors[field.key]) setErrors(prev => { const n = { ...prev }; delete n[field.key]; return n; }); }}
                  className="bg-transparent border-none outline-none w-full text-sm font-medium" />
              </div>
              {errors[field.key] && <span className="text-red-500 text-[10px] uppercase tracking-widest">{errors[field.key]}</span>}
            </div>
          ))}

          <button type="submit" disabled={isSaving}
            className="bg-[#111111] text-white py-4 px-10 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all disabled:opacity-50 flex items-center gap-2">
            <Save size={14} />{isSaving ? 'Guardando...' : 'Actualizar Dirección'}
          </button>
        </form>
      </div>
    </main>
  );
};
