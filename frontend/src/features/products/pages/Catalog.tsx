import { ProductCard } from "../components/ProductCard";
import { Product } from "../types/products";
import { productsAPI, brandsAPI } from "../../../core/api/api";
import { Filter, ChevronDown, Grid, LayoutGrid, Sparkles, X } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "../../../shared/components/seo/SEOHead";
import { AuthAwareLink } from "../../auth/components/AuthAwareLink";

const ITEMS_PER_PAGE = 9;

type PriceRange = 'all' | 'under150' | '150to200' | 'over200';
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';
type GridSize = 2 | 3;

export const Catalog = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtros sincronizados con la URL para que sean indexables y compartibles
  const activeFilter = searchParams.get("category") ?? "Todos";
  const activeGenderFilter = (searchParams.get("gender") ?? "all") as Product['gender'] | 'all';
  const activeConcentracion = searchParams.get("concentracion") ?? "all";
  const activePriceRange = (searchParams.get("price") ?? "all") as PriceRange;
  const sortOption = (searchParams.get("sort") ?? "default") as SortOption;

  const isPageChangeRef = useRef(false);

  useEffect(() => {
    if (isPageChangeRef.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      isPageChangeRef.current = false;
    }
  }, [searchParams]);

  const setActiveFilter = (value: string) => {
    setSearchParams(prev => {
      if (value === "Todos") prev.delete("category");
      else prev.set("category", value);
      prev.delete("page");
      return prev;
    });
  };

  const setActiveGenderFilter = (value: Product['gender'] | 'all') => {
    setSearchParams(prev => {
      if (value === "all") prev.delete("gender");
      else prev.set("gender", value);
      prev.delete("page");
      return prev;
    });
  };

  const setActiveConcentracion = (value: string) => {
    setSearchParams(prev => {
      if (value === "all") prev.delete("concentracion");
      else prev.set("concentracion", value);
      prev.delete("page");
      return prev;
    });
  };

  const setActivePriceRange = (value: PriceRange) => {
    setSearchParams(prev => {
      if (value === "all") prev.delete("price");
      else prev.set("price", value);
      prev.delete("page");
      return prev;
    });
  };

  const setSortOption = (value: SortOption) => {
    setSearchParams(prev => {
      if (value === "default") prev.delete("sort");
      else prev.set("sort", value);
      return prev;
    });
  };

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [gridSize, setGridSize] = useState<GridSize>(3);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Concentración: false,
    Género: false,
    Marca: false,
    Precio: false,
  });

  const toggleSection = (name: string) => {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Paginacion desde URL
  const currentPage = parseInt(searchParams.get("page") ?? "1", 10);
  const setCurrentPage = (page: number | ((p: number) => number)) => {
    isPageChangeRef.current = true;
    const nextPage = typeof page === "function" ? page(currentPage) : page;
    setSearchParams(prev => {
      if (nextPage === 1) prev.delete("page");
      else prev.set("page", String(nextPage));
      return prev;
    });
  };

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll(),
    staleTime: 300000,   // 5 minutos
    gcTime: 600000,      // 10 minutos
  });

  const concentrations = useMemo(() => {
    const values = new Set<string>();
    products.forEach(p => {
      if (p.concentracion) values.add(p.concentracion);
    });
    return Array.from(values).sort();
  }, [products]);

  const {
    data: brands = [],
    isLoading: isLoadingBrands,
  } = useQuery<Category[]>({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll(),
    staleTime: 1800000,  // 30 minutos
    gcTime: 3600000,     // 1 hora
  });

  const isLoading = isLoadingProducts || isLoadingBrands;
  const error = productsError ? "No se pudo cargar la colección. Por favor, intenta de nuevo." : null;

  // Cuando cambian los filtros principales (NO page), no hay que hacer nada extra
  // porque setActiveFilter/etc ya eliminan "page" del URL.

  const parsePrice = (priceStr: string) => {
    // Convierte "150.000 COP" a 150000
    const cleanStr = priceStr.replace(/COP/gi, '').replace(/\./g, '').replace(/,/g, '.').trim();
    return parseFloat(cleanStr) || 0;
  };

  const filteredAndSorted = useMemo(() => {
    let result = products;

    // Category/brand filter
    if (activeFilter !== "Todos") {
      result = result.filter(p => p.category === activeFilter || p.brand === activeFilter);
    }

    // Gender filter
    if (activeGenderFilter !== 'all') {
      result = result.filter(p => p.gender === activeGenderFilter);
    }

    // Concentration filter
    if (activeConcentracion !== 'all') {
      result = result.filter(p => p.concentracion === activeConcentracion);
    }

    // Price filter
    if (activePriceRange !== 'all') {
      result = result.filter(p => {
        const price = parsePrice(p.price);
        if (activePriceRange === 'under150') return price < 150000;
        if (activePriceRange === '150to200') return price >= 150000 && price <= 200000;
        if (activePriceRange === 'over200') return price > 200000;
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
  }, [products, activeFilter, activeGenderFilter, activeConcentracion, activePriceRange, sortOption]);

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
    <>
      <main className="pt-32 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col mb-16 space-y-6">
          <SEOHead
            title="Colección de Perfumes | Eluxar"
            exactTitle
            description={`Explora la colección Eluxar de fragancias de lujo con alta concentración. ${activeFilter !== 'Todos' ? `Categoría: ${activeFilter}. ` : ''}Composiciones atemporales y neutrales. Envío express gratuito.`}
            canonical={`https://eluxar.com/catalog${activeFilter !== 'Todos' ? `?category=${encodeURIComponent(activeFilter)}` : ''}`}
            keywords={`colección fragancias, ${activeFilter !== 'Todos' ? activeFilter + ', ' : ''}perfumes lujo Colombia, extrait de parfum, Eluxar`}
          />
          <h1 className="text-4xl md:text-5xl font-light text-[#111111] dark:text-white tracking-tight">Colección Eluxar</h1>
          <p className="text-[#2B2B2B]/50 dark:text-white/50 text-base font-light max-w-xl">
            Explora una cuidada selección de fragancias de alta concentración.
            Composiciones equilibradas diseñadas para trascender el género y la temporada.
          </p>
          {/* AI Search Button */}
          <AuthAwareLink
            to="/chat"
            customMessage="Inicia sesión para chatear con nuestro experto en fragancias y buscar con IA."
            className="w-fit bg-[#3A4A3F] text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#2C3830] dark:hover:bg-[#4A5C4F] transition-all duration-300 cursor-pointer flex items-center gap-3 shadow-sm hover:shadow-lg"
          >
            <Sparkles size={16} />
            Buscar con IA
          </AuthAwareLink>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            {/* Concentración */}
            <div className="border-b border-[#EDEDED] dark:border-white/10">
              <button
                onClick={() => toggleSection("Concentración")}
                className="w-full flex items-center justify-between py-5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#2B2B2B]/60 dark:hover:text-white/60 transition-colors"
                aria-expanded={openSections["Concentración"]}
                aria-controls="filter-section-concentracion"
              >
                Concentración
                <ChevronDown size={14} className={`transition-transform duration-300 ${openSections["Concentración"] ? 'rotate-180' : ''}`} />
              </button>
              {openSections["Concentración"] && (
                <div id="filter-section-concentracion" className="pb-8">
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => setActiveConcentracion("all")}
                        className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activeConcentracion === "all" ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                      >
                        <span>Todas</span>
                        {activeConcentracion === "all" && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                      </button>
                    </li>
                    {concentrations.map((conc) => (
                      <li key={conc}>
                        <button
                          onClick={() => setActiveConcentracion(conc)}
                          className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activeConcentracion === conc ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                        >
                          <span>{conc}</span>
                          {activeConcentracion === conc && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Género */}
            <div className="border-b border-[#EDEDED] dark:border-white/10">
              <button
                onClick={() => toggleSection("Género")}
                className="w-full flex items-center justify-between py-5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#2B2B2B]/60 dark:hover:text-white/60 transition-colors"
                aria-expanded={openSections["Género"]}
                aria-controls="filter-section-genero"
              >
                Género
                <ChevronDown size={14} className={`transition-transform duration-300 ${openSections["Género"] ? 'rotate-180' : ''}`} />
              </button>
              {openSections["Género"] && (
                <div id="filter-section-genero" className="pb-8">
                  <ul className="space-y-2">
                    {([
                      { value: 'all', label: 'Todos' },
                      { value: 'Masculino', label: 'Masculino' },
                      { value: 'Femenino', label: 'Femenino' },
                      { value: 'Niño', label: 'Niño' },
                      { value: 'Niña', label: 'Niña' },
                      { value: 'Unisex', label: 'Unisex' }
                    ] as { value: Product['gender'] | 'all'; label: string }[]).map((genderItem) => (
                      <li key={genderItem.value}>
                        <button
                          onClick={() => setActiveGenderFilter(genderItem.value)}
                          className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activeGenderFilter === genderItem.value ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                        >
                          <span>{genderItem.label}</span>
                          {activeGenderFilter === genderItem.value && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Marca */}
            <div className="border-b border-[#EDEDED] dark:border-white/10">
              <button
                onClick={() => toggleSection("Marca")}
                className="w-full flex items-center justify-between py-5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#2B2B2B]/60 dark:hover:text-white/60 transition-colors"
                aria-expanded={openSections["Marca"]}
                aria-controls="filter-section-marca"
              >
                Marca
                <ChevronDown size={14} className={`transition-transform duration-300 ${openSections["Marca"] ? 'rotate-180' : ''}`} />
              </button>
              {openSections["Marca"] && (
                <div id="filter-section-marca" className="pb-8">
                  <ul className="space-y-2">
                    {brands.map((brand) => (
                      <li key={brand.id}>
                        <button
                          onClick={() => setActiveFilter(brand.name)}
                          className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activeFilter === brand.name ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                        >
                          <span>{brand.name}</span>
                          {activeFilter === brand.name && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Precio */}
            <div className="border-b border-[#EDEDED] dark:border-white/10">
              <button
                onClick={() => toggleSection("Precio")}
                className="w-full flex items-center justify-between py-5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#2B2B2B]/60 dark:hover:text-white/60 transition-colors"
                aria-expanded={openSections["Precio"]}
                aria-controls="filter-section-precio"
              >
                Precio
                <ChevronDown size={14} className={`transition-transform duration-300 ${openSections["Precio"] ? 'rotate-180' : ''}`} />
              </button>
              {openSections["Precio"] && (
                <div id="filter-section-precio" className="pb-8">
                  <ul className="space-y-2">
                    {([
                      { value: 'all', label: 'Todos los precios' },
                      { value: 'under150', label: 'Menos de $150.000' },
                      { value: '150to200', label: '$150.000 – $200.000' },
                      { value: 'over200', label: 'Más de $200.000' },
                    ] as { value: PriceRange; label: string }[]).map((item) => (
                      <li key={item.value}>
                        <button
                          onClick={() => setActivePriceRange(item.value)}
                          className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activePriceRange === item.value ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                        >
                          <span>{item.label}</span>
                          {activePriceRange === item.value && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          {/* Main Grid Content */}
          <div className="flex-1">
            {/* Mobile Filters Swiper */}
            <div className="lg:hidden mb-8 space-y-4">
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveConcentracion("all")}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-sm whitespace-nowrap transition-colors ${
                    activeConcentracion === "all"
                      ? "bg-[#3A4A3F] text-white border-[#3A4A3F] dark:bg-[#A5BAA8] dark:text-[#111111] dark:border-[#A5BAA8]"
                      : "bg-[#F5F5F5] dark:bg-white/5 text-[#2B2B2B]/60 dark:text-white/60 border-transparent"
                  }`}
                >
                  Concentración: Todas
                </button>
                {concentrations.map((conc) => (
                  <button
                    key={conc}
                    onClick={() => setActiveConcentracion(conc)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-sm whitespace-nowrap transition-colors ${
                      activeConcentracion === conc
                        ? "bg-[#3A4A3F] text-white border-[#3A4A3F] dark:bg-[#A5BAA8] dark:text-[#111111] dark:border-[#A5BAA8]"
                        : "bg-[#F5F5F5] dark:bg-white/5 text-[#2B2B2B]/60 dark:text-white/60 border-transparent"
                    }`}
                  >
                    {conc}
                  </button>
                ))}
              </div>

              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveGenderFilter("all")}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-sm whitespace-nowrap transition-colors ${
                    activeGenderFilter === "all"
                      ? "bg-[#3A4A3F] text-white border-[#3A4A3F] dark:bg-[#A5BAA8] dark:text-[#111111] dark:border-[#A5BAA8]"
                      : "bg-[#F5F5F5] dark:bg-white/5 text-[#2B2B2B]/60 dark:text-white/60 border-transparent"
                  }`}
                >
                  Género: Todos
                </button>
                {([
                  { value: 'Masculino', label: 'Masculino' },
                  { value: 'Femenino', label: 'Femenino' },
                  { value: 'Niño', label: 'Niño' },
                  { value: 'Niña', label: 'Niña' },
                  { value: 'Unisex', label: 'Unisex' }
                ] as const).map((genderItem) => (
                  <button
                    key={genderItem.value}
                    onClick={() => setActiveGenderFilter(genderItem.value)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-sm whitespace-nowrap transition-colors ${
                      activeGenderFilter === genderItem.value
                        ? "bg-[#3A4A3F] text-white border-[#3A4A3F] dark:bg-[#A5BAA8] dark:text-[#111111] dark:border-[#A5BAA8]"
                        : "bg-[#F5F5F5] dark:bg-white/5 text-[#2B2B2B]/60 dark:text-white/60 border-transparent"
                    }`}
                  >
                    {genderItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-10 border-b border-[#EDEDED] dark:border-white/8 pb-6">
              <div className="flex items-center space-x-6">
                <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#111111] dark:text-white font-bold">
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
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 shadow-lg z-50 min-w-[200px]">
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
                  onClick={() => refetchProducts()}
                  className="mt-4 text-[10px] uppercase tracking-widest font-bold border-b border-[#111111] pb-1"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16 ${gridSize === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col group cursor-wait">
                    {/* Image Skeleton */}
                    <div className="w-full aspect-[4/5] bg-[#F5F5F5] dark:bg-white/5 mb-6 rounded-sm"></div>
                    {/* Title Skeleton */}
                    <div className="h-4 bg-[#F5F5F5] dark:bg-white/5 w-3/4 mb-3 rounded-sm"></div>
                    {/* Brand Skeleton */}
                    <div className="h-3 bg-[#F5F5F5] dark:bg-white/5 w-1/2 mb-6 rounded-sm"></div>
                    {/* Price and Action Skeleton */}
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#EDEDED] dark:border-white/5">
                      <div className="h-4 bg-[#F5F5F5] dark:bg-white/5 w-1/3 rounded-sm"></div>
                      <div className="h-4 bg-[#F5F5F5] dark:bg-white/5 w-1/4 rounded-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {paginatedProducts.length === 0 ? (
                  <div className="py-32 text-center">
                    <p className="text-[#2B2B2B]/60 dark:text-white/60 text-sm font-light uppercase tracking-widest">No se encontraron productos con los filtros seleccionados.</p>
                    <button onClick={() => { setActiveFilter("Todos"); setActiveGenderFilter('all'); setActiveConcentracion('all'); setActivePriceRange('all'); }} className="mt-6 text-[10px] uppercase tracking-widest font-bold border-b border-[#111111] pb-1">
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

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-sm bg-white dark:bg-[var(--bg-surface)] h-full flex flex-col shadow-2xl ml-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-[#EDEDED] dark:border-white/10">
              <span className="text-[10px] uppercase tracking-widest font-bold dark:text-white">Filtros</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-[#2B2B2B] dark:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Concentración */}
              <div className="border-b border-[#EDEDED] dark:border-white/10 px-6">
                <button
                  onClick={() => toggleSection("Concentración")}
                  className="w-full flex items-center justify-between py-5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#2B2B2B]/60 dark:hover:text-white/60 transition-colors"
                  aria-expanded={openSections["Concentración"]}
                  aria-controls="mobile-filter-section-concentracion"
                >
                  Concentración
                  <ChevronDown size={14} className={`transition-transform duration-300 ${openSections["Concentración"] ? 'rotate-180' : ''}`} />
                </button>
                {openSections["Concentración"] && (
                  <div id="mobile-filter-section-concentracion" className="pb-6">
                    <ul className="space-y-2">
                      <li>
                        <button
                          onClick={() => setActiveConcentracion("all")}
                          className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activeConcentracion === "all" ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                        >
                          <span>Todas</span>
                          {activeConcentracion === "all" && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                        </button>
                      </li>
                      {concentrations.map((conc) => (
                        <li key={conc}>
                          <button
                            onClick={() => setActiveConcentracion(conc)}
                            className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activeConcentracion === conc ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                          >
                            <span>{conc}</span>
                            {activeConcentracion === conc && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Género */}
              <div className="border-b border-[#EDEDED] dark:border-white/10 px-6">
                <button
                  onClick={() => toggleSection("Género")}
                  className="w-full flex items-center justify-between py-5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#2B2B2B]/60 dark:hover:text-white/60 transition-colors"
                  aria-expanded={openSections["Género"]}
                  aria-controls="mobile-filter-section-genero"
                >
                  Género
                  <ChevronDown size={14} className={`transition-transform duration-300 ${openSections["Género"] ? 'rotate-180' : ''}`} />
                </button>
                {openSections["Género"] && (
                  <div id="mobile-filter-section-genero" className="pb-6">
                    <ul className="space-y-2">
                      {([
                        { value: 'all', label: 'Todos' },
                        { value: 'Masculino', label: 'Masculino' },
                        { value: 'Femenino', label: 'Femenino' },
                        { value: 'Niño', label: 'Niño' },
                        { value: 'Niña', label: 'Niña' },
                        { value: 'Unisex', label: 'Unisex' }
                      ] as { value: Product['gender'] | 'all'; label: string }[]).map((genderItem) => (
                        <li key={genderItem.value}>
                          <button
                            onClick={() => setActiveGenderFilter(genderItem.value)}
                            className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activeGenderFilter === genderItem.value ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                          >
                            <span>{genderItem.label}</span>
                            {activeGenderFilter === genderItem.value && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Marca */}
              <div className="border-b border-[#EDEDED] dark:border-white/10 px-6">
                <button
                  onClick={() => toggleSection("Marca")}
                  className="w-full flex items-center justify-between py-5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#2B2B2B]/60 dark:hover:text-white/60 transition-colors"
                  aria-expanded={openSections["Marca"]}
                  aria-controls="mobile-filter-section-marca"
                >
                  Marca
                  <ChevronDown size={14} className={`transition-transform duration-300 ${openSections["Marca"] ? 'rotate-180' : ''}`} />
                </button>
                {openSections["Marca"] && (
                  <div id="mobile-filter-section-marca" className="pb-6">
                    <ul className="space-y-2">
                      {brands.map((brand) => (
                        <li key={brand.id}>
                          <button
                            onClick={() => setActiveFilter(brand.name)}
                            className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activeFilter === brand.name ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                          >
                            <span>{brand.name}</span>
                            {activeFilter === brand.name && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Precio */}
              <div className="border-b border-[#EDEDED] dark:border-white/10 px-6">
                <button
                  onClick={() => toggleSection("Precio")}
                  className="w-full flex items-center justify-between py-5 text-[9px] uppercase tracking-[0.3em] font-bold text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#2B2B2B]/60 dark:hover:text-white/60 transition-colors"
                  aria-expanded={openSections["Precio"]}
                  aria-controls="mobile-filter-section-precio"
                >
                  Precio
                  <ChevronDown size={14} className={`transition-transform duration-300 ${openSections["Precio"] ? 'rotate-180' : ''}`} />
                </button>
                {openSections["Precio"] && (
                  <div id="mobile-filter-section-precio" className="pb-6">
                    <ul className="space-y-2">
                      {([
                        { value: 'all', label: 'Todos los precios' },
                        { value: 'under150', label: 'Menos de $150.000' },
                        { value: '150to200', label: '$150.000 – $200.000' },
                        { value: 'over200', label: 'Más de $200.000' },
                      ] as { value: PriceRange; label: string }[]).map((item) => (
                        <li key={item.value}>
                          <button
                            onClick={() => setActivePriceRange(item.value)}
                            className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-between ${activePriceRange === item.value ? "bg-[#3A4A3F]/10 text-[#3A4A3F] dark:bg-[#A5BAA8]/10 dark:text-[#A5BAA8] font-bold border border-[#3A4A3F]/20 dark:border-[#A5BAA8]/20" : "text-[#2B2B2B]/60 dark:text-white/50 hover:bg-[#F5F5F5] dark:hover:bg-white/5 border border-transparent"}`}
                          >
                            <span>{item.label}</span>
                            {activePriceRange === item.value && <span className="w-1.5 h-1.5 rounded-full bg-[#3A4A3F] dark:bg-[#A5BAA8]" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-[#EDEDED] dark:border-white/10 flex gap-4">
              <button
                onClick={() => {
                  setActiveFilter("Todos");
                  setActiveGenderFilter("all");
                  setActiveConcentracion("all");
                  setActivePriceRange("all");
                }}
                className="flex-1 px-4 py-3 text-[10px] uppercase tracking-widest font-bold border border-[#2B2B2B]/20 dark:border-white/20 dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/5 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-4 py-3 bg-[#111111] text-white dark:bg-white dark:text-[#111111] text-[10px] uppercase tracking-widest font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#A5BAA8] transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
