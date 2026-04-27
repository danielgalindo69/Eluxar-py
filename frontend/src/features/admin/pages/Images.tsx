import { useState } from "react";
import { PRODUCTS } from "../../products/types/products";
import { Upload, Trash2, ImageIcon, X, Sparkles, Loader2 } from "lucide-react";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { aiAPI } from "../../../core/api/api";

interface ProductImage {
  id: string;
  url: string;
  name: string;
}

export const Images = () => {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]?.id || '');
  const [images, setImages] = useState<Record<string, ProductImage[]>>(
    Object.fromEntries(PRODUCTS.map(p => [p.id, [
      { id: '1', url: p.image, name: 'principal.jpg' },
      ...(p.hoverImage ? [{ id: '2', url: p.hoverImage, name: 'hover.jpg' }] : []),
    ]]))
  );
  const [deleteTarget, setDeleteTarget] = useState<{ productId: string; imageId: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // IA Enhancement State
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiStyle, setAiStyle] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const selectedImages = images[selectedProduct] || [];
  const product = PRODUCTS.find(p => p.id === selectedProduct);

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) return 'Solo se permiten archivos JPEG, PNG o WEBP';
    if (file.size > 2 * 1024 * 1024) return 'El archivo no debe superar los 2MB';
    return null;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) { toast.error(error); return; }
      const url = URL.createObjectURL(file);
      const newImage: ProductImage = { id: crypto.randomUUID(), url, name: file.name };
      setImages(prev => ({ ...prev, [selectedProduct]: [...(prev[selectedProduct] || []), newImage] }));
      toast.success(`Imagen "${file.name}" cargada`);
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setImages(prev => ({ ...prev, [deleteTarget.productId]: prev[deleteTarget.productId].filter(i => i.id !== deleteTarget.imageId) }));
    setDeleteTarget(null);
    toast.success('Imagen eliminada');
  };

  const handleAIEnhance = async () => {
    if (!aiFile) {
      toast.error("Por favor selecciona una imagen primero");
      return;
    }
    setIsEnhancing(true);
    const loadingToast = toast.loading("Mejorando imagen con IA (Esto puede tardar)...");
    
    try {
      const result = await aiAPI.improveImage(aiFile, aiStyle, aiPrompt);
      if (result && result.imagen_url) {
        const newImage: ProductImage = { 
          id: crypto.randomUUID(), 
          url: result.imagen_url, 
          name: `IA_Mejorada_${aiFile.name}` 
        };
        setImages(prev => ({ 
          ...prev, 
          [selectedProduct]: [...(prev[selectedProduct] || []), newImage] 
        }));
        toast.success("Imagen mejorada exitosamente", { id: loadingToast });
        setAiFile(null);
        setAiStyle("");
        setAiPrompt("");
      } else {
        throw new Error(result?.mensaje || "Error desconocido");
      }
    } catch (error: any) {
      toast.error(error.message || "No se pudo mejorar la imagen con IA", { id: loadingToast });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Imágenes</h1>
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Gestión de imágenes por producto</p>
      </div>

      {/* Product Selector */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Seleccionar Producto</label>
        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/10 text-[#111111] dark:text-white px-4 py-3 text-sm outline-none">
          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
        </select>
      </div>

      {/* Upload Zone */}
      <div className={`border-2 border-dashed p-12 text-center transition-colors ${dragOver ? 'border-[#3A4A3F] bg-green-50/30 dark:bg-[#3A4A3F]/10' : 'border-[#EDEDED] dark:border-white/15'}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
      >
        <Upload size={32} className="mx-auto text-[#2B2B2B]/20 dark:text-white/20 mb-4" />
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light mb-2">Arrastra imágenes aquí o</p>
        <label className="inline-block bg-[#111111] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-[#3A4A3F] transition-colors">
          Seleccionar Archivos
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => handleFileUpload(e.target.files)} className="hidden" />
        </label>
        <p className="text-[10px] text-[#2B2B2B]/30 dark:text-white/30 mt-4 uppercase tracking-widest">JPEG, PNG o WEBP • Máximo 2MB</p>
      </div>

      {/* Mejora con IA Zone */}
      <div className="bg-gradient-to-r from-purple-900/10 to-[#111111]/5 border border-purple-500/20 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={120} className="text-purple-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-[14px] uppercase tracking-widest font-bold text-[#111111] dark:text-white">Mejorar con IA</h2>
              <p className="text-[10px] text-[#2B2B2B]/60 dark:text-white/60 uppercase tracking-widest mt-1">Sube una foto base y nuestra IA generará un escenario premium automáticamente.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <label className={`col-span-1 border ${aiFile ? 'border-purple-500 bg-purple-500/10' : 'border-[#EDEDED] dark:border-white/10 bg-white dark:bg-[#161616] hover:border-purple-500/50'} text-[#111111] dark:text-white px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-center text-center`}>
              <span className="truncate">{aiFile ? aiFile.name : "+ Seleccionar Foto"}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setAiFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
            <input 
              type="text" 
              placeholder="Estilo (Ej: elegante, oscuro, minimalista)" 
              value={aiStyle} 
              onChange={e => setAiStyle(e.target.value)} 
              className="col-span-1 bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/10 px-4 py-3 text-sm outline-none text-[#111111] dark:text-white focus:border-purple-500/50 transition-colors"
            />
            <input 
              type="text" 
              placeholder="Prompt adicional (Ej: luces de neón, agua)" 
              value={aiPrompt} 
              onChange={e => setAiPrompt(e.target.value)} 
              className="col-span-1 bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/10 px-4 py-3 text-sm outline-none text-[#111111] dark:text-white focus:border-purple-500/50 transition-colors"
            />
            <button 
              disabled={!aiFile || isEnhancing} 
              onClick={handleAIEnhance}
              className="col-span-1 bg-purple-600 text-white py-3 text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-50 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              {isEnhancing ? <><Loader2 size={16} className="animate-spin" /> Procesando...</> : <><Sparkles size={16} /> Generar</>}
            </button>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div>
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#111111] dark:text-white mb-6">
          Imágenes de {product?.name} ({selectedImages.length})
        </h2>
        {selectedImages.length === 0 ? (
          <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-12 text-center">
            <ImageIcon size={48} className="mx-auto text-[#2B2B2B]/20 mb-4" />
            <p className="text-sm text-[#2B2B2B]/40 dark:text-white/30">No hay imágenes para este producto</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedImages.map(img => (
              <div key={img.id} className="relative group bg-[#EDEDED] aspect-square overflow-hidden">
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button onClick={() => setDeleteTarget({ productId: selectedProduct, imageId: img.id })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 hover:bg-red-50">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-2">
                  <p className="text-[9px] text-[#2B2B2B]/60 uppercase tracking-widest truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)} title="Eliminar Imagen"
        description="¿Estás seguro de eliminar esta imagen?" onConfirm={handleDelete} variant="destructive" confirmLabel="Eliminar" />
    </div>
  );
};
