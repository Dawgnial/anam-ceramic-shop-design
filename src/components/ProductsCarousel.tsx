import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuickViewDialog } from "./QuickViewDialog";
import { toPersianNumber } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";
import { Heart, ShoppingCart, Search, Shuffle } from "lucide-react";

export const ProductsCarousel = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toggleCompare } = useCompare();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Fetch featured products from database
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
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
    toggleCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به مقایسه اضافه شد');
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:min-h-[725px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p className="text-sm md:text-base">در حال بارگذاری محصولات...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:min-h-[725px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm md:text-base">محصولی برای نمایش وجود ندارد</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-[75px] bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-[35px] font-bold text-foreground mb-2 sm:mb-3">محصولات ما</h2>
          <p className="text-muted-foreground text-sm md:text-[15px] font-light">ما ظروف منحصر به فرد را با عشق و علاقه می‌سازیم</p>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="min-w-[200px] sm:min-w-[240px] md:min-w-[270px] flex-shrink-0 group relative"
              >
                {/* Product Image Container */}
                <div className="relative bg-[#F5F4F0] overflow-hidden">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-[220px] sm:h-[260px] md:h-[300px] object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  />
                  
                  {/* Add to Cart Button - Bottom overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#B3886D] text-white text-center py-2.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                       onClick={() => handleAddToCart(product)}>
                    <span className="text-sm font-medium">افزودن به سبد خرید</span>
                  </div>
                  
                  {/* Action Icons - Right side */}
                  <TooltipProvider>
                    <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => handleAddToCompare(product)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-white shadow-md"
                          >
                            <Shuffle className="w-4 h-4 text-[#333]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>مقایسه</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => {
                              setQuickViewProductId(product.id);
                              setQuickViewOpen(true);
                            }}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-white shadow-md"
                          >
                            <Search className="w-4 h-4 text-[#333]" />
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
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-white shadow-md"
                          >
                            <Heart className="w-4 h-4 text-[#333]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>افزودن به علاقه مندی</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>

                {/* Product Info */}
                <div className="pt-4 text-center">
                  <h3 
                    className="font-medium text-foreground hover:text-[#B3886D] transition-colors cursor-pointer text-sm sm:text-base mb-2"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm sm:text-base text-[#333]">
                    {toPersianNumber(product.price)} <span className="text-xs">تومان</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            className="absolute left-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-[#333] hover:text-[#B3886D] transition-colors"
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
          >
            <svg viewBox="0 0 16 16" className="w-6 h-6" fill="currentColor">
              <path d="M5.204 16L3 13.91 9.236 8 3 2.09 5.204 0l7.339 6.955c.61.578.61 1.512 0 2.09L5.204 16z"/>
            </svg>
          </button>
          <button 
            className="absolute right-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-[#333] hover:text-[#B3886D] transition-colors"
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
          >
            <svg viewBox="0 0 16 16" className="w-6 h-6 rotate-180" fill="currentColor">
              <path d="M5.204 16L3 13.91 9.236 8 3 2.09 5.204 0l7.339 6.955c.61.578.61 1.512 0 2.09L5.204 16z"/>
            </svg>
          </button>
        </div>

        <QuickViewDialog
          productId={quickViewProductId}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      </div>
    </section>
  );
};
