import { Loader2 } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-transparent">
      <Loader2 size={32} className="animate-spin text-[#3A4A3F] dark:text-[#A5BAA8]" strokeWidth={1.5} />
      <span className="mt-4 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/40">
        Cargando
      </span>
    </div>
  );
};
