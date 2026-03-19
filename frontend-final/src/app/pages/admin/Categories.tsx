import { useState, useEffect } from "react";
import { categoriesAPI, Category } from "../../services/api";
import { Plus, Pencil, Trash2, X, Tag, Building2 } from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'category' | 'brand'>('category');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'category' as 'category' | 'brand' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { categoriesAPI.getAll().then(d => { setCategories(d); setIsLoading(false); }); }, []);

  const filtered = categories.filter(c => c.type === activeTab);

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (editingId) {
      await categoriesAPI.update(editingId, formData);
      setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } : c));
      toast.success(activeTab === 'category' ? 'Categoría actualizada' : 'Marca actualizada');
    } else {
      const newCat = await categoriesAPI.create(formData);
      setCategories(prev => [...prev, newCat as Category]);
      toast.success(activeTab === 'category' ? 'Categoría creada' : 'Marca creada');
    }
    closeForm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await categoriesAPI.remove(deleteId);
    if (!result.success) { toast.error(result.message || 'Error al eliminar'); setDeleteId(null); return; }
    setCategories(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
    toast.success('Eliminado correctamente');
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, type: cat.type });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setFormData({ name: '', type: activeTab }); };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] tracking-tight">Categorías y Marcas</h1>
          <p className="text-sm text-[#2B2B2B]/60 mt-2">Gestión de la taxonomía de productos</p>
        </div>
        <button onClick={() => { setFormData({ name: '', type: activeTab }); setShowForm(true); setEditingId(null); }}
          className="bg-[#111111] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] transition-colors flex items-center gap-2">
          <Plus size={14} /> {activeTab === 'category' ? 'Nueva Categoría' : 'Nueva Marca'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EDEDED]">
        <button onClick={() => setActiveTab('category')}
          className={`pb-4 px-6 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${activeTab === 'category' ? 'border-b-2 border-[#111111] text-[#111111]' : 'text-[#2B2B2B]/30'}`}>
          <Tag size={14} /> Categorías
        </button>
        <button onClick={() => setActiveTab('brand')}
          className={`pb-4 px-6 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${activeTab === 'brand' ? 'border-b-2 border-[#111111] text-[#111111]' : 'text-[#2B2B2B]/30'}`}>
          <Building2 size={14} /> Marcas
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#EDEDED]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EDEDED]">
              <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 px-6 py-4">Nombre</th>
              <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 px-6 py-4">Productos</th>
              <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40">Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40">No hay {activeTab === 'category' ? 'categorías' : 'marcas'} aún</td></tr>
            ) : filtered.map(cat => (
              <tr key={cat.id} className="border-b border-[#EDEDED] last:border-0 hover:bg-[#EDEDED]/30">
                <td className="px-6 py-4 text-sm font-bold">{cat.name}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold bg-[#EDEDED] px-3 py-1">{cat.productCount} productos</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(cat)} className="text-[#2B2B2B]/40 hover:text-[#111111]"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteId(cat.id)} className="text-[#2B2B2B]/40 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="bg-white w-full max-w-md p-10 space-y-6 relative">
              <button onClick={closeForm} className="absolute top-4 right-4 text-[#2B2B2B]/40 hover:text-[#111111]"><X size={20} /></button>
              <h2 className="text-lg font-light">{editingId ? 'Editar' : 'Crear'} {activeTab === 'category' ? 'Categoría' : 'Marca'}</h2>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Nombre</label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-[#EDEDED] px-4 py-3 text-sm outline-none" placeholder={activeTab === 'category' ? 'Extrait de Parfum' : 'Nombre de la marca'} />
              </div>
              <button onClick={handleSave} className="w-full bg-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F]">
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)} title="Eliminar"
        description="¿Estás seguro? Si tiene productos asociados, no se podrá eliminar." onConfirm={handleDelete} variant="destructive" confirmLabel="Eliminar" />
    </div>
  );
};
