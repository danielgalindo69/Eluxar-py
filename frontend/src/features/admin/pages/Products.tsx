import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Loader2, X, Package, ImageIcon, Filter } from "lucide-react";
import { productsAPI } from "../../../core/api/products";
import { Product } from "../../products/types/products";
import { toast } from "sonner";
import { AdminPaginator } from "../../../shared/components/ui/AdminPaginator";
import { EmptyStateRow } from "../../../shared/components/ui/EmptyState";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductModal, CATEGORIAS } from '../components/ProductModal';

const PAGE_SIZE = 15;


export const Products = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['admin-productos'],
    queryFn: () => productsAPI.getAll(),
    staleTime: 0,
    gcTime: 60000,
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    try {
      await productsAPI.remove(id);
      toast.success("Producto eliminado");
      queryClient.invalidateQueries({ queryKey: ['admin-productos'] });
    } catch (error) {
      toast.error("Error al eliminar producto");
    }
  };

  const filteredProducts = products.filter(product => {
    const q = searchQuery.toLowerCase();
    const categoryLabel = CATEGORIAS.find(c => c.value === product.category)?.label || product.category;
    const matchesSearch = product.name.toLowerCase().includes(q) || categoryLabel.toLowerCase().includes(q) || (product.brand || "").toLowerCase().includes(q);
    const matchesCategory = filterCategory === "" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 on filter change
  const handleSearch = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const handleCategory = (val: string) => { setFilterCategory(val); setCurrentPage(1); };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0 mb-16">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Gestión de Productos</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">
            Administra el catálogo de perfumes
            {filteredProducts.length !== products.length && (
              <span className="ml-2 text-[#3A4A3F] font-bold">{filteredProducts.length} resultados</span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-[#3A4A3F] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#2C3830] dark:hover:bg-[#4A5C4F] transition-all duration-300 shadow-sm hover:shadow-lg flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Filters Row */}
      <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/10 p-4 shadow-sm rounded-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 group-focus-within:text-[#3A4A3F] dark:group-focus-within:text-[var(--color-gold)] transition-colors" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white focus:border-[#3A4A3F] dark:focus:border-[var(--color-gold)] transition-all"
            />
            {searchQuery && (
              <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 hover:text-[#111111] dark:text-white/40 dark:hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40" size={14} />
            <select
              value={filterCategory}
              onChange={(e) => handleCategory(e.target.value)}
              className="pl-8 pr-8 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white appearance-none cursor-pointer focus:border-[#3A4A3F] dark:focus:border-[var(--color-gold)] transition-all dark:[color-scheme:dark]"
            >
              <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" value="">Todas las categorías</option>
              {CATEGORIAS.map(c => (
                <option className="bg-white dark:bg-[var(--bg-surface)] text-[#111111] dark:text-white" key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/10 shadow-sm rounded-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-[#3A4A3F] dark:text-[#A5BAA8]" size={32} />
            <p className="text-sm text-[#2B2B2B]/60 dark:text-white/80">Cargando catálogo...</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EDEDED] dark:border-white/10 bg-[#EDEDED] dark:bg-[#2A2A2A]">
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/70 px-4 py-3">Imagen</th>
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/70 px-4 py-3">Nombre</th>
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/70 px-4 py-3">Categoría</th>
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/70 px-4 py-3">Precio</th>
                    <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/70 px-4 py-3">Stock</th>
                    <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/70 px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <tr key={product.id} className="border-b border-[#EDEDED] dark:border-white/10 hover:bg-[#EDEDED]/30 dark:hover:bg-[#2A2A2A] transition-colors">
                        <td className="px-4 py-2">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-sm" />
                          ) : (
                            <div className="w-10 h-10 bg-[#EDEDED] dark:bg-white/10 flex items-center justify-center rounded-sm">
                              <ImageIcon size={16} className="text-[#2B2B2B]/30" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#2B2B2B] dark:text-white/80">{product.name}</td>
                        <td className="px-4 py-2 text-sm text-[#2B2B2B]/60 dark:text-white/40">
                          {CATEGORIAS.find(c => c.value === product.category)?.label || product.category}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#2B2B2B] font-bold dark:text-white/70">{product.price}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${product.stock > 0 ? 'text-[#3A4A3F]' : 'text-red-500'}`}>
                              {product.stock > 0 ? `En stock (${product.stock})` : 'Sin stock'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              title="Editar Producto"
                              onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                              className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors"
                            >
                              <Edit2 size={16} className="text-[#2B2B2B] dark:text-[#e8e8f0]" strokeWidth={1.5} />
                            </button>
                            <button
                              title="Eliminar Producto"
                              onClick={() => handleDelete(product.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <EmptyStateRow
                      icon={Package}
                      title="No se encontraron productos"
                      description={searchQuery || filterCategory ? "Intenta con otros filtros de búsqueda" : "Agrega tu primer producto al catálogo"}
                      colSpan={6}
                    />
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden space-y-3 p-4">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-[#EDEDED] dark:border-white/10 rounded-sm p-4 space-y-3 bg-white dark:bg-[var(--bg-surface)]"
                  >
                    {/* Header: image + name */}
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-sm shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-[#EDEDED] dark:bg-white/10 flex items-center justify-center rounded-sm shrink-0">
                          <ImageIcon size={16} className="text-[#2B2B2B]/30" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-[#111111] dark:text-white">{product.name}</span>
                    </div>
                    <hr className="border-[#EDEDED] dark:border-white/10" />
                    {/* Body: category, price, stock */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Categoría</span>
                        <span className="text-sm text-[#2B2B2B] dark:text-white/80">
                          {CATEGORIAS.find(c => c.value === product.category)?.label || product.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Precio</span>
                        <span className="text-sm font-bold text-[#2B2B2B] dark:text-white/70">{product.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#2B2B2B]/60 dark:text-white/60">Stock</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={`text-[13px] font-medium ${product.stock > 0 ? 'text-[#3A4A3F] dark:text-[#A5BAA8]' : 'text-red-500'}`}>
                            {product.stock > 0 ? `En stock (${product.stock})` : 'Sin stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <hr className="border-[#EDEDED] dark:border-white/10" />
                    {/* Footer: actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        title="Editar Producto"
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#2B2B2B]/70 dark:text-white/70 hover:text-[#111111] dark:hover:text-white hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors rounded-sm"
                      >
                        <Edit2 size={14} strokeWidth={1.5} />
                        Editar
                      </button>
                      <button
                        title="Eliminar Producto"
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors rounded-sm"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-[#EDEDED] dark:bg-white/5 flex items-center justify-center mx-auto mb-5">
                    <Package size={28} className="text-[#2B2B2B]/20 dark:text-white/20" strokeWidth={1.2} />
                  </div>
                  <p className="text-sm font-light text-[#111111] dark:text-white mb-2">No se encontraron productos</p>
                  <p className="text-[13px] text-[#2B2B2B]/50 dark:text-white/40">
                    {searchQuery || filterCategory ? "Intenta con otros filtros de búsqueda" : "Agrega tu primer producto al catálogo"}
                  </p>
                </div>
              )}
            </div>
            <AdminPaginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredProducts.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['admin-productos'] }); }}
        />
      )}
    </div>
  );
};
