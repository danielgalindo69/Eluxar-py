import { useState, useMemo, useEffect, useRef } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { PRODUCTS } from "../types/products";
import { ProductCard } from "../components/ProductCard";

export const Search = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.notes.top.toLowerCase().includes(q) ||
      p.notes.heart.toLowerCase().includes(q) ||
      p.notes.base.toLowerCase().includes(q) ||
      p.olfactoryFamily.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  const suggestions = ['Santal', 'Oud', 'Iris', 'Floral', 'Amaderada', 'Oriental', 'Cítrica'];

  return (
    <main className="pt-32 pb-24 bg-white min-h-screen px-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative border-b-2 border-[#111111] pb-4">
            <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-[#111111]" size={24} strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, marca o ingrediente..."
              className="bg-transparent border-none outline-none w-full text-2xl font-light pl-10 pr-10 placeholder:text-[#2B2B2B]/20"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 hover:text-[#111111]">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {debouncedQuery.trim() ? (
          <>
            <div className="mb-10">
              <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-bold">
                {results.length} resultado{results.length !== 1 ? 's' : ''} para "{debouncedQuery}"
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
                <p className="text-[#2B2B2B]/40 text-sm font-light uppercase tracking-widest">
                  No se encontraron resultados
                </p>
                <p className="text-[#2B2B2B]/30 text-sm font-light">
                  Prueba con otros términos de búsqueda
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center space-y-10">
            <p className="text-[#2B2B2B]/40 text-sm font-light uppercase tracking-widest">
              Busca entre nuestra colección de fragancias exclusivas
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map(s => (
                <button key={s} onClick={() => setQuery(s)}
                  className="border border-[#EDEDED] px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 hover:border-[#111111] hover:text-[#111111] transition-colors">
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
