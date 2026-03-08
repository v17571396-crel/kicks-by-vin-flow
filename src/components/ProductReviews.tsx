import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { trackEvent } from '@/lib/gtag';

interface ProductReviewsProps {
  productId: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!interactive}
        onClick={() => onRate?.(star)}
        className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
      >
        <Star
          size={interactive ? 24 : 16}
          className={star <= rating ? 'fill-terracotta text-terracotta' : 'text-muted-foreground/40'}
        />
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { reviews, isLoading, addReview, deleteReview, averageRating, userReview } = useReviews(productId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    addReview.mutate(
      { rating, comment, reviewerName: name || 'Anonymous' },
      {
        onSuccess: () => {
          trackEvent('submit_review', { item_id: productId, rating });
          setRating(0);
          setComment('');
          setName('');
        },
      },
    );
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-xl font-bold text-foreground">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-sm text-muted-foreground font-body">
              {averageRating.toFixed(1)} ({reviews.length})
            </span>
          </div>
        )}
      </div>

      {/* Review form */}
      {user && !userReview ? (
        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-4 mb-6 space-y-3">
          <p className="font-display text-sm font-semibold text-foreground">Leave a review</p>
          <StarRating rating={rating} onRate={setRating} interactive />
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background"
          />
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="bg-background resize-none"
          />
          <Button
            type="submit"
            disabled={rating === 0 || addReview.isPending}
            className="bg-primary text-primary-foreground font-display text-sm"
          >
            {addReview.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      ) : !user ? (
        <p className="text-sm text-muted-foreground font-body mb-6 bg-card rounded-lg p-4">
          Log in to leave a review.
        </p>
      ) : null}

      {/* Reviews list */}
      {isLoading ? (
        <p className="text-muted-foreground font-body text-sm">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground font-body text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold text-foreground">{review.reviewer_name}</span>
                  <StarRating rating={review.rating} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-body">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  {user && (user.id === review.user_id) && (
                    <button
                      onClick={() => deleteReview.mutate(review.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete review"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-foreground/80 font-body leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
