import { useState } from 'react';
import { Package, Plus, LogOut, Eye, EyeOff, Loader2, Pencil, Trash2, ShoppingBag, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProductMutations';
import { getProductImage } from '@/data/mockProducts';
import type { Product } from '@/data/mockProducts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ProductFormModal from '@/components/admin/ProductFormModal';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import OrdersSection from '@/components/admin/OrdersSection';
import { useOrders } from '@/hooks/useOrders';
import AnalyticsSection from '@/components/admin/AnalyticsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Database } from '@/integrations/supabase/types';

type ProductInsert = Database['public']['Tables']['products']['Insert'];

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const { signIn, resetPassword } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter your credentials'); return; }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error);
    setSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter your credentials'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm, then sign in.');
      setMode('login');
    }
    setSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setSubmitting(true);
    const { error } = await resetPassword(email);
    if (error) toast.error(error);
    else { toast.success('Check your email for a password reset link.'); setMode('login'); }
    setSubmitting(false);
  };

  const title = mode === 'login' ? 'Admin Login' : mode === 'signup' ? 'Create Account' : 'Reset Password';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">KicksbyVin Dashboard</p>
          </div>
          {(mode === 'login' || mode === 'signup') ? (
            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
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
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Button>
              {mode === 'login' ? (
                <>
                  <button type="button" onClick={() => setMode('signup')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-body">
                    Don't have an account? Sign up
                  </button>
                  <button type="button" onClick={() => setMode('forgot')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-body">
                    Forgot password?
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setMode('login')} className="w-full text-center text-sm text-muted-foreground hover:text-foreground font-body">
                  Already have an account? Sign in
                </button>
              )}
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
  const [activeTab, setActiveTab] = useState('products');
  const { data: products = [], isLoading } = useProducts();
  const { data: orders = [] } = useOrders();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

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

  const handleFormSubmit = async (data: ProductInsert) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, updates: data });
        toast.success('Product updated!');
      } else {
        await createProduct.mutateAsync(data);
        toast.success('Product added!');
      }
      setFormOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

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
            {activeTab === 'products' && (
              <Button onClick={openAdd} className="bg-terracotta text-accent-foreground font-display hover:bg-terracotta-light">
                <Plus size={16} className="mr-2" /> Add Shoe
              </Button>
            )}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-card">
            <TabsTrigger value="products" className="font-display text-sm gap-1.5">
              <Package size={14} /> Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="font-display text-sm gap-1.5">
              <ShoppingBag size={14} /> Orders
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-display text-sm gap-1.5">
              <BarChart3 size={14} /> Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="bg-card rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shoe</th>
                      <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Size</th>
                      <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-right p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
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
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(product)} title="Edit">
                              <Pencil size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(product)} title="Delete" className="text-destructive hover:text-destructive">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersSection />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSection />
          </TabsContent>
        </Tabs>
      </div>

      <ProductFormModal
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingProduct(null); }}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        productTitle={deleteTarget?.title ?? ''}
        onConfirm={handleDelete}
        isDeleting={deleteProduct.isPending}
      />
    </div>
  );
};

export default AdminDashboard;
