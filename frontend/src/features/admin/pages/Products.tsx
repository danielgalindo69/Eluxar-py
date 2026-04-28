import React, { useState, useRef } from "react";
import { Plus, Edit2, Trash2, Search, Loader2, X, Package, ImageIcon, Sparkles, Upload, CheckCircle } from "lucide-react";
import { productsAPI } from "../../../core/api/api";
import { Product } from "../../products/types/products";
import { toast } from "sonner";

// ─── Enum de categorías fijas ─────────────────────────────────
const CATEGORIAS = [
  { value: "CABALLERO", label: "Caballero" },
  { value: "DAMA",      label: "Dama" },
  { value: "NINO",      label: "Niño" },
  { value: "NINA",      label: "Niña" },
] as const;

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error("Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    try {
      await productsAPI.remove(id);
      toast.success("Producto eliminado");
      fetchProducts();
    } catch (error) {
      toast.error("Error al eliminar producto");
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Gestión de Productos</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Administra el catálogo de perfumes</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-[#3A4A3F] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" size={20} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white/30 focus:bg-white dark:focus:bg-[#111111] transition-all"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#3A4A3F]" size={32} />
            <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-bold">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED] dark:bg-white/5">
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Imagen</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Nombre</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Categoría</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Precio</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Stock</th>
                  <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-[#EDEDED] dark:border-white/8 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-2">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-[#EDEDED] dark:bg-white/10 flex items-center justify-center">
                            <ImageIcon size={16} className="text-[#2B2B2B]/30" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-[#2B2B2B] dark:text-white/80">{product.name}</td>
                      <td className="px-4 py-2 text-sm text-[#2B2B2B]/60 dark:text-white/40">
                        {CATEGORIAS.find(c => c.value === product.category)?.label || product.category}
                      </td>
                      <td className="px-4 py-2 text-sm text-[#2B2B2B] font-bold">{product.price}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-[10px] uppercase tracking-widest font-bold ${product.stock > 0 ? 'text-[#3A4A3F]' : 'text-red-500'}`}>
                            {product.stock > 0 ? `En stock (${product.stock})` : 'Sin stock'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Editar Producto"
                            onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                            className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors"
                          >
                            <Edit2 size={16} className="text-[#2B2B2B]" strokeWidth={1.5} />
                          </button>
                          <button
                            title="Eliminar Producto"
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-bold">No se encontraron productos</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchProducts(); }}
        />
      )}
    </div>
  );
};

// ─── Image Slot ───────────────────────────────────────────────
interface ImageSlotProps {
  index: number;
  preview: string | null;
  label: string;
  onSelect: (index: number, file: File) => void;
  onRemove: (index: number) => void;
  isUploading: boolean;
}

const ImageSlot = ({ index, preview, label, onSelect, onRemove, isUploading }: ImageSlotProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      {/* Label */}
      <p className="text-[9px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 mb-2">{label}</p>

      {preview ? (
        /* Preview state */
        <div className="relative group aspect-square bg-[#EDEDED] dark:bg-white/5 overflow-hidden border-2 border-[#3A4A3F]">
          <img src={preview} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 rounded-full transition-opacity hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
          <div className="absolute top-2 right-2 bg-[#3A4A3F] rounded-full p-0.5">
            <CheckCircle size={14} className="text-white" />
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        /* Empty slot */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full aspect-square border-2 border-dashed border-[#EDEDED] dark:border-white/15 hover:border-[#3A4A3F] dark:hover:border-white/40 transition-colors flex flex-col items-center justify-center gap-2 text-[#2B2B2B]/30 dark:text-white/30 hover:text-[#3A4A3F] dark:hover:text-white/60 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={20} strokeWidth={1.5} />
          <span className="text-[9px] uppercase tracking-widest font-bold">Seleccionar</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(index, file);
          e.target.value = '';
        }}
      />
    </div>
  );
};

// ─── Product Modal ────────────────────────────────────────────
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImageEntry {
  file: File | null;
  preview: string;      // blob URL for local preview OR cloudinary URL
  cloudinaryUrl: string | null;  // null while uploading, URL after upload
  isUploading: boolean;
}

const ProductModal = ({ product, onClose, onSuccess }: ProductModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre:          product?.name || "",
    descripcion:     product?.description || "",
    categoria:       product?.category || "",
    marca:           product?.brand || "",
    familiaOlfativa: product?.olfactoryFamily || "",
    activo:          true,
    destacado:       false,
    precio:          product?.variants?.[0]?.price || 0,
    stock:           product?.variants?.[0]?.stock || 0,
  });

  // Image state — up to 3 slots
  const [images, setImages] = useState<(ImageEntry | null)[]>([null, null, null]);

  // On select: show local preview immediately, then upload to Cloudinary after product is created
  const handleImageSelect = (index: number, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setImages(prev => {
      const next = [...prev];
      next[index] = { file, preview: previewUrl, cloudinaryUrl: null, isUploading: false };
      return next;
    });
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => {
      const next = [...prev];
      if (next[index]?.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(next[index]!.preview);
      }
      next[index] = null;
      return next;
    });
  };

  const filledSlots = images.filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (filledSlots.length === 0) {
      toast.error("Agrega al menos una imagen al producto");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Crear el producto primero (sin imágenes)
      const payload = {
        ...formData,
        variantes: [{
          id: product?.variants?.[0]?.id,
          tamanoMl: 100, // TODO: Permitir múltiples tamaños en el futuro
          precioVenta: formData.precio,
          stockActual: formData.stock,
          activa: true,
        }],
        imagenes: [],
      };

      let savedProduct: any;
      if (product) {
        savedProduct = await productsAPI.update(product.id, payload);
      } else {
        savedProduct = await productsAPI.create(payload);
      }

      const productId = savedProduct?.id || product?.id;

      // 2. Subir imágenes a Cloudinary si hay archivos nuevos
      const filesToUpload = filledSlots
        .filter(img => img?.file !== null)
        .map(img => img!.file as File);

      if (filesToUpload.length > 0 && productId) {
        await productsAPI.uploadImages(String(productId), filesToUpload);
      }

      toast.success(product ? "Producto actualizado" : "Producto creado");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#111111]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1A1A1A] w-full max-w-3xl shadow-2xl border border-[#EDEDED] dark:border-white/10 overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="bg-[#3A4A3F] p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">{product ? "Editar" : "Nuevo"} Producto</h2>
              <p className="text-[9px] uppercase tracking-widest text-white/60 mt-0.5">Define los detalles del perfume</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-8">

            {/* ── Col izquierda ── */}
            <div className="space-y-5">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Nombre</label>
                <div className="relative group">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[#3A4A3F] transition-colors" size={14} />
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: L'Eau de Parfum"
                    className="w-full bg-[#EDEDED]/50 border-none px-10 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe las notas y la esencia..."
                  className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none resize-none"
                />
              </div>

              {/* Precio + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Precio (COP)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                    className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ── Col derecha ── */}
            <div className="space-y-5">
              {/* Categoría (Enum fijo) */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Categoría</label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  {CATEGORIAS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Marca (texto libre) */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Marca</label>
                <input
                  type="text"
                  required
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  placeholder="Ej: Chanel, Dior, Tom Ford..."
                  className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                />
              </div>

              {/* Familia Olfativa */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Familia Olfativa</label>
                <input
                  type="text"
                  value={formData.familiaOlfativa}
                  onChange={(e) => setFormData({ ...formData, familiaOlfativa: e.target.value })}
                  placeholder="Ej: Amaderada, Cítrica..."
                  className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                />
              </div>

              {/* Destacado */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.destacado}
                  onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                  className="w-4 h-4 accent-[#3A4A3F]"
                />
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60">Destacado</span>
              </label>
            </div>
          </div>

          {/* ── Image Picker ── */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">
                  Imágenes del Producto
                </label>
                <p className="text-[9px] text-[#2B2B2B]/30 dark:text-white/30 mt-0.5 uppercase tracking-wider">
                  Máximo 3 fotos · JPEG, PNG o WEBP
                </p>
              </div>
              <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 ${
                filledSlots.length === 3
                  ? 'bg-[#3A4A3F]/10 text-[#3A4A3F]'
                  : 'bg-[#EDEDED] text-[#2B2B2B]/40'
              }`}>
                {filledSlots.length} / 3
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <ImageSlot
                  key={i}
                  index={i}
                  preview={images[i]?.preview || null}
                  label={i === 0 ? "Principal ★" : `Foto ${i + 1}`}
                  onSelect={handleImageSelect}
                  onRemove={handleImageRemove}
                  isUploading={images[i]?.isUploading || false}
                />
              ))}
            </div>

            {filledSlots.length === 0 && (
              <p className="text-center text-[9px] text-red-400 uppercase tracking-widest mt-3 font-bold">
                ↑ Selecciona al menos una imagen
              </p>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#EDEDED] py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#EDEDED] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              <span>{product ? "Actualizar Perfume" : "Crear Perfume"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
