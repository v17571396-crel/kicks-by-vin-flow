import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastDistance = useRef(0);
  const lastCenter = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const resetZoom = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  useEffect(() => { if (!lightboxOpen) resetZoom(); }, [lightboxOpen]);
  useEffect(() => { resetZoom(); }, [selectedIndex]);

  const getDistance = (t1: Touch, t2: Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastDistance.current = getDistance(e.touches[0], e.touches[1]);
      lastCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const newScale = Math.min(4, Math.max(1, scale * (dist / lastDistance.current)));
      lastDistance.current = dist;

      const center = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      if (newScale > 1) {
        setTranslate(prev => ({
          x: prev.x + (center.x - lastCenter.current.x),
          y: prev.y + (center.y - lastCenter.current.y),
        }));
      } else {
        setTranslate({ x: 0, y: 0 });
      }
      lastCenter.current = center;
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2 && scale <= 1) resetZoom();
  };

  const goTo = useCallback((index: number, dir?: number) => {
    const next = (index + images.length) % images.length;
    setDirection(dir ?? (next > selectedIndex ? 1 : -1));
    setSelectedIndex(next);
  }, [images.length, selectedIndex]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      goTo(selectedIndex + 1, 1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      goTo(selectedIndex - 1, -1);
    }
  };

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-card group">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={selectedIndex}
              src={images[selectedIndex]}
              alt={`${product.title} — photo ${selectedIndex + 1}`}
              className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
              custom={direction}
              initial={{ opacity: 0, x: direction * 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 80 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              drag={images.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={handleDragEnd}
              onClick={openLightbox}
            />
          </AnimatePresence>

          {/* Zoom hint */}
          <button
            onClick={openLightbox}
            className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
            aria-label="Zoom image"
          >
            <ZoomIn size={18} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={() => goTo(selectedIndex - 1, -1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm text-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
                aria-label="Previous photo">
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => goTo(selectedIndex + 1, 1)}
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

      {/* Lightbox overlay */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-foreground/70 hover:text-foreground bg-card/50 rounded-full p-2 transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            {/* Counter */}
            {images.length > 1 && (
              <span className="absolute top-5 left-5 text-sm text-muted-foreground font-body z-10">
                {selectedIndex + 1} / {images.length}
              </span>
            )}

            {/* Lightbox image */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.img
                key={selectedIndex}
                src={images[selectedIndex]}
                alt={`${product.title} — photo ${selectedIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg cursor-grab active:cursor-grabbing select-none"
                custom={direction}
                initial={{ opacity: 0, scale: 0.9, x: direction * 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -direction * 100 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                onClick={(e) => e.stopPropagation()}
                drag={images.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -SWIPE_THRESHOLD) goTo(selectedIndex + 1, 1);
                  else if (info.offset.x > SWIPE_THRESHOLD) goTo(selectedIndex - 1, -1);
                }}
              />
            </AnimatePresence>

            {/* Lightbox nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(selectedIndex - 1, -1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/60 backdrop-blur-sm text-foreground rounded-full p-2.5 hover:bg-card/90 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(selectedIndex + 1, 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/60 backdrop-blur-sm text-foreground rounded-full p-2.5 hover:bg-card/90 transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImageGallery;
