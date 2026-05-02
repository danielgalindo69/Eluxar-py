import { useState, useEffect } from "react";
import { inventoryAPI, InventoryMovement, InventoryItem } from "../../../core/api/api";
import { Plus, ArrowDownCircle, ArrowUpCircle, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const tableWrap = "bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8";
const thCls = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 px-6 py-4";

export const Inventory = () => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [inventario, setInventario] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ varianteId: '', stockActual: '', stockMinimo: '', motivo: '' });

  useEffect(() => {
    Promise.all([
      inventoryAPI.getMovements(),
      inventoryAPI.getAll(),
    ]).then(([movs, inv]) => {
      setMovements(movs);
      setInventario(inv);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
      toast.error('Error al cargar datos de inventario');
    });
  }, []);

  const handleSubmit = async () => {
    if (!formData.varianteId || !formData.stockActual) {
      toast.error('Selecciona una variante e ingresa el stock');
      return;
    }

    try {
      await inventoryAPI.update(formData.varianteId, {
        stockActual: parseInt(formData.stockActual),
        stockMinimo: formData.stockMinimo ? parseInt(formData.stockMinimo) : undefined,
        motivo: formData.motivo || 'Ajuste manual desde panel admin',
      });

      // Recargar datos
      const [movs, inv] = await Promise.all([
        inventoryAPI.getMovements(),
        inventoryAPI.getAll(),
      ]);
      setMovements(movs);
      setInventario(inv);

      setFormData({ varianteId: '', stockActual: '', stockMinimo: '', motivo: '' });
      setShowForm(false);
      toast.success('Stock actualizado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar stock');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Inventario</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Registro de movimientos de almacén</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#111111] dark:bg-white dark:text-[#111111] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors flex items-center gap-2">
          <Plus size={14} /> Ajustar Stock
        </button>
      </div>

      {/* Table */}
      <div className={tableWrap}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED]/50 dark:bg-white/5">
                {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Usuario', 'Motivo'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40 dark:text-white/30">Cargando...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40 dark:text-white/30">Sin movimientos registrados</td></tr>
              ) : movements.map(m => (
                <tr key={m.id} className="border-b border-[#EDEDED] dark:border-white/8 last:border-0 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{new Date(m.fecha).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#111111] dark:text-white">{m.productoNombre} — {m.tamanoMl}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${m.tipo === 'ENTRADA' ? 'text-[#3A4A3F]' : 'text-red-400'}`}>
                      {m.tipo === 'ENTRADA' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />} {m.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#111111] dark:text-white">{m.tipo === 'ENTRADA' ? '+' : '-'}{m.cantidad}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40">{m.usuario}</td>
                  <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40 max-w-[200px] truncate">{m.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ajustar Stock Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg p-10 space-y-6 relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white"><X size={20} /></button>
              <h2 className="text-lg font-light text-[#111111] dark:text-white">Ajustar Stock de Variante</h2>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Variante *</label>
                <select value={formData.varianteId} onChange={e => setFormData(p => ({ ...p, varianteId: e.target.value }))}
                  className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none">
                  <option value="">Seleccionar variante</option>
                  {inventario.map(inv => (
                    <option key={inv.varianteId} value={inv.varianteId}>
                      {inv.productoNombre} — {inv.tamanoMl}ml (SKU: {inv.sku}) [Stock: {inv.stockActual}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Nuevo Stock Actual *</label>
                  <input type="number" min="0" value={formData.stockActual} onChange={e => setFormData(p => ({ ...p, stockActual: e.target.value }))}
                    className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Stock Mínimo</label>
                  <input type="number" min="0" value={formData.stockMinimo} onChange={e => setFormData(p => ({ ...p, stockMinimo: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Motivo</label>
                <textarea value={formData.motivo} onChange={e => setFormData(p => ({ ...p, motivo: e.target.value }))} rows={3}
                  placeholder="Ej: Llegó nuevo lote del proveedor"
                  className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none resize-none" />
              </div>

              <button onClick={handleSubmit} className="w-full bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-all">
                Actualizar Stock
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
