import { Link, useNavigate } from "react-router";
import { ImageWithFallback } from "../../../shared/components/figma/ImageWithFallback";
import { Product } from "../types/products";
import { useState } from "react";
import { Plus, Heart } from "lucide-react";
import { useCart } from "../../cart/context/CartContext";
import { useWishlist } from "../../user/context/WishlistContext";
import { useAuth } from "../../auth/context/AuthContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const { wishlistIds, toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const defaultVariant = product.variants?.[0];
    addItem({
      varianteId: defaultVariant?.id,
      productId: product.id,
      name: product.name,
      type: product.type,
      image: product.image,
      volume: defaultVariant?.volume ?? product.specs.volume,
      price: defaultVariant?.price ?? parseFloat(product.price.replace('COP', '')),
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[4/5] bg-[#EDEDED] dark:bg-white/5 overflow-hidden mb-6">
          <ImageWithFallback
            src={isHovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <button
              onClick={handleAddToCart}
              className="w-full bg-white dark:bg-[#161616] text-[#111111] dark:text-white py-3 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#111111] hover:text-white transition-colors duration-300 border border-[#111111]"
            >
              <Plus size={14} />
              Añadir a la Bolsa
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button 
              onClick={handleToggleWishlist}
              className="bg-white/80 dark:bg-black/50 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white dark:hover:bg-black transition-colors"
              title={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
              <Heart 
                size={16} 
                className={`transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-[#111111] dark:text-white hover:text-red-500'}`} 
              />
            </button>
          </div>

          {product.id === "1" && (
            <div className="absolute top-4 left-4 bg-white dark:bg-[#161616] px-3 py-1">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#3A4A3F]">Nuevo</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-start">
          <Link to={`/product/${product.id}`} className="text-[#2B2B2B] dark:text-[#EDEDED] text-sm font-light tracking-wide hover:opacity-60 transition-opacity">
            {product.name}
          </Link>
          <span className="text-[#2B2B2B] dark:text-[#EDEDED] text-xs font-medium">{product.price}</span>
        </div>
        <p className="text-[#2B2B2B]/40 dark:text-white/40 text-[10px] uppercase tracking-[0.15em] font-light">
          {product.type} <span className="mx-1 text-[#2B2B2B]/20 dark:text-white/20">|</span> {product.specs.volume}
        </p>
      </div>
    </div>
  );
};
