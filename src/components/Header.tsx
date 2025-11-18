import { Search, Menu, Scale, Heart, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

export const Header = () => {
  const [cartTotal, setCartTotal] = useState(0);

  return (
    <header className="w-full border-b">
      {/* Top Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Login/Register - Left */}
          <div className="flex-shrink-0">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              ورود / ثبت نام
            </Button>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Input
                type="text"
                placeholder="جستجوی محصولات"
                className="w-full pr-4 pl-12 h-11 bg-background border-border"
              />
              <Button
                size="icon"
                className="absolute left-0 top-0 h-11 w-11 bg-search-icon hover:bg-search-icon/90 text-white rounded-l-md rounded-r-none"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Logo - Right */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">آنام</h1>
          </div>
        </div>
      </div>

      {/* Bottom Header */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Cart Icons - Left */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium">{cartTotal} تومان</span>
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Scale className="h-5 w-5" />
              </Button>
            </div>

            {/* Main Navigation - Center */}
            <nav className="flex items-center gap-6">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                ارتباط با ما
              </Button>
              <Button variant="ghost" className="text-foreground hover:text-primary">
                بلاگ
              </Button>
              <Button variant="ghost" className="text-foreground hover:text-primary">
                فروشگاه
              </Button>
              <Button variant="ghost" className="text-foreground hover:text-primary">
                درباره ما
              </Button>
              <Button variant="ghost" className="text-foreground hover:text-primary">
                صفحه نخست 🔔
              </Button>
            </nav>

            {/* Mega Menu - Right */}
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Menu className="h-5 w-5" />
                دسته بندی محصولات
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
