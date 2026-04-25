import { useParams, Link, useNavigate } from "react-router";
import { Product } from "../types/products";
import { productsAPI } from "../../../core/api/api";
import { ImageWithFallback } from "../../../shared/components/figma/ImageWithFallback";
import { Plus, Minus, ArrowLeft, Share2, Loader2, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useCart } from "../../cart/context/CartContext";
import { toast } from "sonner";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await productsAPI.getById(id);
        setProduct(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError("No se pudo cargar la información del producto.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const selectedVariant = product?.variants?.[selectedVariantIndex];
  const currentPrice = selectedVariant?.price ?? parseFloat((product?.price ?? '0').replace('€', ''));

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      type: product.type,
      image: product.image,
      volume: selectedVariant?.volume ?? product.specs.volume,
      price: currentPrice,
    }, quantity);
    toast.success(`${product.name} añadido a la bolsa`, {
      action: {
        label: 'Ver bolsa',
        onClick: () => navigate('/cart'),
      },
    });
  };

  if (isLoading) return (
    <div className="pt-40 pb-24 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-[#3A4A3F]" size={32} />
      <span className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40">Cargando detalles...</span>
    </div>
  );

  if (error || !product) return (
    <div className="pt-32 pb-24 text-center">
      <h2 className="text-2xl font-light">{error || "Producto no encontrado"}</h2>
      <Link to="/catalog" className="text-xs uppercase tracking-widest mt-6 inline-block underline">Volver al catálogo</Link>
    </div>
  );

  return (
    <main className="pt-24 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs & Back */}
        <div className="flex items-center justify-between py-8">
           <Link to="/catalog" className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-[#2B2B2B]/40 hover:text-[#111111] transition-colors font-bold">
              <ArrowLeft size={14} />
              <span>Volver a la colección</span>
           </Link>
           <button className="text-[#2B2B2B]/40 hover:text-[#111111] transition-colors">
              <Share2 size={16} strokeWidth={1.5} />
           </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Gallery Section */}
          <div className="w-full lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2 aspect-[16/10] bg-[#EDEDED] overflow-hidden">
                <ImageWithFallback 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover grayscale opacity-90"
                />
             </div>
             <div className="aspect-square bg-[#EDEDED] overflow-hidden">
                <ImageWithFallback 
                  src={product.hoverImage || product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
             </div>
             <div className="aspect-square bg-[#EDEDED] overflow-hidden flex items-center justify-center p-12">
                <div className="text-center">
                   <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4">Embotellado en</h4>
                   <p className="text-xs font-light text-[#2B2B2B]/60 uppercase tracking-widest">Grasse, Francia</p>
                </div>
             </div>
          </div>

          {/* Info Section */}
          <div className="w-full lg:w-2/5 space-y-10">
             <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#3A4A3F] font-bold">{product.type}</span>
                <h1 className="text-4xl md:text-5xl font-light text-[#111111] tracking-tight">{product.name}</h1>
                <p className="text-xl text-[#2B2B2B] font-medium tracking-tight">
                  {currentPrice.toFixed(2)}€
                </p>
             </div>

             <p className="text-[#2B2B2B]/60 text-base font-light leading-relaxed">
                {product.description}
             </p>

             {/* Scent Notes Block */}
             <div className="bg-[#EDEDED] p-8 space-y-8">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] mb-6">Composición Olfativa</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F]">Salida</span>
                      <p className="text-xs font-light text-[#2B2B2B]/60">{product.notes.top}</p>
                   </div>
                   <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F]">Corazón</span>
                      <p className="text-xs font-light text-[#2B2B2B]/60">{product.notes.heart}</p>
                   </div>
                   <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F]">Fondo</span>
                      <p className="text-xs font-light text-[#2B2B2B]/60">{product.notes.base}</p>
                   </div>
                </div>
             </div>

             {/* Purchase Actions */}
             <div className="space-y-6 pt-6">
                {/* Variant Selector */}
                {product.variants && product.variants.length > 1 && (
                  <div className="flex flex-col space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold">Formato</span>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant, idx) => (
                        <button
                          key={variant.volume}
                          onClick={() => setSelectedVariantIndex(idx)}
                          className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                            selectedVariantIndex === idx
                              ? 'border-[#111111] bg-[#111111] text-white'
                              : 'border-[#EDEDED] hover:border-[#111111] text-[#2B2B2B]'
                          }`}
                        >
                          {variant.volume} — {variant.price.toFixed(2)}€
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Single variant display */}
                {(!product.variants || product.variants.length <= 1) && (
                  <div className="flex flex-col space-y-3">
                    <span className="text-[10px] uppercase tracking-widest font-bold">Formato</span>
                    <div className="border border-[#111111] px-4 py-2 text-center text-xs uppercase tracking-widest font-bold w-fit">
                      {product.specs.volume}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-6">
                   <div className="flex flex-col space-y-3">
                      <span className="text-[10px] uppercase tracking-widest font-bold">Cantidad</span>
                      <div className="flex items-center space-x-6 border border-[#EDEDED] px-4 py-2">
                         <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#2B2B2B]/40 hover:text-[#111111] transition-colors"><Minus size={14} /></button>
                         <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                         <button onClick={() => setQuantity(quantity + 1)} className="text-[#2B2B2B]/40 hover:text-[#111111] transition-colors"><Plus size={14} /></button>
                      </div>
                   </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="w-full bg-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] transition-all duration-300 shadow-lg shadow-black/5 flex items-center justify-center gap-3"
                >
                   <ShoppingBag size={16} strokeWidth={1.5} />
                   Añadir a la Bolsa
                </motion.button>
                
                <p className="text-center text-[10px] uppercase tracking-[0.1em] text-[#2B2B2B]/40 font-bold">
                   Envío express gratuito en toda la colección
                </p>
             </div>

             {/* Technical Details Tabs */}
             <div className="border-t border-[#EDEDED] pt-10">
                <div className="flex space-x-8 border-b border-[#EDEDED] mb-8">
                   <button 
                     onClick={() => setActiveTab("details")}
                     className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === "details" ? "border-b-2 border-[#111111] text-[#111111]" : "text-[#2B2B2B]/30 hover:text-[#111111]"}`}
                   >
                     Detalles Técnicos
                   </button>
                   <button 
                     onClick={() => setActiveTab("shipping")}
                     className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === "shipping" ? "border-b-2 border-[#111111] text-[#111111]" : "text-[#2B2B2B]/30 hover:text-[#111111]"}`}
                   >
                     Envío y Devoluciones
                   </button>
                </div>
                
                <div className="min-h-[100px]">
                   {activeTab === "details" ? (
                      <div className="grid grid-cols-2 gap-y-6">
                         <div className="flex flex-col space-y-1">
                            <span className="text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest font-bold">Longevidad</span>
                            <span className="text-xs uppercase tracking-widest font-bold">{product.specs.longevity}</span>
                         </div>
                         <div className="flex flex-col space-y-1">
                            <span className="text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest font-bold">Estela</span>
                            <span className="text-xs uppercase tracking-widest font-bold">{product.specs.sillage}</span>
                         </div>
                         <div className="flex flex-col space-y-1">
                            <span className="text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest font-bold">Concentración</span>
                            <span className="text-xs uppercase tracking-widest font-bold">25% Aceite Puro</span>
                         </div>
                         <div className="flex flex-col space-y-1">
                            <span className="text-[10px] text-[#2B2B2B]/40 uppercase tracking-widest font-bold">Familia Olfativa</span>
                            <span className="text-xs uppercase tracking-widest font-bold">{product.olfactoryFamily || '—'}</span>
                         </div>
                      </div>
                   ) : (
                      <p className="text-xs font-light text-[#2B2B2B]/60 leading-relaxed uppercase tracking-widest">
                         Envíos internacionales disponibles. Devoluciones aceptadas en un plazo de 30 días si el precinto no ha sido vulnerado. Incluye una muestra de 2ml para probar antes de abrir el frasco principal.
                      </p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};
