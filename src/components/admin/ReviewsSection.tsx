import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ReviewWithProduct {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  products: { title: string } | null;
}

const ReviewsSection = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: reviews = [], isLoading } = useQuery<ReviewWithProduct[]>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(title)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ReviewWithProduct[];
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted');
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const filtered = reviews.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.reviewer_name.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      (r.products?.title || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reviews by name, product, or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <span className="text-sm text-muted-foreground font-body whitespace-nowrap">
          {filtered.length} review{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-center text-muted-foreground font-body text-sm">Loading reviews...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground font-body text-sm">
            {search ? 'No reviews match your search.' : 'No reviews yet.'}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((review) => (
              <div key={review.id} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-sm font-semibold text-foreground">{review.reviewer_name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= review.rating ? 'fill-terracotta text-terracotta' : 'text-muted-foreground/40'} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-body">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-body mt-0.5">
                    {review.products?.title || 'Unknown product'}
                  </p>
                  {review.comment && (
                    <p className="mt-1 text-sm text-foreground/80 font-body leading-relaxed">{review.comment}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReview.mutate(review.id)}
                  disabled={deleteReview.isPending}
                  className="text-destructive hover:text-destructive shrink-0"
                  title="Delete review"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
