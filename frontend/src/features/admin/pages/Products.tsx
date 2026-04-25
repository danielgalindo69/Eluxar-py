import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Loader2, X, Package, Image as ImageIcon, Sparkles } from "lucide-react";
import { productsAPI, categoriesAPI, brandsAPI } from "../../../core/api/api";
import { Product } from "../../products/types/products";
import { toast } from "sonner";

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error("Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    
    try {
      await productsAPI.remove(id);
      toast.success("Producto eliminado");
      fetchProducts();
    } catch (error) {
      toast.error("Error al eliminar producto");
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Gestión de Productos</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Administra el catálogo de perfumes</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-[#3A4A3F] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#111111] transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/40 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" size={20} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white/30 focus:bg-white dark:focus:bg-[#111111] transition-all"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#3A4A3F]" size={32} />
            <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-bold">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDEDED] dark:border-white/8 bg-[#EDEDED] dark:bg-white/5">
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Imagen</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Nombre</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Tipo</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Precio</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Stock</th>
                  <th className="text-right text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B] dark:text-white/50 px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-[#EDEDED] dark:border-white/8 hover:bg-[#EDEDED]/30 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-2">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover" />
                      </td>
                      <td className="px-4 py-2 text-sm text-[#2B2B2B] dark:text-white/80">{product.name}</td>
                      <td className="px-4 py-2 text-sm text-[#2B2B2B]/60 dark:text-white/40">{product.type}</td>
                      <td className="px-4 py-2 text-sm text-[#2B2B2B] font-bold">{product.price}</td>
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
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/10 transition-colors"
                          >
                            <Edit2 size={16} className="text-[#2B2B2B]" strokeWidth={1.5} />
                          </button>
                          <button 
                            title="Eliminar Producto"
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 font-bold">No se encontraron productos</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductModal = ({ product, onClose, onSuccess }: ProductModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [brands, setBrands] = useState<{id: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    nombre: product?.name || "",
    descripcion: product?.description || "",
    categoria: product?.category || "",
    marca: product?.brand || "",
    familiaOlfativa: product?.olfactoryFamily || "",
    activo: true,
    destacado: false,
    precio: product?.variants?.[0]?.price || 0,
    stock: product?.variants?.[0]?.stock || 0,
    imageUrl: product?.image || ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, brs] = await Promise.all([categoriesAPI.getAll(), brandsAPI.getAll()]);
        setCategories(cats);
        setBrands(brs);
      } catch (error) {
        toast.error("Error al cargar categorías/marcas");
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      variantes: [
        {
          tamanoMl: 100, // Default for now
          precioVenta: formData.precio,
          stockActual: formData.stock,
          activa: true
        }
      ],
      imagenes: [formData.imageUrl]
    };

    try {
      if (product) {
        await productsAPI.update(product.id, payload);
        toast.success("Producto actualizado");
      } else {
        await productsAPI.create(payload);
        toast.success("Producto creado");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#111111]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1A1A1A] w-full max-w-2xl shadow-2xl border border-[#EDEDED] dark:border-white/10 overflow-hidden">
        <div className="bg-[#3A4A3F] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
                <Package size={18} />
             </div>
             <div>
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold">{product ? "Editar" : "Nuevo"} Producto</h2>
                <p className="text-[9px] uppercase tracking-widest text-white/60 mt-0.5">Define los detalles del perfume</p>
             </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Nombre</label>
                <div className="relative group">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[#3A4A3F] transition-colors" size={14} />
                  <input 
                    type="text" 
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: L'Eau de Parfum"
                    className="w-full bg-[#EDEDED]/50 border-none px-10 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Descripción</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Describe las notas y la esencia..."
                  className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Precio (€)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: Number(e.target.value)})}
                    className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Stock Inicial</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Categoría</label>
                <select 
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Marca</label>
                <select 
                  required
                  value={formData.marca}
                  onChange={(e) => setFormData({...formData, marca: e.target.value})}
                  className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">Familia Olfativa</label>
                <input 
                  type="text" 
                  value={formData.familiaOlfativa}
                  onChange={(e) => setFormData({...formData, familiaOlfativa: e.target.value})}
                  placeholder="Ej: Amaderada"
                  className="w-full bg-[#EDEDED]/50 border-none px-4 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40">URL Imagen</label>
                <div className="relative group">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/30 group-focus-within:text-[#3A4A3F] transition-colors" size={14} />
                  <input 
                    type="url" 
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://images..."
                    className="w-full bg-[#EDEDED]/50 border-none px-10 py-3 text-xs focus:ring-1 focus:ring-[#3A4A3F] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.destacado}
                    onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                    className="w-4 h-4 accent-[#3A4A3F]" 
                  />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60">Destacado</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#EDEDED] py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#EDEDED] transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-[#111111] text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#3A4A3F] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              <span>{product ? "Actualizar Perfume" : "Crear Perfume"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
