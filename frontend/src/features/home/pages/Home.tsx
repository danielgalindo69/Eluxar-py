import React, { useState, useEffect } from "react";
import { Hero } from "../components/Hero";
import { ImageWithFallback } from "../../../shared/components/figma/ImageWithFallback";
import { Link } from "react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { Product } from "../../products/types/products";
import { productsAPI } from "../../../core/api/api";
import { ProductCard } from "../../products/components/ProductCard";
import { toast } from "sonner";


export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success('¡Suscripción confirmada! Bienvenido al Eluxar Journal.');
    setNewsletterEmail('');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productsAPI.getAll();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products for Home:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // AI Recommended Products (primeros 2 productos)
  const aiRecommended = products.slice(0, 2);
  // Featured Products (últimos 2 productos)
  const featuredProducts = products.slice(2, 4);

  return (
    <main>
      <Hero />
      
      {/* AI Recommendation Section */}
      <section className="py-24 bg-white dark:bg-[#0F0F0F] px-6">
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

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="animate-spin text-[#3A4A3F]" size={32} />
               <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40">Cargando recomendaciones...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {aiRecommended.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Visual Collections Grid */}
      <section className="py-32 bg-white dark:bg-[#0F0F0F] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="relative aspect-[16/9] group cursor-pointer overflow-hidden bg-[#EDEDED] dark:bg-[#1A1A1A]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1720423514789-15a33e59fc81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGVyZnVtZSUyMGJvdHRsZSUyMHN0dWRpbyUyMGx1eHVyeSUyMGZyYWdyYW5jZSUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kJTIwZ2xhc3N8ZW58MXx8fHwxNzcxNzE4NTEwfDA"
              alt="Fragancias Neutras"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
            />
            <div className="absolute inset-0 bg-[#111111]/10 group-hover:bg-[#111111]/20 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
              <span className="text-[10px] uppercase tracking-[0.4em] mb-4 font-bold">Esenciales</span>
              <h2 className="text-3xl font-light tracking-tight mb-8">Fragancias Neutras</h2>
              <Link to="/catalog" className="border border-white/30 bg-black/20 backdrop-blur-sm px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-white hover:text-black hover:border-white transition-all duration-300">Ver Todo</Link>
            </div>
          </div>
          <div className="relative aspect-[16/9] group cursor-pointer overflow-hidden bg-[#EDEDED] dark:bg-[#1A1A1A]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1762815716180-1d3a167828f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwcGVyZnVtZSUyMGJvdHRsZSUyMHN0dWRpbyUyMG5ldXRyYWx8ZW58MXx8fHwxNzcxNzE4NzI5fDA"
              alt="Ediciones Limitadas"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
            />
            <div className="absolute inset-0 bg-[#111111]/10 group-hover:bg-[#111111]/20 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
              <span className="text-[10px] uppercase tracking-[0.4em] mb-4 font-bold">Premium</span>
              <h2 className="text-3xl font-light tracking-tight mb-8">Ediciones Limitadas</h2>
              <Link to="/catalog" className="border border-white/30 bg-black/20 backdrop-blur-sm px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-white hover:text-black hover:border-white transition-all duration-300">Explorar</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-white dark:bg-[#0F0F0F] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-light text-[#111111] dark:text-white tracking-tight mb-4">Productos Destacados</h2>
            <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light max-w-xl">
              Fragancias icónicas seleccionadas por su composición única y aceptación global.
            </p>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="animate-spin text-[#3A4A3F]" size={32} />
               <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40">Cargando destacados...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
      <section className="py-24 bg-[#EDEDED] dark:bg-[#161616] px-6">
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
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] mb-3">Concentración Extrait</h4>
                <p className="text-sm text-[#2B2B2B]/60 dark:text-white/50 font-light leading-relaxed">Nuestras fórmulas utilizan una de las concentraciones más altas permitidas en la industria para garantizar una longevidad excepcional.</p>
              </div>
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

      {/* Subscription Banner */}
      <section className="relative h-[40vh] bg-white dark:bg-[#0F0F0F] flex items-center justify-center text-center px-6 border-t border-[#EDEDED] dark:border-white/5">
         <div className="max-w-3xl flex flex-col items-center">
           <h2 className="text-[#111111] dark:text-white text-2xl md:text-4xl font-light tracking-tight mb-8">
             Eluxar Journal
           </h2>
           <p className="text-[#2B2B2B]/60 dark:text-white/50 text-base mb-10 font-light max-w-lg mx-auto">
             Acceso exclusivo a nuevos lanzamientos y notas técnicas de perfumería.
           </p>
           <form onSubmit={handleNewsletter} className="flex w-full max-w-md border-b border-[#111111] dark:border-white/40 pb-2">
              <input type="email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} placeholder="Correo electrónico" className="flex-1 bg-transparent border-none outline-none text-sm font-light uppercase tracking-widest text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/40 dark:placeholder:text-white/30" />
              <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-[#111111] dark:text-white hover:text-[#3A4A3F] dark:hover:text-[#A5BAA8] transition-colors">Unirse</button>
           </form>
         </div>
      </section>
    </main>
  );
};
