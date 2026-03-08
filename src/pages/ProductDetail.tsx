import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, MessageCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import CheckoutModal from '@/components/CheckoutModal';
import { useProduct } from '@/hooks/useProducts';
import { getProductImage } from '@/data/mockProducts';
import { Button } from '@/components/ui/button';
import FavoriteButton from '@/components/FavoriteButton';

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="font-display text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="font-display text-xl text-foreground">Product not found.</p>
          <Link to="/" className="text-terracotta font-body mt-4 inline-block hover:underline">
            ← Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getProductImage(product);

  const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(
    `Hey KicksbyVin! I'm interested in: ${product.title} (${product.size}) - KES ${product.price.toLocaleString()}. Can I get more photos?`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm mb-6">
          <ArrowLeft size={16} /> Back to shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="aspect-square rounded-xl overflow-hidden bg-card">
              <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-card text-muted-foreground font-body w-fit">
              {product.condition}
            </span>
            <div className="flex items-start justify-between gap-2 mt-3">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{product.title}</h1>
              <FavoriteButton productId={product.id} size={24} className="mt-1 shrink-0" />
            </div>
            <p className="font-display text-2xl font-bold text-terracotta mt-2">KES {product.price.toLocaleString()}</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Size: {product.size}</p>
            <p className="font-body text-foreground/80 mt-6 leading-relaxed">{product.description}</p>

            <div className="mt-8 space-y-3">
              {product.available ? (
                <Button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full bg-primary text-primary-foreground hover:bg-olive-light font-display text-base py-6"
                  size="lg"
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Buy via M-Pesa — KES {product.price.toLocaleString()}
                </Button>
              ) : (
                <Button disabled className="w-full font-display text-base py-6" size="lg">Sold Out</Button>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-border text-foreground px-6 py-3 rounded-lg font-body text-sm hover:bg-card transition-colors"
              >
                <MessageCircle size={18} />
                Request more photos on WhatsApp
              </a>
            </div>

            <div className="mt-8 p-4 bg-card rounded-lg">
              <h3 className="font-display font-semibold text-sm text-foreground">Delivery Info</h3>
              <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                We deliver across Nairobi. Delivery fee depends on your area. You'll select your estate/area at checkout. Payment via M-Pesa only.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton productTitle={product.title} />
      <CheckoutModal product={product} isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
};

export default ProductDetail;
