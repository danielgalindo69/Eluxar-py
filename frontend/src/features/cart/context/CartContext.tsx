import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { cartAPI } from '../../../core/api/api';
import { toast } from 'sonner';

export interface CartItem {
  itemId?: number; // Para backend
  varianteId?: number; // Para backend
  productId: string;
  name: string;
  type: string;
  image: string;
  volume: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string, volume: string) => void;
  updateQuantity: (productId: string, volume: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize cart from backend or local storage
  useEffect(() => {
    const initCart = async () => {
      if (isAuthenticated) {
        try {
          const data = await cartAPI.getActive();
          setItems((data.items || []).map((i: any) => ({
            itemId: i.id,
            varianteId: i.varianteId,
            productId: String(i.varianteId), // fallback
            name: i.productoNombre,
            type: '', // Falta en DTO, lo omitimos
            image: i.imagenUrl || 'https://images.unsplash.com/photo-1558710347-d8257f52e427?w=1080',
            volume: `${i.tamanoMl}ml`,
            price: i.precioUnitario,
            quantity: i.cantidad
          })));
        } catch (e) {
          console.error("Failed to load cart from API", e);
        }
      } else {
        const saved = localStorage.getItem('eluxar_cart');
        if (saved) setItems(JSON.parse(saved));
      }
      setIsInitializing(false);
    };
    initCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && !isInitializing) {
      localStorage.setItem('eluxar_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated, isInitializing]);

  const addItem = async (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (isAuthenticated) {
      if (!item.varianteId) {
        toast.error("Error: Variante no especificada");
        return;
      }
      try {
        const data = await cartAPI.addItem(item.varianteId, quantity);
        // Reload items from backend response
        setItems((data.items || []).map((i: any) => ({
          itemId: i.id,
          varianteId: i.varianteId,
          productId: String(i.varianteId),
          name: i.productoNombre,
          type: '',
          image: i.imagenUrl || 'https://images.unsplash.com/photo-1558710347-d8257f52e427?w=1080',
          volume: `${i.tamanoMl}ml`,
          price: i.precioUnitario,
          quantity: i.cantidad
        })));
        toast.success("Producto agregado al carrito");
      } catch (e: any) {
        toast.error(e.message || "Error al agregar al carrito");
      }
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.productId === item.productId && i.volume === item.volume);
        if (existing) {
          return prev.map(i =>
            i.productId === item.productId && i.volume === item.volume
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      toast.success("Producto agregado al carrito");
    }
  };

  const removeItem = async (productId: string, volume: string) => {
    const itemToRemove = items.find(i => i.productId === productId && i.volume === volume);
    if (!itemToRemove) return;

    if (isAuthenticated && itemToRemove.itemId) {
      try {
        await cartAPI.removeItem(itemToRemove.itemId);
        setItems(prev => prev.filter(i => i.itemId !== itemToRemove.itemId));
      } catch (e: any) {
        toast.error(e.message || "Error al eliminar producto");
      }
    } else {
      setItems(prev => prev.filter(i => !(i.productId === productId && i.volume === volume)));
    }
  };

  const updateQuantity = async (productId: string, volume: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId, volume);
    
    const itemToUpdate = items.find(i => i.productId === productId && i.volume === volume);
    if (!itemToUpdate) return;

    if (isAuthenticated && itemToUpdate.itemId) {
      try {
        await cartAPI.updateItem(itemToUpdate.itemId, quantity);
        setItems(prev => prev.map(i => i.itemId === itemToUpdate.itemId ? { ...i, quantity } : i));
      } catch (e: any) {
        toast.error(e.message || "Stock insuficiente");
      }
    } else {
      setItems(prev => prev.map(i => i.productId === productId && i.volume === volume ? { ...i, quantity } : i));
    }
  };

  const clearCart = () => setItems([]);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
