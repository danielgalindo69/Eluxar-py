import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { wishlistAPI } from '../../../core/api/api';
import { useAuth } from '../../auth/context/AuthContext';

interface WishlistContextType {
  wishlistIds: number[];
  toggleWishlist: (productId: string | number) => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlistIds();
    } else {
      setWishlistIds([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadWishlistIds = async () => {
    try {
      setIsLoading(true);
      const ids = await wishlistAPI.getIds();
      setWishlistIds(ids);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (productId: string | number) => {
    if (!isAuthenticated) return;
    const numId = Number(productId);
    const currentlyInWishlist = wishlistIds.includes(numId);

    // Optimistic UI update
    setWishlistIds(prev => 
      currentlyInWishlist ? prev.filter(id => id !== numId) : [...prev, numId]
    );

    try {
      if (currentlyInWishlist) {
        await wishlistAPI.remove(String(productId));
      } else {
        await wishlistAPI.add(String(productId));
      }
    } catch (error) {
      // Revert optimistic update on failure
      setWishlistIds(prev => 
        currentlyInWishlist ? [...prev, numId] : prev.filter(id => id !== numId)
      );
      console.error('Error toggling wishlist item:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: string | number) => {
    return wishlistIds.includes(Number(productId));
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
