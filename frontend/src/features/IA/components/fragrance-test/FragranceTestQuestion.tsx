import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2 } from "lucide-react";
import { TestState } from "./types";

interface FragranceTestQuestionProps {
  state: TestState;
  selectedOption: string | null;
  isAdvancing: boolean;
  errorMsg: string | null;
  progress: number;
  onOptionClick: (option: string) => void;
}

export const FragranceTestQuestion = ({
  state,
  selectedOption,
  isAdvancing,
  errorMsg,
  progress,
  onOptionClick,
}: FragranceTestQuestionProps) => {
  const questionNumber = state.step - 1;

  return (
    <main className="pt-28 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#3A4A3F] flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <h1 className="text-lg font-light text-[#111111] dark:text-white tracking-tight">
              Test Olfativo
            </h1>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/30">
              Pregunta {questionNumber} de {state.totalSteps}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-[#A5BAA8]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-0.5 bg-[#EDEDED] dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#3A4A3F] to-[#3A4A3F]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Error banner preserved here */}
        {errorMsg && (
          <div className="mb-8 p-4 border border-red-500/40 bg-red-500/10 text-left">
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

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-light text-[#111111] dark:text-white text-center mb-10 leading-snug">
              {state.question}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {(state.options || []).map((option) => {
                const isSelected = selectedOption === option;
                return (
                  <motion.button
                    key={option}
                    id={`option-${option.replace(/\s+/g, "-").toLowerCase()}`}
                    onClick={() => onOptionClick(option)}
                    disabled={isAdvancing}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full p-5 text-left transition-all duration-250 flex items-center gap-4 overflow-hidden
                      ${
                        isSelected
                          ? "bg-[#3A4A3F] border-2 border-[#3A4A3F]"
                          : "bg-transparent border-2 border-[#EDEDED] dark:border-white/8 hover:border-[#3A4A3F]/50 dark:hover:border-[#3A4A3F]/40 hover:bg-[#3A4A3F]/5 dark:hover:bg-[#3A4A3F]/5"
                      }
                      disabled:cursor-wait`}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isSelected
                          ? "border-white bg-white"
                          : "border-[#EDEDED] dark:border-white/20"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3A4A3F]" />
                      )}
                    </div>

                    <span
                      className={`text-[15px] font-light transition-colors duration-200 ${
                        isSelected
                          ? "text-white font-medium"
                          : "text-[#2B2B2B] dark:text-white/70 group-hover:text-[#111111] dark:group-hover:text-white"
                      }`}
                    >
                      {option}
                    </span>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto"
                      >
                        <Loader2
                          size={16}
                          className="text-white animate-spin"
                        />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <p className="text-center text-[9px] uppercase tracking-widest text-[#2B2B2B]/30 dark:text-white/15 mt-8">
              Selecciona una opción para continuar
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
};
