import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Loader2, Heart } from "lucide-react";
import { Product } from "../../products/types/products";
import { wishlistAPI } from "../../../core/api/api";
import { ProductCard } from "../../products/components/ProductCard";

export const Wishlist = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const data = await wishlistAPI.getAll();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching wishlist:", err);
      setError("No se pudieron cargar tus favoritos.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-[#3A4A3F] dark:text-[#A5BAA8]" size={32} />
        <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/40">
          Cargando favoritos...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchWishlist}
          className="border border-[#111111] dark:border-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111] transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <Heart size={48} strokeWidth={1} className="text-[#2B2B2B]/20 dark:text-white/20" />
        <div className="space-y-2">
          <h2 className="text-2xl font-light text-[#111111] dark:text-white">Aún no tienes favoritos</h2>
          <p className="text-sm font-light text-[#2B2B2B]/60 dark:text-white/60">
            Explora nuestra colección y guarda los productos que más te gusten.
          </p>
        </div>
        <Link 
          to="/catalog"
          className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#A5BAA8] transition-colors"
        >
          Explorar Colección
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[#111111] dark:text-white mb-2">Lista de Deseos</h1>
        <p className="text-[#2B2B2B]/60 dark:text-white/60 text-sm font-light">
          {products.length} {products.length === 1 ? 'producto guardado' : 'productos guardados'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </motion.div>
  );
};
