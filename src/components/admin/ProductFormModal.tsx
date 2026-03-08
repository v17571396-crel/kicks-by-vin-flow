import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Constants } from '@/integrations/supabase/types';
import ImageUploader from './ImageUploader';
import type { Product } from '@/data/mockProducts';
import type { Database } from '@/integrations/supabase/types';

type ShoeCondition = Database['public']['Enums']['shoe_condition'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: ProductInsert) => void;
  isSubmitting: boolean;
}

const defaultForm: ProductInsert = {
  title: '',
  description: '',
  price: 0,
  size: '',
  condition: 'Grade A - Like New',
  category: 'Sneakers',
  available: true,
  images: [],
};

export default function ProductFormModal({ open, onOpenChange, product, onSubmit, isSubmitting }: ProductFormModalProps) {
  const [form, setForm] = useState<ProductInsert>(defaultForm);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title,
        description: product.description,
        price: product.price,
        size: product.size,
        condition: product.condition,
        category: product.category,
        available: product.available,
        images: product.images,
      });
    } else {
      setForm(defaultForm);
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const update = <K extends keyof ProductInsert>(key: K, value: ProductInsert[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm">Title</Label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Nike Air Max 90" required className="bg-card" />
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm">Description</Label>
            <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the shoe condition, color, etc." required className="bg-card min-h-[80px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-sm">Price (KES)</Label>
              <Input type="number" value={form.price || ''} onChange={(e) => update('price', Number(e.target.value))} placeholder="3500" required min={1} className="bg-card" />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Size</Label>
              <Input value={form.size} onChange={(e) => update('size', e.target.value)} placeholder="UK 9 / EU 43" required className="bg-card" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body text-sm">Condition</Label>
              <Select value={form.condition} onValueChange={(v) => update('condition', v as ShoeCondition)}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.shoe_condition.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Category</Label>
              <Input value={form.category || ''} onChange={(e) => update('category', e.target.value)} placeholder="Sneakers" className="bg-card" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.available ?? true} onCheckedChange={(v) => update('available', v)} />
            <Label className="font-body text-sm">Available for sale</Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-primary-foreground font-display">
              {isSubmitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              {product ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
