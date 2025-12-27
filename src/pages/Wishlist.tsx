import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Trash2, ChevronLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatPrice, toPersianNumber } from "@/lib/utils";

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    toast.success('محصول به سبد خرید اضافه شد');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center px-4" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">لیست علاقه‌مندی‌ها</h1>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('/')} className="hover:text-foreground">
            خانه
          </button>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-foreground font-medium">لیست علاقه‌مندی‌ها</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center justify-center space-y-6">
                <Heart className="w-24 h-24 text-muted-foreground" />
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">لیست علاقه‌مندی‌های شما خالی است</h2>
                  <p className="text-muted-foreground">
                    محصولات جالب بسیاری را در صفحه فروشگاه پیدا خواهید کرد
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {toPersianNumber(items.length)} محصول در لیست علاقه‌مندی‌ها
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="aspect-square relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        removeFromWishlist(item.id);
                        toast.success('محصول از لیست علاقه‌مندی‌ها حذف شد');
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold" style={{ color: '#B3886D' }}>
                        {formatPrice(item.price)} تومان
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                      style={{ backgroundColor: '#B3886D' }}
                    >
                      <ShoppingCart className="ml-2 w-4 h-4" />
                      افزودن به سبد خرید
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
