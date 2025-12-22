import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProductAttributesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function ProductAttributesDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductAttributesDialogProps) {
  const queryClient = useQueryClient();
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const [editingAttributeValues, setEditingAttributeValues] = useState<string[]>([]);

  // Fetch existing attributes
  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ['product-attributes', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_attributes')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Add new attribute
  const addAttributeMutation = useMutation({
    mutationFn: async () => {
      if (!newAttributeName.trim()) {
        throw new Error('نام ویژگی را وارد کنید');
      }
      if (editingAttributeValues.length === 0) {
        throw new Error('حداقل یک مقدار برای ویژگی وارد کنید');
      }

      const { error } = await supabase
        .from('product_attributes')
        .insert({
          product_id: productId,
          attribute_name: newAttributeName.trim(),
          attribute_values: editingAttributeValues,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-attributes', productId] });
      toast.success('ویژگی با موفقیت اضافه شد');
      setNewAttributeName("");
      setEditingAttributeValues([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete attribute
  const deleteAttributeMutation = useMutation({
    mutationFn: async (attributeId: string) => {
      const { error } = await supabase
        .from('product_attributes')
        .delete()
        .eq('id', attributeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-attributes', productId] });
      toast.success('ویژگی حذف شد');
    },
    onError: () => {
      toast.error('خطا در حذف ویژگی');
    },
  });

  const addValueToNewAttribute = () => {
    if (newAttributeValue.trim()) {
      setEditingAttributeValues([...editingAttributeValues, newAttributeValue.trim()]);
      setNewAttributeValue("");
    }
  };

  const removeValueFromNewAttribute = (index: number) => {
    setEditingAttributeValues(editingAttributeValues.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">مدیریت ویژگی‌های محصول</DialogTitle>
          <DialogDescription className="text-sm">
            محصول: {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Attribute Form */}
          <div className="border rounded-lg p-3 sm:p-4 space-y-4 bg-muted/30">
            <h3 className="font-semibold text-sm sm:text-lg">افزودن ویژگی جدید</h3>
            
            <div className="space-y-2">
              <Label className="text-sm">نام ویژگی (مثل: رنگ، اندازه، جنس)</Label>
              <Input
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
                placeholder="نام ویژگی را وارد کنید"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">مقادیر ویژگی</Label>
              <div className="flex gap-2">
                <Input
                  value={newAttributeValue}
                  onChange={(e) => setNewAttributeValue(e.target.value)}
                  placeholder="مقدار را وارد کنید (مثل: قرمز، بزرگ، پارچه)"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addValueToNewAttribute();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addValueToNewAttribute}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {editingAttributeValues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingAttributeValues.map((value, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {value}
                      <button
                        onClick={() => removeValueFromNewAttribute(index)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => addAttributeMutation.mutate()}
              disabled={addAttributeMutation.isPending}
              style={{ backgroundColor: '#B3886D' }}
              className="w-full"
            >
              <Plus className="ml-2 h-4 w-4" />
              افزودن ویژگی
            </Button>
          </div>

          {/* Existing Attributes List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">ویژگی‌های موجود</h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                در حال بارگذاری...
              </div>
            ) : attributes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/10">
                هیچ ویژگی‌ای تعریف نشده است
              </div>
            ) : (
              <div className="space-y-3">
                {attributes.map((attribute) => (
                  <div
                    key={attribute.id}
                    className="border rounded-lg p-4 space-y-3 bg-background hover:border-[#B3886D] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-base">{attribute.attribute_name}</h4>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteAttributeMutation.mutate(attribute.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {attribute.attribute_values?.map((value: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {value}
                        </Badge>
                      ))
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
