import { useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductImage } from '@/data/mockProducts';
import type { Product } from '@/data/mockProducts';

interface ProductImageGalleryProps {
  product: Product;
}

const SWIPE_THRESHOLD = 50;

const ProductImageGallery = ({ product }: ProductImageGalleryProps) => {
  const fallback = getProductImage(product);
  const images = product.images?.length > 0 ? product.images : [fallback];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = (index: number, dir?: number) => {
    const next = (index + images.length) % images.length;
    setDirection(dir ?? (next > selectedIndex ? 1 : -1));
    setSelectedIndex(next);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      goTo(selectedIndex + 1, 1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      goTo(selectedIndex - 1, -1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-card group">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={`${product.title} — photo ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(selectedIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm text-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => goTo(selectedIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm text-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
              aria-label="Next photo"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === selectedIndex
                      ? 'bg-foreground scale-110'
                      : 'bg-foreground/40 hover:bg-foreground/60'
                  }`}
                  aria-label={`View photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === selectedIndex
                  ? 'border-primary ring-1 ring-primary/30'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={src} alt={`${product.title} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
