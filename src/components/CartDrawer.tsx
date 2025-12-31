import { ShoppingCart, X } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CartDrawerProps {
  showPrice?: boolean;
}

export const CartDrawer = ({ showPrice = false }: CartDrawerProps) => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 hover:text-[#B3886D] transition-colors">
          <div className="relative">
            <div className="h-10 w-10 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
            </div>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {toPersianNumber(totalItems)}
              </span>
            )}
          </div>
          {showPrice && (
            <span className="text-sm font-medium">{formatPrice(getTotalPrice())} تومان</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] xs:w-[300px] sm:w-[400px] flex flex-col h-full p-0">
        <SheetHeader className="p-4 sm:p-6 pb-0">
          <SheetTitle className="text-base sm:text-lg">سبد خرید</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-4">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
            <p className="text-sm sm:text-base text-muted-foreground">سبد خرید شما خالی است.</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 p-4 sm:p-6 pt-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 sm:gap-3 border-b pb-2 sm:pb-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs sm:text-sm truncate">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {toPersianNumber(item.quantity)} × {formatPrice(item.price)} تومان
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex-shrink-0 border-t p-4 sm:p-6 space-y-3 bg-background">
              <div className="flex justify-between text-sm sm:text-lg font-bold">
                <span>مجموع:</span>
                <span>{formatPrice(getTotalPrice())} تومان</span>
              </div>
              <Button 
                className="w-full text-white text-sm sm:text-base h-10"
                style={{ backgroundColor: '#B3886D' }}
                onClick={() => navigate('/cart')}
              >
                مشاهده سبد خرید
              </Button>
              <Button 
                className="w-full text-sm sm:text-base h-10"
                variant="outline"
                style={{ backgroundColor: '#B3886D', color: 'white' }}
                onClick={() => navigate('/checkout')}
              >
                تسویه حساب
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
