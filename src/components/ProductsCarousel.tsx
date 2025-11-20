import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { toPersianNumber } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export const ProductsCarousel = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  if (isLoading) {
    return (
      <section className="h-[725px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p>در حال بارگذاری محصولات...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="h-[725px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">محصولی برای نمایش وجود ندارد</p>
        </div>
      </section>
    );
  }

  return (
    <section className="h-[725px] bg-background flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">محصولات ما</h2>
          <p className="text-muted-foreground">ما ظروف منحصر به فرد را با عشق و علاقه می‌سازیم</p>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="min-w-[280px] flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <img
                    src={product.images?.[0] || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 p-4">
                  <h3 
                    className="font-semibold text-foreground hover:text-[#B3886D] transition-colors cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="font-bold" style={{ color: '#B3886D' }}>
                    {toPersianNumber(product.price)} تومان
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => handleAddToCart(product)}
                    style={{ backgroundColor: '#B3886D' }}
                  >
                    افزودن به سبد خرید
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
