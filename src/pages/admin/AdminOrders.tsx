import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, X, Download, FileSpreadsheet } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { toast } from "sonner";
import { generateOrderNumber, toPersianNumber } from "@/lib/utils";

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
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
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

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter((order: any) => {
      // Search filter (phone number or address)
      const matchesSearch = searchQuery === "" || 
        order.profiles?.phone?.includes(searchQuery) ||
        order.shipping_address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  // Export orders to CSV
  const exportToCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      toast.error('سفارشی برای خروجی‌گیری وجود ندارد');
      return;
    }

    const headers = ['شماره موبایل', 'تعداد محصولات', 'مبلغ کل', 'وضعیت', 'آدرس', 'تاریخ'];
    const rows = filteredOrders.map((order: any) => [
      order.profiles?.phone || '-',
      order.order_items?.length || 0,
      order.total_amount,
      statusLabels[order.status] || order.status,
      `"${order.shipping_address?.replace(/"/g, '""') || ''}"`,
      new Date(order.created_at).toLocaleDateString('fa-IR'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('فایل سفارشات دانلود شد');
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

        {/* Search and Filter Section */}
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو با شماره موبایل یا آدرس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="وضعیت سفارش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="processing">در حال پردازش</SelectItem>
                  <SelectItem value="completed">تکمیل شده</SelectItem>
                  <SelectItem value="cancelled">لغو شده</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                  <X className="h-4 w-4 ml-2" />
                  پاک کردن فیلترها
                </Button>
              )}
              <Button variant="outline" onClick={exportToCSV} className="w-full sm:w-auto">
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                خروجی Excel
              </Button>
            </div>
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground">
                {filteredOrders.length.toLocaleString('fa-IR')} سفارش یافت شد
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">لیست سفارشات</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : isError ? (
              <div className="text-center py-8 text-destructive">
                خطا در دریافت سفارشات
                <div className="mt-2 text-sm text-muted-foreground break-words">
                  {(error as any)?.message || 'لطفاً صفحه را رفرش کنید'}
                </div>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                  تلاش دوباره
                </Button>
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ سفارشی ثبت نشده است
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                سفارشی با این مشخصات یافت نشد
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>شماره سفارش</TableHead>
                        <TableHead>شماره موبایل</TableHead>
                        <TableHead>تعداد محصولات</TableHead>
                        <TableHead>مبلغ کل</TableHead>
                        <TableHead>وضعیت</TableHead>
                        <TableHead>تاریخ</TableHead>
                        <TableHead>عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-bold" style={{ color: '#B3886D' }}>
                            {toPersianNumber(generateOrderNumber(order.id, order.created_at))}
                          </TableCell>
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
                      {filteredOrders.map((order: any) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">شماره سفارش</p>
                            <p className="font-mono font-bold text-sm" style={{ color: '#B3886D' }}>
                              {toPersianNumber(generateOrderNumber(order.id, order.created_at))}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {order.profiles?.phone || '-'}
                            </p>
                            <p className="text-xs text-muted-foreground">
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
