import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useProducts } from '@/hooks/useProducts';

const Wishlist = () => {
  const { user } = useAuth();
  const { favoriteIds, isLoading: favsLoading } = useFavorites();
  const { data: products = [], isLoading: prodsLoading } = useProducts();

  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));
  const isLoading = favsLoading || prodsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={28} className="text-terracotta" />
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">My Wishlist</h1>
        </div>

        {!user ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground">Sign in to view your saved kicks.</p>
            <Link to="/admin" className="mt-3 inline-block text-terracotta font-body text-sm hover:underline">
              Go to login →
            </Link>
          </div>
        ) : isLoading ? (
          <p className="font-body text-muted-foreground">Loading...</p>
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground">No favorites yet. Browse the shop and tap the heart icon!</p>
            <Link to="/" className="mt-3 inline-block text-terracotta font-body text-sm hover:underline">
              Browse kicks →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Wishlist;
