import { Hero } from "../components/Hero";
import { ImageWithFallback } from "../../../shared/components/figma/ImageWithFallback";
import { Link } from "react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { Product } from "../../products/types/products";
import { productsAPI, aiAPI } from "../../../core/api/api";
import { ProductCard } from "../../products/components/ProductCard";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "../../../shared/components/seo/SEOHead";
import { useAuth } from "../../auth/context/AuthContext";

export const Home = () => {
  const { isAuthenticated } = useAuth();

  const {
    data: products = [],
    isLoading: isLoadingProducts,
  } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll(),
    staleTime: 300000,   // 5 minutos
    gcTime: 600000,      // 10 minutos
  });

  const {
    data: recomendaciones = [],
    isLoading: isLoadingRecs,
  } = useQuery({
    queryKey: ['recomendaciones'],
    queryFn: () => aiAPI.getRecommendations(),
    enabled: isAuthenticated,
    staleTime: 300000,
    gcTime: 600000,
  });

  const {
    data: destacados = [],
    isLoading: isLoadingDestacados,
  } = useQuery<Product[]>({
    queryKey: ['destacados'],
    queryFn: () => productsAPI.getDestacados(),
    staleTime: 300000,   // 5 minutos
    gcTime: 600000,      // 10 minutos
  });

  let showInvitation = false;
  let invitationVariant: 'login' | 'test' = 'test';
  let displayProducts: Product[] = [];

  if (!isAuthenticated) {
    showInvitation = true;
    invitationVariant = 'login';
  } else if (recomendaciones.length === 0) {
    showInvitation = true;
    invitationVariant = 'test';
  } else {
    const validRecs = recomendaciones.filter(r => r.productId != null);
    for (const rec of validRecs) {
      if (displayProducts.length >= 2) break;
      const product = products.find(p => p.id === String(rec.productId));
      if (product && !displayProducts.find(d => d.id === product.id)) {
        displayProducts.push(product);
      }
    }
    if (displayProducts.length < 2) {
      for (const p of products) {
        if (displayProducts.length >= 2) break;
        if (!displayProducts.find(d => d.id === p.id)) {
          displayProducts.push(p);
        }
      }
    }
    if (displayProducts.length === 0) {
      showInvitation = true;
      invitationVariant = 'test';
    }
  }

  const isLoadingAI = isLoadingProducts || (isAuthenticated && isLoadingRecs);

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Eluxar",
    "url": "https://eluxar.com",
    "description": "Tienda de fragancias de lujo con alta concentración y composiciones atemporales.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://eluxar.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main className="bg-white dark:bg-[var(--bg-base)]">
      <SEOHead
        title="Eluxar | Fragancias de Lujo"
        exactTitle
        description="Descubre Eluxar: fragancias de lujo con alta concentración, composiciones atemporales y neutrales. Test olfativo con IA incluido. Envío express gratuito."
        canonical="https://eluxar.com/"
        ogType="website"
        keywords="fragancias de lujo, perfumes alta concentración, perfumes unisex, colección Eluxar, extrait de parfum"
        structuredData={homeStructuredData}
      />
      <Hero />
      
      {/* AI Recommendation Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-[#3A4A3F]" size={24} />
                <h2 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight">Recomendado por IA</h2>
              </div>
              <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light max-w-xl">
                Según tus preferencias olfativas y tendencias actuales, nuestro asistente inteligente ha seleccionado estas fragancias para ti.
              </p>
            </div>
          </div>

          {isLoadingAI ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="animate-spin text-[#3A4A3F] dark:text-[#A5BAA8]" size={32} />
               <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/80">Cargando recomendaciones...</span>
            </div>
          ) : showInvitation ? (
            <div className="py-20 text-center space-y-6">
              <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light max-w-md mx-auto">
                {invitationVariant === 'login'
                  ? "Inicia sesión y completa el test olfativo para recibir recomendaciones personalizadas con IA."
                  : "Realiza el test olfativo para descubrir tu fragancia ideal con recomendaciones personalizadas por IA."}
              </p>
              <Link
                to={invitationVariant === 'login' ? "/auth" : "/fragrance-test"}
                className="inline-flex items-center gap-2 bg-[#3A4A3F] dark:bg-white/10 text-white dark:text-white px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] dark:hover:bg-white/25 transition-colors"
              >
                <Sparkles size={14} />
                {invitationVariant === 'login' ? "Iniciar Sesión" : "Hacer Test Olfativo"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:max-w-5xl lg:mx-auto">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Visual Collections Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="relative aspect-[16/9] group cursor-pointer overflow-hidden bg-[#EDEDED] dark:bg-[var(--bg-surface)]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1720423514789-15a33e59fc81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGVyZnVtZSUyMGJvdHRsZSUyMHN0dWRpbyUyMGx1eHVyeSUyMGZyYWdyYW5jZSUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kJTIwZ2xhc3N8ZW58MXx8fHwxNzcxNzE4NTEwfDA"
              alt="Fragancias Neutras"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
            />
            <div className="absolute inset-0 bg-[#111111]/10 group-hover:bg-[#111111]/20 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
              <span className="text-[10px] uppercase tracking-[0.4em] mb-4 font-bold">Esenciales</span>
              <h2 className="text-3xl font-light tracking-tight mb-8">Fragancias Neutras</h2>
              <Link to="/catalog" className="border border-white/30 bg-black/20 backdrop-blur-sm px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-white hover:text-black hover:border-white transition-all duration-300">Ver Todo</Link>
            </div>
          </div>
          <div className="relative aspect-[16/9] group cursor-pointer overflow-hidden bg-[#EDEDED] dark:bg-[var(--bg-surface)]">
            <div className="relative w-full h-full">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1762815716180-1d3a167828f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGVyZnVtZSUyMGJvdHRsZSUyMHN0dWRpbyUyMG5ldXRyYWx8ZW58MXx8fHwxNzcxNzE4NzI5fDA"
                alt="Ediciones Limitadas"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
              />
            </div>
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white">
              <div className="relative z-10 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
                <span className="text-[10px] uppercase tracking-[0.4em] mb-4 font-bold ">Premium</span>
                <h2 className="text-3xl font-light tracking-tight mb-8">Ediciones Limitadas</h2>
                <Link to="/catalog" className="border border-white/30 bg-black/20 backdrop-blur-sm px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-white hover:text-black hover:border-white transition-all duration-300">Explorar</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight mb-4">Productos Destacados</h2>
            <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light max-w-xl">
              Fragancias icónicas seleccionadas por su composición única y aceptación global.
            </p>
          </div>

          {isLoadingDestacados ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="animate-spin text-[#3A4A3F] dark:text-[#A5BAA8]" size={32} />
               <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/80">Cargando destacados...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {destacados.slice(0, 4).map((product, i) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                  whileHover={{ y: -5 }}
                >
                  <ProductCard product={product} />
                  {/* Rating Badge Overlay */}
                  {product.rating !== undefined && product.rating > 0 && (
                     <div className="mt-3 flex items-center justify-center gap-1 text-[#3A4A3F] dark:text-[#A5BAA8]"></div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Link to="/catalog" className="inline-flex items-center justify-center bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#2B2B2B] dark:hover:bg-[#E5E5E5] transition-all duration-300">
              Ver Toda la Colección
            </Link>
          </div>
        </div>
      </section>
      
      {/* Neutral Technical Section */}
      <section className="py-24 bg-[#EDEDED] dark:bg-[var(--bg-surface)] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
             <ImageWithFallback 
                src="https://images.unsplash.com/photo-1558710347-d8257f52e427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwc3ByYXklMjBtaXN0JTIwcGhvdG9ncmFwaHklMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzcxNzE4Nzk5fDA" 
                alt="Technical Craft"
                className="w-full aspect-[3/4] object-cover grayscale"
             />
          </div>
          <div className="w-full md:w-1/2 space-y-10">
            <h3 className="text-3xl font-light text-[#111111] dark:text-white leading-snug">Excelencia Técnica en <br />cada Composición</h3>
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] mb-3">Envases Sostenibles</h4>
                <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light leading-relaxed">Vidrio reciclado de alta densidad y cierres magnéticos diseñados para una durabilidad indefinida.</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] mb-3">Neutralidad de Género</h4>
                <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light leading-relaxed">Composiciones equilibradas que eliminan las barreras tradicionales de la perfumería masculina y femenina.</p>
              </div>
            </div>
            <Link to="/catalog" className="inline-flex items-center justify-center bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#2B2B2B] dark:hover:bg-[#E5E5E5] transition-all duration-300">Ver Colección</Link>
          </div>
        </div>
      </section>
    </main>
  );
};
