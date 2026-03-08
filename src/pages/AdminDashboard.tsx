import { useState } from 'react';
import { Package, Plus, LogIn, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { mockProducts, Product } from '@/data/mockProducts';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [products] = useState<Product[]>(mockProducts);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — in production, this would use Lovable Cloud auth
    if (email && password) {
      setIsLoggedIn(true);
      toast.success('Welcome back, Vin!');
    } else {
      toast.error('Please enter your credentials');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">Admin Login</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">KicksbyVin Dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-sm">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vin@kicksbyvin.co.ke" className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-body text-sm">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-card pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-display py-5">
                <LogIn size={16} className="mr-2" /> Sign In
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center font-body">
              Connect Lovable Cloud to enable real authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="font-body text-sm text-muted-foreground">Manage your inventory</p>
          </div>
          <Button className="bg-terracotta text-accent-foreground font-display hover:bg-terracotta-light">
            <Plus size={16} className="mr-2" /> Add Shoe
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pairs', value: products.length },
            { label: 'Available', value: products.filter((p) => p.available).length },
            { label: 'Sold Out', value: products.filter((p) => !p.available).length },
            { label: 'Revenue (KES)', value: products.filter((p) => !p.available).reduce((s, p) => s + p.price, 0).toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg p-4">
              <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Product table */}
        <div className="bg-card rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shoe</th>
                  <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Size</th>
                  <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded-md object-cover" />
                        <div>
                          <p className="font-display text-sm font-medium text-foreground">{product.title}</p>
                          <p className="font-body text-xs text-muted-foreground">{product.condition}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-body text-sm text-foreground hidden md:table-cell">{product.size}</td>
                    <td className="p-4 font-display text-sm font-semibold text-foreground">KES {product.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${product.available ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {product.available ? 'Available' : 'Sold Out'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
