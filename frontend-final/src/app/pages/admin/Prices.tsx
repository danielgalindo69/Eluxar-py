import { useState } from "react";
import { PRODUCTS } from "../../types/products";
import { Save, Check } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export const Prices = () => {
  const [prices, setPrices] = useState<Record<string, Record<string, string>>>(
    Object.fromEntries(PRODUCTS.map(p => [p.id, Object.fromEntries(p.variants.map(v => [v.volume, String(v.price)]))]))
  );
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [confirmSave, setConfirmSave] = useState<{ productId: string; volume: string; price: string } | null>(null);
  const [savedCells, setSavedCells] = useState<Record<string, boolean>>({});

  const handlePriceChange = (productId: string, volume: string, value: string) => {
    setPrices(prev => ({ ...prev, [productId]: { ...prev[productId], [volume]: value } }));
  };

  const handleSave = () => {
    if (!confirmSave) return;
    const val = parseFloat(confirmSave.price);
    if (isNaN(val) || val <= 0) { toast.error('El precio debe ser un valor positivo'); setConfirmSave(null); return; }
    const key = `${confirmSave.productId}-${confirmSave.volume}`;
    setSavedCells(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setSavedCells(prev => { const n = { ...prev }; delete n[key]; return n; }), 2000);
    toast.success('Precio actualizado');
    setEditingCell(null);
    setConfirmSave(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] tracking-tight">Precios</h1>
        <p className="text-sm text-[#2B2B2B]/60 mt-2">Actualización de precios por producto y variante</p>
      </div>

      <div className="bg-white border border-[#EDEDED]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED]">
                {['Producto', 'Marca', 'Variante', 'Precio Actual', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(product =>
                product.variants.map((variant, vi) => {
                  const cellKey = `${product.id}-${variant.volume}`;
                  const isEditing = editingCell === cellKey;
                  const isSaved = savedCells[cellKey];
                  return (
                    <tr key={cellKey} className="border-b border-[#EDEDED] last:border-0 hover:bg-[#EDEDED]/30">
                      {vi === 0 && <td rowSpan={product.variants.length} className="px-6 py-4 text-sm font-bold align-top">{product.name}</td>}
                      {vi === 0 && <td rowSpan={product.variants.length} className="px-6 py-4 text-sm text-[#2B2B2B]/60 align-top">{product.brand}</td>}
                      <td className="px-6 py-4 text-sm">{variant.volume}</td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input type="number" min="0.01" step="0.01" value={prices[product.id]?.[variant.volume] || ''}
                            onChange={e => handlePriceChange(product.id, variant.volume, e.target.value)}
                            className="border border-[#3A4A3F] px-3 py-1 text-sm w-24 outline-none" autoFocus />
                        ) : (
                          <span className="text-sm font-bold flex items-center gap-2">
                            {prices[product.id]?.[variant.volume] || variant.price}€
                            {isSaved && <Check size={14} className="text-[#3A4A3F]" />}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button onClick={() => setConfirmSave({ productId: product.id, volume: variant.volume, price: prices[product.id]?.[variant.volume] || '' })}
                              className="bg-[#111111] text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                              <Save size={12} /> Guardar
                            </button>
                            <button onClick={() => setEditingCell(null)} className="border border-[#EDEDED] px-3 py-1 text-[10px] uppercase tracking-widest font-bold">Cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingCell(cellKey)} className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 hover:text-[#111111]">Editar</button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog open={!!confirmSave} onOpenChange={o => !o && setConfirmSave(null)} title="Confirmar Cambio de Precio"
        description={`¿Confirmas actualizar el precio a ${confirmSave?.price}€?`} onConfirm={handleSave} />
    </div>
  );
};
