import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['wishlist', user?.id];

  const { data: wishlistIds = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => wishlistAPI.getIds(),
    enabled: !!user,
    staleTime: 60000,
    gcTime: 300000,
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId: number) => {
      const isCurrentlyInWishlist = wishlistIds.includes(productId);
      if (isCurrentlyInWishlist) {
        await wishlistAPI.remove(String(productId));
      } else {
        await wishlistAPI.add(String(productId));
      }
    },
    onMutate: async (productId: number) => {
      await queryClient.cancelQueries({ queryKey });
      const previousIds = queryClient.getQueryData<number[]>(queryKey) ?? [];
      const isCurrentlyInWishlist = previousIds.includes(productId);

      queryClient.setQueryData<number[]>(queryKey, (old = []) =>
        isCurrentlyInWishlist
          ? old.filter(id => id !== productId)
          : [...old, productId]
      );

      return { previousIds };
    },
    onError: (_err, _productId, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(queryKey, context.previousIds);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleWishlist = async (productId: string | number) => {
    if (!user) return;
    toggleMutation.mutate(Number(productId));
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
