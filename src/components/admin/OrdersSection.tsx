import { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-600', icon: <Clock size={12} /> },
  confirmed: { label: 'Confirmed', className: 'bg-primary/10 text-primary', icon: <CheckCircle size={12} /> },
  delivered: { label: 'Delivered', className: 'bg-green-500/10 text-green-600', icon: <Package size={12} /> },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive', icon: <XCircle size={12} /> },
};

const statuses = ['pending', 'confirmed', 'delivered', 'cancelled'];

export default function OrdersSection() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: products = [] } = useProducts();
  const updateStatus = useUpdateOrderStatus();

  const productMap = new Map(products.map((p) => [p.id, p.title]));

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast.success(`Order marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Date', 'Customer', 'Phone', 'Product', 'Amount (KES)', 'Delivery Area', 'Status', 'M-Pesa Receipt'];
    const rows = orders.map((o) => [
      format(new Date(o.created_at), 'yyyy-MM-dd HH:mm'),
      o.customer_name,
      o.customer_phone,
      productMap.get(o.product_id) || 'Unknown',
      o.amount,
      o.delivery_area,
      o.status,
      o.mpesa_receipt || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kicksbyvin-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-lg p-12 text-center">
        <Package size={40} className="mx-auto text-muted-foreground mb-3" />
        <p className="font-display text-lg text-foreground">No orders yet</p>
        <p className="font-body text-sm text-muted-foreground mt-1">Orders will appear here when customers check out.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="font-body text-xs gap-1.5" onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </Button>
      </div>
      <div className="bg-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Product</th>
              <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Area</th>
              <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left p-4 font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              return (
                <tr key={order.id} className="border-b border-border/50 last:border-0">
                  <td className="p-4">
                    <p className="font-display text-sm font-medium text-foreground">{order.customer_name}</p>
                    <p className="font-body text-xs text-muted-foreground">{order.customer_phone}</p>
                  </td>
                  <td className="p-4 font-body text-sm text-foreground hidden md:table-cell">
                    {productMap.get(order.product_id) || 'Unknown'}
                  </td>
                  <td className="p-4 font-display text-sm font-semibold text-foreground">
                    KES {order.amount.toLocaleString()}
                    {order.mpesa_receipt && (
                      <p className="font-body text-xs text-muted-foreground">{order.mpesa_receipt}</p>
                    )}
                  </td>
                  <td className="p-4 font-body text-sm text-foreground hidden md:table-cell">{order.delivery_area}</td>
                  <td className="p-4">
                    <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <div className="flex items-center gap-1.5">
                          {config.icon}
                          <span>{config.label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            <div className="flex items-center gap-1.5">
                              {statusConfig[s].icon}
                              <span>{statusConfig[s].label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4 font-body text-xs text-muted-foreground hidden lg:table-cell">
                    {format(new Date(order.created_at), 'MMM d, h:mm a')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
