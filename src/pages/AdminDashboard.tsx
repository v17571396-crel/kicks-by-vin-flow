import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Plus, LogOut, Eye, EyeOff, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { getProductImage } from '@/data/mockProducts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const { signIn, resetPassword } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your credentials');
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error);
    setSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setSubmitting(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Check your email for a password reset link.');
      setMode('login');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {mode === 'login' ? 'Admin Login' : 'Reset Password'}
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">KicksbyVin Dashboard</p>
          </div>
          {mode === 'login' ? (
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
              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground font-display py-5">
                {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                Sign In
              </Button>
              <button type="button" onClick={() => setMode('forgot')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-body">
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="font-body text-sm">Email</Label>
                <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vin@kicksbyvin.co.ke" className="bg-card" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground font-display py-5">
                {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                Send Reset Link
              </Button>
              <button type="button" onClick={() => setMode('login')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-body">
                ← Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { data: products = [], isLoading } = useProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="font-body text-muted-foreground mt-2">Your account does not have admin privileges.</p>
          <Button onClick={signOut} variant="outline" className="mt-6">Sign Out</Button>
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
            <p className="font-body text-sm text-muted-foreground">Logged in as {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-terracotta text-accent-foreground font-display hover:bg-terracotta-light">
              <Plus size={16} className="mr-2" /> Add Shoe
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pairs', value: isLoading ? '...' : products.length },
            { label: 'Available', value: isLoading ? '...' : products.filter((p) => p.available).length },
            { label: 'Sold Out', value: isLoading ? '...' : products.filter((p) => !p.available).length },
            { label: 'Revenue (KES)', value: isLoading ? '...' : products.filter((p) => !p.available).reduce((s, p) => s + p.price, 0).toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg p-4">
              <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

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
                        <img src={getProductImage(product)} alt={product.title} className="w-10 h-10 rounded-md object-cover" />
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
