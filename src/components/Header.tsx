import { Search, Menu, Heart, ChevronDown, User, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { toPersianNumber } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useCompare } from "@/contexts/CompareContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { CartDrawer } from "./CartDrawer";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import compareIcon from "@/assets/compare.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";


export const Header = () => {
  const { getTotalPrice, items: cartItems } = useCart();
  const { items: compareItems } = useCompare();
  const { items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch categories from database
  const { data: categories } = useQuery({
    queryKey: ['header-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch products for search
  const { data: products } = useQuery({
    queryKey: ['header-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, slug, images')
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

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
    if (query.trim() && products) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "صفحه نخست" },
    { path: "/about", label: "درباره ما" },
    { path: "/shop", label: "فروشگاه" },
    { path: "/blog", label: "بلاگ" },
    { path: "/contact", label: "ارتباط با ما" },
  ];

  return (
    <header className={cn(
      "w-full border-b sticky top-0 bg-background z-50 transition-all duration-300",
      isScrolled && "py-0"
    )}>
      {/* Top Header */}
      <div className={cn(
        "transition-all duration-300",
        isScrolled ? "h-[50px] md:h-[60px]" : "h-[60px] md:h-[90px]"
      )}>
        <div className="container mx-auto px-3 md:px-4 h-full flex items-center">
          <div className="flex items-center justify-between gap-2 md:gap-4 w-full">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex items-center justify-between">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                      <img src={logo} alt="آنام" className="h-10 w-auto" />
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  
                  <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                      {navLinks.map((link) => (
                        <li key={link.path}>
                          <Link 
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "block py-3 px-4 rounded-lg transition-colors",
                              isActivePage(link.path) 
                                ? "bg-primary/10 text-primary" 
                                : "hover:bg-muted"
                            )}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Categories in mobile menu */}
                    {categories && categories.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-bold mb-2 px-4">دسته بندی‌ها</p>
                        <ul className="space-y-1">
                          {categories.map((category) => (
                            <li key={category.id}>
                              <Link
                                to={`/shop?category=${category.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 px-4 text-sm hover:bg-muted rounded-lg transition-colors"
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </nav>
                  
                  <div className="p-4 border-t">
                    {user ? (
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full gap-2">
                          <User className="h-4 w-4" />
                          پروفایل
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">ورود / ثبت نام</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo - Right */}
            <Link to="/" className="flex-shrink-0 group">
              <img src={logo} alt="آنام" className="h-10 md:h-16 w-auto transition-opacity hover:opacity-90" />
            </Link>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-3xl relative" ref={searchRef}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="جستجو..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pr-3 md:pr-4 pl-10 md:pl-12 h-9 md:h-11 bg-background border-border rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base"
                />
                <Button
                  size="icon"
                  className="absolute left-0 top-0 h-9 md:h-11 w-9 md:w-11 bg-search-icon hover:bg-search-icon/90 text-white rounded-l-sm rounded-r-none"
                >
                  <Search className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-right"
                    >
                      <img 
                        src={product.images?.[0] || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-10 h-10 md:w-12 md:h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm md:text-base">{product.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {toPersianNumber(product.price)} تومان
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile/Login - Left (hidden on mobile) */}
            <div className="flex-shrink-0 hidden lg:block">
              {user ? (
                <Link to="/profile">
                  <Button variant="ghost" className="gap-2 text-foreground hover:bg-transparent hover:opacity-80 transition-opacity">
                    <User className="h-4 w-4" />
                    پروفایل
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" className="text-foreground hover:bg-transparent hover:opacity-80 transition-opacity">
                    ورود / ثبت نام
                  </Button>
                </Link>
              )}
            </div>

            {/* Cart Icons - Always visible on mobile */}
            <div className="flex items-center gap-1 md:gap-2 lg:hidden">
              <Link to="/compare" className="relative">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent hover:opacity-80 transition-opacity">
                  <img src={compareIcon} alt="مقایسه" className="h-5 w-5" />
                  {compareItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {toPersianNumber(compareItems.length)}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent hover:opacity-80 transition-opacity">
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {toPersianNumber(wishlistItems.length)}
                    </span>
                  )}
                </Button>
              </Link>
              
              <div className="relative">
                <CartDrawer />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    {toPersianNumber(cartItems.length)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Header - Hidden on mobile */}
      <div 
        className={cn(
          "border-t transition-all duration-300 hidden lg:block",
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
              <Button variant="ghost" className="gap-2 h-9 text-sm hover:bg-transparent hover:opacity-80 transition-opacity">
                دسته بندی محصولات
                <ChevronDown className="h-4 w-4" />
              </Button>

              {/* Categories Dropdown */}
              {showCategories && categories && categories.length > 0 && (
                <div className="absolute top-full right-0 bg-background border border-border rounded-md shadow-lg min-w-[200px] z-50">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/shop?category=${category.slug}`}
                      className="block px-4 py-2 hover:bg-muted transition-colors"
                      onClick={() => setShowCategories(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Main Navigation - Center */}
            <nav className="flex items-center gap-3">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "text-sm h-9 px-3 transition-all hover:bg-transparent",
                      isActivePage(link.path) ? "text-[#B3886D]" : "text-foreground hover:text-[#B3886D]"
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Cart Icons - Left */}
            <div className="flex items-center gap-3">
              <Link to="/compare" className="relative">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent hover:opacity-80 transition-opacity">
                  <img src={compareIcon} alt="مقایسه" className="h-6 w-6" />
                  {compareItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {toPersianNumber(compareItems.length)}
                    </span>
                  )}
                </Button>
              </Link>
              
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent hover:opacity-80 transition-opacity">
                  <Heart className="h-6 w-6" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {toPersianNumber(wishlistItems.length)}
                    </span>
                  )}
                </Button>
              </Link>
              
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{toPersianNumber(getTotalPrice())} تومان</span>
                <div className="relative">
                  <CartDrawer />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {toPersianNumber(cartItems.length)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};