import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import WhatsAppButton from '@/components/WhatsAppButton';
import SEO from '@/components/SEO';
import { useProducts } from '@/hooks/useProducts';
import { getProductImage } from '@/data/mockProducts';
import heroImage from '@/assets/hero-shoes.jpg';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: products = [], isLoading } = useProducts();

  // Extract unique sizes from actual products
  const availableSizes = useMemo(() => {
    const sizes = new Set(products.map((p) => p.size));
    return Array.from(sizes);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (sizeFilter !== 'all') {
      result = result.filter((p) => p.size === sizeFilter);
    }
    if (conditionFilter !== 'all') {
      result = result.filter((p) => p.condition.includes(conditionFilter));
    }
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, searchQuery, sizeFilter, conditionFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: 'KicksbyVin',
          description: "Nairobi's trusted thrift shoe plug. Quality second-hand sneakers, inspected & cleaned.",
          url: 'https://kicksbyvin.lovable.app',
          priceRange: 'KES 2000 - KES 10000',
          address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
          paymentAccepted: 'M-Pesa',
        }}
      />
      {/* ItemList structured data for product listings */}
      {filteredProducts.length > 0 && (
        <SEO
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: filteredProducts.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `https://kicksbyvin.lovable.app/product/${p.id}`,
              name: p.title,
              image: getProductImage(p),
            })),
          }}
        />
      )}
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={heroImage}
          alt="KicksbyVin thrift shoe collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-transparent" />
        <div className="relative h-full flex items-end pb-12 md:pb-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-4xl md:text-6xl font-bold text-sand leading-tight">
                Fresh Kicks.<br />
                <span className="text-terracotta-light">Fair Prices.</span>
              </h1>
              <p className="mt-4 font-body text-base md:text-lg text-sand/80 max-w-md">
                Nairobi's trusted thrift shoe plug. Quality second-hand sneakers, inspected & cleaned. Pay via M-Pesa.
              </p>
              <a
                href="#shop"
                className="mt-6 inline-flex items-center gap-2 bg-terracotta text-accent-foreground px-6 py-3 rounded-full font-display font-semibold text-sm hover:bg-terracotta-light transition-colors"
              >
                Shop Now <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Available Kicks
          </h2>
          <p className="font-body text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${filteredProducts.length} pair${filteredProducts.length !== 1 ? 's' : ''} in stock`}
          </p>
        </div>

        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sizeFilter={sizeFilter}
          onSizeChange={setSizeFilter}
          conditionFilter={conditionFilter}
          onConditionChange={setConditionFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          availableSizes={availableSizes}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-lg text-muted-foreground">No kicks match your filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSizeFilter('all'); setConditionFilter('all'); }}
              className="mt-3 text-terracotta font-body text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
