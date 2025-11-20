import { Search, Menu, Heart, ChevronDown, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useLocation } from "react-router-dom";
import { toPersianNumber } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { CartDrawer } from "./CartDrawer";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import compareIcon from "@/assets/compare.png";

// Sample products for search - این باید از دیتابیس بیاید
const products = [
  { id: 1, name: "کاسه سرامیکی", price: 250000, image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=100&h=100&fit=crop" },
  { id: 2, name: "بشقاب دستساز", price: 180000, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&h=100&fit=crop" },
  { id: 3, name: "ماگ سفالی", price: 120000, image: "https://images.unsplash.com/photo-1610650876093-a9ec4e8f264b?w=100&h=100&fit=crop" },
  { id: 4, name: "سرویس چای خوری", price: 450000, image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=100&h=100&fit=crop" },
  { id: 5, name: "کاسه نقاشی شده", price: 280000, image: "https://images.unsplash.com/photo-1493707553966-283afb8c7aee?w=100&h=100&fit=crop" },
  { id: 6, name: "بشقاب تزئینی", price: 350000, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop" },
  { id: 7, name: "گلدان سرامیکی", price: 200000, image: "https://images.unsplash.com/photo-1516886635086-2b3c423c0947?w=100&h=100&fit=crop" },
  { id: 8, name: "سرویس قهوه خوری", price: 520000, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100&h=100&fit=crop" },
];

export const Header = () => {
  const { getTotalPrice, items: cartItems } = useCart();
  const { items: compareItems } = useCompare();
  const { items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = products.filter(p => 
        p.name.includes(query)
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={cn(
      "w-full border-b sticky top-0 bg-background z-50 transition-all duration-300",
      isScrolled && "py-0"
    )}>
      {/* Top Header */}
      <div className={cn(
        "transition-all duration-300",
        isScrolled ? "h-[60px]" : "h-[90px]"
      )}>
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="flex items-center justify-between gap-4 w-full">
            {/* Logo - Right */}
            <Link to="/" className="flex-shrink-0 group">
              <h1 className="text-2xl font-bold text-primary transition-opacity hover:opacity-70">
                ظروف سرامیکی آنام
              </h1>
            </Link>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-3xl relative" ref={searchRef}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="جستجوی محصولات"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pr-4 pl-12 h-11 bg-background border-border rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  size="icon"
                  className="absolute left-0 top-0 h-11 w-11 bg-search-icon hover:bg-search-icon/90 text-white rounded-l-sm rounded-r-none"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/shop?product=${product.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                      onClick={() => {
                        setShowResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {toPersianNumber(product.price)} تومان
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile/Login - Left */}
            <div className="flex-shrink-0">
              {user ? (
                <Link to="/profile">
                  <Button variant="ghost" className="gap-2 text-foreground hover:bg-transparent hover:opacity-70 transition-opacity">
                    <User className="h-4 w-4" />
                    پروفایل
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" className="text-foreground hover:bg-transparent hover:opacity-70 transition-opacity">
                    ورود / ثبت نام
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Header */}
      <div 
        className={cn(
          "border-t transition-all duration-300",
          isScrolled ? "h-[52px]" : "h-[40px]"
        )} 
        style={{ backgroundColor: '#F9F9F9' }}
      >
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="flex items-center justify-between w-full">
            {/* Mega Menu - Right */}
            <div 
              className="relative flex items-center gap-2"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <Button variant="ghost" className="gap-2 h-9 text-sm hover:bg-transparent hover:opacity-70 transition-opacity">
                دسته بندی محصولات
                <ChevronDown className="h-4 w-4" />
              </Button>

              {/* Categories Dropdown */}
              {showCategories && (
                <div className="absolute top-full right-0 mt-2 bg-background border border-border rounded-md shadow-lg min-w-[200px] z-50">
                  <Link to="/shop?category=ceramic" className="block px-4 py-2 hover:bg-muted transition-colors">
                    ظروف سرامیکی
                  </Link>
                  <Link to="/shop?category=pottery" className="block px-4 py-2 hover:bg-muted transition-colors">
                    ظروف سفالی
                  </Link>
                  <Link to="/shop?category=decorative" className="block px-4 py-2 hover:bg-muted transition-colors">
                    ظروف تزئینی
                  </Link>
                  <Link to="/shop?category=tableware" className="block px-4 py-2 hover:bg-muted transition-colors">
                    سرویس غذاخوری
                  </Link>
                </div>
              )}
            </div>

            {/* Main Navigation - Center */}
            <nav className="flex items-center gap-3">
              <Link to="/">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm h-9 px-3 transition-all hover:bg-transparent",
                    isActivePage("/") ? "text-[#B3886D]" : "text-foreground hover:text-[#B3886D]"
                  )}
                >
                  صفحه نخست
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm h-9 px-3 transition-all hover:bg-transparent",
                    isActivePage("/about") ? "text-[#B3886D]" : "text-foreground hover:text-[#B3886D]"
                  )}
                >
                  درباره ما
                </Button>
              </Link>
              <Link to="/shop">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm h-9 px-3 transition-all hover:bg-transparent",
                    isActivePage("/shop") ? "text-[#B3886D]" : "text-foreground hover:text-[#B3886D]"
                  )}
                >
                  فروشگاه
                </Button>
              </Link>
              <Link to="/blog">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-sm h-9 px-3 transition-all hover:bg-transparent",
                    isActivePage("/blog") ? "text-[#B3886D]" : "text-foreground hover:text-[#B3886D]"
                  )}
                >
                  بلاگ
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="text-sm h-9 px-3 text-foreground hover:text-[#B3886D] transition-all hover:bg-transparent"
              >
                ارتباط با ما
              </Button>
            </nav>

            {/* Cart Icons - Left */}
            <div className="flex items-center gap-4">
              <Link to="/compare" className="relative">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent hover:opacity-70 transition-opacity">
                  <img src={compareIcon} alt="مقایسه" className="h-6 w-6" />
                  {compareItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {toPersianNumber(compareItems.length)}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent hover:opacity-70 transition-opacity">
                  <Heart className="h-6 w-6" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {toPersianNumber(wishlistItems.length)}
                    </span>
                  )}
                </Button>
              </Link>
              
              <div className="relative">
                <CartDrawer />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {toPersianNumber(cartItems.length)}
                  </span>
                )}
              </div>
              
              <span className="text-sm font-medium">{toPersianNumber(getTotalPrice())} تومان</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
