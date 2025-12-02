import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toPersianNumber } from "@/lib/utils";
import { Loader2, Save, Truck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface ShippingCost {
  id: string;
  province_name: string;
  shipping_cost: number;
  is_active: boolean;
}

const AdminShipping = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCosts, setEditingCosts] = useState<Record<string, number>>({});

  const { data: shippingCosts, isLoading } = useQuery({
    queryKey: ["admin-shipping-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_costs")
        .select("*")
        .order("province_name");

      if (error) throw error;
      return data as ShippingCost[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, shipping_cost }: { id: string; shipping_cost: number }) => {
      const { error } = await supabase
        .from("shipping_costs")
        .update({ shipping_cost })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-costs"] });
      toast({
        title: "موفق",
        description: "هزینه ارسال با موفقیت به‌روزرسانی شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی هزینه ارسال",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("shipping_costs")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-costs"] });
      toast({
        title: "موفق",
        description: "وضعیت استان به‌روزرسانی شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی وضعیت",
        variant: "destructive",
      });
    },
  });

  const updateAllMutation = useMutation({
    mutationFn: async (updates: { id: string; shipping_cost: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("shipping_costs")
          .update({ shipping_cost: update.shipping_cost })
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shipping-costs"] });
      setEditingCosts({});
      toast({
        title: "موفق",
        description: "تمام هزینه‌های ارسال با موفقیت ذخیره شدند",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ذخیره هزینه‌های ارسال",
        variant: "destructive",
      });
    },
  });

  const handleCostChange = (id: string, value: string) => {
    // Convert Persian digits to English digits first
    const persianToEnglish = value
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[^0-9]/g, '');
    const numValue = parseInt(persianToEnglish) || 0;
    setEditingCosts(prev => ({ ...prev, [id]: numValue }));
  };

  const handleSaveAll = () => {
    const updates = Object.entries(editingCosts).map(([id, shipping_cost]) => ({
      id,
      shipping_cost,
    }));
    
    if (updates.length > 0) {
      updateAllMutation.mutate(updates);
    } else {
      toast({
        title: "توجه",
        description: "هیچ تغییری برای ذخیره وجود ندارد",
      });
    }
  };

  const getCostValue = (item: ShippingCost) => {
    return editingCosts[item.id] !== undefined ? editingCosts[item.id] : item.shipping_cost;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8" style={{ color: '#B3886D' }} />
            <div>
              <h1 className="text-3xl font-bold">هزینه ارسال</h1>
              <p className="text-muted-foreground">
                تنظیم هزینه ارسال برای هر استان
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSaveAll}
            disabled={Object.keys(editingCosts).length === 0 || updateAllMutation.isPending}
            style={{ backgroundColor: '#B3886D' }}
            className="text-white"
          >
            {updateAllMutation.isPending ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            ذخیره تغییرات
          </Button>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 هزینه‌ها را به تومان وارد کنید. برای ارسال رایگان به یک استان، مقدار ۰ را وارد کنید.
          </p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">ردیف</TableHead>
                <TableHead className="text-right">استان</TableHead>
                <TableHead className="text-right">هزینه ارسال (تومان)</TableHead>
                <TableHead className="text-right">فعال</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingCosts?.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {toPersianNumber(index + 1)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.province_name}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={toPersianNumber(getCostValue(item))}
                      onChange={(e) => handleCostChange(item.id, e.target.value)}
                      className="w-40 text-left"
                      dir="ltr"
                      placeholder="هزینه ارسال"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => 
                        toggleActiveMutation.mutate({ id: item.id, is_active: checked })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-background border rounded-lg p-4">
          <h3 className="font-bold mb-2">راهنما:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>هزینه ارسال را برای هر استان به تومان وارد کنید</li>
            <li>برای ارسال رایگان مقدار ۰ وارد کنید</li>
            <li>استان‌های غیرفعال در لیست انتخاب مشتری نمایش داده نمی‌شوند</li>
            <li>پس از تغییر هزینه‌ها، دکمه «ذخیره تغییرات» را بزنید</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminShipping;
