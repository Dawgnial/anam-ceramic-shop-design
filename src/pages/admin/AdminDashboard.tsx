import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ShoppingCart, Users, FolderTree, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LowStockAlert } from "@/components/admin/LowStockAlert";

export default function AdminDashboard() {
  // Fetch basic stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [productsRes, ordersRes, customersRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
      ]);

      return {
        products: productsRes.count || 0,
        orders: ordersRes.count || 0,
        customers: customersRes.count || 0,
        categories: categoriesRes.count || 0,
      };
    },
  });

  // Fetch revenue and orders data
  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, status, created_at');

      if (error) throw error;

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

      return {
        totalRevenue,
        completedOrders,
        pendingOrders,
        orders: orders || [],
      };
    },
  });

  // Fetch top selling products
  const { data: topProducts } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('product_name, quantity, price')
        .order('quantity', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Group by product name and sum quantities
      const productMap = new Map();
      data?.forEach(item => {
        const existing = productMap.get(item.product_name) || { quantity: 0, revenue: 0 };
        productMap.set(item.product_name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity),
        });
      });

      return Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    },
  });

  // Prepare chart data for last 7 days
  const { data: chartData } = useQuery({
    queryKey: ['admin-chart-data'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const dailyData: Record<string, { revenue: number; orders: number }> = {};
      
      orders?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('fa-IR');
        if (!dailyData[date]) {
          dailyData[date] = { revenue: 0, orders: 0 };
        }
        dailyData[date].revenue += order.total_amount;
        dailyData[date].orders += 1;
      });

      return Object.entries(dailyData).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }));
    },
  });

  const statCards = [
    {
      title: "تعداد محصولات",
      value: stats?.products || 0,
      icon: Package,
      color: "#B3886D",
    },
    {
      title: "تعداد سفارشات",
      value: stats?.orders || 0,
      icon: ShoppingCart,
      color: "#896A59",
    },
    {
      title: "درآمد کل",
      value: `${(revenueData?.totalRevenue || 0).toLocaleString('fa-IR')} تومان`,
      icon: DollarSign,
      color: "#28A745",
    },
    {
      title: "تعداد مشتریان",
      value: stats?.customers || 0,
      icon: Users,
      color: "#BC977F",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">داشبورد</h2>
          <p className="text-muted-foreground mt-2">خلاصه‌ای از وضعیت فروشگاه</p>
        </div>

        {/* Low Stock Alert */}
        <LowStockAlert />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: stat.color }}>
                  {isLoading ? "..." : typeof stat.value === 'number' ? stat.value.toLocaleString('fa-IR') : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>نمودار درآمد (۷ روز اخیر)</CardTitle>
              <CardDescription>روند درآمد روزانه</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData && chartData.length > 0 ? (
                <ChartContainer
                  config={{
                    revenue: {
                      label: "درآمد",
                      color: "#B3886D",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#B3886D" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  داده‌ای برای نمایش وجود ندارد
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>نمودار سفارشات (۷ روز اخیر)</CardTitle>
              <CardDescription>تعداد سفارشات روزانه</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData && chartData.length > 0 ? (
                <ChartContainer
                  config={{
                    orders: {
                      label: "سفارشات",
                      color: "#896A59",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="orders" fill="#896A59" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  داده‌ای برای نمایش وجود ندارد
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products and Order Status */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>محصولات پرفروش</CardTitle>
              <CardDescription>۵ محصول برتر براساس تعداد فروش</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts && topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: '#B3886D' }}
                        >
                          {(index + 1).toLocaleString('fa-IR')}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.quantity.toLocaleString('fa-IR')} فروش
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold" style={{ color: '#28A745' }}>
                          {product.revenue.toLocaleString('fa-IR')}
                        </p>
                        <p className="text-xs text-muted-foreground">تومان</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  هنوز فروشی ثبت نشده است
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>وضعیت سفارشات</CardTitle>
              <CardDescription>آمار سفارشات براساس وضعیت</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="font-medium">در انتظار پردازش</span>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: '#896A59' }}>
                    {(revenueData?.pendingOrders || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">تکمیل شده</span>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: '#28A745' }}>
                    {(revenueData?.completedOrders || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#B3886D' }}></div>
                    <span className="font-medium">کل سفارشات</span>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: '#B3886D' }}>
                    {(stats?.orders || 0).toLocaleString('fa-IR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
