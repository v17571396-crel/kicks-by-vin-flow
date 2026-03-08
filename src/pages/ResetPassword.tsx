import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(true);
    const { error } = await updatePassword(password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Password updated successfully!');
      navigate('/admin');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">Set New Password</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Enter your new password below</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="font-body text-sm">New Password</Label>
              <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-card" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="font-body text-sm">Confirm Password</Label>
              <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="bg-card" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground font-display py-5">
              {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
