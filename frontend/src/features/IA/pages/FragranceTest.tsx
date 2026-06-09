import { useState } from "react";
import { aiAPI } from "../../../core/api/api";
import { Sparkles, RotateCcw, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface TestState {
  question: string;
  options: string[];
  history: object[];
  step: number;
  finished: boolean;
  totalSteps: number;
  response: string;
}

type Phase = "idle" | "question" | "loading" | "result";

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

/* ─── Component ──────────────────────────────────────────────────────────── */
export const FragranceTest = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [state, setState] = useState<TestState | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* Start the test: call step=0, message="" */
  const handleStart = async () => {
    setPhase("loading");
    setErrorMsg(null);
    try {
      const data = await aiAPI.fragranceTest("", [], 0);
      setState(data as TestState);
      setPhase("question");
      setSelectedOption(null);
    } catch (err: any) {
      console.error("[FragranceTest] Error al iniciar:", err);
      setErrorMsg(err?.message || "Error al conectar con el servidor IA (localhost:5000)");
      setPhase("idle");
    }
  };

  /* User clicks an option — auto-advance */
  const handleOptionClick = async (option: string) => {
    if (!state || isAdvancing) return;

    setSelectedOption(option);
    setIsAdvancing(true);

    // Brief visual feedback before advancing
    await new Promise((r) => setTimeout(r, 320));

    const isFinalQuestion = state.step === state.totalSteps;

    if (isFinalQuestion) {
      // Show loading while AI generates the recommendation
      setPhase("loading");
    }

    const updatedHistory = [
      ...state.history,
      { question: state.question, answer: option }
    ];

    try {
      const data = await aiAPI.fragranceTest(option, updatedHistory, state.step);
      setState(data as TestState);

      if ((data as TestState).finished) {
        setPhase("result");
      } else {
        setPhase("question");
      }
    } catch (err: any) {
      console.error("[FragranceTest] Error al avanzar:", err);
      setErrorMsg(err?.message || "Error al conectar con el servidor IA");
      setPhase("question");
    } finally {
      setSelectedOption(null);
      setIsAdvancing(false);
    }
  };

  /* Reset the entire test */
  const handleReset = () => {
    setPhase("idle");
    setState(null);
    setSelectedOption(null);
    setIsAdvancing(false);
    setErrorMsg(null);
  };

  const progress =
    state && state.totalSteps > 0
      ? ((state.step - 1) / state.totalSteps) * 100
      : 0;

  /* ── IDLE ─────────────────────────────────────────────────────── */
  if (phase === "idle") {
    return (
      <main className="pt-32 pb-24 bg-white dark:bg-[#0F0F0F] min-h-screen px-6 flex items-center justify-center">
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
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400" />
            </div>
          </div>

          <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight mb-4">
            Test Olfativo
          </h1>
          <p className="text-sm font-light text-[#2B2B2B] dark:text-white/50 leading-relaxed mb-3">
            Responde{" "}
            <span className="font-semibold text-[#3A4A3F] dark:text-emerald-400">
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
              "🎯 Ocasión de uso",
              "🌸 Familia olfativa",
              "💨 Intensidad",
              "👤 Género",
              "💰 Presupuesto",
              "🌡️ Clima",
              "✨ Personalidad",
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
            onClick={handleStart}
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
  }

  /* ── LOADING ──────────────────────────────────────────────────── */
  if (phase === "loading") {
    const isAnalyzing = state && state.step > state.totalSteps;
    return (
      <main className="pt-32 pb-24 bg-white dark:bg-[#0F0F0F] min-h-screen px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="flex justify-center mb-8">
            <Loader2
              size={40}
              className="text-[#3A4A3F] dark:text-emerald-400 animate-spin"
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
  }

  /* ── QUESTION ─────────────────────────────────────────────────── */
  if (phase === "question" && state) {
    const questionNumber = state.step - 1;
    return (
      <main className="pt-28 pb-24 bg-white dark:bg-[#0F0F0F] min-h-screen px-6">
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
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-emerald-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-0.5 bg-[#EDEDED] dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3A4A3F] to-emerald-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

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
                      onClick={() => handleOptionClick(option)}
                      disabled={isAdvancing}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative w-full p-5 text-left transition-all duration-250 flex items-center gap-4 overflow-hidden
                        ${
                          isSelected
                            ? "bg-[#3A4A3F] border-2 border-[#3A4A3F]"
                            : "bg-transparent border-2 border-[#EDEDED] dark:border-white/8 hover:border-[#3A4A3F]/50 dark:hover:border-emerald-500/40 hover:bg-[#3A4A3F]/5 dark:hover:bg-emerald-500/5"
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
  }

  /* ── RESULT ───────────────────────────────────────────────────── */
  if (phase === "result" && state) {
    return (
      <main className="pt-28 pb-24 bg-white dark:bg-[#0F0F0F] min-h-screen px-6">
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
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-emerald-400">
                Recomendación personalizada por IA
              </p>
            </div>

            {/* Recommendation card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="relative bg-gradient-to-br from-[#1a2a1f] to-[#111111] dark:from-[#1a2a1f] dark:to-[#0a0a0a] p-8 mb-6 overflow-hidden"
            >
              {/* Decorative glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#3A4A3F]/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

              <div className="relative text-sm font-light leading-relaxed text-white/80 space-y-0.5">
                {renderMarkdown(state.response || "")}
              </div>
            </motion.div>

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
                      <span className="text-[9px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-emerald-400 shrink-0 mt-0.5 w-4">
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
                onClick={handleReset}
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
  }

  return null;
};
