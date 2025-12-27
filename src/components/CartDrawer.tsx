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

export const CartDrawer = () => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent hover:text-[#B3886D] transition-colors">
          <ShoppingCart className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>سبد خرید</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <ShoppingCart className="w-16 h-16 text-muted-foreground" />
            <p className="text-muted-foreground">سبد خرید شما خالی است.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 border-b pb-3">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {toPersianNumber(item.quantity)} × {formatPrice(item.price)} تومان
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>مجموع:</span>
                <span>{formatPrice(getTotalPrice())} تومان</span>
              </div>
              <Button 
                className="w-full text-white"
                style={{ backgroundColor: '#B3886D' }}
                onClick={() => navigate('/cart')}
              >
                مشاهده سبد خرید
              </Button>
              <Button 
                className="w-full"
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
