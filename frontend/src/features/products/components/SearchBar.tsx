import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { searchAPI } from '../../../core/api/api';
import { Product } from '../../products/types/products';
import { useNavigate } from 'react-router';
import { formatPrice } from '../../../core/api/api';
import { motion, AnimatePresence } from 'motion/react';

const DEBOUNCE_MS = 300;

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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
        setSelectedIndex(-1);
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
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]); // Seleccionar el primero si no hay selección y presiona Enter
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
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
          onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar perfume, marca, familia olfativa..."
          className="w-full pl-9 pr-8 py-2.5 bg-[#F5F5F5] dark:bg-white/5 border border-transparent focus:border-[#3A4A3F] dark:focus:border-[#C8A97E] focus:bg-white dark:focus:bg-[#1A1A1A] focus:shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-sm outline-none text-sm font-medium text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/20 transition-all duration-300"
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
      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1A1A] border border-[#EDEDED] dark:border-white/10 shadow-2xl rounded-sm z-50 overflow-hidden"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-[#2B2B2B]/40 dark:text-white/30">
                <Loader2 size={24} className="animate-spin text-[#3A4A3F] dark:text-[#C8A97E]" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Buscando fragancias...</span>
              </div>
            ) : results.length === 0 && query.trim().length >= 2 ? (
              <div className="px-4 py-10 text-center space-y-2">
                <Search size={32} className="mx-auto text-[#2B2B2B]/20 dark:text-white/20 mb-4" />
                <p className="text-xs text-[#2B2B2B]/60 dark:text-white/60 font-light">No encontramos resultados para</p>
                <p className="text-sm font-bold text-[#111111] dark:text-white">"{query}"</p>
              </div>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {results.map((product, i) => (
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors border-b border-[#EDEDED] dark:border-white/5 last:border-0 ${
                      selectedIndex === i ? 'bg-[#F5F5F5] dark:bg-white/10' : 'hover:bg-[#F5F5F5]/50 dark:hover:bg-white/5'
                    }`}
                  >
                    {/* Miniatura */}
                    <div className="w-14 h-14 flex-shrink-0 bg-[#EDEDED] dark:bg-white/5 overflow-hidden rounded-sm relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#111111] dark:text-white truncate tracking-wide">{product.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-[#3A4A3F] dark:text-[#C8A97E] truncate mt-1">
                        {product.brand} <span className="text-[#2B2B2B]/30 dark:text-white/30 mx-1">|</span> {product.olfactoryFamily}
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
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
