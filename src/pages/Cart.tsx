import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Breadcrumb Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <div className="flex items-center gap-3 text-2xl">
          <span className="font-bold text-black">سبد خرید</span>
          <span className="text-gray-400">←</span>
          <span className="text-gray-400">تسویه حساب</span>
          <span className="text-gray-400">←</span>
          <span className="text-gray-400">تکمیل سفارش</span>
        </div>
      </div>

      {/* Cart Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-6">سبد خرید شما خالی است</p>
            <Button 
              onClick={() => navigate('/shop')}
              className="text-white"
              style={{ backgroundColor: '#B3886D' }}
            >
              بازگشت به فروشگاه
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border rounded-lg p-4 bg-background">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">{formatPrice(item.price)} تومان</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{toPersianNumber(item.quantity)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-6 bg-background sticky top-4">
                <h2 className="text-2xl font-bold mb-6">خلاصه سفارش</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>جمع کل:</span>
                    <span className="font-bold">{formatPrice(getTotalPrice())} تومان</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/checkout')}
                  className="w-full text-white"
                  style={{ backgroundColor: '#B3886D' }}
                >
                  ادامه به تسویه حساب
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
