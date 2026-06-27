import { useState } from "react";
import { Loader2, X, Package, Sparkles, Filter } from "lucide-react";
import { productsAPI } from "../../../core/api/products";
import { Product } from "../../products/types/products";
import { toast } from "sonner";
import { ImageSlot } from "./ImageSlot";

// ─── Enum de categorías fijas ─────────────────────────────────
export const CATEGORIAS = [
  { value: "CABALLERO", label: "Caballero" },
  { value: "DAMA", label: "Dama" },
  { value: "NINO", label: "Niño" },
  { value: "NINA", label: "Niña" },
  { value: "UNISEX", label: "Unisex" },
] as const;

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImageEntry {
  file: File | null;
  preview: string;
  cloudinaryUrl: string | null;
  isUploading: boolean;
}

export const ProductModal = ({ product, onClose, onSuccess }: ProductModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const parseVolume = (volStr?: string) => {
    if (!volStr) return 100;
    const match = volStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 100;
  };

  const [formData, setFormData] = useState({
    nombre: product?.name || "",
    descripcion: product?.description || "",
    categoria: product?.category || "",
    marca: product?.brand || "",
    familiaOlfativa: product?.olfactoryFamily || "",
    activo: true,
    destacado: false,
    precio: product?.variants?.[0]?.price || 0,
    stock: product?.variants?.[0]?.stock || 0,
    tamanoMl: parseVolume(product?.variants?.[0]?.volume),
    concentracion: product?.concentracion || "",
    notasSalida: product?.notasSalida || "",
    notasCorazon: product?.notasCorazon || "",
    notasFondo: product?.notasFondo || "",
    estaciones: product?.estaciones || "",
    longevidad: product?.longevidad || "",
    guiaUso: product?.guiaUso || "",
    intensidad: product?.intensidad || "",
  });

  // Image state — up to 3 slots
  const [images, setImages] = useState<(ImageEntry | null)[]>(() => {
    const initial: (ImageEntry | null)[] = [null, null, null];
    if (product?.image) {
      initial[0] = { file: null, preview: product.image, cloudinaryUrl: product.image, isUploading: false };
    }
    if (product?.hoverImage) {
      initial[1] = { file: null, preview: product.hoverImage, cloudinaryUrl: product.hoverImage, isUploading: false };
    }
    return initial;
  });

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

    if (formData.nombre.trim().length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (formData.precio <= 0) {
      toast.error("El precio debe ser mayor a 0");
      return;
    }

    if (filledSlots.length === 0) {
      toast.error("Agrega al menos una imagen al producto");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Crear el producto primero (sin subir nuevas imágenes todavía)
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        marca: formData.marca,
        familiaOlfativa: formData.familiaOlfativa,
        activo: formData.activo,
        destacado: formData.destacado,
        // Perfil olfativo y sensorial
        concentracion: formData.concentracion || null,
        notasSalida: formData.notasSalida || null,
        notasCorazon: formData.notasCorazon || null,
        notasFondo: formData.notasFondo || null,
        estaciones: formData.estaciones || null,
        longevidad: formData.longevidad || null,
        guiaUso: formData.guiaUso || null,
        intensidad: formData.intensidad || null,
        variantes: [{
          id: product?.variants?.[0]?.id,
          tamanoMl: formData.tamanoMl,
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
      <div className="relative bg-white dark:bg-[var(--bg-surface)] w-full max-w-3xl shadow-2xl border border-[#EDEDED] dark:border-white/10 overflow-hidden max-h-[95vh] flex flex-col">

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
          {/* ── Sección 1: Información Básica ── */}
          <div className="mb-10 pb-8 border-b border-[#EDEDED] dark:border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Package size={16} className="text-[var(--color-gold)]" />
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B] dark:text-white">Información Básica</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Nombre</label>
                  <div className="relative group">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[var(--color-gold)] transition-colors" size={14} />
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: L'Eau de Parfum"
                      className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm pl-10 pr-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Descripción</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Describe las notas y la esencia..."
                    className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Precio (COP)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.precio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          precio: Number(e.target.value),
                        })
                      }
                      className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Tamaño (ml)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.tamanoMl}
                      onChange={(e) => setFormData({ ...formData, tamanoMl: Number(e.target.value) })}
                      className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Stock Inicial</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: Number(e.target.value),
                        })
                      }
                      className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)]"
                    />
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Categoría</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] appearance-none"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIAS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Marca</label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Ej: Chanel, Dior, Tom Ford..."
                    className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Familia Olfativa</label>
                  <input
                    type="text"
                    value={formData.familiaOlfativa}
                    onChange={(e) => setFormData({ ...formData, familiaOlfativa: e.target.value })}
                    placeholder="Ej: Floral, Amaderada..."
                    className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)]"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.destacado}
                    onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                    className="w-4 h-4 accent-[var(--color-gold)]"
                  />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-[#9090a8]">Destacado</span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Sección 2: Perfil Olfativo y Sensorial ── */}
          <div className="mb-10 pb-8 border-b border-[#EDEDED] dark:border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-[var(--color-gold)]" />
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B] dark:text-white">Perfil Olfativo y Sensorial</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Concentración</label>
                <select
                  value={formData.concentracion}
                  onChange={(e) => setFormData({ ...formData, concentracion: e.target.value })}
                  className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Eau de Cologne">Eau de Cologne</option>
                  <option value="Eau de Toilette">Eau de Toilette</option>
                  <option value="Eau de Parfum">Eau de Parfum</option>
                  <option value="Parfum">Parfum</option>
                  <option value="Extrait de Parfum">Extrait de Parfum</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Intensidad</label>
                <select
                  value={formData.intensidad}
                  onChange={(e) => setFormData({ ...formData, intensidad: e.target.value })}
                  className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Suave">Suave</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Intensa">Intensa</option>
                  <option value="Muy Intensa">Muy Intensa</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Longevidad</label>
                <select
                  value={formData.longevidad}
                  onChange={(e) => setFormData({ ...formData, longevidad: e.target.value })}
                  className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Efímera (1-2 horas)">Efímera (1-2 horas)</option>
                  <option value="Corta (2-4 horas)">Corta (2-4 horas)</option>
                  <option value="Moderada (4-6 horas)">Moderada (4-6 horas)</option>
                  <option value="Larga (6-8 horas)">Larga (6-8 horas)</option>
                  <option value="Muy Larga (8+ horas)">Muy Larga (8+ horas)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Notas de Salida</label>
                  <span className="text-[9px] text-[#2B2B2B]/30 dark:text-white/30 font-bold">{formData.notasSalida.length}/200</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={formData.notasSalida}
                  onChange={(e) => setFormData({ ...formData, notasSalida: e.target.value })}
                  placeholder="Ej: Bergamota, Limón, Lavanda..."
                  className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] resize-none"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Notas de Corazón</label>
                  <span className="text-[9px] text-[#2B2B2B]/30 dark:text-white/30 font-bold">{formData.notasCorazon.length}/200</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={formData.notasCorazon}
                  onChange={(e) => setFormData({ ...formData, notasCorazon: e.target.value })}
                  placeholder="Ej: Rosa, Jazmín, Canela..."
                  className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] resize-none"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Notas de Fondo</label>
                  <span className="text-[9px] text-[#2B2B2B]/30 dark:text-white/30 font-bold">{formData.notasFondo.length}/200</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={formData.notasFondo}
                  onChange={(e) => setFormData({ ...formData, notasFondo: e.target.value })}
                  placeholder="Ej: Sándalo, Vainilla, Almizcle..."
                  className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── Sección 3: Contexto y Recomendaciones ── */}
          <div className="mb-10 pb-8 border-b border-[#EDEDED] dark:border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={16} className="text-[var(--color-gold)]" />
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B] dark:text-white">Contexto y Recomendaciones</h3>
            </div>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Estaciones</label>
                <select
                  value={formData.estaciones}
                  onChange={(e) => setFormData({ ...formData, estaciones: e.target.value })}
                  className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] appearance-none max-w-xs"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Primavera">Primavera</option>
                  <option value="Verano">Verano</option>
                  <option value="Otoño">Otoño</option>
                  <option value="Invierno">Invierno</option>
                  <option value="Toda la Temporada">Toda la Temporada</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">Guía de Uso y Aplicación</label>
                <span className="text-[9px] text-[#2B2B2B]/30 dark:text-white/30 font-bold">{formData.guiaUso.length}/500</span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={formData.guiaUso}
                onChange={(e) => setFormData({ ...formData, guiaUso: e.target.value })}
                placeholder="Consejos de aplicación, momentos ideales, combinaciones sugeridas..."
                className="w-full bg-[#F5F5F5] dark:bg-[var(--bg-surface)] border rounded-sm px-4 py-3 text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/30 outline-none transition-all border-[#DEDEDE] dark:border-[#2A2A2A] focus:border-[var(--color-gold)] dark:focus:border-[var(--color-gold)] resize-none"
              />
            </div>
          </div>

          {/* ── Image Picker ── */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2B2B2B]/60 dark:text-white/60">
                  Imágenes del Producto
                </label>
                <p className="text-[9px] text-[#2B2B2B]/30 dark:text-white/30 mt-0.5 uppercase tracking-wider">
                  Máximo 3 fotos · JPEG, PNG o WEBP
                </p>
              </div>
              <span className={`text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${filledSlots.length === 3
                ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]'
                : 'bg-[#EDEDED] dark:bg-[var(--bg-surface)] text-[#2B2B2B]/40 dark:text-white/40'
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
              <p className="text-center text-[9px] text-red-400 uppercase tracking-[0.2em] mt-3 font-bold">
                ↑ Selecciona al menos una imagen
              </p>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#EDEDED] dark:border-[#2A2A2A] rounded-sm py-4 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-[#F5F5F5] dark:hover:bg-[var(--bg-surface)] transition-all text-[#111111] dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-[var(--color-gold)] hover:bg-[#b8946a] text-[#111111] py-4 text-[11px] uppercase tracking-[0.2em] font-bold transition-colors rounded-sm flex items-center justify-center gap-3 disabled:opacity-50"
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
