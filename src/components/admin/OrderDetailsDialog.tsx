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
import { useState, useMemo } from "react";
import { Download, Truck, CreditCard, Banknote, Box } from "lucide-react";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";

// Helper to extract shipping method from shipping_address
const parseShippingInfo = (shippingAddress: string) => {
  const methodMatch = shippingAddress.match(/روش ارسال:\s*(.*?)(?:\s*-|$)/);
  const shippingMethod = methodMatch ? methodMatch[1].trim() : null;
  
  // Remove shipping method from address for cleaner display
  const cleanAddress = shippingAddress.replace(/\s*-\s*روش ارسال:.*$/, '').trim();
  
  return { shippingMethod, cleanAddress };
};

const getShippingMethodInfo = (method: string | null) => {
  switch (method) {
    case 'پرداخت آنلاین':
      return { label: 'پرداخت آنلاین هزینه ارسال', icon: CreditCard, color: 'bg-green-500' };
    case 'پس کرایه':
      return { label: 'پس کرایه (پرداخت هنگام تحویل)', icon: Banknote, color: 'bg-amber-500' };
    case 'اسنپ باکس':
      return { label: 'اسنپ باکس (ویژه مشهد)', icon: Box, color: 'bg-blue-500' };
    default:
      return { label: method || 'نامشخص', icon: Truck, color: 'bg-gray-500' };
  }
};

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
  
  // Parse shipping info from address
  const { shippingMethod, cleanAddress } = parseShippingInfo(order.shipping_address || '');
  const shippingInfo = getShippingMethodInfo(shippingMethod);
  const ShippingIcon = shippingInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base sm:text-lg">جزئیات سفارش</DialogTitle>
              <DialogDescription className="text-sm">
                مشاهده اطلاعات کامل سفارش و تغییر وضعیت
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateInvoicePDF(order)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              دانلود فاکتور
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Order Status */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-semibold text-sm sm:text-base">وضعیت سفارش</h3>
              <Badge className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
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
                className="w-full sm:w-auto"
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

          {/* Shipping Method */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5" />
              روش ارسال
            </h3>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <div className={`p-2 rounded-full ${shippingInfo.color}`}>
                <ShippingIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{shippingInfo.label}</p>
                {shippingMethod === 'پس کرایه' && (
                  <p className="text-sm text-amber-600">هزینه ارسال توسط مشتری هنگام تحویل پرداخت می‌شود</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div className="space-y-3">
            <h3 className="font-semibold">آدرس ارسال</h3>
            <p className="text-sm bg-muted p-3 rounded-lg">
              {cleanAddress || order.shipping_address}
            </p>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm sm:text-base">محصولات سفارش</h3>
            <div className="space-y-3">
              {order.order_items?.map((item: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 border rounded-lg">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm sm:text-base">{item.product_name}</h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span>تعداد: {toPersianNumber(item.quantity)}</span>
                      <span>قیمت واحد: {formatPrice(item.price)} تومان</span>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="font-semibold text-sm sm:text-base">
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
