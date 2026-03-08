import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export function useReviews(productId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!productId,
  });

  const addReview = useMutation({
    mutationFn: async ({ rating, comment, reviewerName, productTitle }: { rating: number; comment: string; reviewerName: string; productTitle: string }) => {
      if (!user || !productId) throw new Error('Login required');
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        reviewer_name: reviewerName,
        rating,
        comment,
      });
      if (error) throw error;
      return { reviewerName, rating, comment, productTitle };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      toast.success('Review submitted!');

      // Send WhatsApp notification to admin
      const stars = '⭐'.repeat(data.rating);
      const msg = `📝 New Review — KicksbyVin\n\n` +
        `👟 ${data.productTitle}\n` +
        `${stars} (${data.rating}/5)\n` +
        `👤 ${data.reviewerName}\n` +
        `💬 ${data.comment || '(no comment)'}\n\n` +
        `Check the admin dashboard for details.`;
      const whatsappUrl = `https://wa.me/254111235578?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, '_blank');
    },
    onError: () => {
      toast.error('Failed to submit review');
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      toast.success('Review deleted');
    },
  });

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const userReview = user ? reviews.find((r) => r.user_id === user.id) : undefined;

  return { reviews, isLoading, addReview, deleteReview, averageRating, userReview };
}
