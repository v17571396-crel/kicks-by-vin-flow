import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  size?: number;
  className?: string;
}

const FavoriteButton = ({ productId, size = 20, className }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Sign in to save favorites', { description: 'Go to the Admin page to log in.' });
      return;
    }
    toggleFavorite.mutate(productId);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleClick}
      className={cn(
        'rounded-full p-1.5 backdrop-blur-sm transition-colors',
        liked
          ? 'bg-terracotta/90 text-accent-foreground'
          : 'bg-background/60 text-muted-foreground hover:bg-background/80',
        className,
      )}
      aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart size={size} className={liked ? 'fill-current' : ''} />
    </motion.button>
  );
};

export default FavoriteButton;
