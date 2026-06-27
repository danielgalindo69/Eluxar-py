import { Loader2 } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-transparent gap-3">
      <Loader2 size={32} className="animate-spin text-[#3A4A3F] dark:text-[#A5BAA8]" strokeWidth={1.5} />
      <span className="text-sm text-[#2B2B2B]/60 dark:text-white/80">
        Cargando
      </span>
    </div>
  );
};
