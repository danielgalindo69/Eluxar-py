import { useState, useEffect } from "react";
import { inventoryAPI, InventoryMovement } from "../../../core/api/api";
import { PRODUCTS } from "../../products/types/products";
import { Plus, ArrowDownCircle, ArrowUpCircle, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const tableWrap = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8";
const thCls = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 px-6 py-4";

export const Inventory = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterProduct, setFilterProduct] = useState('');
  const [formData, setFormData] = useState({ productId: '', type: 'Entrada' as 'Entrada' | 'Salida', quantity: '', notes: '' });

  useEffect(() => { inventoryAPI.getMovements().then(d => { setMovements(d); setIsLoading(false); }); }, []);

  const filtered = filterProduct ? movements.filter(m => m.productId === filterProduct) : movements;

  const handleSubmit = async () => {
    if (!formData.productId || !formData.quantity) { toast.error('Completa todos los campos obligatorios'); return; }
    const product = PRODUCTS.find(p => p.id === formData.productId);
    const newMovement = await inventoryAPI.addMovement({
      productId: formData.productId, productName: product?.name || '', type: formData.type,
      quantity: parseInt(formData.quantity), date: new Date().toISOString().split('T')[0],
      user: 'Admin', notes: formData.notes,
    });
    setMovements(prev => [newMovement, ...prev]);
    setFormData({ productId: '', type: 'Entrada', quantity: '', notes: '' });
    setShowForm(false);
    toast.success('Movimiento registrado');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Inventario</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Registro de movimientos de almacén</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#111111] dark:bg-white dark:text-[#111111] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors flex items-center gap-2">
          <Plus size={14} /> Nuevo Movimiento
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
          className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/10 text-[#111111] dark:text-white px-4 py-2 text-sm outline-none">
          <option value="">Todos los productos</option>
          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={tableWrap}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED]/50 dark:bg-white/5">
                {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Usuario', 'Notas'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40 dark:text-white/30">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40 dark:text-white/30">Sin movimientos</td></tr>
              ) : filtered.map(m => (
                <tr key={m.id} className="border-b border-[#EDEDED] dark:border-white/8 last:border-0 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{m.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#111111] dark:text-white">{m.productName}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${m.type === 'Entrada' ? 'text-[#3A4A3F]' : 'text-red-400'}`}>
                      {m.type === 'Entrada' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />} {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#111111] dark:text-white">{m.type === 'Entrada' ? '+' : '-'}{m.quantity}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40">{m.user}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40 max-w-[200px] truncate">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Movement Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg p-10 space-y-6 relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white"><X size={20} /></button>
              <h2 className="text-lg font-light text-[#111111] dark:text-white">Registrar Movimiento</h2>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Producto *</label>
                <select value={formData.productId} onChange={e => setFormData(p => ({ ...p, productId: e.target.value }))}
                  className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none">
                  <option value="">Seleccionar producto</option>
                  {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Tipo *</label>
                <div className="flex gap-4">
                  {(['Entrada', 'Salida'] as const).map(t => (
                    <button key={t} onClick={() => setFormData(p => ({ ...p, type: t }))}
                      className={`flex-1 py-3 border text-[10px] uppercase tracking-widest font-bold transition-colors ${formData.type === t ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] border-[#111111] dark:border-white' : 'border-[#EDEDED] dark:border-white/15 dark:text-white hover:border-[#111111] dark:hover:border-white'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Cantidad *</label>
                <input type="number" min="1" value={formData.quantity} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))}
                  className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Notas</label>
                <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3}
                  className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none resize-none" />
              </div>

              <button onClick={handleSubmit} className="w-full bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-all">
                Registrar Movimiento
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
