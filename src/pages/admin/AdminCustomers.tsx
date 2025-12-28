import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminCustomers() {
  const { data: customers, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          orders (id)
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
          <h2 className="text-3xl font-bold">مدیریت مشتریان</h2>
          <p className="text-muted-foreground mt-2">
            مشاهده اطلاعات و آمار مشتریان
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                تعداد کل مشتریان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#B3886D' }}>
                {isLoading ? "..." : customers?.length.toLocaleString('fa-IR') || '۰'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>لیست مشتریان</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">
                خطا در دریافت اطلاعات مشتریان
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                  تلاش دوباره
                </Button>
              </div>
            ) : !customers || customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ مشتری‌ای ثبت نشده است
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره موبایل</TableHead>
                    <TableHead>تعداد سفارشات</TableHead>
                    <TableHead>تاریخ عضویت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        {customer.orders?.length.toLocaleString('fa-IR') || '۰'}
                      </TableCell>
                      <TableCell>
                        {new Date(customer.created_at).toLocaleDateString('fa-IR')}
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
