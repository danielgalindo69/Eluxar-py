import { useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, RotateCcw, Eye, ShoppingBag } from "lucide-react";
import { TestState } from "./types";
import { useNavigate } from "react-router";
import { aiAPI } from "../../../../core/api/api";

interface FragranceTestResultProps {
  state: TestState;
  onReset: () => void;
}

/* ─── Markdown renderer (bold + line breaks) ─────────────────────────────── */
function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      ) : (
        part
      )
    );
    return (
      <span key={i} className="block leading-relaxed">
        {parts}
      </span>
    );
  });
}

export const FragranceTestResult = ({ state, onReset }: FragranceTestResultProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    aiAPI.saveRecommendation(state.productId, state.response).catch((err) =>
      console.error("[FragranceTestResult] Error al guardar recomendación:", err)
    );
  }, []);

  return (
    <main className="pt-28 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Result header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3A4A3F] to-emerald-600 flex items-center justify-center shadow-2xl shadow-[#3A4A3F]/40">
                <Sparkles size={32} className="text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight mb-2">
              Tu Fragancia Ideal
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-[#A5BAA8]">
              Recomendación personalizada por IA
            </p>
          </div>

          {/* Recommendation card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="relative bg-gradient-to-br from-[#1a2a1f] to-[#111111] dark:from-[#1a2a1f] dark:to-[var(--bg-base)] p-8 mb-6 overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#3A4A3F]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

            <div className="relative text-sm font-light leading-relaxed text-white/80 space-y-0.5">
              {renderMarkdown(state.response || "")}
            </div>
          </motion.div>

          {/* Recommendation Actions */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {state.productId ? (
              <button
                onClick={() => navigate(`/product/${state.productId}`)}
                className="inline-flex items-center gap-2 bg-[#C8A97E] text-[#111111] px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#b09670] transition-all duration-300"
              >
                <Eye size={13} /> Ver Detalles del Producto
              </button>
            ) : (
              <button
                onClick={() => navigate("/catalog")}
                className="inline-flex items-center gap-2 bg-[#C8A97E] text-[#111111] px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#b09670] transition-all duration-300"
              >
                <ShoppingBag size={13} /> Explorar Colección
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#EDEDED] dark:bg-white/8" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-[#2B2B2B]/30 dark:text-white/20">
              Test completado
            </span>
            <div className="flex-1 h-px bg-[#EDEDED] dark:bg-white/8" />
          </div>

          {/* Answers summary */}
          {state.history.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8 space-y-2"
            >
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/20 mb-3">
                Tus respuestas
              </p>
              {(state.history as Array<{ question: string; answer: string }> || []).map(
                (item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 border border-[#EDEDED] dark:border-white/5"
                  >
                    <span className="text-[9px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-[#A5BAA8] shrink-0 mt-0.5 w-4">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[10px] text-[#2B2B2B]/40 dark:text-white/25 mb-0.5">
                        {item.question}
                      </p>
                      <p className="text-sm font-light text-[#111111] dark:text-white/80">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          )}

          {/* Reset button */}
          <div className="text-center">
            <button
              id="reset-fragrance-test"
              onClick={onReset}
              className="inline-flex items-center gap-2 border-2 border-[#111111] dark:border-white/20 text-[#111111] dark:text-white/60 px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] dark:hover:border-white transition-all duration-300"
            >
              <RotateCcw size={13} />
              Repetir el Test
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};
