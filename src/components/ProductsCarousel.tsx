import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuickViewDialog } from "./QuickViewDialog";
import { LazyImage } from "./ui/lazy-image";
import { ProductGridSkeleton } from "./ui/product-card-skeleton";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";
import { Heart, ShoppingCart, Search, Shuffle } from "lucide-react";
export const ProductsCarousel = () => {
  const navigate = useNavigate();
  const {
    addToCart
  } = useCart();
  const {
    toggleWishlist
  } = useWishlist();
  const {
    toggleCompare
  } = useCompare();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Fetch featured products from database
  const {
    data: products = [],
    isLoading
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('products').select('*').eq('is_featured', true).order('created_at', {
        ascending: false
      }).limit(4);
      if (error) throw error;
      return data;
    }
  });
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg'
    });
    toast.success('محصول به سبد خرید اضافه شد');
  };
  const handleAddToWishlist = (product: any) => {
    const added = toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg'
    });
    if (added) {
      toast.success('محصول به علاقه‌مندی‌ها اضافه شد');
    } else {
      toast.info('محصول از علاقه‌مندی‌ها حذف شد');
    }
  };
  const handleAddToCompare = (product: any) => {
    const added = toggleCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg'
    });
    if (added) {
      toast.success('محصول به مقایسه اضافه شد');
    } else {
      toast.info('محصول از مقایسه حذف شد');
    }
  };
  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:h-[725px] bg-background flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-2">محصولات ما</h2>
            <p className="text-muted-foreground text-sm md:text-base">ما ظروف منحصر به فرد را با عشق و علاقه می‌سازیم</p>
          </div>
          <ProductGridSkeleton count={4} />
        </div>
      </section>
    );
  }
  if (products.length === 0) {
    return <section className="py-8 sm:py-12 md:py-16 lg:h-[725px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm md:text-base">محصولی برای نمایش وجود ندارد</p>
        </div>
      </section>;
  }
  return <section className="py-8 sm:py-12 md:py-16 lg:h-[725px] bg-background flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-2">محصولات ما</h2>
          <p className="text-muted-foreground text-sm md:text-base">ما ظروف منحصر به فرد را با عشق و علاقه می‌سازیم</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 4).map(product => (
              <div key={product.id} className="group border border-border/60 hover:border-primary/50 transition-colors duration-300 bg-card">
                {/* Card Image Container */}
                <div className="relative overflow-hidden bg-muted/30">
                  <LazyImage 
                    src={product.images?.[0] || '/placeholder.svg'} 
                    alt={product.name} 
                    className="h-48 sm:h-56 md:h-64 lg:h-80 cursor-pointer transition-transform duration-300 group-hover:scale-105" 
                    onClick={() => navigate(`/product/${product.slug}`)} 
                  />
                  
                  {/* Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Action Icons - Left Side */}
                  <TooltipProvider>
                    <div className="absolute right-3 sm:right-4 top-4 flex flex-col gap-2 sm:gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => handleAddToCompare(product)} 
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-none flex items-center justify-center transition-colors shadow-sm"
                          >
                            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>افزودن به مقایسه</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => {
                              setQuickViewProductId(product.id);
                              setQuickViewOpen(true);
                            }} 
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-none flex items-center justify-center transition-colors shadow-sm"
                          >
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>نمایش سریع</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => handleAddToWishlist(product)} 
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-none flex items-center justify-center transition-colors shadow-sm"
                          >
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>افزودن به علاقه مندی</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

                  {/* Add to Cart Button - Bottom Center */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-foreground px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 whitespace-nowrap border border-border/50"
                  >
                    افزودن به سبد خرید
                  </button>
                </div>

                {/* Product Info - Below Image */}
                <div className="text-center pt-4 pb-2">
                  <h3 
                    className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-sm sm:text-base mb-1"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="font-bold text-sm sm:text-base text-primary">
                    {formatPrice(product.price)} تومان
                  </p>
                </div>
              </div>
            ))}
        </div>

        <QuickViewDialog productId={quickViewProductId} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
      </div>
    </section>;
};