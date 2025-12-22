import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { Heart, Shuffle, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QuickViewDialogProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickViewDialog = ({ productId, open, onOpenChange }: QuickViewDialogProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toggleCompare } = useCompare();
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['quick-view-product', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId && open,
  });

  // Fetch product attributes
  const { data: attributes = [] } = useQuery({
    queryKey: ['quick-view-attributes', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_attributes')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return data;
    },
    enabled: !!productId && open,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به سبد خرید اضافه شد');
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    
    const added = toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    if (added) {
      toast.success('محصول به علاقه‌مندی‌ها اضافه شد');
    } else {
      toast.info('محصول از علاقه‌مندی‌ها حذف شد');
    }
  };

  const handleAddToCompare = () => {
    if (!product) return;
    
    const added = toggleCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    if (added) {
      toast.success('محصول به مقایسه اضافه شد');
    } else {
      toast.info('محصول از مقایسه حذف شد');
    }
  };

  if (!product && !isLoading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#B3886D' }}></div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Images Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={product.images?.[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-[#B3886D]' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-3 sm:space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold">{product.name}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#B3886D' }}>
                  {formatPrice(product.price)} تومان
                </p>
                {product.discount_percentage && (
                  <Badge variant="destructive">
                    {toPersianNumber(product.discount_percentage)}% تخفیف
                  </Badge>
                )}
              </div>

              {product.stock !== undefined && (
                <div>
                  {product.stock > 0 ? (
                    <Badge variant="outline" className="bg-green-50">
                      موجود ({toPersianNumber(product.stock)} عدد)
                    </Badge>
                  ) : (
                    <Badge variant="destructive">ناموجود</Badge>
                  )}
                </div>
              )}

              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">توضیحات:</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Attributes */}
              {attributes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">ویژگی‌ها:</h3>
                  {attributes.map((attr) => (
                    <div key={attr.id} className="space-y-2">
                      <p className="text-sm font-medium">{attr.attribute_name}:</p>
                      <div className="flex flex-wrap gap-2">
                        {attr.attribute_values.map((value: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || product.stock === 0}
                  className="w-full text-white"
                  style={{ backgroundColor: '#B3886D' }}
                  size="lg"
                >
                  <ShoppingCart className="ml-2 h-5 w-5" />
                  افزودن به سبد خرید
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddToWishlist}
                    variant="outline"
                    size="lg"
                  >
                    <Heart className="ml-2 h-5 w-5" />
                    علاقه‌مندی
                  </Button>
                  
                  <Button
                    onClick={handleAddToCompare}
                    variant="outline"
                    size="lg"
                  >
                    <Shuffle className="ml-2 h-5 w-5" />
                    مقایسه
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/product/${product.slug}`);
                  }}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  مشاهده جزئیات کامل
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
