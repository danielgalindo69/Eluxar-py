import { motion } from "motion/react";
import { Sparkles, ChevronRight } from "lucide-react";

interface FragranceTestIdleProps {
  onStart: () => void;
  errorMsg: string | null;
}

export const FragranceTestIdle = ({ onStart, errorMsg }: FragranceTestIdleProps) => {
  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full text-center"
      >
        {/* Icon ring */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3A4A3F] to-[#1a2a1f] flex items-center justify-center shadow-2xl shadow-[#3A4A3F]/30">
              <Sparkles size={36} className="text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#A5BAA8] animate-ping opacity-60" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#A5BAA8]" />
          </div>
        </div>

        <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-4">
          Test Olfativo
        </h1>
        <p className="text-sm font-light text-[#2B2B2B] dark:text-white/50 leading-relaxed mb-3">
          Responde{" "}
          <span className="font-semibold text-[#3A4A3F] dark:text-[#A5BAA8]">
            7 preguntas
          </span>{" "}
          sobre tus preferencias y nuestra IA analizará el catálogo para
          recomendarte la fragancia perfecta.
        </p>
        <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/20 mb-12">
          Sin escritura · Solo selecciona · Resultado inmediato
        </p>

        {/* Dimension pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            " Ocasión de uso",
            " Familia olfativa",
            " Intensidad",
            " Género",
            " Presupuesto",
            " Clima",
            " Personalidad",
          ].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 border border-[#EDEDED] dark:border-white/10 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          id="start-fragrance-test"
          onClick={onStart}
          className="group inline-flex items-center gap-3 bg-[#3A4A3F] text-white px-12 py-5 text-[11px] uppercase tracking-widest font-bold hover:bg-[#111111] dark:hover:bg-white dark:hover:text-[#111111] transition-all duration-300 shadow-xl shadow-[#3A4A3F]/20"
        >
          <Sparkles size={14} />
          Comenzar Test
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>

        {/* Error banner */}
        {errorMsg && (
          <div className="mt-6 p-4 border border-red-500/40 bg-red-500/10 text-left">
            <p className="text-[11px] uppercase tracking-widest font-bold text-red-400 mb-1">
              Error de conexión con el servidor IA
            </p>
            <p className="text-xs text-red-300/80 font-mono break-all">{errorMsg}</p>
            <p className="text-[10px] text-red-300/50 mt-2">
              Asegúrate de que el servidor IA esté corriendo:{" "}
              <span className="font-mono">localhost:5000</span>
            </p>
          </div>
        )}
      </motion.div>
    </main>
  );
};
