import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, FolderTree } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
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
      title: "تعداد مشتریان",
      value: stats?.customers || 0,
      icon: Users,
      color: "#BC977F",
    },
    {
      title: "تعداد دسته‌بندی‌ها",
      value: stats?.categories || 0,
      icon: FolderTree,
      color: "#B3886D",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">داشبورد</h2>
          <p className="text-muted-foreground mt-2">خلاصه‌ای از وضعیت فروشگاه</p>
        </div>

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
                  {isLoading ? "..." : stat.value.toLocaleString('fa-IR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>به پنل مدیریت خوش آمدید</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              از منوی سمت راست می‌توانید بخش‌های مختلف پنل مدیریت را مدیریت کنید.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
