import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, ArrowLeftRight, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";

interface RelatedProductsProps {
  categoryId: string | null;
  currentProductId: string;
}

export function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toggleCompare, items: compareItems } = useCompare();

  const { data: products = [] } = useQuery({
    queryKey: ['related-products', categoryId, currentProductId],
    queryFn: async () => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });

  if (!products.length) {
    return null;
  }

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به سبد خرید اضافه شد');
  };

  const handleAddToWishlist = (product: any) => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به علاقه‌مندی‌ها اضافه شد');
  };

  const handleAddToCompare = (product: any) => {
    if (compareItems.length >= 4 && !compareItems.some(item => item.id === product.id)) {
      toast.error('حداکثر ۴ محصول می‌توانید مقایسه کنید');
      return;
    }

    toggleCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به لیست مقایسه اضافه شد');
  };

  return (
    <div className="mt-16 border-t pt-12">
      <h3 className="text-2xl font-bold mb-8">محصولات مرتبط</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.images?.[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Hover Icons */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#B3886D] hover:text-white transition-colors shadow-md"
                  title="افزودن به سبد خرید"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#B3886D] hover:text-white transition-colors shadow-md"
                  title="نمایش سریع"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleAddToCompare(product)}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#B3886D] hover:text-white transition-colors shadow-md"
                  title="افزودن به مقایسه"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleAddToWishlist(product)}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#B3886D] hover:text-white transition-colors shadow-md"
                  title="افزودن به علاقه‌مندی"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
              <h4 
                className="font-semibold text-sm hover:text-[#B3886D] cursor-pointer transition-colors line-clamp-2"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                {product.name}
              </h4>
              
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color: '#B3886D' }}>
                  {product.price.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
