import { useState, useEffect } from "react";
import { aiAPI } from "../services/api";
import { PRODUCTS } from "../types/products";
import { ProductCard } from "../components/ProductCard";
import { Sparkles, Info } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";

export const Recommendations = () => {
  const [recommendedProducts, setRecommendedProducts] = useState<typeof PRODUCTS>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    aiAPI.getRecommendations().then(data => {
      const products = data.recommendedProductIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean) as typeof PRODUCTS;
      setRecommendedProducts(products);
      setReasons(data.reasons);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return (
    <main className="pt-32 pb-24 bg-white min-h-screen px-6 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Sparkles className="mx-auto text-[#3A4A3F] animate-pulse" size={32} />
        <p className="text-[#2B2B2B]/40 text-sm font-light uppercase tracking-widest">Personalizando tus recomendaciones...</p>
      </div>
    </main>
  );

  return (
    <main className="pt-32 pb-24 bg-white min-h-screen px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-[#3A4A3F]" size={28} />
            <h1 className="text-4xl font-light text-[#111111] tracking-tight">Recomendaciones para Ti</h1>
          </div>
          <p className="text-sm text-[#2B2B2B]/60 font-light max-w-xl">
            Fragancias seleccionadas especialmente para ti, basadas en tu perfil olfativo y preferencias de compra.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12">
          {recommendedProducts.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
              className="relative"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <ProductCard product={product} />
              {/* Why Recommended Tooltip */}
              {reasons[product.id] && (
                <div className="mt-4 relative">
                  <div className="flex items-start gap-2 bg-[#EDEDED] p-4">
                    <Info size={14} className="text-[#3A4A3F] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#2B2B2B]/60 font-light leading-relaxed">{reasons[product.id]}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20 space-y-6">
          <p className="text-sm text-[#2B2B2B]/40 font-light">¿Quieres descubrir más fragancias perfectas para ti?</p>
          <Link to="/fragrance-test"
            className="inline-flex items-center gap-2 bg-[#3A4A3F] text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] transition-colors">
            <Sparkles size={14} /> Hacer el Test Olfativo
          </Link>
        </div>
      </div>
    </main>
  );
};
