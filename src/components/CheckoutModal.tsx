import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Product, getProductImage } from '@/data/mockProducts';

interface CheckoutModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const nairobiAreas = [
  'Kilimani', 'Westlands', 'Roysambu', 'Kasarani', 'Langata',
  'South B', 'South C', 'Eastleigh', 'Parklands', 'Lavington',
  'Karen', 'Kileleshwa', 'Embakasi', 'Donholm', 'Umoja',
  'Pipeline', 'Ruaka', 'Rongai', 'Kitengela', 'Syokimau',
];

const CheckoutModal = ({ product, isOpen, onClose }: CheckoutModalProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !area) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!/^(?:254|\+254|0)\d{9}$/.test(phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    setLoading(true);
    // Simulate M-Pesa STK Push
    await new Promise((r) => setTimeout(r, 2000));
    toast.success('M-Pesa STK Push sent! Check your phone to complete payment.', {
      description: `KES ${product.price.toLocaleString()} for ${product.title}`,
      duration: 8000,
    });
    setLoading(false);
    onClose();
  };

  const imageUrl = getProductImage(product);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Checkout — {product.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 p-3 bg-card rounded-lg">
          <img src={imageUrl} alt={product.title} className="w-16 h-16 rounded-md object-cover" />
          <div>
            <p className="font-display font-bold text-lg">KES {product.price.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground font-body">{product.size}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-body text-sm">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="bg-card" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="font-body text-sm">M-Pesa Phone Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" className="bg-card" />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Delivery Area / Estate</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select your area" />
              </SelectTrigger>
              <SelectContent>
                {nairobiAreas.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-olive-light font-display text-base py-6"
          >
            {loading ? 'Sending STK Push...' : `Pay KES ${product.price.toLocaleString()} via M-Pesa`}
          </Button>
          <p className="text-xs text-muted-foreground text-center font-body">
            You will receive an M-Pesa prompt on your phone. Enter your PIN to complete.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
