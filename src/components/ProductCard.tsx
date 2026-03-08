import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, getProductImage } from '@/data/mockProducts';
import FavoriteButton from '@/components/FavoriteButton';
import { useAllReviewStats } from '@/hooks/useReviewStats';

interface ProductCardProps {
  product: Product;
}

const conditionColor = (condition: string) => {
  if (condition.includes('Like New')) return 'bg-primary text-primary-foreground';
  if (condition.includes('Very Good')) return 'bg-olive-light text-primary-foreground';
  if (condition.includes('Gently Used')) return 'bg-terracotta text-accent-foreground';
  return 'bg-muted text-muted-foreground';
};

const ProductCard = ({ product }: ProductCardProps) => {
  const imageUrl = getProductImage(product);
  const { data: statsMap } = useAllReviewStats();
  const stats = statsMap?.[product.id];
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-card">
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {!product.available && (
            <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center">
              <span className="font-display text-lg font-bold text-sand tracking-wider uppercase">
                Sold Out
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${conditionColor(product.condition)}`}>
              {product.condition}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <FavoriteButton productId={product.id} size={18} />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-display text-sm font-semibold text-foreground truncate group-hover:text-terracotta transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-bold text-foreground">
              KES {product.price.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-body">{product.size}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
