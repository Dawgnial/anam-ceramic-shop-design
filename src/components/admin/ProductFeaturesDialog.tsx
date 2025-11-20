import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function ProductFeaturesDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductFeaturesDialogProps) {
  const queryClient = useQueryClient();
  const [newFeature, setNewFeature] = useState({ key: "", value: "" });

  const { data: features = [], isLoading } = useQuery({
    queryKey: ['product-features-admin', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_features')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const addFeatureMutation = useMutation({
    mutationFn: async () => {
      if (!newFeature.key.trim() || !newFeature.value.trim()) {
        throw new Error('لطفا نام و مقدار ویژگی را وارد کنید');
      }

      const { error } = await supabase
        .from('product_features')
        .insert({
          product_id: productId,
          feature_key: newFeature.key.trim(),
          feature_value: newFeature.value.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-features-admin', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-features', productId] });
      toast.success('ویژگی با موفقیت اضافه شد');
      setNewFeature({ key: "", value: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: async (featureId: string) => {
      const { error } = await supabase
        .from('product_features')
        .delete()
        .eq('id', featureId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-features-admin', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-features', productId] });
      toast.success('ویژگی با موفقیت حذف شد');
    },
    onError: () => {
      toast.error('خطا در حذف ویژگی');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>مدیریت ویژگی‌های محصول: {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Feature Form */}
          <div className="border rounded-lg p-4 space-y-4" style={{ backgroundColor: '#F9F9F9' }}>
            <h4 className="font-semibold">افزودن ویژگی جدید</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نام ویژگی</Label>
                <Input
                  placeholder="مثال: سایز، وزن، جنس"
                  value={newFeature.key}
                  onChange={(e) => setNewFeature({ ...newFeature, key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>مقدار</Label>
                <Input
                  placeholder="مثال: بزرگ، ۵۰۰ گرم، سرامیک"
                  value={newFeature.value}
                  onChange={(e) => setNewFeature({ ...newFeature, value: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={() => addFeatureMutation.mutate()}
              disabled={addFeatureMutation.isPending}
              style={{ backgroundColor: '#B3886D' }}
              className="w-full"
            >
              <Plus className="w-4 h-4 ml-2" />
              افزودن ویژگی
            </Button>
          </div>

          {/* Existing Features List */}
          <div className="space-y-3">
            <h4 className="font-semibold">ویژگی‌های موجود</h4>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">در حال بارگذاری...</p>
            ) : features.length > 0 ? (
              <div className="space-y-2">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">نام:</span>
                        <p className="font-medium">{feature.feature_key}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">مقدار:</span>
                        <p className="font-medium">{feature.feature_value}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteFeatureMutation.mutate(feature.id)}
                      disabled={deleteFeatureMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 border rounded-lg">
                هنوز ویژگی‌ای اضافه نشده است
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
