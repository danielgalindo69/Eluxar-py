import { useState, useEffect } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { addressAPI, Address } from "../../../core/api/api";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const emptyAddress = { label: '', street: '', city: '', state: '', zip: '', country: 'España', isDefault: false };

export const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>(emptyAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadAddresses(); }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    const data = await addressAPI.getAll();
    setAddresses(data);
    setIsLoading(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.label.trim()) errs.label = 'Nombre requerido';
    if (!formData.street.trim()) errs.street = 'Calle requerida';
    if (!formData.city.trim()) errs.city = 'Ciudad requerida';
    if (!formData.zip.trim()) errs.zip = 'Código postal requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (editingId) {
      await addressAPI.update(editingId, formData);
      setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
      toast.success('Dirección actualizada');
    } else {
      const newAddr = await addressAPI.create(formData);
      setAddresses(prev => [...prev, newAddr]);
      toast.success('Dirección añadida');
    }
    closeForm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await addressAPI.remove(deleteId);
    setAddresses(prev => prev.filter(a => a.id !== deleteId));
    setDeleteId(null);
    toast.success('Dirección eliminada');
  };

  const handleSetDefault = async (id: string) => {
    await addressAPI.setDefault(id);
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    toast.success('Dirección predeterminada actualizada');
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({ label: address.label, street: address.street, city: address.city, state: address.state, zip: address.zip, country: address.country, isDefault: address.isDefault });
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptyAddress);
    setErrors({});
  };

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[#161616] min-h-screen px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-4">Mis Direcciones</h1>
            <p className="text-sm text-[#2B2B2B]/50 dark:text-white/50 font-light">Gestiona tus direcciones de envío</p>
          </div>
          <button onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData(emptyAddress); setErrors({}); }}
            className="bg-[#111111] text-white px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#3A4A3F] transition-colors flex items-center gap-2">
            <Plus size={14} /> Nueva Dirección
          </button>
        </div>

        {/* Address List */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-[#2B2B2B]/40 dark:text-white/40 text-sm font-light uppercase tracking-widest">Cargando direcciones...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <MapPin size={48} className="mx-auto text-[#2B2B2B]/20" />
            <p className="text-[#2B2B2B]/40 dark:text-white/40 text-sm font-light uppercase tracking-widest">No tienes direcciones guardadas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(addr => (
              <div key={addr.id} className={`bg-[#EDEDED] dark:bg-white/5 p-8 relative group transition-all ${addr.isDefault ? 'ring-2 ring-[#3A4A3F]' : ''}`}>
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 text-[11px] uppercase tracking-[0.2em] font-semibold text-[#3A4A3F] flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Predeterminada
                  </span>
                )}
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">{addr.label}</h3>
                <div className="text-sm text-[#2B2B2B]/60 dark:text-white/60 font-light space-y-1">
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zip}</p>
                  <p>{addr.country}</p>
                </div>
                <div className="flex gap-4 mt-6 pt-4 border-t border-[#2B2B2B]/10">
                  <button onClick={() => openEdit(addr)} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white flex items-center gap-1">
                    <Pencil size={12} /> Editar
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#3A4A3F] flex items-center gap-1">
                      <Star size={12} /> Predeterminar
                    </button>
                  )}
                  <button onClick={() => setDeleteId(addr.id)} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#2B2B2B]/40 dark:text-white/40 hover:text-red-500 flex items-center gap-1">
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Overlay */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="bg-white dark:bg-[#161616] w-full max-w-lg p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={closeForm} className="absolute top-4 right-4 text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white"><X size={20} /></button>
                <h2 className="text-lg font-light text-[#111111] dark:text-white tracking-tight">{editingId ? 'Editar Dirección' : 'Nueva Dirección'}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { key: 'label', label: 'Nombre (ej: Casa)', placeholder: 'Casa', col: 'col-span-full' },
                    { key: 'street', label: 'Calle y Número', placeholder: 'Calle Mayor 10, 3ºA', col: 'col-span-full' },
                    { key: 'city', label: 'Ciudad', placeholder: 'Madrid', col: '' },
                    { key: 'state', label: 'Provincia/Estado', placeholder: 'Madrid', col: '' },
                    { key: 'zip', label: 'Código Postal', placeholder: '28001', col: '' },
                    { key: 'country', label: 'País', placeholder: 'España', col: '' },
                  ].map(field => (
                    <div key={field.key} className={`flex flex-col space-y-1 ${field.col}`}>
                      <label className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#2B2B2B]/40 dark:text-white/40">{field.label}</label>
                      <div className="border-b border-[#2B2B2B]/20 dark:border-white/20 py-1.5 focus-within:border-[#111111] transition-colors">
                        <input type="text" value={(formData as any)[field.key]}
                          onChange={e => { setFormData(prev => ({ ...prev, [field.key]: e.target.value })); if (errors[field.key]) setErrors(prev => { const n = { ...prev }; delete n[field.key]; return n; }); }}
                          placeholder={field.placeholder}
                          className="bg-transparent border-none outline-none w-full text-sm dark:text-white font-medium placeholder:text-[#2B2B2B]/20" />
                      </div>
                      {errors[field.key] && <span className="text-red-500 text-[10px] uppercase tracking-widest mt-1">{errors[field.key]}</span>}
                    </div>
                  ))}
                </div>

                <button onClick={handleSave}
                  className="w-full bg-[#111111] text-white py-4 mt-2 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#3A4A3F] transition-all">
                  {editingId ? 'Actualizar Dirección' : 'Guardar Dirección'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Eliminar Dirección"
          description="¿Estás seguro de que deseas eliminar esta dirección? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </main>
  );
};
