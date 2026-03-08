import type { Tables } from '@/integrations/supabase/types';

// Use the database type as the canonical Product type
export type Product = Tables<'products'>;

// Re-export condition type
export type Condition = Product['condition'];

// Fallback images for products without uploaded photos
import shoe1 from '@/assets/shoe1.jpg';
import shoe2 from '@/assets/shoe2.jpg';
import shoe3 from '@/assets/shoe3.jpg';
import shoe4 from '@/assets/shoe4.jpg';
import shoe5 from '@/assets/shoe5.jpg';
import shoe6 from '@/assets/shoe6.jpg';

export const fallbackImages: Record<string, string> = {
  'Nike Air Force 1 Low': shoe1,
  'New Balance 574 Classic': shoe2,
  'Converse Chuck Taylor Hi': shoe3,
  'Adidas Superstar OG': shoe4,
  'Jordan 1 Retro High OG': shoe5,
  'Vans Old Skool': shoe6,
};

export function getProductImage(product: Product): string {
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  return fallbackImages[product.title] || shoe1;
}
