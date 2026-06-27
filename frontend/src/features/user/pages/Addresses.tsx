import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { addressAPI, Address } from "../../../core/api/api";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../auth/context/AuthContext";

const emptyAddress = { label: '', street: '', barrio: '', city: '', state: '', zip: '', country: 'Colombia', isDefault: false };
const MAX_ADDRESSES = 5;

export const Addresses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => addressAPI.getAll(),
    staleTime: 60000,
    gcTime: 300000,
    enabled: !!user?.id,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>(emptyAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.label.trim()) errs.label = 'Nombre requerido';
    if (!formData.street.trim()) errs.street = 'Dirección requerida';
    if (!formData.barrio.trim()) errs.barrio = 'Barrio requerido';
    if (!formData.city.trim()) errs.city = 'Ciudad requerida';
    if (!formData.zip.trim()) errs.zip = 'Código postal requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (editingId) {
      await addressAPI.update(editingId, formData);
      toast.success('Dirección actualizada');
    } else {
      await addressAPI.create(formData);
      toast.success('Dirección añadida');
    }
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
    closeForm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await addressAPI.remove(deleteId);
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
    toast.success('Dirección eliminada');
  };

  const handleSetDefault = async (id: string) => {
    await addressAPI.setDefault(id);
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
    toast.success('Dirección predeterminada actualizada');
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({ label: address.label, street: address.street, barrio: address.barrio || '', city: address.city, state: address.state, zip: address.zip, country: address.country, isDefault: address.isDefault });
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(emptyAddress);
    setErrors({});
  };

  // Field definitions for the form
  const formFields = [
    { key: 'label', label: 'Nombre (ej: Casa)', placeholder: 'Casa', col: 'col-span-full' },
    { key: 'street', label: 'Calle y Número', placeholder: 'Calle 80 # 12-34', col: 'col-span-full' },
    { key: 'barrio', label: 'Barrio', placeholder: 'El Poblado', col: '' },
    { key: 'city', label: 'Ciudad', placeholder: 'Medellín', col: '' },
    { key: 'state', label: 'Departamento', placeholder: 'Antioquia', col: '' },
    { key: 'zip', label: 'Código Postal', placeholder: '050001', col: '' },
  ];

  return (
    <div>
      <div className="w-full">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-4">Mis Direcciones</h1>
            <p className="text-sm text-[#2B2B2B]/50 dark:text-white/50 font-light">Gestiona tus direcciones de envío</p>
          </div>
          <button
            onClick={() => { setIsFormOpen(true); setEditingId(null); setFormData(emptyAddress); setErrors({}); }}
            disabled={addresses.length >= MAX_ADDRESSES}
            className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-6 py-3 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
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
              <div key={addr.id} className={`bg-white dark:bg-[var(--bg-surface)] p-8 relative group transition-all border border-black/5 dark:border-white/10 rounded-sm hover:border-black/20 dark:hover:border-white/20 shadow-sm hover:shadow-md ${addr.isDefault ? 'ring-1 ring-[#3A4A3F] dark:ring-[var(--color-gold)]' : ''}`}>
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 text-[9px] uppercase tracking-[0.2em] font-semibold bg-[#3A4A3F] dark:bg-[var(--color-gold)] text-white dark:text-[#111111] px-2.5 py-1 rounded-sm shadow-sm flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Predeterminada
                  </span>
                )}
                <h3 className="text-sm font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                  <MapPin size={16} className="text-[#3A4A3F] dark:text-[var(--color-gold)]" />
                  {addr.label}
                </h3>
                <div className="text-sm text-[#2B2B2B]/60 dark:text-white/60 font-light space-y-1">
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zip}</p>
                  <p>{addr.country}</p>
                </div>
                <div className="flex gap-4 mt-6 pt-4 border-t border-[#2B2B2B]/10">
                  <button onClick={() => openEdit(addr)} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white transition-colors flex items-center gap-1">
                    <Pencil size={12} /> Editar
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#3A4A3F] dark:hover:text-[var(--color-gold)] transition-colors flex items-center gap-1">
                      <Star size={12} /> Predeterminar
                    </button>
                  )}
                  <button onClick={() => setDeleteId(addr.id)} className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#2B2B2B]/40 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1">
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Form Overlay — redesigned for dark mode legibility ─── */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="bg-white dark:bg-[var(--bg-surface)] w-full max-w-lg relative max-h-[90vh] overflow-y-auto rounded-sm border border-[#EDEDED] dark:border-white/10 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-[#EDEDED] dark:border-white/10">
                  <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#111111] dark:text-white">
                    {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Fields */}
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    {formFields.map(field => (
                      <div key={field.key} className={`flex flex-col space-y-2 ${field.col}`}>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={(formData as any)[field.key]}
                          onChange={e => {
                            setFormData(prev => ({ ...prev, [field.key]: e.target.value }));
                            if (errors[field.key]) setErrors(prev => { const n = { ...prev }; delete n[field.key]; return n; });
                          }}
                          placeholder={field.placeholder}
                          className={`
                            bg-[#F5F5F5] dark:bg-[var(--bg-surface)] 
                            border rounded-sm px-4 py-3
                            text-sm font-medium text-[#111111] dark:text-white
                            placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30
                            outline-none transition-all
                            ${errors[field.key]
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)]'
                            }
                          `}
                        />
                        {errors[field.key] && (
                          <span className="text-red-500 text-[9px] uppercase tracking-widest font-bold">{errors[field.key]}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    className="w-full mt-2 bg-[var(--color-gold)] hover:bg-[#b8946a] text-[#111111] py-4 text-[11px] uppercase tracking-[0.2em] font-bold transition-colors rounded-sm"
                  >
                    {editingId ? 'Actualizar Dirección' : 'Guardar Dirección'}
                  </button>
                </div>
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
    </div>
  );
};
