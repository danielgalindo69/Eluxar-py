import { useState, useEffect } from "react";
import { bannersAPI, Banner } from "../../../core/api/api";
import { Plus, GripVertical, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', link: '', active: true, order: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { bannersAPI.getAll().then(d => { setBanners(d.sort((a, b) => a.order - b.order)); setIsLoading(false); }); }, []);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.imageUrl.trim()) { toast.error('Título e imagen son obligatorios'); return; }
    if (editingId) {
      await bannersAPI.update(editingId, formData);
      setBanners(prev => prev.map(b => b.id === editingId ? { ...b, ...formData } : b));
      toast.success('Banner actualizado');
    } else {
      const newBanner = await bannersAPI.create({ ...formData, order: banners.length + 1 });
      setBanners(prev => [...prev, newBanner as Banner]);
      toast.success('Banner creado');
    }
    closeForm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await bannersAPI.remove(deleteId);
    setBanners(prev => prev.filter(b => b.id !== deleteId));
    setDeleteId(null);
    toast.success('Banner eliminado');
  };

  const handleToggle = async (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    await bannersAPI.update(id, { active: !banner.active });
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
    toast.success(banner.active ? 'Banner desactivado' : 'Banner activado');
  };

  const moveOrder = (id: string, direction: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === banners.length - 1)) return;
    const newBanners = [...banners];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newBanners[idx], newBanners[swapIdx]] = [newBanners[swapIdx], newBanners[idx]];
    newBanners.forEach((b, i) => b.order = i + 1);
    setBanners(newBanners);
    bannersAPI.reorder(newBanners.map(b => b.id));
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({ title: banner.title, imageUrl: banner.imageUrl, link: banner.link, active: banner.active, order: banner.order });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setFormData({ title: '', imageUrl: '', link: '', active: true, order: 0 }); };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] tracking-tight">Banners</h1>
          <p className="text-sm text-[#2B2B2B]/60 mt-2">Gestión de banners promocionales</p>
        </div>
        <button onClick={() => { closeForm(); setShowForm(true); }} className="bg-[#111111] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] transition-colors flex items-center gap-2">
          <Plus size={14} /> Nuevo Banner
        </button>
      </div>

      {isLoading ? <p className="text-sm text-[#2B2B2B]/40">Cargando...</p> : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div key={banner.id} className={`bg-white border border-[#EDEDED] p-4 flex items-center gap-4 ${!banner.active ? 'opacity-50' : ''}`}>
              <div className="flex flex-col gap-1">
                <button onClick={() => moveOrder(banner.id, 'up')} className="text-[#2B2B2B]/30 hover:text-[#111111]"><GripVertical size={16} /></button>
              </div>
              <div className="w-20 h-14 bg-[#EDEDED] overflow-hidden shrink-0">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{banner.title}</p>
                <p className="text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest">Orden: {banner.order} • {banner.link}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => handleToggle(banner.id)} className="text-[#2B2B2B]/40 hover:text-[#111111]">
                  {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(banner)} className="text-[#2B2B2B]/40 hover:text-[#111111]"><Pencil size={16} /></button>
                <button onClick={() => setDeleteId(banner.id)} className="text-[#2B2B2B]/40 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="bg-white w-full max-w-lg p-10 space-y-6 relative">
              <button onClick={closeForm} className="absolute top-4 right-4 text-[#2B2B2B]/40 hover:text-[#111111]"><X size={20} /></button>
              <h2 className="text-lg font-light">{editingId ? 'Editar Banner' : 'Nuevo Banner'}</h2>

              {[
                { key: 'title', label: 'Título', placeholder: 'Nombre del banner' },
                { key: 'imageUrl', label: 'URL de Imagen', placeholder: 'https://...' },
                { key: 'link', label: 'Enlace', placeholder: '/catalog' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">{f.label}</label>
                  <input type="text" value={(formData as any)[f.key]} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} className="w-full border border-[#EDEDED] px-4 py-3 text-sm outline-none" />
                </div>
              ))}

              {formData.imageUrl && (
                <div className="h-40 bg-[#EDEDED] overflow-hidden"><img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" /></div>
              )}

              <button onClick={handleSave} className="w-full bg-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F]">
                {editingId ? 'Actualizar' : 'Crear Banner'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)} title="Eliminar Banner"
        description="¿Estás seguro de eliminar este banner? Esta acción no se puede deshacer." onConfirm={handleDelete} variant="destructive" confirmLabel="Eliminar" />
    </div>
  );
};
