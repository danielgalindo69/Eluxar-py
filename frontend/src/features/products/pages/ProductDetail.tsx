import { useParams, Link, useNavigate } from "react-router";
import { Product } from "../types/products";
import { productsAPI, formatPrice } from "../../../core/api/api";
import { ImageWithFallback } from "../../../shared/components/figma/ImageWithFallback";
import { Plus, Minus, ArrowLeft, Share2, ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { useCart } from "../../cart/context/CartContext";
import { toast } from "sonner";
import { ProductReviews } from "../components/ProductReviews";
import { useWishlist } from "../../user/context/WishlistContext";
import { useAuth } from "../../auth/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SEOHead } from "../../../shared/components/seo/SEOHead";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  const { wishlistIds, toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const {
    data: product,
    isLoading,
    error: productError,
  } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id!),
    enabled: !!id,
    staleTime: 300000,   // 5 minutos
    gcTime: 600000,      // 10 minutos
  });

  const inWishlist = product ? isInWishlist(product.id) : false;
  const error = productError ? "No se pudo cargar la información del producto." : null;

  const selectedVariant = product?.variants?.[selectedVariantIndex];
  const currentPrice = selectedVariant?.price ?? parseFloat((product?.price ?? '0').replace('COP', ''));

  const handleAddToCart = () => {
    if (!product) return;
    const vId = selectedVariant?.id;
    
    addItem({
      varianteId: vId,
      productId: product.id,
      name: product.name,
      type: product.type,
      image: product.image,
      volume: selectedVariant?.volume ?? product.variants?.[0]?.volume ?? '',
      price: currentPrice,
    }, quantity);
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast('Inicia sesión para guardar favoritos', {
        action: { label: 'Iniciar sesión', onClick: () => navigate('/auth') }
      });
      return;
    }

    try {
      await toggleWishlist(product.id);
      if (!inWishlist) {
        toast.success(`${product.name} añadido a favoritos`);
      }
    } catch {
      toast.error('Error al actualizar favoritos');
    }
  };

  if (isLoading) return (
    <main className="pt-24 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-8 animate-pulse">
          <div className="h-4 bg-[#F5F5F5] dark:bg-white/5 w-40 rounded-sm"></div>
          <div className="flex space-x-6">
            <div className="h-4 w-4 bg-[#F5F5F5] dark:bg-white/5 rounded-sm"></div>
            <div className="h-4 w-4 bg-[#F5F5F5] dark:bg-white/5 rounded-sm"></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-20 animate-pulse">
          {/* Gallery Skeleton */}
          <div className="w-full lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 aspect-[16/10] bg-[#F5F5F5] dark:bg-white/5 rounded-sm"></div>
            <div className="aspect-square bg-[#F5F5F5] dark:bg-white/5 rounded-sm"></div>
            <div className="aspect-square bg-[#F5F5F5] dark:bg-white/5 rounded-sm"></div>
          </div>

          {/* Info Skeleton */}
          <div className="w-full lg:w-2/5 space-y-10">
            <div className="space-y-4">
              <div className="h-3 bg-[#F5F5F5] dark:bg-white/5 w-20 rounded-sm"></div>
              <div className="h-10 bg-[#F5F5F5] dark:bg-white/5 w-3/4 rounded-sm"></div>
              <div className="h-6 bg-[#F5F5F5] dark:bg-white/5 w-1/3 rounded-sm"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-[#F5F5F5] dark:bg-white/5 w-full rounded-sm"></div>
              <div className="h-4 bg-[#F5F5F5] dark:bg-white/5 w-full rounded-sm"></div>
              <div className="h-4 bg-[#F5F5F5] dark:bg-white/5 w-5/6 rounded-sm"></div>
            </div>
            <div className="h-32 bg-[#F5F5F5] dark:bg-white/5 w-full rounded-sm"></div>
            <div className="h-14 bg-[#F5F5F5] dark:bg-white/5 w-full rounded-sm mt-8"></div>
          </div>
        </div>
      </div>
    </main>
  );

  if (error || !product) return (
    <div className="pt-32 pb-24 text-center">
      <h2 className="text-2xl font-light">{error || "Producto no encontrado"}</h2>
      <Link to="/catalog" className="text-xs uppercase tracking-widest mt-6 inline-block underline">Volver al catálogo</Link>
    </div>
  );

  return (
    <main className="pt-24 pb-24 bg-white dark:bg-[var(--bg-base)] min-h-screen">
      <SEOHead
        title={product ? `${product.name} | Eluxar` : "Eluxar"}
        exactTitle
        description={`${product?.description?.slice(0, 150) ?? `Fragancia de alta concentración.`} Notas: ${product?.notasSalida ?? ''}. Disponible en ${product?.variants?.[0]?.volume ?? ''}.`}
        canonical={`https://eluxar.com/product/${product.id}`}
        image={product.image}
        ogType="product"
        keywords={`${product.name}, ${product.type}, ${product.brand ?? 'Eluxar'}, fragancia lujo, ${product.olfactoryFamily ?? ''}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": [product.image, product.hoverImage].filter(Boolean),
          "brand": {
            "@type": "Brand",
            "name": product.brand ?? "Eluxar"
          },
          "sku": String(product.id),
          "offers": {
            "@type": "Offer",
            "priceCurrency": "COP",
            "price": currentPrice,
            "availability": "https://schema.org/InStock",
            "url": `https://eluxar.com/product/${product.id}`,
            "seller": { "@type": "Organization", "name": "Eluxar" }
          },
          ...(product.rating && product.rating > 0 ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating.toFixed(1),
              "reviewCount": product.reviewCount ?? 0,
              "bestRating": "5",
              "worstRating": "1"
            }
          } : {})
        }}
      />
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs & Back */}
        <div className="flex items-center justify-between py-8">
          <Link to="/catalog" className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors font-bold">
            <ArrowLeft size={14} />
            <span>Volver a la colección</span>
          </Link>
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleToggleWishlist}
              className="text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors"
              title={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Heart size={16} strokeWidth={1.5} className={inWishlist ? "fill-red-500 text-red-500" : ""} />
            </button>
            <button className="text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors">
              <Share2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Gallery Section */}
          <div className="w-full lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 aspect-[16/10] bg-[#EDEDED] dark:bg-white/5 overflow-hidden">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-[#EDEDED] dark:bg-white/5 overflow-hidden">
              <ImageWithFallback
                src={product.hoverImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-[#EDEDED] dark:bg-white/5 overflow-hidden flex items-center justify-center p-12">
              <div className="text-center">
                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4">Embotellado en</h4>
                <p className="text-xs font-light text-[#2B2B2B]/60 dark:text-white/60 uppercase tracking-widest">Grasse, Francia</p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="w-full lg:w-2/5 space-y-10">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#3A4A3F] dark:text-[#A5BAA8] font-bold">{product.type}</span>
              <h1 className="text-4xl md:text-5xl font-light text-[#111111] dark:text-white tracking-tight">{product.name}</h1>
              <p className="text-xl text-[#2B2B2B] dark:text-[#EDEDED] font-medium tracking-tight">
                {formatPrice(currentPrice)} COP
              </p>
            </div>

            <p className="text-[#2B2B2B]/60 dark:text-white/60 text-base font-light leading-relaxed">
              {product.description}
            </p>

            {/* Scent Notes Block */}
            <div className="bg-[#EDEDED] dark:bg-white/5 p-8 space-y-8">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white mb-6">Composición Olfativa</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-[#A5BAA8]">Salida</span>
                  <p className="text-xs font-light text-[#2B2B2B]/60 dark:text-white/60">{product.notasSalida ?? '—'}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-[#A5BAA8]">Corazón</span>
                  <p className="text-xs font-light text-[#2B2B2B]/60 dark:text-white/60">{product.notasCorazon ?? '—'}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F] dark:text-[#A5BAA8]">Fondo</span>
                  <p className="text-xs font-light text-[#2B2B2B]/60 dark:text-white/60">{product.notasFondo ?? '—'}</p>
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
                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${selectedVariantIndex === idx
                            ? 'border-[#111111] dark:border-white bg-[#111111] dark:bg-white text-white dark:text-[#111111]'
                            : 'border-[#EDEDED] dark:border-white/8 hover:border-[#111111] text-[#2B2B2B] dark:text-[#EDEDED]'
                          }`}
                      >
                        {variant.volume} — {formatPrice(variant.price)} COP
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
                    {product.variants?.[0]?.volume ?? '—'}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-6">
                <div className="flex flex-col space-y-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Cantidad</span>
                  <div className="flex items-center space-x-6 border border-[#EDEDED] dark:border-white/8 px-4 py-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors"><Minus size={14} /></button>
                    <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="text-[#2B2B2B]/40 dark:text-white/40 hover:text-[#111111] dark:text-white transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full bg-[#111111] dark:bg-white dark:text-[#111111] text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-all duration-300 shadow-lg shadow-black/5 flex items-center justify-center gap-3"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                Añadir a la Bolsa
              </motion.button>

              <p className="text-center text-[10px] uppercase tracking-[0.1em] text-[#2B2B2B]/40 dark:text-white/40 font-bold">
                Envío express gratuito en toda la colección
              </p>
            </div>

            {/* Technical Details Tabs */}
            <div className="border-t border-[#EDEDED] dark:border-white/8 pt-10">
              <div className="flex space-x-8 border-b border-[#EDEDED] dark:border-white/8 mb-8">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === "details" ? "border-b-2 border-[#111111] text-[#111111] dark:text-white" : "text-[#2B2B2B]/30 hover:text-[#111111] dark:text-white"}`}
                >
                  Detalles Técnicos
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === "shipping" ? "border-b-2 border-[#111111] text-[#111111] dark:text-white" : "text-[#2B2B2B]/30 hover:text-[#111111] dark:text-white"}`}
                >
                  Envío y Devoluciones
                </button>
              </div>

              <div className="min-h-[100px]">
                {activeTab === "details" ? (
                  <div className="grid grid-cols-2 gap-y-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest font-bold">Longevidad</span>
                      <span className="text-xs uppercase tracking-widest font-bold">{product.longevidad ?? '—'}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest font-bold">Intensidad</span>
                      <span className="text-xs uppercase tracking-widest font-bold">{product.intensidad ?? '—'}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest font-bold">Concentración</span>
                      <span className="text-xs uppercase tracking-widest font-bold">{product.concentracion ?? '—'}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest font-bold">Familia Olfativa</span>
                      <span className="text-xs uppercase tracking-widest font-bold">{product.olfactoryFamily || '—'}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] text-[#2B2B2B]/40 dark:text-white/40 uppercase tracking-widest font-bold">Estación</span>
                      <span className="text-xs uppercase tracking-widest font-bold">{product.estaciones ?? '—'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-light text-[#2B2B2B]/60 dark:text-white/60 leading-relaxed uppercase tracking-widest">
                    Envíos internacionales disponibles. Devoluciones aceptadas en un plazo de 30 días si el precinto no ha sido vulnerado. Incluye una muestra de 2ml para probar antes de abrir el frasco principal.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Guía de Uso --- */}
        {product.guiaUso && (
          <div className="mt-16 border-t border-[#EDEDED] dark:border-white/8 pt-12">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#111111] dark:text-white mb-6">
              Guía de Uso y Aplicación
            </h3>
            <p className="text-sm font-light text-[#2B2B2B]/70 dark:text-white/60 leading-relaxed max-w-2xl">
              {product.guiaUso}
            </p>
          </div>
        )}

        {/* --- Sección de Reseñas --- */}
        <ProductReviews
          productId={product.id}
          onReviewAdded={() => {
            // Invalida la caché del producto para que se recargue con el nuevo rating promedio
            queryClient.invalidateQueries({ queryKey: ['product', id] });
          }}
        />

      </div>
    </main>
  );
};
