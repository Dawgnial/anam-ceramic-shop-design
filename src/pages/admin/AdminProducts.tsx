import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Settings, Tags } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductFeaturesDialog } from "@/components/admin/ProductFeaturesDialog";
import { ProductAttributesDialog } from "@/components/admin/ProductAttributesDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminProducts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false);
  const [managingProduct, setManagingProduct] = useState<any>(null);
  const [attributesDialogOpen, setAttributesDialogOpen] = useState(false);
  const [managingAttributesProduct, setManagingAttributesProduct] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch product categories
      const { data: productCategoriesData, error: pcError } = await supabase
        .from('product_categories')
        .select(`
          product_id,
          categories (
            id,
            name
          )
        `);

      if (pcError) throw pcError;

      // Map categories to products
      const productsWithCategories = productsData.map(product => ({
        ...product,
        categories: productCategoriesData
          ?.filter((pc: any) => pc.product_id === product.id)
          .map((pc: any) => pc.categories) || [],
        category_ids: productCategoriesData
          ?.filter((pc: any) => pc.product_id === product.id)
          .map((pc: any) => pc.categories.id) || []
      }));

      return productsWithCategories;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const slug = values.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w-]/g, '');

      // Extract category_ids and remove from product data
      const { category_ids, ...productValues } = values;

      // Filter out undefined values
      const productData = Object.fromEntries(
        Object.entries({ ...productValues, slug }).filter(([_, v]) => v !== undefined)
      ) as any;

      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) throw productError;

      // Insert product categories
      if (category_ids && category_ids.length > 0) {
        const categoryInserts = category_ids.map((categoryId: string) => ({
          product_id: product.id,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('product_categories')
          .insert(categoryInserts);

        if (categoriesError) throw categoriesError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('محصول با موفقیت اضافه شد');
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('خطا در افزودن محصول');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const slug = values.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w-]/g, '');

      // Extract category_ids and remove from product data
      const { category_ids, ...productValues } = values;

      // Filter out undefined values
      const productData = Object.fromEntries(
        Object.entries({ ...productValues, slug }).filter(([_, v]) => v !== undefined)
      ) as any;

      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (productError) throw productError;

      // Delete existing product categories
      const { error: deleteError } = await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      // Insert new product categories
      if (category_ids && category_ids.length > 0) {
        const categoryInserts = category_ids.map((categoryId: string) => ({
          product_id: id,
          category_id: categoryId
        }));

        const { error: categoriesError } = await supabase
          .from('product_categories')
          .insert(categoryInserts);

        if (categoriesError) throw categoriesError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('محصول با موفقیت ویرایش شد');
      setDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('خطا در ویرایش محصول');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('محصول با موفقیت حذف شد');
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('خطا در حذف محصول');
    },
  });

  const handleSubmit = async (values: any) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (product: any) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleManageFeatures = (product: any) => {
    setManagingProduct(product);
    setFeaturesDialogOpen(true);
  };

  const handleManageAttributes = (product: any) => {
    setManagingAttributesProduct(product);
    setAttributesDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">مدیریت محصولات</h2>
            <p className="text-muted-foreground mt-2">
              افزودن، ویرایش و حذف محصولات
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setDialogOpen(true);
            }}
            style={{ backgroundColor: '#B3886D' }}
          >
            <Plus className="ml-2 h-4 w-4" />
            افزودن محصول
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>لیست محصولات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">در حال بارگذاری...</div>
            ) : !products || products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ محصولی ثبت نشده است
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تصویر</TableHead>
                    <TableHead>نام محصول</TableHead>
                    <TableHead>دسته‌بندی</TableHead>
                    <TableHead>قیمت</TableHead>
                    <TableHead>تخفیف</TableHead>
                    <TableHead>موجودی</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.images[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.categories?.length > 0 
                          ? product.categories.map((cat: any) => cat.name).join('، ')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {product.price.toLocaleString('fa-IR')} تومان
                      </TableCell>
                      <TableCell>
                        {product.discount_percentage ? (
                          <Badge variant="secondary">
                            {product.discount_percentage.toLocaleString('fa-IR')}٪
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          {product.stock?.toLocaleString('fa-IR') ?? '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {product.is_featured && (
                            <Badge style={{ backgroundColor: '#B3886D' }}>
                              ویژه
                            </Badge>
                          )}
                          {product.in_stock ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              موجود
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              ناموجود
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleManageAttributes(product)}
                            title="مدیریت ویژگی‌ها (رنگ، اندازه، ...)"
                          >
                            <Tags className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleManageFeatures(product)}
                            title="مدیریت مشخصات فنی"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(product)}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'اطلاعات محصول را ویرایش کنید'
                : 'اطلاعات محصول جدید را وارد کنید'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            defaultValues={editingProduct || undefined}
            onSubmit={handleSubmit}
            submitLabel={editingProduct ? 'ذخیره تغییرات' : 'افزودن محصول'}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف محصول</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید محصول "{deletingProduct?.name}" را حذف کنید؟
              این عملیات قابل بازگشت نیست.
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

      {managingProduct && (
        <ProductFeaturesDialog
          open={featuresDialogOpen}
          onOpenChange={setFeaturesDialogOpen}
          productId={managingProduct.id}
          productName={managingProduct.name}
        />
      )}

      {managingAttributesProduct && (
        <ProductAttributesDialog
          open={attributesDialogOpen}
          onOpenChange={setAttributesDialogOpen}
          productId={managingAttributesProduct.id}
          productName={managingAttributesProduct.name}
        />
      )}
    </AdminLayout>
  );
}
