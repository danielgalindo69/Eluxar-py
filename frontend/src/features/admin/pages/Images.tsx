import { useState, useRef, useEffect } from "react";
import { PRODUCTS } from "../../products/types/products";
<<<<<<< HEAD
import { Upload, Trash2, ImageIcon, X, Sparkles, Loader2 } from "lucide-react";
=======
import { Upload, Trash2, ImageIcon, Sparkles, CheckCircle2, ChevronDown } from "lucide-react";
>>>>>>> a7d832b730725d464a57ffa70b7f5e2a086e9eb2
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
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const aiFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedImageId && aiFormRef.current) {
      aiFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedImageId]);

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
      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60 flex items-center gap-2">
          Seleccionar Producto a Gestionar
        </label>
        <div className="relative max-w-xl group">
          <select 
            value={selectedProduct} 
            onChange={e => { setSelectedProduct(e.target.value); setSelectedImageId(null); }}
            className="w-full bg-[#EDEDED]/50 dark:bg-white/5 border border-transparent hover:border-[#EDEDED] dark:hover:border-white/10 focus:border-[#3A4A3F] dark:focus:border-white/20 text-[#111111] dark:text-white pl-5 pr-12 py-4 text-sm outline-none appearance-none transition-all cursor-pointer rounded-none font-light shadow-sm"
          >
            {PRODUCTS.map(p => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-[#161616] text-[#111111] dark:text-white py-4">
                {p.name} — {p.brand}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2B2B2B]/40 dark:text-white/40 group-hover:text-[#111111] dark:group-hover:text-white transition-colors">
            <ChevronDown size={18} strokeWidth={1.5} />
          </div>
        </div>
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
              <div key={img.id} 
                   onClick={() => setSelectedImageId(img.id)}
                   className={`relative group bg-[#EDEDED] aspect-square overflow-hidden cursor-pointer border-2 transition-all duration-300 ${selectedImageId === img.id ? 'border-[#3A4A3F] dark:border-white ring-4 ring-[#3A4A3F]/20 dark:ring-white/20' : 'border-transparent hover:border-[#EDEDED] dark:hover:border-white/20'} ${selectedImageId && selectedImageId !== img.id ? 'opacity-50 grayscale-[50%]' : 'opacity-100'}`}>
                <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={`absolute inset-0 transition-colors flex items-center justify-center ${selectedImageId === img.id ? 'bg-[#3A4A3F]/10 dark:bg-black/40' : 'bg-black/0 group-hover:bg-black/30'}`}>
                  {selectedImageId === img.id && (
                    <div className="absolute top-3 right-3 bg-white text-[#3A4A3F] rounded-full p-0.5 shadow-lg">
                      <CheckCircle2 size={24} className="fill-current" />
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ productId: selectedProduct, imageId: img.id }); }}
                    className={`transition-opacity bg-white p-2 hover:bg-red-50 ${selectedImageId === img.id ? 'opacity-100 shadow-md' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-[#161616]/90 px-3 py-2 backdrop-blur-sm">
                  <p className="text-[9px] text-[#2B2B2B] dark:text-white/80 uppercase tracking-widest truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhance AI Form */}
      {selectedImageId && (
        <div ref={aiFormRef} className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/10 p-8 shadow-sm">
          <h3 className="text-lg font-light text-[#111111] dark:text-white mb-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3A4A3F] flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            Mejorar Imagen con IA
          </h3>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/60 mb-8 max-w-2xl font-light">
            Utiliza nuestra inteligencia artificial para mejorar la resolución, corregir colores, iluminar la escena o eliminar fondos no deseados de la imagen seleccionada.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Tipo de Mejora</label>
                <select className="w-full bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/10 text-[#111111] dark:text-white px-4 py-3 text-sm outline-none">
                  <option>Mejora Mágica (Automático)</option>
                  <option>Escalar Resolución (4x)</option>
                  <option>Corregir Iluminación</option>
                  <option>Eliminar Fondo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">Intensidad</label>
                <input type="range" className="w-full accent-[#3A4A3F]" min="1" max="100" defaultValue="50" />
              </div>
            </div>
            
            <div className="flex flex-col justify-end gap-3">
               <button onClick={() => toast.success('Procesando imagen con IA...')} className="w-full flex items-center justify-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-6 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors">
                 <Sparkles size={14} />
                 Aplicar Mejora
               </button>
               <button onClick={() => setSelectedImageId(null)} className="w-full border border-[#EDEDED] dark:border-white/20 text-[#111111] dark:text-white px-6 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                 Cancelar
               </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)} title="Eliminar Imagen"
        description="¿Estás seguro de eliminar esta imagen?" onConfirm={handleDelete} variant="destructive" confirmLabel="Eliminar" />
    </div>
  );
};
