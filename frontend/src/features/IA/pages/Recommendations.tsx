import { useState, useEffect } from "react";
import { aiAPI } from "../../../core/api/api";
import { Sparkles, Eye, ShoppingBag, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { SEOHead } from "../../../shared/components/seo/SEOHead";

interface RecomendacionItem {
  id: number;
  productId: number | null;
  respuestaTexto: string;
  fechaCreacion: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j} className="font-semibold text-[#111111] dark:text-white">
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

export const Recommendations = () => {
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiAPI.getRecommendations();
      setRecomendaciones(data);
    } catch (err) {
      console.error("[Recommendations] Error al cargar recomendaciones:", err);
      setError("No pudimos cargar las recomendaciones en este momento.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (isLoading) return (
    <main className="pt-32 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6 flex items-center justify-center">
      <SEOHead title="Eluxar | Mis Recomendaciones" exactTitle />
      <div className="text-center space-y-4">
        <Sparkles className="mx-auto text-[#3A4A3F] animate-pulse" size={32} />
        <p className="text-[#2B2B2B] dark:text-[#EDEDED]/40 dark:text-white/30 text-sm font-light uppercase tracking-widest">Cargando tus recomendaciones...</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="pt-32 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6 flex items-center justify-center">
      <SEOHead title="Eluxar | Mis Recomendaciones" exactTitle />
      <div className="text-center space-y-6">
        <p className="text-sm text-red-500 font-light">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="border border-[#111111] dark:border-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </main>
  );

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6">
      <SEOHead title="Eluxar | Mis Recomendaciones" exactTitle />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-[#3A4A3F]" size={28} />
            <h1 className="text-4xl font-light text-[#111111] dark:text-white tracking-tight">Mis Recomendaciones</h1>
          </div>
          <p className="text-sm text-[#2B2B2B] dark:text-[#EDEDED]/60 dark:text-white/50 font-light max-w-xl">
            Historial de recomendaciones personalizadas generadas por el test olfativo.
          </p>
        </div>

        {/* Empty state */}
        {recomendaciones.length === 0 && (
          <div className="text-center py-20 space-y-6">
            <p className="text-[#2B2B2B]/40 dark:text-white/30 text-sm font-light">
              Aún no tienes recomendaciones. Realiza el test olfativo para descubrir tu fragancia ideal.
            </p>
            <Link to="/fragrance-test"
              className="inline-flex items-center gap-2 bg-[#3A4A3F] dark:bg-white/10 text-white dark:text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] dark:hover:bg-white/25 transition-colors">
              <Sparkles size={14} /> Hacer el Test Olfativo
            </Link>
          </div>
        )}

        {/* History list */}
        <div className="space-y-8">
          {recomendaciones.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border border-[#EDEDED] dark:border-white/10 p-8"
            >
              {/* Date */}
              <div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/30 dark:text-white/20">
                <Clock size={12} />
                {formatDate(rec.fechaCreacion)}
              </div>

              {/* Recommendation text */}
              <div className="text-sm font-light leading-relaxed text-[#2B2B2B] dark:text-white/70 mb-6 space-y-0.5">
                {renderMarkdown(rec.respuestaTexto || "")}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col items-start gap-3">
                {rec.productId ? (
                  <button
                    onClick={() => navigate(`/product/${rec.productId}`)}
                    className="inline-flex items-center gap-2 bg-[#C8A97E] text-[#111111] px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#b09670] dark:hover:bg-[#d4b98c] transition-all duration-300"
                  >
                    <Eye size={13} /> Ver Detalles del Producto
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/catalog")}
                    className="inline-flex items-center gap-2 border border-[#111111] dark:border-white/20 text-[#111111] dark:text-white/60 px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] dark:hover:border-white transition-all duration-300"
                  >
                    <ShoppingBag size={13} /> Explorar Colección
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20 space-y-6">
          <p className="text-sm text-[#2B2B2B] dark:text-[#EDEDED]/40 dark:text-white/40 font-light">¿Quieres descubrir más fragancias?</p>
          <Link to="/fragrance-test"
            className="inline-flex items-center gap-2 bg-[#3A4A3F] dark:bg-white/10 text-white dark:text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] dark:hover:bg-white/25 transition-colors">
            <Sparkles size={14} /> Hacer el Test Olfativo
          </Link>
        </div>
      </div>
    </main>
  );
};
