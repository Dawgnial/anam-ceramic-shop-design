import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";

export function RelatedProductsInCart() {
  const { items, addToCart } = useCart();
  const navigate = useNavigate();

  // Get category IDs from cart items
  const { data: relatedProducts = [], isLoading } = useQuery({
    queryKey: ['related-cart-products', items.map(i => i.id)],
    queryFn: async () => {
      if (items.length === 0) return [];

      // Get product IDs in cart
      const cartProductIds = items.map(i => i.id);

      // Get categories of cart products
      const { data: cartCategories } = await supabase
        .from('product_categories')
        .select('category_id')
        .in('product_id', cartProductIds);

      if (!cartCategories || cartCategories.length === 0) return [];

      const categoryIds = [...new Set(cartCategories.map(c => c.category_id))];

      // Get products from same categories, excluding cart items
      const { data: productCategories } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', categoryIds)
        .not('product_id', 'in', `(${cartProductIds.join(',')})`);

      if (!productCategories || productCategories.length === 0) return [];

      const relatedProductIds = [...new Set(productCategories.map(p => p.product_id))];

      // Get product details
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price, images, slug, stock, in_stock, weight_with_packaging, preparation_days')
        .in('id', relatedProductIds)
        .eq('in_stock', true)
        .limit(4);

      return products || [];
    },
    enabled: items.length > 0,
  });

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
      weight_with_packaging: product.weight_with_packaging || 0,
      preparation_days: product.preparation_days || 1,
    });
    toast.success('محصول به سبد خرید اضافه شد');
  };

  if (items.length === 0 || isLoading || relatedProducts.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5 text-[#B3886D]" />
          این محصولات را هم ببینید
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map((product: any) => (
            <div
              key={product.id}
              className="group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="aspect-square overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                <img
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3 space-y-2">
                <h4
                  className="text-sm font-medium line-clamp-1 cursor-pointer hover:text-[#B3886D]"
                  onClick={() => navigate(`/product/${product.slug}`)}
                >
                  {product.name}
                </h4>
                <p className="text-sm font-bold" style={{ color: '#B3886D' }}>
                  {formatPrice(product.price)} تومان
                </p>
                <Button
                  size="sm"
                  className="w-full text-xs"
                  style={{ backgroundColor: '#B3886D' }}
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="w-3 h-3 ml-1" />
                  افزودن
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}