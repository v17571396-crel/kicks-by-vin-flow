import { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { Loader2, TrendingUp, ShoppingBag, DollarSign, Package, CalendarIcon } from 'lucide-react';
import { format, subDays, startOfDay, isAfter, isBefore, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(45, 93%, 47%)',
  confirmed: 'hsl(142, 71%, 45%)',
  delivered: 'hsl(200, 80%, 50%)',
  cancelled: 'hsl(0, 84%, 60%)',
};

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function AnalyticsSection() {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const [dateFrom, setDateFrom] = useState<Date>(startOfDay(subDays(new Date(), 14)));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const filteredOrders = useMemo(() => {
    const from = startOfDay(dateFrom);
    const to = startOfDay(subDays(dateTo, -1)); // include the end date
    return orders.filter((o) => {
      const created = new Date(o.created_at);
      return !isBefore(created, from) && isBefore(created, to);
    });
  }, [orders, dateFrom, dateTo]);

  const dayCount = differenceInDays(dateTo, dateFrom) + 1;

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((s, o) => s + o.amount, 0);
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter((o) => o.status === 'pending').length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    return { totalRevenue, totalOrders, pendingOrders, avgOrderValue };
  }, [filteredOrders]);

  const revenueByDay = useMemo(() => {
    const result: { date: string; revenue: number; orders: number }[] = [];
    for (let i = dayCount - 1; i >= 0; i--) {
      const day = startOfDay(subDays(dateTo, i));
      const nextDay = startOfDay(subDays(dateTo, i - 1));
      const dayOrders = filteredOrders.filter((o) => {
        const created = new Date(o.created_at);
        return !isBefore(created, day) && isBefore(created, nextDay) && o.status !== 'cancelled';
      });
      result.push({
        date: format(day, dayCount > 30 ? 'MMM d' : 'MMM d'),
        revenue: dayOrders.reduce((s, o) => s + o.amount, 0),
        orders: dayOrders.length,
      });
    }
    return result;
  }, [filteredOrders, dateTo, dayCount]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; revenue: number; count: number }> = {};
    filteredOrders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        const product = products.find((p) => p.id === o.product_id);
        const name = product?.title || 'Unknown';
        if (!productSales[o.product_id]) {
          productSales[o.product_id] = { name, revenue: 0, count: 0 };
        }
        productSales[o.product_id].revenue += o.amount;
        productSales[o.product_id].count += 1;
      });
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders, products]);

  const areaBreakdown = useMemo(() => {
    const areas: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      areas[o.delivery_area] = (areas[o.delivery_area] || 0) + 1;
    });
    return Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, orders]) => ({ name, orders }));
  }, [filteredOrders]);

  const handlePreset = (days: number) => {
    setDateFrom(startOfDay(subDays(new Date(), days)));
    setDateTo(new Date());
  };

  if (ordersLoading || productsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-lg p-12 text-center">
        <TrendingUp size={40} className="mx-auto text-muted-foreground mb-3" />
        <p className="font-display text-lg text-foreground">No analytics yet</p>
        <p className="font-body text-sm text-muted-foreground mt-1">Analytics will appear once you receive orders.</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `KES ${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign size={18} />, color: 'text-primary' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag size={18} />, color: 'text-primary' },
    { label: 'Pending', value: stats.pendingOrders, icon: <Package size={18} />, color: 'text-yellow-500' },
    { label: 'Avg Order Value', value: `KES ${stats.avgOrderValue.toLocaleString()}`, icon: <TrendingUp size={18} />, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-card rounded-lg p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.days}
              variant={dayCount === p.days + 1 ? 'default' : 'outline'}
              size="sm"
              className="font-body text-xs"
              onClick={() => handlePreset(p.days)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn('font-body text-xs gap-1.5', !dateFrom && 'text-muted-foreground')}>
                <CalendarIcon size={14} />
                {format(dateFrom, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(d) => d && setDateFrom(d)}
                disabled={(d) => isAfter(d, dateTo) || isAfter(d, new Date())}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground text-xs">→</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn('font-body text-xs gap-1.5', !dateTo && 'text-muted-foreground')}>
                <CalendarIcon size={14} />
                {format(dateTo, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(d) => d && setDateTo(d)}
                disabled={(d) => isBefore(d, dateFrom) || isAfter(d, new Date())}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={stat.color}>{stat.icon}</span>
              <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="bg-card rounded-lg p-5">
        <h3 className="font-display text-sm font-semibold text-foreground mb-4">
          Revenue Trend ({format(dateFrom, 'MMM d')} — {format(dateTo, 'MMM d')})
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueByDay}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval={dayCount > 30 ? Math.floor(dayCount / 10) : 0} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-card rounded-lg p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || 'hsl(var(--muted))'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusBreakdown.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] }} />
                <span className="capitalize">{entry.name}</span>
                <span className="font-semibold text-foreground">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Delivery Areas */}
        <div className="bg-card rounded-lg p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Top Delivery Areas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={areaBreakdown} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-card rounded-lg p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-display text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                  <div>
                    <p className="font-display text-sm font-medium text-foreground">{p.name}</p>
                    <p className="font-body text-xs text-muted-foreground">{p.count} order{p.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="font-display text-sm font-semibold text-foreground">KES {p.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
