import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { useState } from "react";
import { Download } from "lucide-react";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

interface OrderDetailsDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const [newStatus, setNewStatus] = useState(order?.status || "pending");
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', order.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('وضعیت سفارش با موفقیت تغییر کرد');
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast.error('خطا در تغییر وضعیت سفارش');
    },
  });

  const handleStatusChange = async () => {
    if (newStatus !== order.status) {
      await updateStatusMutation.mutateAsync(newStatus);
    }
  };

  if (!order) return null;

  const totalItems = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>جزئیات سفارش</DialogTitle>
              <DialogDescription>
                مشاهده اطلاعات کامل سفارش و تغییر وضعیت
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateInvoicePDF(order)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              دانلود فاکتور
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">وضعیت سفارش</h3>
              <Badge className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="processing">در حال پردازش</SelectItem>
                  <SelectItem value="completed">تکمیل شده</SelectItem>
                  <SelectItem value="cancelled">لغو شده</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusChange}
                disabled={newStatus === order.status || updateStatusMutation.isPending}
                style={{ backgroundColor: '#B3886D' }}
              >
                {updateStatusMutation.isPending ? 'در حال ذخیره...' : 'ذخیره'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">اطلاعات مشتری</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">شماره موبایل:</span>
                <span className="font-medium">{order.profiles?.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاریخ سفارش:</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div className="space-y-3">
            <h3 className="font-semibold">آدرس ارسال</h3>
            <p className="text-sm bg-muted p-3 rounded-lg">
              {order.shipping_address}
            </p>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold">محصولات سفارش</h3>
            <div className="space-y-3">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 p-3 border rounded-lg">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">{item.product_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>تعداد: {toPersianNumber(item.quantity)}</span>
                      <span>قیمت واحد: {formatPrice(item.price)} تومان</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">
                      {formatPrice(item.quantity * item.price)} تومان
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold">خلاصه سفارش</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">تعداد کل محصولات:</span>
                <span className="font-medium">{totalItems.toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>جمع کل:</span>
                <span style={{ color: '#B3886D' }}>
                  {order.total_amount.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
