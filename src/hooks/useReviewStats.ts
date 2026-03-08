import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReviewStats {
  averageRating: number;
  count: number;
}

export function useAllReviewStats() {
  return useQuery<Record<string, ReviewStats>>({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('product_id, rating');
      if (error) throw error;

      const statsMap: Record<string, { total: number; count: number }> = {};
      for (const row of data || []) {
        if (!statsMap[row.product_id]) {
          statsMap[row.product_id] = { total: 0, count: 0 };
        }
        statsMap[row.product_id].total += row.rating;
        statsMap[row.product_id].count += 1;
      }

      const result: Record<string, ReviewStats> = {};
      for (const [id, s] of Object.entries(statsMap)) {
        result[id] = { averageRating: s.total / s.count, count: s.count };
      }
      return result;
    },
    staleTime: 60_000,
  });
}
