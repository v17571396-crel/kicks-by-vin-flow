import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/gtag';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteIds = [], isLoading } = useQuery<string[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map((f) => f.product_id);
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Login required');
      const isFav = favoriteIds.includes(productId);
      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
        return { productId, action: 'removed' as const };
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        trackEvent('add_to_wishlist', { item_id: productId });
        return { productId, action: 'added' as const };
      }
    },
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previous = queryClient.getQueryData<string[]>(['favorites', user?.id]) ?? [];
      const isFav = previous.includes(productId);
      queryClient.setQueryData<string[]>(
        ['favorites', user?.id],
        isFav ? previous.filter((id) => id !== productId) : [...previous, productId],
      );
      return { previous };
    },
    onError: (_err, _productId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites', user?.id], context.previous);
      }
      toast.error('Failed to update wishlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const isFavorite = (productId: string) => favoriteIds.includes(productId);

  return { favoriteIds, isFavorite, toggleFavorite, isLoading };
}
