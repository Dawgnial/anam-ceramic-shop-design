import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
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
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";

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
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold">مدیریت سفارشات</h2>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            مشاهده و مدیریت تمام سفارشات
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">لیست سفارشات</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ سفارشی ثبت نشده است
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>شماره موبایل</TableHead>
                        <TableHead>تعداد محصولات</TableHead>
                        <TableHead>مبلغ کل</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>آدرس</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead>عملیات</TableHead>
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
                          <TableCell>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {orders.map((order: any) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-sm">{order.profiles?.phone || '-'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(order.created_at).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                          <Badge className={`${statusColors[order.status]} text-xs`}>
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">تعداد محصولات:</span>
                            <span className="font-medium">
                              {order.order_items?.length.toLocaleString('fa-IR') || '۰'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">مبلغ کل:</span>
                            <span className="font-bold" style={{ color: '#B3886D' }}>
                              {order.total_amount.toLocaleString('fa-IR')} تومان
                            </span>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {order.shipping_address}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(order)}
                          className="w-full mt-3"
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          مشاهده جزئیات
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </AdminLayout>
  );
}
