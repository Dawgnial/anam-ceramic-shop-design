import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, Scale, ShoppingCart, Eye, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Compare() {
  const { items, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Fetch full product details for comparison
  const { data: products, isLoading } = useQuery({
    queryKey: ['compare-products', items.map(i => i.id)],
    queryFn: async () => {
      if (items.length === 0) return [];

      const productIds = items.map(i => i.id);
      
      // Fetch products with features and attributes
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Fetch features for each product
      const { data: featuresData, error: featuresError } = await supabase
        .from('product_features')
        .select('*')
        .in('product_id', productIds);

      if (featuresError) throw featuresError;

      // Fetch attributes for each product
      const { data: attributesData, error: attributesError } = await supabase
        .from('product_attributes')
        .select('*')
        .in('product_id', productIds);

      if (attributesError) throw attributesError;

      // Map features and attributes to products
      return productsData.map(product => ({
        ...product,
        features: featuresData?.filter(f => f.product_id === product.id) || [],
        attributes: attributesData?.filter(a => a.product_id === product.id) || []
      }));
    },
    enabled: items.length > 0,
  });

  // Get all unique feature keys and attribute names across all products
  const allFeatureKeys = products
    ? Array.from(new Set(
        products.flatMap(p => p.features?.map((f: any) => f.feature_key) || [])
      ))
    : [];

  const allAttributeNames = products
    ? Array.from(new Set(
        products.flatMap(p => p.attributes?.map((a: any) => a.attribute_name) || [])
      ))
    : [];

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به سبد خرید اضافه شد');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center px-4" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">مقایسه محصولات</h1>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('/')} className="hover:text-foreground">
            خانه
          </button>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-foreground font-medium">مقایسه محصولات</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center justify-center space-y-6">
                <Scale className="w-24 h-24 text-muted-foreground" />
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">لیست مقایسه خالی است</h2>
                  <p className="text-muted-foreground">
                    هیچ محصولی برای مقایسه اضافه نشده است
                  </p>
                  <Button 
                    onClick={() => navigate('/shop')}
                    style={{ backgroundColor: '#B3886D' }}
                  >
                    مشاهده محصولات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {items.length.toLocaleString('fa-IR')} محصول در لیست مقایسه
              </h2>
              <Button
                variant="destructive"
                onClick={() => {
                  clearCompare();
                  toast.success('لیست مقایسه پاک شد');
                }}
              >
                پاک کردن همه
              </Button>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#FCF8F4]">
                      <TableHead className="w-[200px] font-bold text-base sticky right-0 bg-[#FCF8F4] z-10">
                        مشخصات
                      </TableHead>
                      {products?.map((product) => (
                        <TableHead key={product.id} className="text-center min-w-[250px] relative">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 left-2 hover:bg-destructive/10"
                            onClick={() => {
                              removeFromCompare(product.id);
                              toast.success('محصول از لیست مقایسه حذف شد');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Product Images */}
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-semibold sticky right-0 bg-background">
                        تصویر محصول
                      </TableCell>
                      {products?.map((product) => (
                        <TableCell key={product.id} className="text-center p-4">
                          <div className="flex justify-center">
                            <img
                              src={product.images?.[0] || '/placeholder.svg'}
                              alt={product.name}
                              className="w-48 h-48 object-cover rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => navigate(`/product/${product.slug}`)}
                            />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Product Name */}
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-semibold sticky right-0 bg-background">
                        نام محصول
                      </TableCell>
                      {products?.map((product) => (
                        <TableCell key={product.id} className="text-center">
                          <button
                            onClick={() => navigate(`/product/${product.slug}`)}
                            className="font-bold text-lg hover:text-[#B3886D] transition-colors"
                          >
                            {product.name}
                          </button>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Price */}
                    <TableRow className="hover:bg-muted/50 bg-[#FCF8F4]/30">
                      <TableCell className="font-semibold sticky right-0 bg-[#FCF8F4]/30">
                        قیمت
                      </TableCell>
                      {products?.map((product) => (
                        <TableCell key={product.id} className="text-center">
                          <div className="space-y-1">
                            <span className="text-2xl font-bold block" style={{ color: '#B3886D' }}>
                              {product.price.toLocaleString('en-US').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])}
                            </span>
                            <span className="text-sm text-muted-foreground">تومان</span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Stock Status */}
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-semibold sticky right-0 bg-background">
                        وضعیت موجودی
                      </TableCell>
                      {products?.map((product) => (
                        <TableCell key={product.id} className="text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Badge 
                              variant={product.stock > 0 ? "default" : "destructive"}
                              className="text-sm"
                            >
                              {product.stock > 0 
                                ? `موجود (${product.stock.toLocaleString('fa-IR')} عدد)`
                                : 'ناموجود'
                              }
                            </Badge>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Description */}
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="font-semibold sticky right-0 bg-background align-top">
                        توضیحات
                      </TableCell>
                      {products?.map((product) => (
                        <TableCell key={product.id} className="text-center">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 text-justify px-2">
                            {product.description || '-'}
                          </p>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Discount */}
                    {products?.some(p => p.discount_percentage) && (
                      <TableRow className="hover:bg-muted/50">
                        <TableCell className="font-semibold sticky right-0 bg-background">
                          تخفیف
                        </TableCell>
                        {products?.map((product) => (
                          <TableCell key={product.id} className="text-center">
                            {product.discount_percentage ? (
                              <Badge variant="secondary" className="text-base">
                                {product.discount_percentage.toLocaleString('fa-IR')}٪
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}

                    {/* Product Attributes Section Header */}
                    {allAttributeNames.length > 0 && (
                      <TableRow className="bg-[#FCF8F4]">
                        <TableCell 
                          colSpan={products?.length + 1} 
                          className="font-bold text-base text-center py-4"
                        >
                          ویژگی‌های محصول
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Individual Attributes */}
                    {allAttributeNames.map((attributeName, idx) => (
                      <TableRow 
                        key={attributeName} 
                        className={`hover:bg-muted/50 ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                      >
                        <TableCell className="font-semibold sticky right-0 bg-background">
                          {attributeName}
                        </TableCell>
                        {products?.map((product) => {
                          const attribute = product.attributes?.find(
                            (a: any) => a.attribute_name === attributeName
                          );
                          return (
                            <TableCell key={product.id} className="text-center">
                              {attribute && attribute.attribute_values?.length > 0 ? (
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {attribute.attribute_values.map((value: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-sm">
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}

                    {/* Features Section Header */}
                    {allFeatureKeys.length > 0 && (
                      <TableRow className="bg-[#FCF8F4]">
                        <TableCell 
                          colSpan={products?.length + 1} 
                          className="font-bold text-base text-center py-4"
                        >
                          مشخصات فنی
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Individual Features */}
                    {allFeatureKeys.map((featureKey, idx) => (
                      <TableRow 
                        key={featureKey} 
                        className={`hover:bg-muted/50 ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                      >
                        <TableCell className="font-semibold sticky right-0 bg-background">
                          {featureKey}
                        </TableCell>
                        {products?.map((product) => {
                          const feature = product.features?.find(
                            (f: any) => f.feature_key === featureKey
                          );
                          return (
                            <TableCell key={product.id} className="text-center">
                              {feature ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4 text-green-600" />
                                  <span className="font-medium">{feature.feature_value}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}

                    {/* Product Attributes Section Header */}
                    {allAttributeNames.length > 0 && (
                      <TableRow className="bg-[#FCF8F4]">
                        <TableCell 
                          colSpan={products?.length + 1} 
                          className="font-bold text-base text-center py-4"
                        >
                          ویژگی‌های محصول
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Individual Attributes */}
                    {allAttributeNames.map((attributeName, idx) => (
                      <TableRow 
                        key={attributeName} 
                        className={`hover:bg-muted/50 ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                      >
                        <TableCell className="font-semibold sticky right-0 bg-background">
                          {attributeName}
                        </TableCell>
                        {products?.map((product) => {
                          const attribute = product.attributes?.find(
                            (a: any) => a.attribute_name === attributeName
                          );
                          return (
                            <TableCell key={product.id} className="text-center">
                              {attribute && attribute.attribute_values?.length > 0 ? (
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {attribute.attribute_values.map((value: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-sm">
                                      {value}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}

                    {/* Action Buttons */}
                    <TableRow className="bg-[#FCF8F4]">
                      <TableCell className="font-semibold sticky right-0 bg-[#FCF8F4]">
                        عملیات
                      </TableCell>
                      {products?.map((product) => (
                        <TableCell key={product.id} className="text-center p-4">
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              style={{ backgroundColor: '#B3886D' }}
                              className="w-full"
                            >
                              <ShoppingCart className="ml-2 h-4 w-4" />
                              افزودن به سبد خرید
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/product/${product.slug}`)}
                              className="w-full"
                            >
                              <Eye className="ml-2 h-4 w-4" />
                              مشاهده جزئیات
                            </Button>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
