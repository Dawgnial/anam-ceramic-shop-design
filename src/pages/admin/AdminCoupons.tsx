import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const couponSchema = z.object({
  code: z.string().min(3, "کد باید حداقل ۳ کاراکتر باشد"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().min(1, "مقدار تخفیف باید بیشتر از ۰ باشد"),
  min_purchase: z.number().min(0),
  max_discount: z.number().optional(),
  usage_limit: z.number().optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function AdminCoupons() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState<any>(null);
  const queryClient = useQueryClient();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      min_purchase: 0,
      is_active: true,
    },
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: CouponFormValues) => {
      const payload = {
        code: values.code,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        min_purchase: values.min_purchase || 0,
        max_discount: values.max_discount,
        usage_limit: values.usage_limit,
        is_active: values.is_active,
        expires_at: values.expires_at || null,
      };
      
      const { error } = await supabase
        .from('coupons')
        .insert([payload]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('کد تخفیف با موفقیت اضافه شد');
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Error creating coupon:', error);
      toast.error(error.message === 'duplicate key value violates unique constraint "coupons_code_key"' 
        ? 'این کد تخفیف قبلا استفاده شده است'
        : 'خطا در افزودن کد تخفیف');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: CouponFormValues }) => {
      const { error } = await supabase
        .from('coupons')
        .update(values)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('کد تخفیف با موفقیت ویرایش شد');
      setDialogOpen(false);
      setEditingCoupon(null);
      form.reset();
    },
    onError: (error) => {
      console.error('Error updating coupon:', error);
      toast.error('خطا در ویرایش کد تخفیف');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('کد تخفیف با موفقیت حذف شد');
      setDeleteDialogOpen(false);
      setDeletingCoupon(null);
    },
    onError: (error) => {
      console.error('Error deleting coupon:', error);
      toast.error('خطا در حذف کد تخفیف');
    },
  });

  const handleSubmit = async (values: CouponFormValues) => {
    if (editingCoupon) {
      await updateMutation.mutateAsync({ id: editingCoupon.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    form.reset({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase: coupon.min_purchase,
      max_discount: coupon.max_discount,
      usage_limit: coupon.usage_limit,
      expires_at: coupon.expires_at,
      is_active: coupon.is_active,
    });
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">مدیریت کوپن‌های تخفیف</h2>
            <p className="text-muted-foreground mt-2">
              ایجاد و مدیریت کدهای تخفیف
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingCoupon(null);
              form.reset();
              setDialogOpen(true);
            }}
            style={{ backgroundColor: '#B3886D' }}
          >
            <Plus className="ml-2 h-4 w-4" />
            افزودن کد تخفیف
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>لیست کدهای تخفیف</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : !coupons || coupons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ کد تخفیفی ثبت نشده است
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کد</TableHead>
                    <TableHead>نوع تخفیف</TableHead>
                    <TableHead>مقدار</TableHead>
                    <TableHead>حداقل خرید</TableHead>
                    <TableHead>استفاده شده</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon: any) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-bold">{coupon.code}</TableCell>
                      <TableCell>
                        {coupon.discount_type === 'percentage' ? 'درصدی' : 'مبلغ ثابت'}
                      </TableCell>
                      <TableCell>
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value.toLocaleString('fa-IR')}%`
                          : `${coupon.discount_value.toLocaleString('fa-IR')} تومان`}
                      </TableCell>
                      <TableCell>
                        {coupon.min_purchase.toLocaleString('fa-IR')} تومان
                      </TableCell>
                      <TableCell>
                        {coupon.used_count.toLocaleString('fa-IR')}
                        {coupon.usage_limit && ` / ${coupon.usage_limit.toLocaleString('fa-IR')}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.is_active ? "default" : "secondary"}>
                          {coupon.is_active ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              setDeletingCoupon(coupon);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'ویرایش کد تخفیف' : 'افزودن کد تخفیف جدید'}
            </DialogTitle>
            <DialogDescription>
              اطلاعات کد تخفیف را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد تخفیف</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: SUMMER2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع تخفیف</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">درصدی</SelectItem>
                          <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discount_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مقدار تخفیف</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="min_purchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حداقل مبلغ خرید (تومان)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" style={{ backgroundColor: '#B3886D' }}>
                {editingCoupon ? 'ذخیره تغییرات' : 'افزودن کد تخفیف'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کد تخفیف</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید کد تخفیف "{deletingCoupon?.code}" را حذف کنید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingCoupon && deleteMutation.mutate(deletingCoupon.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
