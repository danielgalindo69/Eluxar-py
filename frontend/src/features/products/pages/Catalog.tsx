import { ProductCard } from "../components/ProductCard";
import { Product } from "../types/products";
import { productsAPI, categoriesAPI, brandsAPI, Category } from "../../../core/api/api";
import { Filter, ChevronDown, Grid, LayoutGrid, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

const ITEMS_PER_PAGE = 9;

type PriceRange = 'all' | 'under150' | '150to200' | 'over200';
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';
type GridSize = 2 | 3;

export const Catalog = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activePriceRange, setActivePriceRange] = useState<PriceRange>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData, brandsData] = await Promise.all([
          productsAPI.getAll(),
          categoriesAPI.getAll(),
          brandsAPI.getAll()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setBrands(brandsData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching catalog data:", err);
        setError("No se pudo cargar la colección. Por favor, intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [activeFilter, activePriceRange, sortOption]);

  const parsePrice = (priceStr: string) => parseFloat(priceStr.replace('COP', '').replace(',', '.'));

  const filteredAndSorted = useMemo(() => {
    let result = products;

    // Category/brand filter
    if (activeFilter !== "Todos") {
      result = result.filter(p => p.category === activeFilter || p.brand === activeFilter);
    }

    // Price filter
    if (activePriceRange !== 'all') {
      result = result.filter(p => {
        const price = parsePrice(p.price);
        if (activePriceRange === 'under150') return price < 150;
        if (activePriceRange === '150to200') return price >= 150 && price <= 200;
        if (activePriceRange === 'over200') return price > 200;
        return true;
      });
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortOption === 'price-asc') return parsePrice(a.price) - parsePrice(b.price);
      if (sortOption === 'price-desc') return parsePrice(b.price) - parsePrice(a.price);
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, activeFilter, activePriceRange, sortOption]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const sortLabels: Record<SortOption, string> = {
    default: 'Por defecto',
    'price-asc': 'Precio: Menor a Mayor',
    'price-desc': 'Precio: Mayor a Menor',
    'name-asc': 'Nombre A-Z',
  };

  return (
    <main className="pt-32 pb-24 bg-white dark:bg-[#161616] min-h-screen px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col mb-16 space-y-6">
          <h1 className="text-4xl md:text-5xl font-light text-[#111111] dark:text-white tracking-tight">Colección Eluxar</h1>
          <p className="text-[#2B2B2B]/50 dark:text-white/50 text-base font-light max-w-xl">
            Explora una cuidada selección de fragancias de alta concentración.
            Composiciones equilibradas diseñadas para trascender el género y la temporada.
          </p>
          {/* AI Search Button */}
          <button
            onClick={() => navigate('/fragrance-test')}
            className="w-fit bg-[#3A4A3F] text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] transition-colors flex items-center gap-3"
          >
            <Sparkles size={16} />
            Buscar con IA
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 space-y-12 shrink-0">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white mb-6">Categoría</h3>
              <ul className="space-y-4">
                <li>
                  <button
                    onClick={() => setActiveFilter("Todos")}
                    className={`text-xs uppercase tracking-widest transition-colors ${activeFilter === "Todos" ? "text-[#3A4A3F] dark:text-[#A5BAA8] font-bold" : "text-[#2B2B2B]/50 hover:text-[#111111] dark:text-white"}`}
                  >
                    Todos
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setActiveFilter(cat.name)}
                      className={`text-xs uppercase tracking-widest transition-colors ${activeFilter === cat.name ? "text-[#3A4A3F] dark:text-[#A5BAA8] font-bold" : "text-[#2B2B2B]/50 hover:text-[#111111] dark:text-white"}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white mb-6">Marca</h3>
              <ul className="space-y-4">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <button
                      onClick={() => setActiveFilter(brand.name)}
                      className={`text-xs uppercase tracking-widest transition-colors ${activeFilter === brand.name ? "text-[#3A4A3F] dark:text-[#A5BAA8] font-bold" : "text-[#2B2B2B]/50 hover:text-[#111111] dark:text-white"}`}
                    >
                      {brand.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white mb-6">Precio</h3>
              <ul className="space-y-4">
                {([
                  { value: 'all', label: 'Todos los precios' },
                  { value: 'under150', label: 'Menos de 150COP' },
                  { value: '150to200', label: '150COP – 200COP' },
                  { value: 'over200', label: 'Más de 200COP' },
                ] as { value: PriceRange; label: string }[]).map((item) => (
                  <li key={item.value} className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActivePriceRange(item.value)}>
                    <div className={`w-3 h-3 border transition-colors ${activePriceRange === item.value ? 'border-[#3A4A3F] dark:border-[#A5BAA8] bg-[#3A4A3F] dark:bg-[#A5BAA8]' : 'border-[#EDEDED] dark:border-white/8 group-hover:border-[#111111]'}`} />
                    <span className={`text-xs uppercase tracking-widest transition-colors ${activePriceRange === item.value ? 'text-[#3A4A3F] dark:text-[#A5BAA8] font-bold' : 'text-[#2B2B2B]/50 group-hover:text-[#111111] dark:text-white'}`}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Grid Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-10 border-b border-[#EDEDED] dark:border-white/8 pb-6">
              <div className="flex items-center space-x-6">
                <button className="lg:hidden flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#111111] dark:text-white font-bold">
                  <Filter size={14} />
                  <span>Filtros</span>
                </button>
                <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/40">{filteredAndSorted.length} Productos</span>
              </div>

              <div className="flex items-center space-x-8">
                {/* Grid size toggle */}
                <div className="hidden sm:flex items-center space-x-4">
                  <button
                    onClick={() => setGridSize(3)}
                    className={`transition-colors ${gridSize === 3 ? 'text-[#111111] dark:text-white' : 'text-[#2B2B2B]/30 hover:text-[#111111] dark:text-white'}`}
                  >
                    <Grid size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setGridSize(2)}
                    className={`transition-colors ${gridSize === 2 ? 'text-[#111111] dark:text-white' : 'text-[#2B2B2B]/30 hover:text-[#111111] dark:text-white'}`}
                  >
                    <LayoutGrid size={16} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#111111] dark:text-white font-bold"
                  >
                    <span>{sortLabels[sortOption]}</span>
                    <ChevronDown size={14} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 shadow-lg z-10 min-w-[200px]">
                      {(Object.entries(sortLabels) as [SortOption, string][]).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => { setSortOption(value); setShowSortMenu(false); }}
                          className={`block w-full text-left px-5 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${sortOption === value ? 'bg-[#3A4A3F] text-white' : 'text-[#2B2B2B] dark:text-[#EDEDED] hover:bg-[#EDEDED] dark:hover:bg-white/5 dark:bg-white/5'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="py-20 text-center">
                <p className="text-sm text-red-500 font-light">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-[10px] uppercase tracking-widest font-bold border-b border-[#111111] pb-1"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-[#3A4A3F]" size={32} />
                <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/60">Cargando colección...</span>
              </div>
            ) : (
              <>
                {paginatedProducts.length === 0 ? (
                  <div className="py-32 text-center">
                    <p className="text-[#2B2B2B]/60 dark:text-white/60 text-sm font-light uppercase tracking-widest">No se encontraron productos con los filtros seleccionados.</p>
                    <button onClick={() => { setActiveFilter("Todos"); setActivePriceRange('all'); }} className="mt-6 text-[10px] uppercase tracking-widest font-bold border-b border-[#111111] pb-1">
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16 ${gridSize === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="mt-24 flex items-center justify-center space-x-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-xs uppercase tracking-widest text-[#2B2B2B]/50 font-bold hover:text-[#111111] dark:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <div className="flex items-center space-x-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`text-xs font-bold transition-colors ${currentPage === page ? 'text-[#111111] dark:text-white' : 'text-[#2B2B2B]/30 hover:text-[#111111] dark:text-white'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="text-xs uppercase tracking-widest text-[#111111] dark:text-white font-bold hover:opacity-50 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
