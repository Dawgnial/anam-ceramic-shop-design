import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ShoppingCart, Users, FolderTree, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { LowStockAlert } from "@/components/admin/LowStockAlert";

// Custom tooltip for charts
const ChartTooltip = Tooltip;

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
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold">داشبورد</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">خلاصه‌ای از وضعیت فروشگاه</p>
        </div>

        {/* Low Stock Alert */}
        <LowStockAlert />

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between p-0 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: stat.color }} />
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-base sm:text-2xl font-bold" style={{ color: stat.color }}>
                  {isLoading ? "..." : typeof stat.value === 'number' ? stat.value.toLocaleString('fa-IR') : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">نمودار درآمد (۷ روز اخیر)</CardTitle>
              <CardDescription className="text-xs sm:text-sm">روند درآمد روزانه</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              {chartData && chartData.length > 0 ? (
                <div className="h-[180px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fill: '#666' }} 
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#666' }} 
                        width={50}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickFormatter={(value) => value.toLocaleString('fa-IR')}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                                <p className="font-medium mb-1">{label}</p>
                                <p className="text-[#B3886D]">
                                  درآمد: {payload[0].value?.toLocaleString('fa-IR')} تومان
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#B3886D" 
                        strokeWidth={2}
                        dot={{ fill: '#B3886D', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#B3886D' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[180px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  داده‌ای برای نمایش وجود ندارد
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">نمودار سفارشات (۷ روز اخیر)</CardTitle>
              <CardDescription className="text-xs sm:text-sm">تعداد سفارشات روزانه</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              {chartData && chartData.length > 0 ? (
                <div className="h-[180px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10, fill: '#666' }} 
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#666' }} 
                        width={30}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                        allowDecimals={false}
                        tickFormatter={(value) => value.toLocaleString('fa-IR')}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                                <p className="font-medium mb-1">{label}</p>
                                <p className="text-[#896A59]">
                                  تعداد سفارش: {payload[0].value?.toLocaleString('fa-IR')}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="orders" 
                        fill="#896A59" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[180px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  داده‌ای برای نمایش وجود ندارد
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products and Order Status */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Top Selling Products */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">محصولات پرفروش</CardTitle>
              <CardDescription className="text-xs sm:text-sm">۵ محصول برتر براساس تعداد فروش</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {topProducts && topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2 sm:pb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div 
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                          style={{ backgroundColor: '#B3886D' }}
                        >
                          {(index + 1).toLocaleString('fa-IR')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.quantity.toLocaleString('fa-IR')} فروش
                          </p>
                        </div>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="font-bold text-xs sm:text-sm" style={{ color: '#28A745' }}>
                          {product.revenue.toLocaleString('fa-IR')}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">تومان</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                  هنوز فروشی ثبت نشده است
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">وضعیت سفارشات</CardTitle>
              <CardDescription className="text-xs sm:text-sm">آمار سفارشات براساس وضعیت</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center justify-between p-2 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <span className="font-medium text-xs sm:text-base">در انتظار پردازش</span>
                  </div>
                  <span className="text-lg sm:text-2xl font-bold" style={{ color: '#896A59' }}>
                    {(revenueData?.pendingOrders || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium text-xs sm:text-base">تکمیل شده</span>
                  </div>
                  <span className="text-lg sm:text-2xl font-bold" style={{ color: '#28A745' }}>
                    {(revenueData?.completedOrders || 0).toLocaleString('fa-IR')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#B3886D' }}></div>
                    <span className="font-medium text-xs sm:text-base">کل سفارشات</span>
                  </div>
                  <span className="text-lg sm:text-2xl font-bold" style={{ color: '#B3886D' }}>
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
