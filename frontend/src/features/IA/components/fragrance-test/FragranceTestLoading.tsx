import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface FragranceTestLoadingProps {
  isAnalyzing: boolean;
}

export const FragranceTestLoading = ({ isAnalyzing }: FragranceTestLoadingProps) => {
  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="flex justify-center mb-8">
          <Loader2
            size={40}
            className="text-[#3A4A3F] dark:text-[#A5BAA8] animate-spin"
          />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/40">
          {isAnalyzing
            ? "Analizando tus preferencias y consultando el catálogo..."
            : "Preparando el test..."}
        </p>
        {isAnalyzing && (
          <p className="text-[9px] uppercase tracking-widest text-[#2B2B2B]/30 dark:text-white/20 mt-2">
            La IA está eligiendo la fragancia perfecta para ti
          </p>
        )}
      </motion.div>
    </main>
  );
};
