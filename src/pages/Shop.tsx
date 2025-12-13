import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { QuickViewDialog } from "@/components/QuickViewDialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { Heart, ShoppingCart, Search, Shuffle, Filter } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";
import StructuredData from "@/components/seo/StructuredData";

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toggleCompare, items: compareItems } = useCompare();
  
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Fetch products from database
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['shop-products'],
    queryFn: async () => {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch product categories
      const { data: productCategoriesData, error: pcError } = await supabase
        .from('product_categories')
        .select('product_id, category_id');

      if (pcError) throw pcError;

      // Map categories to products
      const productsWithCategories = productsData.map(product => ({
        ...product,
        category_ids: productCategoriesData
          ?.filter((pc: any) => pc.product_id === product.id)
          .map((pc: any) => pc.category_id) || []
      }));

      return productsWithCategories;
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

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_ids && p.category_ids.includes(selectedCategory));
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

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
  }, [products, selectedCategory, priceRange, sortOrder]);

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
    const added = toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    if (added) {
      toast.success('محصول به علاقه‌مندی‌ها اضافه شد');
    } else {
      toast.info('محصول از علاقه‌مندی‌ها حذف شد');
    }
  };

  const handleAddToCompare = (product: any) => {
    if (compareItems.length >= 4 && !compareItems.some(item => item.id === product.id)) {
      toast.error('حداکثر ۴ محصول می‌توانید مقایسه کنید');
      return;
    }

    const added = toggleCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg',
    });
    if (added) {
      toast.success('محصول به لیست مقایسه اضافه شد');
    } else {
      toast.info('محصول از لیست مقایسه حذف شد');
    }
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

  // Sidebar content component for reuse
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* دسته‌بندی‌ها */}
      <div>
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">دسته بندی ها</h3>
        <div className="space-y-1 sm:space-y-2">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setFilterSheetOpen(false);
            }}
            className={`block w-full text-right text-xs sm:text-sm py-1 px-2 rounded transition-colors ${
              selectedCategory === null 
                ? 'font-bold' 
                : 'hover:bg-accent'
            }`}
            style={selectedCategory === null ? { color: '#B3886D' } : undefined}
          >
            همه محصولات ({toPersianNumber(products.length)})
          </button>
          {categories.map((category) => {
            const count = products.filter(p => p.category_ids && p.category_ids.includes(category.id)).length;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setFilterSheetOpen(false);
                }}
                className={`block w-full text-right text-xs sm:text-sm py-1 px-2 rounded transition-colors ${
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
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">فیلتر بر اساس قیمت</h3>
        <div className="space-y-4">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={10000}
            value={priceRange}
            onValueChange={setPriceRange}
            className="w-full"
          />
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span>قیمت: {toPersianNumber(priceRange[0])} تومان</span>
            <span>— {toPersianNumber(priceRange[1])} تومان</span>
          </div>
          <Button 
            variant="outline" 
            className="w-full text-sm"
            style={{ backgroundColor: 'transparent' }}
            onClick={() => setFilterSheetOpen(false)}
          >
            اعمال فیلتر
          </Button>
        </div>
      </div>
    </div>
  );

  if (loadingProducts || loadingCategories) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
            <p className="text-sm md:text-base">در حال بارگذاری...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'خانه', url: 'https://anamzoroof.ir/' },
    { name: 'فروشگاه', url: 'https://anamzoroof.ir/shop' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <StructuredData type="BreadcrumbList" items={breadcrumbItems} />
      <Header />
      
      {/* Page Header Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">فروشگاه</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-[30%] space-y-6">
            <SidebarContent />
          </aside>

          {/* Products Area */}
          <main className="w-full lg:w-[70%]">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Breadcrumb & Mobile Filter Button */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      فیلتر
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] sm:w-[320px] overflow-y-auto">
                    <div className="pt-6">
                      <SidebarContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-xs sm:text-sm text-muted-foreground">
                  <Link to="/" className="hover:text-foreground">خانه</Link>
                  <span className="mx-1 sm:mx-2">/</span>
                  <span>فروشگاه</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                {/* Items per page selector */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-xs sm:text-sm hidden sm:inline">نمایش:</span>
                  {[9, 24, 36].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setItemsPerPage(num);
                        setCurrentPage(1);
                      }}
                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded ${
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
                  <SelectTrigger className="w-[140px] sm:w-[180px] md:w-[200px] text-xs sm:text-sm">
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
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
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
                      <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* افزودن به سبد خرید */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}
                            >
                              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
                              onClick={() => {
                                setQuickViewProductId(product.id);
                                setQuickViewOpen(true);
                              }}
                              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}
                            >
                              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
                              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}
                            >
                              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
                              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}
                            >
                              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>افزودن به علاقه مندی</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div 
                      className="p-2 sm:p-3 md:p-4 text-center cursor-pointer"
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      <h3 className="font-semibold text-foreground mb-1 sm:mb-2 hover:text-[#B3886D] transition-colors text-xs sm:text-sm md:text-base line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg font-bold" style={{ color: '#B3886D' }}>
                        {formatPrice(product.price)} تومان
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent className="flex-wrap justify-center gap-1">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={`text-xs sm:text-sm ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page} className="hidden sm:block">
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer text-xs sm:text-sm"
                      >
                        {toPersianNumber(page)}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {/* Mobile: Show current page */}
                  <PaginationItem className="sm:hidden">
                    <span className="px-3 py-1 text-xs">
                      {toPersianNumber(currentPage)} از {toPersianNumber(totalPages)}
                    </span>
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={`text-xs sm:text-sm ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </main>

        </div>
      </div>

      <QuickViewDialog
        productId={quickViewProductId}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Shop;