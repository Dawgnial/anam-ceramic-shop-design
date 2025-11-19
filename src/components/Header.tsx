import { Search, Menu, Scale, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link } from "react-router-dom";
import { toPersianNumber } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "./CartDrawer";

export const Header = () => {
  const { getTotalPrice } = useCart();

  return (
    <header className="w-full border-b sticky top-0 bg-background z-50">
      {/* Top Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Right */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">آنام</h1>
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

          {/* Login/Register - Left */}
          <div className="flex-shrink-0">
            <Link to="/auth">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                ورود / ثبت نام
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Header */}
      <div className="border-t" style={{ backgroundColor: '#F9F9F9' }}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Mega Menu - Right */}
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2 h-9 text-sm">
                <Menu className="h-4 w-4" />
                دسته بندی محصولات
              </Button>
            </div>

            {/* Main Navigation - Center */}
            <nav className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" className="text-sm h-9 px-3 hover:text-primary" style={{ color: '#BC977F' }}>
                  صفحه نخست
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" className="text-sm h-9 px-3 text-foreground hover:text-primary">
                  درباره ما
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="ghost" className="text-sm h-9 px-3 text-foreground hover:text-primary">
                  فروشگاه
                </Button>
              </Link>
              <Link to="/blog">
                <Button variant="ghost" className="text-sm h-9 px-3 text-foreground hover:text-primary">
                  بلاگ
                </Button>
              </Link>
              <Button variant="ghost" className="text-sm h-9 px-3 text-foreground hover:text-primary">
                ارتباط با ما
              </Button>
            </nav>

            {/* Cart Icons - Left */}
            <div className="flex items-center gap-3">
              <Link to="/compare">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Scale className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>
              <CartDrawer />
              <span className="text-sm font-medium">{toPersianNumber(getTotalPrice())} تومان</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
