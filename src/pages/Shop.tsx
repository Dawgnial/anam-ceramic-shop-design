import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toPersianNumber } from "@/lib/utils";
import { Heart, ShoppingCart, Search, Shuffle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toggleCompare, items: compareItems } = useCompare();
  
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch products from database
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['shop-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch categories from database
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Calculate min and max price from products
  const minPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 10000000;

  // Initialize price range when products load
  useState(() => {
    if (products.length > 0 && priceRange[0] === 0 && priceRange[1] === 10000000) {
      setPriceRange([minPrice, maxPrice]);
    }
  });

  // Calculate color counts from all products
  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(product => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color: string) => {
          counts[color] = (counts[color] || 0) + 1;
        });
      }
    });
    return counts;
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by selected colors
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => 
        p.colors && Array.isArray(p.colors) && 
        p.colors.some((color: string) => selectedColors.includes(color))
      );
    }

    // Sort products
    switch (sortOrder) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name, 'fa'));
        break;
      default:
        // Keep default order (by created_at desc)
        break;
    }

    return filtered;
  }, [products, selectedCategory, priceRange, selectedColors, sortOrder]);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به سبد خرید اضافه شد');
  };

  const handleAddToWishlist = (product: any) => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به علاقه‌مندی‌ها اضافه شد');
  };

  const handleAddToCompare = (product: any) => {
    if (compareItems.length >= 4 && !compareItems.some(item => item.id === product.id)) {
      toast.error('حداکثر ۴ محصول می‌توانید مقایسه کنید');
      return;
    }

    toggleCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    toast.success('محصول به لیست مقایسه اضافه شد');
  };

  // Calculate products for display
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useState(() => {
    setCurrentPage(1);
  });

  if (loadingProducts || loadingCategories) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
            <p>در حال بارگذاری...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-3xl font-bold text-black">فروشگاه</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-6">
          
          {/* Sidebar - 30% */}
          <aside className="w-[30%] space-y-6">
            
            {/* دسته‌بندی‌ها */}
            <div>
              <h3 className="text-lg font-bold mb-4">دسته بندی ها</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-right text-sm py-1 px-2 rounded transition-colors ${
                    selectedCategory === null 
                      ? 'font-bold' 
                      : 'hover:bg-accent'
                  }`}
                  style={selectedCategory === null ? { color: '#B3886D' } : undefined}
                >
                  همه محصولات ({toPersianNumber(products.length)})
                </button>
                {categories.map((category) => {
                  const count = products.filter(p => p.category_id === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`block w-full text-right text-sm py-1 px-2 rounded transition-colors ${
                        selectedCategory === category.id 
                          ? 'font-bold' 
                          : 'hover:bg-accent'
                      }`}
                      style={selectedCategory === category.id ? { color: '#B3886D' } : undefined}
                    >
                      {category.name} ({toPersianNumber(count)})
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* فیلتر بر اساس قیمت */}
            <div>
              <h3 className="text-lg font-bold mb-4">فیلتر بر اساس قیمت</h3>
              <div className="space-y-4">
                <Slider
                  min={minPrice}
                  max={maxPrice}
                  step={10000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>قیمت: {toPersianNumber(priceRange[0])} تومان</span>
                  <span>— {toPersianNumber(priceRange[1])} تومان</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  style={{ backgroundColor: 'transparent' }}
                >
                  صافی
                </Button>
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* فیلتر بر اساس رنگ */}
            <div>
              <h3 className="text-lg font-bold mb-4">فیلتر بر اساس رنگ</h3>
              <div className="space-y-2">
                {Object.entries(colorCounts).map(([color, count]) => (
                  <label key={color} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={selectedColors.includes(color)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColors([...selectedColors, color]);
                        } else {
                          setSelectedColors(selectedColors.filter(c => c !== color));
                        }
                      }}
                    />
                    <span className="text-sm">{color} ({toPersianNumber(count)})</span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Products Area - 70% */}
          <main className="w-[70%]">
            
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              {/* Breadcrumb - سمت چپ */}
              <div className="text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground">خانه</Link>
                <span className="mx-2">/</span>
                <span>فروشگاه</span>
              </div>

              {/* Controls - سمت راست */}
              <div className="flex items-center gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">نمایش:</span>
                  {[9, 24, 36].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setItemsPerPage(num);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 text-sm border rounded ${
                        itemsPerPage === num 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background hover:bg-accent'
                      }`}
                    >
                      {toPersianNumber(num)}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">مرتب سازی پیش فرض</SelectItem>
                    <SelectItem value="price-asc">قیمت: کم به زیاد</SelectItem>
                    <SelectItem value="price-desc">قیمت: زیاد به کم</SelectItem>
                    <SelectItem value="name-asc">نام: الف - ی</SelectItem>
                    <SelectItem value="name-desc">نام: ی - الف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <TooltipProvider>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {displayedProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => navigate(`/product/${product.slug}`)}
                      />
                      
                      {/* Hover Icons - عمودی */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* افزودن به سبد خرید */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}
                            >
                              <ShoppingCart className="w-5 h-5 text-white" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>افزودن به سبد خرید</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* نمایش سریع */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => navigate(`/product/${product.slug}`)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}
                            >
                              <Search className="w-5 h-5 text-white" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>نمایش سریع</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* افزودن به مقایسه */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => handleAddToCompare(product)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}
                            >
                              <Shuffle className="w-5 h-5 text-white" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>افزودن به مقایسه</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* افزودن به علاقه‌مندی */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => handleAddToWishlist(product)}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}
                            >
                              <Heart className="w-5 h-5 text-white" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>افزودن به علاقه مندی</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div 
                      className="p-4 text-center cursor-pointer"
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      <h3 className="font-semibold text-foreground mb-2 hover:text-[#B3886D] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold" style={{ color: '#B3886D' }}>
                        {toPersianNumber(product.price)} تومان
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {toPersianNumber(page)}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

          </main>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Shop;
