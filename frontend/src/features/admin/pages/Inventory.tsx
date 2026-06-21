import { useState } from "react";
import { inventoryAPI, InventoryMovement, InventoryItem } from "../../../core/api/api";
import { Plus, ArrowDownCircle, ArrowUpCircle, X, Download, Archive, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { SearchBar } from "../components/SearchBar";
import { AdminPaginator } from "../../../shared/components/ui/AdminPaginator";
import { EmptyStateRow } from "../../../shared/components/ui/EmptyState";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 15;

const tableWrap = "bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8";
const thCls = "text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 px-6 py-4";

export const Inventory = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtros
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [archiveBefore, setArchiveBefore] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    varianteId: '',
    stockActual: '',
    stockMinimo: '',
    motivo: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventario', filterDesde, filterHasta],
    queryFn: async () => {
      const [movs, inv] = await Promise.all([
        inventoryAPI.getMovements(filterDesde || undefined, filterHasta || undefined),
        inventoryAPI.getAll(),
      ]);
      return { movs, inv };
    },
    staleTime: 0,
    gcTime: 60000,
  });

  const movements = data?.movs || [];
  const inventario = data?.inv || [];

  const handleFilter = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-inventario'] });
  };

  const handleClearFilter = () => {
    setFilterDesde('');
    setFilterHasta('');
  };

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
      queryClient.invalidateQueries({ queryKey: ['admin-inventario'] });
      setFormData({ varianteId: '', stockActual: '', stockMinimo: '', motivo: '' });
      setShowForm(false);
      toast.success('Stock actualizado correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar stock');
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await inventoryAPI.exportarExcel(filterDesde || undefined, filterHasta || undefined);
      toast.success('Reporte Excel descargado correctamente');
    } catch {
      toast.error('Error al generar el reporte Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveBefore) {
      toast.error('Selecciona una fecha límite para archivar');
      return;
    }
    try {
      setIsArchiving(true);
      await inventoryAPI.archivarMovimientos(archiveBefore);
      toast.success('Movimientos archivados correctamente. Los datos siguen en la base de datos.');
      setShowArchiveModal(false);
      setArchiveBefore('');
      queryClient.invalidateQueries({ queryKey: ['admin-inventario'] });
    } catch {
      toast.error('Error al archivar los movimientos');
    } finally {
      setIsArchiving(false);
    }
  };

  const filteredMovements = movements.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.productoNombre.toLowerCase().includes(q) ||
      (m.motivo || "").toLowerCase().includes(q) ||
      m.tipo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Inventario</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-1">Bitácora de movimientos de almacén</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 border border-[#EDEDED] dark:border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#111111] dark:text-white hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <Download size={13} />
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
          <button
            onClick={() => setShowArchiveModal(true)}
            className="flex items-center gap-2 border border-[#EDEDED] dark:border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 hover:text-[#111111] dark:hover:text-white hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors"
          >
            <Archive size={13} />
            Archivar Historial
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#111111] dark:bg-white dark:text-[#111111] text-white px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors flex items-center gap-2"
          >
            <Plus size={13} /> Ajustar Stock
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className={`${tableWrap} p-4 flex flex-col gap-4`}>
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <SearchBar
              placeholder="Buscar por producto, tipo o motivo..."
              value={searchQuery}
              onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className={`flex items-center gap-2 px-3 py-2 border transition-colors ${filterDesde || filterHasta ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-[#EDEDED] dark:border-white/10'}`}>
              <div className="flex items-center gap-2 text-[#2B2B2B]/40 dark:text-white/40 border-r border-[#EDEDED] dark:border-white/10 pr-3">
                <Filter size={14} className={filterDesde || filterHasta ? 'text-[var(--color-gold)]' : ''} />
                <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:inline">Rango</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filterDesde}
                  onChange={(e) => setFilterDesde(e.target.value)}
                  className="bg-transparent text-xs text-[#111111] dark:text-white outline-none [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
                <span className="text-[#2B2B2B]/30 dark:text-white/30">-</span>
                <input
                  type="date"
                  value={filterHasta}
                  onChange={(e) => setFilterHasta(e.target.value)}
                  className="bg-transparent text-xs text-[#111111] dark:text-white outline-none [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
            </div>

            <button
              onClick={handleFilter}
              className="shrink-0 bg-[#111111] dark:bg-[var(--color-gold)] text-white dark:text-[#111111] px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#b59567] transition-colors"
            >
              Filtrar
            </button>

            {(filterDesde || filterHasta) && (
              <button
                onClick={handleClearFilter}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
        
        {/* Results indicator */}
        {(filterDesde || filterHasta || searchQuery) && (
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold border-t border-[#EDEDED] dark:border-white/5 pt-3">
            <span className="text-[#2B2B2B]/40 dark:text-white/40">Mostrando resultados filtrados</span>
            <span className="text-[var(--color-gold)]">
              {filteredMovements.length} registro{filteredMovements.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      

      {/* Tabla de Movimientos */}
      <div className={tableWrap}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED]/50 dark:bg-white/5">
                {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Motivo'].map(h => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-3 text-[#2B2B2B]/30 dark:text-white/20">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs uppercase tracking-widest">Cargando...</span>
                  </div>
                </td></tr>
              ) : (() => {
                const totalPages = Math.ceil(filteredMovements.length / PAGE_SIZE);
                const paginated = filteredMovements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
                return (
                  <>
                    {paginated.length === 0 ? (
                      <EmptyStateRow
                        icon={ArrowDownCircle}
                        title="Sin movimientos"
                        description={searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "Aún no se han registrado movimientos de inventario"}
                        colSpan={5}
                      />
                    ) : paginated.map((m, i) => (
                      <motion.tr
                        key={m.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-[#EDEDED] dark:border-white/8 last:border-0 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40 whitespace-nowrap">
                          {new Date(m.fecha).toLocaleDateString('es-CO', {
                            year: 'numeric', month: 'short', day: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#111111] dark:text-white">{m.productoNombre}</p>
                          <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest">{m.tamanoMl}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 ${
                            m.tipo === 'ENTRADA'
                              ? 'bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[var(--color-gold)]/10 dark:text-[var(--color-gold)]'
                              : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {m.tipo === 'ENTRADA' ? <ArrowDownCircle size={11} /> : <ArrowUpCircle size={11} />}
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#111111] dark:text-white">
                          <span className={m.tipo === 'ENTRADA' ? 'text-[#3A4A3F] dark:text-[var(--color-gold)]' : 'text-red-500'}>
                            {m.tipo === 'ENTRADA' ? '+' : '-'}{m.cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#2B2B2B]/60 dark:text-white/40 max-w-[260px] truncate">
                          {m.motivo}
                        </td>
                      </motion.tr>
                    ))}
                    {totalPages > 1 && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <AdminPaginator
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredMovements.length}
                            pageSize={PAGE_SIZE}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ajustar Stock */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="bg-white dark:bg-[var(--bg-surface)] w-full max-w-lg p-10 space-y-6 relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white">
                <X size={20} />
              </button>
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
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Nuevo Stock *</label>
                  <input type="number" min="0" value={formData.stockActual}
                    onChange={e => setFormData(p => ({ ...p, stockActual: e.target.value }))}
                    className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Stock Mínimo</label>
                  <input type="number" min="0" value={formData.stockMinimo}
                    onChange={e => setFormData(p => ({ ...p, stockMinimo: e.target.value }))}
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

              <button onClick={handleSubmit}
                className="w-full bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-all">
                Actualizar Stock
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Archivar Historial */}
      <AnimatePresence>
        {showArchiveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[var(--bg-surface)] w-full max-w-md p-10 space-y-6 relative">
              <button onClick={() => setShowArchiveModal(false)} className="absolute top-4 right-4 text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white">
                <X size={20} />
              </button>
              <div className="space-y-2">
                <h2 className="text-lg font-light text-[#111111] dark:text-white">Archivar Historial</h2>
                <p className="text-xs text-[#2B2B2B]/50 dark:text-white/40 leading-relaxed">
                  Los registros anteriores a la fecha seleccionada serán ocultados de esta vista. 
                  <strong className="text-[#111111] dark:text-white"> No se eliminarán</strong> de la base de datos; 
                  seguirán disponibles en reportes Excel.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">
                  Archivar movimientos anteriores a
                </label>
                <input
                  type="date"
                  value={archiveBefore}
                  onChange={(e) => setArchiveBefore(e.target.value)}
                  className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent dark:bg-[#111111] dark:text-white px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowArchiveModal(false)}
                  className="flex-1 border border-[#EDEDED] dark:border-white/10 py-3 text-[10px] uppercase tracking-widest font-bold text-[#111111] dark:text-white hover:bg-[#EDEDED] dark:hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleArchive} disabled={isArchiving}
                  className="flex-1 bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors disabled:opacity-50">
                  {isArchiving ? 'Archivando...' : 'Confirmar Archivo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
