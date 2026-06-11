import { useState, useEffect } from "react";
import { productsAPI, pricesAPI, formatPrice } from "../../../core/api/api";
import { Product } from "../../products/types/products";
import { Save, Check, Search, X, Tag } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { AdminPaginator } from "../../../shared/components/ui/AdminPaginator";
import { EmptyStateRow } from "../../../shared/components/ui/EmptyState";

const PAGE_SIZE = 15;

export const Prices = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, Record<string, string>>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [confirmSave, setConfirmSave] = useState<{ productId: string; variantId: number; volume: string; price: string } | null>(null);
  const [savedCells, setSavedCells] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    productsAPI.getAll().then(data => {
      setProducts(data);
      setPrices(Object.fromEntries(data.map(p => [p.id, Object.fromEntries(p.variants.map(v => [v.volume, String(v.price)]))])));
      setIsLoading(false);
    });
  }, []);

  const handlePriceChange = (productId: string, volume: string, value: string) => {
    setPrices(prev => ({ ...prev, [productId]: { ...prev[productId], [volume]: value } }));
  };

  const handleSave = async () => {
    if (!confirmSave) return;
    const val = parseFloat(confirmSave.price);
    if (isNaN(val) || val <= 0) { toast.error('El precio debe ser un valor positivo'); setConfirmSave(null); return; }

    if(!confirmSave.variantId) { toast.error('La variante no tiene ID válido'); return; }

    try {
      await pricesAPI.bulkUpdate([{
        varianteId: confirmSave.variantId,
        nuevoPrecioVenta: val
      }]);

      const key = `${confirmSave.productId}-${confirmSave.volume}`;
      setSavedCells(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setSavedCells(prev => { const n = { ...prev }; delete n[key]; return n; }), 2000);
      toast.success('Precio actualizado');
    } catch (e) {
      toast.error('Error al actualizar el precio');
    } finally {
      setEditingCell(null);
      setConfirmSave(null);
    }
  };

  // Filter products by name or brand
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
  });

  // Flatten variants for pagination
  const rows = filteredProducts.flatMap(product =>
    product.variants.map((variant, vi) => ({ product, variant, vi }))
  );

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const paginatedRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Precios</h1>
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Actualización de precios por producto y variante</p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" size={18} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar producto por nombre o marca..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white/30 transition-all"
          />
          {searchQuery && (
            <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 hover:text-[#111111] dark:text-white/40 dark:hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED]/50 dark:bg-white/5">
                {['Producto', 'Marca', 'Variante', 'Precio Actual', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-[#2B2B2B]/40 dark:text-white/30">Cargando catálogo...</td></tr>
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map(({ product, variant, vi }, idx) => {
                  const cellKey = `${product.id}-${variant.volume}`;
                  const isEditing = editingCell === cellKey;
                  const isSaved = savedCells[cellKey];

                  // Check if prev row has same product (for rowSpan logic)
                  const prevRow = paginatedRows[idx - 1];
                  const isFirstVariantInPage = !prevRow || prevRow.product.id !== product.id;

                  // Count how many variants of this product are in the paginated set
                  const variantCountInPage = paginatedRows.filter(r => r.product.id === product.id).length;

                  return (
                    <tr key={cellKey} className="border-b border-[#EDEDED] dark:border-white/8 last:border-0 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                      {isFirstVariantInPage && (
                        <td rowSpan={variantCountInPage} className="px-6 py-4 text-sm font-bold text-[#111111] dark:text-white align-top">{product.name}</td>
                      )}
                      {isFirstVariantInPage && (
                        <td rowSpan={variantCountInPage} className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40 align-top">{product.brand}</td>
                      )}
                      <td className="px-6 py-4 text-sm text-[#2B2B2B] dark:text-white/80">{variant.volume}</td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input type="number" min="0.01" step="0.01" value={prices[product.id]?.[variant.volume] || ''}
                            onChange={e => handlePriceChange(product.id, variant.volume, e.target.value)}
                            className="border border-[#3A4A3F] dark:border-[#3A4A3F] dark:bg-[#111111] dark:text-white px-3 py-1 text-sm w-24 outline-none" autoFocus />
                        ) : (
                          <span className="text-sm font-bold text-[#111111] dark:text-white flex items-center gap-2">
                            {formatPrice(Number(prices[product.id]?.[variant.volume] || variant.price))} COP
                            {isSaved && <Check size={14} className="text-[#3A4A3F]" />}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button onClick={() => setConfirmSave({ productId: product.id, variantId: variant.id || 0, volume: variant.volume, price: prices[product.id]?.[variant.volume] || '' })}
                              className="bg-[#111111] dark:bg-white dark:text-[#111111] text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                              <Save size={12} /> Guardar
                            </button>
                            <button onClick={() => setEditingCell(null)} className="border border-[#EDEDED] dark:border-white/10 dark:text-white px-3 py-1 text-[10px] uppercase tracking-widest font-bold">Cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingCell(cellKey)} className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white transition-colors">Editar</button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyStateRow
                  icon={Tag}
                  title="No se encontraron productos"
                  description={searchQuery ? "Intenta buscar con otro nombre o marca" : "El catálogo está vacío"}
                  colSpan={5}
                />
              )}
            </tbody>
          </table>
        </div>
        <AdminPaginator
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={rows.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      <ConfirmDialog open={!!confirmSave} onOpenChange={o => !o && setConfirmSave(null)} title="Confirmar Cambio de Precio"
        description={`¿Confirmas actualizar el precio a ${confirmSave?.price ? formatPrice(Number(confirmSave.price)) : ''} COP?`} onConfirm={handleSave} />
    </div>
  );
};
