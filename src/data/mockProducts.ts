export type Condition = 'Grade A - Like New' | 'Grade A - Very Good' | 'Grade B - Gently Used' | 'Grade B - Good';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string;
  condition: Condition;
  images: string[];
  available: boolean;
  category: string;
}

import shoe1 from '@/assets/shoe1.jpg';
import shoe2 from '@/assets/shoe2.jpg';
import shoe3 from '@/assets/shoe3.jpg';
import shoe4 from '@/assets/shoe4.jpg';
import shoe5 from '@/assets/shoe5.jpg';
import shoe6 from '@/assets/shoe6.jpg';

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Nike Air Force 1 Low',
    description: 'Classic white Air Force 1s in excellent condition. Barely worn, clean soles. A timeless silhouette that goes with everything.',
    price: 4500,
    size: 'UK 9 / EU 43',
    condition: 'Grade A - Like New',
    images: [shoe1],
    available: true,
    category: 'Sneakers',
  },
  {
    id: '2',
    title: 'New Balance 574 Classic',
    description: 'Grey and navy NB 574s with great cushioning. Minor signs of wear on the outsole. Super comfortable daily drivers.',
    price: 3200,
    size: 'UK 8 / EU 42',
    condition: 'Grade A - Very Good',
    images: [shoe2],
    available: true,
    category: 'Sneakers',
  },
  {
    id: '3',
    title: 'Converse Chuck Taylor Hi',
    description: 'Black high-top Chucks. Canvas is clean, rubber toe cap in good shape. The icon that never goes out of style.',
    price: 2800,
    size: 'UK 10 / EU 44',
    condition: 'Grade B - Gently Used',
    images: [shoe3],
    available: true,
    category: 'Canvas',
  },
  {
    id: '4',
    title: 'Adidas Superstar OG',
    description: 'White with green stripes. Shell toe intact, leather upper in great condition. Clean and ready to rock.',
    price: 3800,
    size: 'UK 9 / EU 43',
    condition: 'Grade A - Very Good',
    images: [shoe4],
    available: true,
    category: 'Sneakers',
  },
  {
    id: '5',
    title: 'Jordan 1 Retro High OG',
    description: 'Bred colorway Jordan 1s. Some heel drag but upper is clean. These are grails — priced to move.',
    price: 6500,
    size: 'UK 10 / EU 44',
    condition: 'Grade B - Gently Used',
    images: [shoe5],
    available: true,
    category: 'Sneakers',
  },
  {
    id: '6',
    title: 'Vans Old Skool',
    description: 'Classic black and white Old Skools. Suede panels in good shape, waffle sole has plenty of life. Skateboard-ready.',
    price: 2500,
    size: 'UK 7 / EU 41',
    condition: 'Grade B - Good',
    images: [shoe6],
    available: false,
    category: 'Canvas',
  },
];
