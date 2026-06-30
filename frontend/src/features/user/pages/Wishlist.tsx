import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Loader2, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { wishlistAPI } from "../../../core/api/api";
import { ProductCard } from "../../products/components/ProductCard";
import { useAuth } from "../../auth/context/AuthContext";

const PAGE_SIZE = 6;

export const Wishlist = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: productsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['wishlist', user?.id, 'products'],
    queryFn: () => wishlistAPI.getAll(),
    staleTime: 30000,
    enabled: !!user?.id,
  });

  const products = productsData ?? [];

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

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">No se pudieron cargar tus favoritos.</p>
        <button 
          onClick={() => refetch()}
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

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginated = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-light text-[#111111] dark:text-white mb-2">Lista de Deseos</h1>
          <p className="text-[#2B2B2B]/60 dark:text-white/60 text-sm font-light">
            {products.length} {products.length === 1 ? 'producto guardado' : 'productos guardados'}
          </p>
        </div>
        {totalPages > 1 && (
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30">
            Pág. {currentPage} / {totalPages}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {paginated.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-16 pt-8 border-t border-[#EDEDED] dark:border-white/8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-6 py-3 border border-[#EDEDED] dark:border-white/10 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white hover:bg-[#EDEDED] dark:hover:bg-white/8 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 text-[10px] font-bold transition-colors ${
                  currentPage === p
                    ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
                    : 'hover:bg-[#EDEDED] dark:hover:bg-white/8 text-[#2B2B2B] dark:text-white/60'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-6 py-3 border border-[#EDEDED] dark:border-white/10 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white hover:bg-[#EDEDED] dark:hover:bg-white/8 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
};
