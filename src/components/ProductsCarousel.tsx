import { useRef } from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

const products = [
  { id: 1, name: "کاسه سرامیکی", price: "250,000", image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=300&fit=crop" },
  { id: 2, name: "بشقاب دستساز", price: "180,000", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=300&fit=crop" },
  { id: 3, name: "ماگ سفالی", price: "120,000", image: "https://images.unsplash.com/photo-1610650876093-a9ec4e8f264b?w=300&h=300&fit=crop" },
  { id: 4, name: "سرویس چای خوری", price: "450,000", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=300&fit=crop" },
  { id: 5, name: "کاسه نقاشی شده", price: "280,000", image: "https://images.unsplash.com/photo-1493707553966-283afb8c7aee?w=300&h=300&fit=crop" },
  { id: 6, name: "بشقاب تزئینی", price: "350,000", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop" },
  { id: 7, name: "گلدان سرامیکی", price: "200,000", image: "https://images.unsplash.com/photo-1516886635086-2b3c423c0947?w=300&h=300&fit=crop" },
  { id: 8, name: "سرویس قهوه خوری", price: "520,000", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&h=300&fit=crop" },
];

export const ProductsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "right" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">محصولات ما</h2>
          <p className="text-muted-foreground">ما ظروف منحصر به فرد را با عشق و علاقه می‌سازیم</p>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <Card key={product.id} className="min-w-[280px] flex-shrink-0">
                <CardContent className="p-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 p-4">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <p className="text-primary font-bold">{product.price} تومان</p>
                  <Button className="w-full">افزودن به سبد خرید</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
