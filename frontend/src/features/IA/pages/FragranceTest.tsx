import { useState, useEffect } from "react";
import { aiAPI } from "../../../core/api/api";
import { PRODUCTS } from "../../products/types/products";
import { ProductCard } from "../../products/components/ProductCard";
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Question {
  id: number;
  question: string;
  options: string[];
}

export const FragranceTest = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    aiAPI.getFragranceTestQuestions().then(q => { setQuestions(q); setIsLoading(false); });
  }, []);

  const handleAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = await aiAPI.submitFragranceTest(answers);
      setResults(data.recommendedProductIds);
    } catch { /* noop */ }
    finally { setIsSubmitting(false); }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setResults(null);
  };

  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentStep];
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;
  const recommendedProducts = results ? PRODUCTS.filter(p => results.includes(p.id)) : [];

  if (isLoading) return (
    <main className="pt-32 pb-24 bg-white dark:bg-[#161616] dark:bg-[#0F0F0F] min-h-screen px-6 flex items-center justify-center">
      <p className="text-[#2B2B2B] dark:text-[#EDEDED]/40 text-sm font-light uppercase tracking-widest">Preparando tu test olfativo...</p>
    </main>
  );

  if (results) return (
    <main className="pt-32 pb-24 bg-white dark:bg-[#161616] dark:bg-[#0F0F0F] min-h-screen px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="text-[#3A4A3F]" size={28} />
            <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight">Tus Fragancias Ideales</h1>
          </div>
          <p className="text-sm text-[#2B2B2B] dark:text-[#EDEDED]/60 dark:text-white/50 font-light max-w-xl mx-auto">
            Basándonos en tus preferencias olfativas, nuestra IA ha seleccionado estas fragancias especialmente para ti.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {recommendedProducts.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={handleReset}
            className="inline-flex items-center gap-2 border border-[#111111] dark:border-white text-[#111111] dark:text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] dark:hover:bg-white dark:bg-[#161616] hover:text-white dark:hover:text-[#111111] dark:text-white transition-colors">
            <RotateCcw size={14} /> Repetir Test
          </button>
        </div>
      </div>
    </main>
  );

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[#161616] dark:bg-[#0F0F0F] min-h-screen px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="text-[#3A4A3F]" size={28} />
            <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight">Test Olfativo</h1>
          </div>
          <p className="text-sm text-[#2B2B2B] dark:text-[#EDEDED]/60 dark:text-white/50 font-light">
            Responde 5 preguntas y descubre tu fragancia ideal
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-[#EDEDED]/40">Pregunta {currentStep + 1} de {questions.length}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F]">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-[#EDEDED] dark:bg-white/5 dark:bg-white/10">
            <motion.div className="h-full bg-[#3A4A3F]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-8">
              <h2 className="text-2xl font-light text-[#111111] dark:text-white text-center">{currentQuestion.question}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options.map(option => (
                  <button key={option} onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`p-6 border text-left transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-[#3A4A3F] bg-[#3A4A3F] text-white'
                        : 'border-[#EDEDED] dark:border-white/8 dark:border-white/15 hover:border-[#111111] dark:hover:border-white text-[#111111] dark:text-white'
                    }`}
                  >
                    <span className="text-sm uppercase tracking-widest font-bold">{option}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#EDEDED] dark:border-white/8 dark:border-white/10">
          <button onClick={handlePrev} disabled={currentStep === 0}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-[#EDEDED]/40 hover:text-[#111111] dark:text-white dark:hover:text-white disabled:opacity-30 disabled:hover:text-[#2B2B2B] dark:text-[#EDEDED]/40 transition-colors">
            <ArrowLeft size={14} /> Anterior
          </button>

          {currentStep === questions.length - 1 ? (
            <button onClick={handleSubmit} disabled={!allAnswered || isSubmitting}
              className="bg-[#3A4A3F] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] transition-colors disabled:opacity-50 flex items-center gap-2">
              <Sparkles size={14} /> {isSubmitting ? 'Analizando...' : 'Ver Resultados'}
            </button>
          ) : (
            <button onClick={handleNext} disabled={!answers[currentQuestion?.id]}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#111111] dark:text-white hover:text-[#3A4A3F] disabled:opacity-30 transition-colors">
              Siguiente <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </main>
  );
};
