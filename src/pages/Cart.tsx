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
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center px-4" style={{ backgroundColor: '#DDDDDD' }}>
        <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg md:text-2xl flex-wrap justify-center">
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
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border rounded-lg p-3 sm:p-4 bg-background">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img src={item.image} alt={item.name} className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded flex-shrink-0" />
                    <div className="flex-1 sm:flex-none min-w-0">
                      <h3 className="font-semibold text-sm sm:text-lg truncate">{item.name}</h3>
                      <p className="text-muted-foreground text-sm">{formatPrice(item.price)} تومان</p>
                    </div>
                    {/* Mobile remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:hidden h-8 w-8"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-10 sm:w-12 text-center font-medium">{toPersianNumber(item.quantity)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 sm:h-8 sm:w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <span className="font-semibold text-sm sm:hidden" style={{ color: '#B3886D' }}>
                      {formatPrice(item.price * item.quantity)} تومان
                    </span>
                  </div>
                  {/* Desktop remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex"
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
