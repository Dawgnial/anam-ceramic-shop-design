import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminCategories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get product count for each category
  const { data: productCounts } = useQuery({
    queryKey: ['category-product-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('category_id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((pc: any) => {
        if (pc.category_id) {
          counts[pc.category_id] = (counts[pc.category_id] || 0) + 1;
        }
      });

      return counts;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const slug = values.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w-]/g, '');

      const { error } = await supabase
        .from('categories')
        .insert([{ ...values, slug }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('دسته‌بندی با موفقیت اضافه شد');
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('خطا در افزودن دسته‌بندی');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const slug = values.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w-]/g, '');

      const { error } = await supabase
        .from('categories')
        .update({ ...values, slug })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('دسته‌بندی با موفقیت ویرایش شد');
      setDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('خطا در ویرایش دسته‌بندی');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-product-counts'] });
      toast.success('دسته‌بندی با موفقیت حذف شد');
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('خطا در حذف دسته‌بندی');
    },
  });

  const handleSubmit = async (values: any) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({ id: editingCategory.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = (category: any) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">مدیریت دسته‌بندی‌ها</h2>
            <p className="text-muted-foreground mt-2">
              افزودن، ویرایش و حذف دسته‌بندی‌ها
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingCategory(null);
              setDialogOpen(true);
            }}
            style={{ backgroundColor: '#B3886D' }}
          >
            <Plus className="ml-2 h-4 w-4" />
            افزودن دسته‌بندی
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>لیست دسته‌بندی‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : !categories || categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ دسته‌بندی‌ای ثبت نشده است
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category: any) => (
                  <Card key={category.id} className="overflow-hidden">
                    <div className="aspect-video relative bg-muted">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                          {productCounts?.[category.id]?.toLocaleString('fa-IR') || '۰'} محصول
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingCategory(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'اطلاعات دسته‌بندی را ویرایش کنید'
                : 'اطلاعات دسته‌بندی جدید را وارد کنید'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            key={editingCategory?.id || 'new'}
            defaultValues={editingCategory || undefined}
            onSubmit={handleSubmit}
            submitLabel={editingCategory ? 'ذخیره تغییرات' : 'افزودن دسته‌بندی'}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید دسته‌بندی "{deletingCategory?.name}" را حذف کنید؟
              {productCounts?.[deletingCategory?.id] > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  توجه: این دسته‌بندی دارای {productCounts[deletingCategory.id].toLocaleString('fa-IR')} محصول است.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
