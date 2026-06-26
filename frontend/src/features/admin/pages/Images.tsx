import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload, Trash2, ImageIcon, Sparkles, Loader2, ChevronDown,
  Star, X, CheckCircle2,
} from "lucide-react";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { aiAPI, API_URL, getStoredToken } from "../../../core/api/api";
import { productsAPI } from "../../../core/api/products";

// ─── Types ────────────────────────────────────────────────────
interface ProductOption {
  id: number;
  nombre: string;
  marca: string;
}

interface ProductImage {
  id: number;
  urlIndex: number; // 0-based index used to build DELETE path
  url: string;
  principal: boolean;
}

// State for the per-card AI panel
interface AiPanelState {
  style: string;
  prompt: string;
  isGenerating: boolean;
  resultUrl: string | null;
}

type LoadState = "idle" | "loading" | "ok" | "error";

// ─── API helpers ──────────────────────────────────────────────
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };



  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status}`);
  }
  if (res.status === 204) return {};
  const body = await res.json();
  return body.data !== undefined ? body.data : body;
}

// ─── Component ────────────────────────────────────────────────
export const Images = () => {
  const queryClient = useQueryClient();
  
  // Products dropdown
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: adminProducts = [], isLoading: isProductsLoading, error: productsError } = useQuery({
    queryKey: ['admin-productos'],
    queryFn: () => productsAPI.getAll(),
    staleTime: 0,
    gcTime: 60000,
  });

  useEffect(() => {
    if (adminProducts.length > 0 && selectedId === null) {
      setSelectedId(parseInt(adminProducts[0].id));
    }
  }, [adminProducts, selectedId]);

  const productsState: LoadState = isProductsLoading ? "loading" : productsError ? "error" : "ok";
  const products: ProductOption[] = adminProducts.map((p) => ({ id: parseInt(p.id), nombre: p.name, marca: p.brand }));

  // Gallery
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [imagesState, setImagesState] = useState<LoadState>("idle");

  // Upload zone
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Per-card AI panel state
  const [selectedAiImage, setSelectedAiImage] = useState<ProductImage | null>(null);
  const [aiPanels, setAiPanels] = useState<Record<number, AiPanelState>>({});

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ProductImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set principal
  const [isSettingPrincipal, setIsSettingPrincipal] = useState<number | null>(null);

  // ── Load images when product changes
  const loadImages = useCallback((id: number) => {
    setImagesState("loading");
    setProductImages([]);
    setSelectedAiImage(null);
    setAiPanels({});
    apiFetch(`/productos/${id}`)
      .then((dto: any) => {
        const imgs: any[] = dto.imagenes || [];
        setProductImages(
          imgs.map((img: any, idx: number) => ({ id: img.id, urlIndex: idx, url: img.url, principal: img.principal }))
        );
        setImagesState("ok");
      })
      .catch(() => setImagesState("error"));
  }, []);

  useEffect(() => {
    if (selectedId !== null) loadImages(selectedId);
  }, [selectedId, loadImages]);

  // ── Validate file
  const validateFile = (file: File): string | null => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return "Solo se permiten JPEG, PNG o WEBP";
    if (file.size > 2 * 1024 * 1024) return "Máximo 2 MB por imagen";
    return null;
  };

  // ── Upload a file to the selected product
  const uploadFile = async (file: File) => {
    if (!selectedId) return;
    const err = validateFile(file);
    if (err) { toast.error(err); return; }

    setIsUploading(true);
    const tid = toast.loading("Subiendo imagen...");
    try {
      const fd = new FormData();
      fd.append("imagenes", file);
      const dto = await apiFetch(`/productos/${selectedId}/imagenes`, {
        method: "POST",
        body: fd,
      });
      const imgs: any[] = dto.imagenes || [];
      setProductImages(
        imgs.map((img: any, idx: number) => ({ id: img.id, urlIndex: idx, url: img.url, principal: img.principal }))
      );
      toast.success("Imagen subida exitosamente", { id: tid });
    } catch (e: any) {
      toast.error(e.message || "Error al subir imagen", { id: tid });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Delete image
  const handleDelete = async () => {
    if (!deleteTarget || !selectedId) return;
    setIsDeleting(true);
    const tid = toast.loading("Eliminando imagen...");
    try {
      await apiFetch(
        `/productos/${selectedId}/imagenes/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      setProductImages((prev) =>
        prev
          .filter((img) => img.url !== deleteTarget.url)
          .map((img, idx) => ({ ...img, urlIndex: idx, principal: idx === 0 }))
      );
      toast.success("Imagen eliminada", { id: tid });
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar imagen", { id: tid });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ── Set image as principal
  const handleSetPrincipal = async (img: ProductImage) => {
    if (!selectedId) return;
    setIsSettingPrincipal(img.id);
    const tid = toast.loading("Estableciendo como principal...");
    try {
      await apiFetch(
        `/productos/${selectedId}/imagenes/${img.id}/principal`,
        { method: "PATCH" }
      );
      setProductImages((prev) =>
        prev.map((i) => ({ ...i, principal: i.url === img.url }))
      );
      toast.success("Imagen principal actualizada", { id: tid });
    } catch (e: any) {
      toast.error(e.message || "Error al establecer imagen principal", { id: tid });
    } finally {
      setIsSettingPrincipal(null);
    }
  };

  // ── Open AI panel for a card
  const toggleAiPanel = (img: ProductImage) => {
    setSelectedAiImage(img);
    if (!aiPanels[img.urlIndex]) {
      setAiPanels((prev) => ({
        ...prev,
        [img.urlIndex]: { style: "", prompt: "", isGenerating: false, resultUrl: null },
      }));
    }
  };

  const updatePanel = (urlIndex: number, patch: Partial<AiPanelState>) =>
    setAiPanels((prev) => ({
      ...prev,
      [urlIndex]: { ...prev[urlIndex], ...patch },
    }));

  // ── Generate AI image for a card
  const handleGenerate = async (img: ProductImage) => {
    const panel = aiPanels[img.urlIndex];
    if (!panel || !selectedId) return;

    updatePanel(img.urlIndex, { isGenerating: true, resultUrl: null });
    const tid = toast.loading("Generando imagen con IA...");
    try {
      const result = await aiAPI.improveImage(selectedId, img.id, panel.style, panel.prompt);

      if (result?.edited_image_base64) {
        const dataUri = `data:image/jpeg;base64,${result.edited_image_base64}`;
        updatePanel(img.urlIndex, { resultUrl: dataUri, isGenerating: false });
        toast.success("Imagen generada", { id: tid });
      } else {
        throw new Error("Sin respuesta de la IA");
      }
    } catch (e: any) {
      toast.error(e.message || "No se pudo generar la imagen", { id: tid });
      updatePanel(img.urlIndex, { isGenerating: false });
    }
  };

  // ── Use AI result as a product image
  const handleUseAiResult = async (img: ProductImage) => {
    const panel = aiPanels[img.urlIndex];
    if (!panel?.resultUrl || !selectedId) return;

    const tid = toast.loading("Guardando imagen generada...");
    try {
      const blob = await fetch(panel.resultUrl).then((r) => r.blob());
      const file = new File([blob], `ia_${Date.now()}.jpg`, { type: "image/jpeg" });
      const fd = new FormData();
      fd.append("imagenes", file);
      const dto = await apiFetch(`/productos/${selectedId}/imagenes`, {
        method: "POST",
        body: fd,
      });
      const imgs: any[] = dto.imagenes || [];
      setProductImages(
        imgs.map((img: any, idx: number) => ({ id: img.id, urlIndex: idx, url: img.url, principal: img.principal }))
      );
      setSelectedAiImage(null);
      updatePanel(img.urlIndex, { resultUrl: null, style: "", prompt: "" });
      toast.success("Imagen guardada en el producto", { id: tid });
    } catch (e: any) {
      toast.error(e.message || "Error al guardar imagen", { id: tid });
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedId);

  // ─── JSX ──────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">
          Imágenes
        </h1>
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">
          Gestión de imágenes por producto
        </p>
      </div>

      {/* ─── [1] SELECCIONAR PRODUCTO ──────────────────────── */}
      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60">
          Seleccionar Producto a Gestionar
        </label>
        <div className="relative max-w-xl group">
          <select
            value={selectedId ?? ""}
            disabled={productsState === "loading"}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full bg-[#EDEDED]/50 dark:bg-white/5 border border-transparent hover:border-[#EDEDED] dark:hover:border-white/10 focus:border-[#3A4A3F] dark:focus:border-white/20 text-[#111111] dark:text-white pl-5 pr-12 py-4 text-sm outline-none appearance-none transition-all cursor-pointer rounded-none font-light shadow-sm"
          >
            {productsState === "loading" && (
              <option value="" disabled>Cargando productos...</option>
            )}
            {productsState === "error" && (
              <option value="" disabled>Error al cargar productos</option>
            )}
            {productsState === "ok" &&
              products.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-[var(--bg-surface)]">
                  {p.nombre} — {p.marca}
                </option>
              ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2B2B2B]/40 dark:text-white/40">
            {productsState === "loading"
              ? <Loader2 size={18} className="animate-spin" />
              : <ChevronDown size={18} strokeWidth={1.5} />}
          </div>
        </div>
      </div>

      {/* ─── [2] SUBIR NUEVA IMAGEN ────────────────────────── */}
      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60">
          Subir Nueva Imagen
        </label>
        <div
          className={`border-2 border-dashed transition-colors ${!selectedId
              ? "opacity-40 pointer-events-none border-[#EDEDED] dark:border-white/10"
              : dragOver
                ? "border-[#3A4A3F] bg-green-50/20 dark:bg-[#3A4A3F]/10"
                : "border-[#EDEDED] dark:border-white/15 hover:border-[#3A4A3F]/40"
            } p-10 text-center`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) uploadFile(file);
          }}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#3A4A3F]" />
              <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light">
                Subiendo imagen...
              </p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-[#2B2B2B]/20 dark:text-white/20 mb-4" />
              <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light mb-3">
                Arrastra una imagen aquí o
              </p>
              <label className="inline-block bg-[#111111] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-[#3A4A3F] transition-colors">
                Seleccionar Archivo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="text-[10px] text-[#2B2B2B]/30 dark:text-white/30 mt-4 uppercase tracking-widest">
                JPEG, PNG o WEBP • Máximo 2 MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* ─── [3] GALERÍA ───────────────────────────────────── */}
      <div>
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#111111] dark:text-white mb-6">
          Imágenes de{" "}
          <span className="text-[#3A4A3F] dark:text-[#A5BAA8]">
            {selectedProduct?.nombre ?? "—"}
          </span>
          {imagesState === "ok" && (
            <span className="text-[#2B2B2B]/40 dark:text-white/40 ml-2">
              ({productImages.length})
            </span>
          )}
        </h2>

        {/* Loading */}
        {imagesState === "loading" && (
          <div className="flex items-center gap-3 justify-center py-16 text-[#2B2B2B]/40 dark:text-white/40 text-sm">
            <Loader2 size={20} className="animate-spin" /> Cargando imágenes...
          </div>
        )}

        {/* Error */}
        {imagesState === "error" && (
          <div className="border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-900/10 p-6 text-center text-sm text-red-600 dark:text-red-400">
            No se pudieron cargar las imágenes. Verifica la conexión con el servidor.
          </div>
        )}

        {/* Empty */}
        {imagesState === "ok" && productImages.length === 0 && (
          <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-16 text-center">
            <ImageIcon size={48} className="mx-auto text-[#2B2B2B]/20 mb-4" />
            <p className="text-sm text-[#2B2B2B]/40 dark:text-white/30">
              Este producto no tiene imágenes aún
            </p>
          </div>
        )}

        {/* Grid */}
        {imagesState === "ok" && productImages.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productImages.map((img) => (
                <div key={img.url} className="flex flex-col">
                  {/* Image card */}
                  <div className="relative group bg-[#EDEDED] dark:bg-white/5 aspect-square overflow-hidden shadow-sm">
                    <img
                      src={img.url}
                      alt={`Imagen ${img.urlIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Principal badge */}
                    {img.principal && (
                      <div className="absolute top-2 left-2 bg-[#3A4A3F] text-white text-[8px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 z-10 shadow-md">
                        <Star size={8} fill="white" /> Principal
                      </div>
                    )}

                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-4 z-20 backdrop-blur-[2px]">

                      {/* Top Action Row (Delete & Star) */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(img); }}
                          className="p-2.5 text-white/50 hover:text-red-400 hover:bg-red-500/20 backdrop-blur-md border border-transparent hover:border-red-500/30 transition-all duration-300"
                          title="Eliminar imagen"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>

                        {!img.principal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrincipal(img);
                            }}
                            disabled={isSettingPrincipal === img.id}
                            className={`p-2.5 backdrop-blur-md border border-transparent transition-all duration-300 ${
                              isSettingPrincipal === img.id
                                ? "text-[#3A4A3F] bg-[#3A4A3F]/20 cursor-not-allowed opacity-50"
                                : "text-white/50 hover:text-[#A5BAA8] hover:bg-[#3A4A3F]/20 hover:border-[#3A4A3F]/30"
                            }`}
                            title="Establecer como principal"
                          >
                            {isSettingPrincipal === img.id ? (
                              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                            ) : (
                              <Star size={16} strokeWidth={1.5} />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Center Action (AI) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAiPanel(img); }}
                        className="group/ai flex flex-col items-center gap-4 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75"
                      >
                        <div className="h-14 w-14 flex items-center justify-center bg-purple-500/10 border border-purple-500/30 text-purple-300 group-hover/ai:bg-purple-600 group-hover/ai:text-white group-hover/ai:border-purple-500 group-hover/ai:scale-110 group-hover/ai:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-500 backdrop-blur-sm">
                          <Sparkles size={24} strokeWidth={1.5} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70 group-hover/ai:text-white transition-colors duration-300">
                          Mejorar con IA
                        </span>
                      </button>
                    </div>

                    {/* Caption (hides on hover) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-[var(--bg-surface)]/90 px-3 py-2 backdrop-blur-sm opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                      <p className="text-[9px] text-[#2B2B2B] dark:text-white/80 uppercase tracking-widest truncate">
                        imagen_{img.urlIndex + 1}.jpg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── AI Modal ───────────────────────────── */}
      {selectedAiImage && (
        <>
          <style>{`
            @keyframes modalBackdropFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalContentScale {
              from { opacity: 0; transform: scale(0.95) translateY(15px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .animate-modal-backdrop {
              animation: modalBackdropFade 0.3s ease-out forwards;
            }
            .animate-modal-content {
              animation: modalContentScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-backdrop">
            <div className="bg-white dark:bg-[#111111] border border-[#EDEDED] dark:border-purple-500/30 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-modal-content">
              <button
                onClick={() => setSelectedAiImage(null)}
                className="absolute top-4 right-4 text-[#111111]/50 hover:text-[#111111] dark:text-white/50 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg uppercase tracking-widest font-bold text-[#111111] dark:text-white">Mejorar con IA</h2>
                    <p className="text-[10px] text-[#2B2B2B]/60 dark:text-white/60 uppercase tracking-widest mt-1">Configura tu escena premium</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Col: Original Image & Config */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60 font-bold">Imagen Seleccionada</p>
                      <img src={selectedAiImage.url} alt="Original" className="w-full aspect-square object-cover bg-[#EDEDED]/30 dark:bg-white/5 border border-[#EDEDED] dark:border-white/10" />
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Estilo (Ej: elegante, oscuro, minimalista)"
                        value={aiPanels[selectedAiImage.urlIndex]?.style || ""}
                        onChange={(e) => updatePanel(selectedAiImage.urlIndex, { style: e.target.value })}
                        className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/10 px-4 py-3 text-sm outline-none text-[#111111] dark:text-white focus:border-[#3A4A3F] dark:focus:border-[var(--color-gold)] transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Prompt adicional (Ej: luces de neón, fondo de mármol)"
                        value={aiPanels[selectedAiImage.urlIndex]?.prompt || ""}
                        onChange={(e) => updatePanel(selectedAiImage.urlIndex, { prompt: e.target.value })}
                        className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/10 px-4 py-3 text-sm outline-none text-[#111111] dark:text-white focus:border-[#3A4A3F] dark:focus:border-[var(--color-gold)] transition-colors"
                      />
                      <button
                        onClick={() => handleGenerate(selectedAiImage)}
                        disabled={aiPanels[selectedAiImage.urlIndex]?.isGenerating}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        {aiPanels[selectedAiImage.urlIndex]?.isGenerating
                          ? <><Loader2 size={16} className="animate-spin" /> Generando...</>
                          : <><Sparkles size={16} /> Generar</>}
                      </button>
                    </div>
                  </div>

                  {/* Right Col: AI Result */}
                  <div className="space-y-2 flex flex-col h-full">
                    <p className="text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Resultado IA</p>

                    {aiPanels[selectedAiImage.urlIndex]?.resultUrl ? (
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="mb-6">
                          <img
                            src={aiPanels[selectedAiImage.urlIndex].resultUrl as string}
                            alt="Resultado IA"
                            className="w-full aspect-square object-cover border-2 border-purple-500/50 shadow-lg shadow-purple-500/10"
                          />
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => handleUseAiResult(selectedAiImage)}
                            className="w-full flex items-center justify-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-gray-200 transition-colors"
                          >
                            <CheckCircle2 size={14} /> Usar como imagen del producto
                          </button>
                          <button
                            onClick={() => updatePanel(selectedAiImage.urlIndex, { resultUrl: null })}
                            className="w-full flex items-center justify-center gap-2 border border-[#EDEDED] dark:border-white/20 text-[#111111] dark:text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <X size={14} /> Descartar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 border-2 border-dashed border-[#EDEDED] dark:border-white/10 flex flex-col items-center justify-center text-center p-8 aspect-square md:aspect-auto h-full">
                        <Sparkles size={32} className="text-[#2B2B2B]/20 dark:text-white/20 mb-4" />
                        <p className="text-sm text-[#2B2B2B]/40 dark:text-white/40 font-light">
                          El resultado generado aparecerá aquí
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Confirm Delete Dialog ───────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Eliminar Imagen"
        description="¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel={isDeleting ? "Eliminando..." : "Eliminar"}
      />
    </div>
  );
};
