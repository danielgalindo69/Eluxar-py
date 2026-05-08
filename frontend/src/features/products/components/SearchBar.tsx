import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { searchAPI } from '../../../core/api/api';
import { Product } from '../../products/types/products';
import { useNavigate } from 'react-router';
import { formatPrice } from '../../../core/api/api';

const DEBOUNCE_MS = 300;

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // ─── Debounced search ──────────────────────────────────────
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchAPI.buscarSugerencias(q);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => search(query), DEBOUNCE_MS);
    } else {
      setResults([]);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // ─── Cerrar al hacer clic fuera ────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: Product) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    navigate(`/product/${product.id}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && (isLoading || results.length > 0 || query.trim().length >= 2);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative flex items-center">
        <Search
          size={14}
          className="absolute left-3 text-[#2B2B2B]/40 dark:text-white/30 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar perfume, marca, familia olfativa..."
          className="w-full pl-9 pr-8 py-2.5 bg-[#F5F5F5] dark:bg-white/5 border border-transparent focus:border-[#111111] dark:focus:border-white/20 outline-none text-sm font-light text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/20 transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-[#2B2B2B]/30 dark:text-white/30 hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1A1A1A] border border-[#EDEDED] dark:border-white/10 shadow-2xl z-50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-[#2B2B2B]/40 dark:text-white/30">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs uppercase tracking-widest">Buscando...</span>
            </div>
          ) : results.length === 0 && query.trim().length >= 2 ? (
            <div className="px-4 py-6 text-center text-xs text-[#2B2B2B]/40 dark:text-white/30 uppercase tracking-widest">
              Sin resultados para "{query}"
            </div>
          ) : (
            <ul>
              {results.map((product, i) => (
                <li
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors border-b border-[#EDEDED] dark:border-white/5 last:border-0"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Miniatura */}
                  <div className="w-12 h-12 flex-shrink-0 bg-[#EDEDED] dark:bg-white/10 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111111] dark:text-white truncate">{product.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#3A4A3F] dark:text-[#A5BAA8] truncate">
                      {product.brand} · {product.olfactoryFamily}
                    </p>
                  </div>
                  {/* Precio */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-[#111111] dark:text-white">
                      {product.variants?.[0]?.price
                        ? `${formatPrice(product.variants[0].price)} COP`
                        : product.price}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
