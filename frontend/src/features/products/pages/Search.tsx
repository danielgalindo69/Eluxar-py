import { useState, useMemo, useEffect, useRef } from "react";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { Product } from "../types/products";
import { productsAPI } from "../../../core/api/api";
import { ProductCard } from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";

export const Search = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<Product['gender'] | 'Todos'>('Todos');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll(),
    staleTime: 300000,   // 5 minutos
    gcTime: 600000,      // 10 minutos
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    let filtered = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.notes?.top && p.notes.top.toLowerCase().includes(q)) ||
      (p.notes?.heart && p.notes.heart.toLowerCase().includes(q)) ||
      (p.notes?.base && p.notes.base.toLowerCase().includes(q)) ||
      p.olfactoryFamily.toLowerCase().includes(q)
    );

    if (selectedGender !== 'Todos') {
      filtered = filtered.filter(p => p.gender === selectedGender);
    }
    return filtered;
  }, [debouncedQuery, products, selectedGender]);

  const suggestions = ['Santal', 'Oud', 'Iris', 'Floral', 'Amaderada', 'Oriental', 'Cítrica'];

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative border-b-2 border-[#111111] dark:border-white/20 focus-within:border-[#111111] dark:focus-within:border-white transition-colors pb-4">
            <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-[#111111] dark:text-white" size={24} strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, marca o ingrediente..."
              className="bg-transparent border-none outline-none w-full text-2xl font-light pl-10 pr-10 text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/40 dark:placeholder:text-white/30"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Gender Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {(['Todos', 'Masculino', 'Femenino', 'Niño', 'Niña', 'Unisex'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender)}
              className={`px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold border transition-all duration-300 rounded-sm ${
                selectedGender === gender
                  ? 'bg-[#3A4A3F] text-white border-[#3A4A3F] shadow-sm'
                  : 'bg-transparent text-[#2B2B2B]/60 dark:text-white/60 border-[#EDEDED] dark:border-white/10 hover:border-[#111111] dark:hover:border-white hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#2B2B2B]/40 dark:text-white/30">
            <Loader2 size={32} className="animate-spin text-[#3A4A3F] dark:text-[#A5BAA8]" />
            <span className="text-xs uppercase tracking-widest font-bold">Cargando colección...</span>
          </div>
        ) : debouncedQuery.trim() ? (
          <>
            <div className="mb-10">
              <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60 font-bold">
                {results.length} resultado{results.length !== 1 ? 's' : ''} para "{debouncedQuery}"
                {selectedGender !== 'Todos' && ` en ${selectedGender}`}
              </span>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {results.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 space-y-6">
                <p className="text-[#2B2B2B]/60 dark:text-white/60 text-sm font-light uppercase tracking-widest">
                  No se encontraron resultados
                </p>
                <p className="text-[#2B2B2B]/40 dark:text-white/40 text-sm font-light">
                  Prueba con otros términos de búsqueda o filtros
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-10">
            <p className="text-[#2B2B2B]/60 dark:text-white/60 text-sm font-light uppercase tracking-widest">
              Busca entre nuestra colección de fragancias exclusivas
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map(s => (
                <button key={s} onClick={() => setQuery(s)}
                  className="border border-[#EDEDED] dark:border-white/10 px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/60 hover:border-[#111111] dark:hover:border-white hover:text-[#111111] dark:hover:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
