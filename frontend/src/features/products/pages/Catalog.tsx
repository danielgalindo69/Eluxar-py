import { ProductCard } from "../components/ProductCard";
import { Product } from "../types/products";
import { productsAPI, categoriesAPI, brandsAPI, Category } from "../../../core/api/api";
import { Filter, ChevronDown, Grid, LayoutGrid, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export const Catalog = () => {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const filteredProducts = activeFilter === "Todos"
    ? products 
    : products.filter(p => p.category === activeFilter || p.brand === activeFilter);

  return (
    <main className="pt-32 pb-24 bg-white min-h-screen px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col mb-16 space-y-6">
          <h1 className="text-4xl md:text-5xl font-light text-[#111111] tracking-tight">Colección Eluxar</h1>
          <p className="text-[#2B2B2B]/50 text-base font-light max-w-xl">
            Explora una cuidada selección de fragancias de alta concentración.
            Composiciones equilibradas diseñadas para trascender el género y la temporada.
          </p>
          {/* AI Search Button */}
          <button className="w-fit bg-[#3A4A3F] text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] transition-colors flex items-center gap-3">
            <Sparkles size={16} />
            Buscar con IA
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 space-y-12 shrink-0">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] mb-6">Categoría</h3>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => setActiveFilter("Todos")}
                    className={`text-xs uppercase tracking-widest transition-colors ${activeFilter === "Todos" ? "text-[#3A4A3F] font-bold" : "text-[#2B2B2B]/50 hover:text-[#111111]"}`}
                  >
                    Todos
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => setActiveFilter(cat.name)}
                      className={`text-xs uppercase tracking-widest transition-colors ${activeFilter === cat.name ? "text-[#3A4A3F] font-bold" : "text-[#2B2B2B]/50 hover:text-[#111111]"}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] mb-6">Marca</h3>
              <ul className="space-y-4">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <button 
                      onClick={() => setActiveFilter(brand.name)}
                      className={`text-xs uppercase tracking-widest transition-colors ${activeFilter === brand.name ? "text-[#3A4A3F] font-bold" : "text-[#2B2B2B]/50 hover:text-[#111111]"}`}
                    >
                      {brand.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] mb-6">Precio</h3>
              <ul className="space-y-4">
                {["Menos de 150€", "150€ - 200€", "Más de 200€"].map((price) => (
                  <li key={price} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-3 h-3 border border-[#EDEDED] group-hover:border-[#111111] transition-colors" />
                    <span className="text-xs uppercase tracking-widest text-[#2B2B2B]/50 group-hover:text-[#111111] transition-colors">{price}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] mb-6">Concentración</h3>
              <ul className="space-y-4">
                {["Alta (15-20%)", "Muy Alta (20-30%)", "Extracto (30-40%)"].map((item) => (
                  <li key={item} className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-3 h-3 border border-[#EDEDED] group-hover:border-[#111111] transition-colors" />
                    <span className="text-xs uppercase tracking-widest text-[#2B2B2B]/50 group-hover:text-[#111111] transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Grid Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-10 border-b border-[#EDEDED] pb-6">
              <div className="flex items-center space-x-6">
                 <button className="lg:hidden flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#111111] font-bold">
                   <Filter size={14} />
                   <span>Filtros</span>
                 </button>
                 <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-[#2B2B2B]/40">{filteredProducts.length} Productos</span>
              </div>

              <div className="flex items-center space-x-8">
                 <div className="hidden sm:flex items-center space-x-4">
                    <button className="text-[#111111]"><Grid size={16} strokeWidth={1.5} /></button>
                    <button className="text-[#2B2B2B]/30 hover:text-[#111111] transition-colors"><LayoutGrid size={16} strokeWidth={1.5} /></button>
                 </div>
                 <button className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#111111] font-bold">
                    <span>Ordenar por</span>
                    <ChevronDown size={14} />
                 </button>
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
                <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40">Cargando colección...</span>
              </div>
            ) : (
              /* Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && filteredProducts.length > 0 && (
              <div className="mt-24 flex items-center justify-center space-x-6">
                 <button className="text-xs uppercase tracking-widest text-[#2B2B2B]/30 font-bold hover:text-[#111111] transition-colors">Anterior</button>
                 <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-[#111111]">1</span>
                    <span className="text-xs font-bold text-[#2B2B2B]/30">2</span>
                    <span className="text-xs font-bold text-[#2B2B2B]/30">3</span>
                 </div>
                 <button className="text-xs uppercase tracking-widest text-[#111111] font-bold hover:opacity-50 transition-opacity">Siguiente</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
