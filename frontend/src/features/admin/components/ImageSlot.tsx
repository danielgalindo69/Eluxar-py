import { useRef } from "react";
import { X, Upload, Loader2, CheckCircle } from "lucide-react";

interface ImageSlotProps {
  index: number;
  preview: string | null;
  label: string;
  onSelect: (index: number, file: File) => void;
  onRemove: (index: number) => void;
  isUploading: boolean;
}

export const ImageSlot = ({ index, preview, label, onSelect, onRemove, isUploading }: ImageSlotProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <p className="text-[9px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40 mb-2">{label}</p>

      {preview ? (
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
