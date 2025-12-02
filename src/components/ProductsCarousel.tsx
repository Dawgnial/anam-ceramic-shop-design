import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
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
      <section className="py-8 sm:py-12 md:py-16 lg:h-[725px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p className="text-sm md:text-base">در حال بارگذاری محصولات...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:h-[725px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm md:text-base">محصولی برای نمایش وجود ندارد</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14 md:py-20 lg:min-h-[725px] bg-background flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-14">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3">محصولات ما</h2>
          <p className="text-muted-foreground text-sm md:text-base">ما ظروف منحصر به فرد را با عشق و علاقه می‌سازیم</p>
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
              <Card 
                key={product.id} 
                className="min-w-[180px] sm:min-w-[220px] md:min-w-[260px] lg:min-w-[280px] flex-shrink-0 group relative border-none shadow-sm hover:shadow-lg transition-shadow rounded-sm overflow-hidden"
              >
                <CardContent className="p-0 relative">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-44 sm:h-52 md:h-60 lg:h-64 object-cover cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  />
                  
                  {/* Hover Icons */}
                  <TooltipProvider>
                    <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-[#B3886D]"
                          >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>افزودن به سبد خرید</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => {
                              setQuickViewProductId(product.id);
                              setQuickViewOpen(true);
                            }}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-[#B3886D]"
                          >
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>نمایش سریع</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => handleAddToCompare(product)}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-[#B3886D]"
                          >
                            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>افزودن به مقایسه</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            onClick={() => handleAddToWishlist(product)}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-[#B3886D]"
                          >
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>افزودن به علاقه مندی</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </CardContent>
                <CardFooter className="flex flex-col items-center gap-2 p-4 sm:p-5 bg-white">
                  <h3 
                    className="font-semibold text-foreground hover:text-[#B3886D] transition-colors cursor-pointer text-sm sm:text-base text-center"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="font-bold text-sm sm:text-base text-[#B3886D]">
                    {toPersianNumber(product.price)} تومان
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
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