import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Plus } from "lucide-react";

export default function AdminInventory() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [movementType, setMovementType] = useState<string>("purchase");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  // Fetch inventory movements
  const { data: movements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ['inventory-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          products (
            id,
            name,
            images
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  // Fetch low stock products
  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('low_stock_products')
        .select('*');

      if (error) throw error;
      return data;
    },
  });

  // Fetch all products for dropdown
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Add inventory movement mutation
  const addMovementMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) throw new Error('لطفا محصول را انتخاب کنید');
      if (!quantity || parseInt(quantity) <= 0) throw new Error('لطفا تعداد معتبر وارد کنید');

      const quantityNum = parseInt(quantity);
      const adjustedQuantity = movementType === 'sale' || movementType === 'damage' || movementType === 'return_to_supplier'
        ? -quantityNum
        : quantityNum;

      // Insert movement record
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          product_id: selectedProduct,
          quantity: adjustedQuantity,
          movement_type: movementType,
          notes: notes.trim() || null,
        });

      if (movementError) throw movementError;

      // Update product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', selectedProduct)
        .single();

      if (productError) throw productError;

      const newStock = (product.stock || 0) + adjustedQuantity;

      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock: Math.max(0, newStock),
          in_stock: newStock > 0
        })
        .eq('id', selectedProduct);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-for-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('تغییرات موجودی با موفقیت ثبت شد');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setSelectedProduct("");
    setQuantity("");
    setMovementType("purchase");
    setNotes("");
  };

  const handleSubmit = () => {
    addMovementMutation.mutate();
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'return_from_customer':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'sale':
      case 'damage':
      case 'return_to_supplier':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'خرید',
      sale: 'فروش',
      return_from_customer: 'برگشت از مشتری',
      return_to_supplier: 'برگشت به تامین‌کننده',
      damage: 'خرابی/آسیب',
      adjustment: 'تعدیل موجودی',
    };
    return labels[type] || type;
  };

  const getMovementBadgeVariant = (type: string) => {
    if (['purchase', 'return_from_customer', 'adjustment'].includes(type)) {
      return 'default';
    }
    return 'destructive';
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold">مدیریت موجودی</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              تاریخچه حرکات انبار و هشدار موجودی پایین
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            style={{ backgroundColor: '#B3886D' }}
            className="w-full sm:w-auto"
          >
            <Plus className="ml-2 h-4 w-4" />
            ثبت حرکت جدید
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-orange-800 text-sm sm:text-base">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                هشدار موجودی پایین ({lowStockProducts.length.toLocaleString('fa-IR')} محصول)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {lowStockProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-orange-200"
                  >
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{product.name}</p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          موجودی: {product.stock?.toLocaleString('fa-IR') || '۰'}
                        </Badge>
                        <Badge variant="destructive" className="text-[10px] sm:text-xs">
                          کمبود: {product.stock_shortage?.toLocaleString('fa-IR') || '۰'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Movements History */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base">تاریخچه حرکات انبار</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {movementsLoading ? (
              <div className="text-center py-6 sm:py-8 text-sm">در حال بارگذاری...</div>
            ) : movements.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                هیچ حرکتی ثبت نشده است
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>محصول</TableHead>
                        <TableHead>نوع حرکت</TableHead>
                        <TableHead>تعداد</TableHead>
                        <TableHead>یادداشت</TableHead>
                        <TableHead>تاریخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement: any) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={movement.products?.images?.[0] || '/placeholder.svg'}
                                alt={movement.products?.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <span className="font-medium">
                                {movement.products?.name || 'محصول حذف شده'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getMovementBadgeVariant(movement.movement_type)}>
                              <div className="flex items-center gap-1">
                                {getMovementIcon(movement.movement_type)}
                                {getMovementLabel(movement.movement_type)}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={movement.quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {movement.quantity > 0 ? '+' : ''}
                              {movement.quantity.toLocaleString('fa-IR')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {movement.notes || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(movement.created_at).toLocaleDateString('fa-IR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {movements.map((movement: any) => (
                    <Card key={movement.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={movement.products?.images?.[0] || '/placeholder.svg'}
                          alt={movement.products?.name}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {movement.products?.name || 'محصول حذف شده'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant={getMovementBadgeVariant(movement.movement_type)} className="text-xs">
                              {getMovementIcon(movement.movement_type)}
                              <span className="mr-1">{getMovementLabel(movement.movement_type)}</span>
                            </Badge>
                            <span className={`text-sm font-semibold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity.toLocaleString('fa-IR')}
                            </span>
                          </div>
                          {movement.notes && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{movement.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(movement.created_at).toLocaleDateString('fa-IR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Movement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ثبت حرکت موجودی جدید</DialogTitle>
            <DialogDescription>
              اطلاعات حرکت موجودی را وارد کنید
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>محصول</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب محصول" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (موجودی فعلی: {product.stock?.toLocaleString('fa-IR') || '۰'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>نوع حرکت</Label>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">خرید (افزایش موجودی)</SelectItem>
                  <SelectItem value="sale">فروش (کاهش موجودی)</SelectItem>
                  <SelectItem value="return_from_customer">برگشت از مشتری (افزایش)</SelectItem>
                  <SelectItem value="return_to_supplier">برگشت به تامین‌کننده (کاهش)</SelectItem>
                  <SelectItem value="damage">خرابی/آسیب (کاهش)</SelectItem>
                  <SelectItem value="adjustment">تعدیل موجودی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تعداد</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="تعداد را وارد کنید"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label>یادداشت (اختیاری)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توضیحات یا یادداشت..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={addMovementMutation.isPending}
                style={{ backgroundColor: '#B3886D' }}
                className="flex-1"
              >
                {addMovementMutation.isPending ? 'در حال ثبت...' : 'ثبت حرکت'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                disabled={addMovementMutation.isPending}
              >
                لغو
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}