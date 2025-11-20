import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (phone),
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">مدیریت سفارشات</h2>
          <p className="text-muted-foreground mt-2">
            مشاهده و مدیریت تمام سفارشات
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>لیست سفارشات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ سفارشی ثبت نشده است
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره موبایل</TableHead>
                    <TableHead>تعداد محصولات</TableHead>
                    <TableHead>مبلغ کل</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>آدرس</TableHead>
                    <TableHead>تاریخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.profiles?.phone || '-'}</TableCell>
                      <TableCell>
                        {order.order_items?.length.toLocaleString('fa-IR') || '۰'}
                      </TableCell>
                      <TableCell>
                        {order.total_amount.toLocaleString('fa-IR')} تومان
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {order.shipping_address}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('fa-IR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
