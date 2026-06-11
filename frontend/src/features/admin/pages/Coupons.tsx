import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ticket, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { couponAPI, Coupon, formatPrice } from "../../../core/api/api";
import { SearchBar } from "../components/SearchBar";

export const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    codigo: "",
    tipo: "PORCENTAJE",
    descuento: 0,
    montoMinimo: 0,
    limiteUsos: undefined,
    fechaExpiracion: "",
    activo: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await couponAPI.getAllAdmin();
      setCoupons(data);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar los cupones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.id!);
      setFormData({
        codigo: coupon.codigo,
        tipo: coupon.tipo,
        descuento: coupon.descuento,
        montoMinimo: coupon.montoMinimo || 0,
        limiteUsos: coupon.limiteUsos || undefined,
        fechaExpiracion: coupon.fechaExpiracion ? coupon.fechaExpiracion.slice(0, 16) : "",
        activo: coupon.activo
      });
    } else {
      setEditingId(null);
      setFormData({
        codigo: "",
        tipo: "PORCENTAJE",
        descuento: 0,
        montoMinimo: 0,
        limiteUsos: undefined,
        fechaExpiracion: "",
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        codigo: formData.codigo?.toUpperCase(),
        montoMinimo: formData.montoMinimo ? Number(formData.montoMinimo) : null,
        limiteUsos: formData.limiteUsos ? Number(formData.limiteUsos) : null,
        fechaExpiracion: formData.fechaExpiracion ? new Date(formData.fechaExpiracion as string).toISOString() : null,
      } as any;

      if (editingId) {
        await couponAPI.update(editingId, payload);
        toast.success("Cupón actualizado correctamente");
      } else {
        await couponAPI.create(payload);
        toast.success("Cupón creado exitosamente");
      }
      handleCloseModal();
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el cupón");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cupón?")) return;
    try {
      await couponAPI.remove(id);
      toast.success("Cupón eliminado");
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const filteredCoupons = coupons.filter(c => {
    const q = searchQuery.toLowerCase();
    const estado = c.activo ? (isExpired(c.fechaExpiracion) ? 'expirado' : 'activo') : 'inactivo';
    return (
      c.codigo.toLowerCase().includes(q) ||
      estado.includes(q) ||
      c.tipo.toLowerCase().includes(q) ||
      String(c.descuento).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white flex items-center gap-2">
            <Ticket className="text-[#3A4A3F] dark:text-[#A5BAA8]" />
            Cupones de Descuento
          </h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/60 mt-1">
            Crea y gestiona códigos promocionales para tus clientes.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#A5BAA8] transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Crear Cupón
        </button>
      </div>

      {/* Search Bar */}
      {!isLoading && (
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-4">
          <SearchBar
            placeholder="Buscar por código, estado o tipo..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-[#EDEDED] dark:bg-[#1A1A1A] rounded"></div>
          <div className="h-12 bg-[#EDEDED] dark:bg-[#1A1A1A] rounded"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EDEDED]/50 dark:bg-white/5 border-b border-[#EDEDED] dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60">Código</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60">Descuento</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60">Usos</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60">Expiración</th>
                  <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60">Estado</th>
                  <th className="px-6 py-4 text-right font-bold text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEDED] dark:divide-white/10">
                {filteredCoupons.map((c) => {
                  const expired = isExpired(c.fechaExpiracion);
                  return (
                    <tr key={c.id} className="hover:bg-[#EDEDED]/20 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold tracking-widest">{c.codigo}</td>
                      <td className="px-6 py-4">
                        {c.tipo === 'PORCENTAJE' ? `${c.descuento}%` : `$${formatPrice(c.descuento)}`}
                        {c.montoMinimo ? (
                          <span className="block text-[10px] text-[#2B2B2B]/50 dark:text-[#9090a8]">Min: ${formatPrice(c.montoMinimo)}</span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        {c.usosActuales} / {c.limiteUsos || '∞'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {c.fechaExpiracion ? new Date(c.fechaExpiracion).toLocaleString('es-CO') : 'Sin expiración'}
                        {expired && <span className="text-red-500 ml-2">(Expirado)</span>}
                      </td>
                      <td className="px-6 py-4">
                        {c.activo && !expired ? (
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold uppercase">
                            <CheckCircle2 size={14} /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold uppercase">
                            <XCircle size={14} /> {expired ? 'Expirado' : 'Inactivo'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => handleOpenModal(c)} className="text-[#3A4A3F] dark:text-[#A5BAA8] hover:text-[#111111] dark:hover:text-white transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(c.id!)} className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredCoupons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#2B2B2B]/60 dark:text-white/60">
                      <AlertCircle className="mx-auto mb-2 opacity-50" size={24} />
                      {searchQuery
                        ? `No se encontraron resultados para "${searchQuery}"`
                        : "No hay cupones registrados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161616] w-full max-w-md p-6 border border-[#EDEDED] dark:border-white/10 shadow-2xl">
            <h2 className="text-xl font-light mb-6">
              {editingId ? "Editar Cupón" : "Nuevo Cupón"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-1">Código</label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent px-4 py-2 uppercase placeholder:normal-case focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                  placeholder="Ej. VERANO20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent px-4 py-2 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="VALOR_FIJO">Monto Fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-1">Descuento</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step={formData.tipo === 'PORCENTAJE' ? '1' : '1000'}
                    max={formData.tipo === 'PORCENTAJE' ? '100' : undefined}
                    value={formData.descuento}
                    onChange={(e) => setFormData({ ...formData, descuento: Number(e.target.value) })}
                    className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent px-4 py-2 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold mb-1">Compra Mínima (Opcional)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.montoMinimo || ''}
                  onChange={(e) => setFormData({ ...formData, montoMinimo: Number(e.target.value) })}
                  className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent px-4 py-2 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                  placeholder="0 para sin mínimo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-1">Límite de Usos</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.limiteUsos || ''}
                    onChange={(e) => setFormData({ ...formData, limiteUsos: Number(e.target.value) })}
                    className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent px-4 py-2 focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                    placeholder="En blanco = Ilimitado"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-1">Expiración (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={formData.fechaExpiracion as string}
                    onChange={(e) => setFormData({ ...formData, fechaExpiracion: e.target.value })}
                    className="w-full border border-[#EDEDED] dark:border-white/10 bg-transparent px-4 py-2 text-sm focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="accent-[#111111] dark:accent-white"
                />
                <label htmlFor="activo" className="text-sm cursor-pointer">Cupón Activo</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border border-[#111111] dark:border-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#111111] dark:bg-white text-white dark:text-[#111111] py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#A5BAA8] transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
