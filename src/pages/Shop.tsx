import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { QuickViewDialog } from "@/components/QuickViewDialog";
import { Button } from "@/components/ui/button";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { Heart, ShoppingCart, Search, Shuffle, Filter, X, RotateCcw, Check, ChevronDown, ChevronUp, Grid3X3, LayoutGrid } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";
import StructuredData from "@/components/seo/StructuredData";

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toggleCompare, items: compareItems } = useCompare();
  
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
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
  useEffect(() => {
    if (products.length > 0 && priceRange[0] === 0 && priceRange[1] === 10000000) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products, minPrice, maxPrice]);

  // Read category from URL and set selectedCategory
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.id);
      }
    }
  }, [searchParams, categories]);

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
      weight_with_packaging: product.weight_with_packaging || 0,
      preparation_days: product.preparation_days || 1,
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
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortOrder]);

  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) count++;
    return count;
  }, [selectedCategory, priceRange, minPrice, maxPrice]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory(null);
    setPriceRange([minPrice, maxPrice]);
    setMinPriceInput("");
    setMaxPriceInput("");
    setSortOrder("default");
    setCurrentPage(1);
  };

  // Sidebar content component for reuse
  const SidebarContent = () => {
    const displayedCategories = showAllCategories ? categories : categories.slice(0, 5);
    
    return (
      <div className="space-y-6">
        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-primary">
                {toPersianNumber(activeFiltersCount)} فیلتر فعال
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="h-3 w-3" />
                پاک کردن همه
              </Button>
            </div>
            
            {/* Active filter tags */}
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory(null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} تومان
                  <button onClick={() => {
                    setPriceRange([minPrice, maxPrice]);
                    setMinPriceInput("");
                    setMaxPriceInput("");
                  }} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* دسته‌بندی‌ها */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-base font-black mb-4 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-primary" />
            دسته‌بندی‌ها
          </h3>
          
          <div className="space-y-1">
            {/* همه محصولات */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setFilterSheetOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                selectedCategory === null 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'hover:bg-accent'
              }`}
            >
              <span className="text-sm font-medium">همه محصولات</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === null 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {toPersianNumber(products.length)}
                </span>
                {selectedCategory === null && <Check className="h-4 w-4" />}
              </div>
            </button>
            
            {/* Categories list */}
            {displayedCategories.map((category) => {
              const count = products.filter(p => p.category_ids && p.category_ids.includes(category.id)).length;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setFilterSheetOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-accent'
                  }`}
                >
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {toPersianNumber(count)}
                    </span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                </button>
              );
            })}
            
            {/* Show more/less button */}
            {categories.length > 5 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="w-full flex items-center justify-center gap-1 p-2 text-sm text-primary hover:underline mt-2"
              >
                {showAllCategories ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    نمایش کمتر
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    نمایش همه ({toPersianNumber(categories.length)})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* فیلتر بر اساس قیمت */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-base font-black mb-4 flex items-center gap-2">
            <span className="text-primary">💰</span>
            محدوده قیمت
          </h3>
          
          <div className="space-y-4">
            {/* Price inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">حداقل قیمت</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minPriceInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setMinPriceInput(value);
                    }}
                    placeholder={formatPrice(minPrice)}
                    className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2.5 text-center focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">تومان</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">حداکثر قیمت</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxPriceInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setMaxPriceInput(value);
                    }}
                    placeholder={formatPrice(maxPrice)}
                    className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2.5 text-center focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">تومان</span>
                </div>
              </div>
            </div>
            
            {/* Apply price filter button */}
            <Button
              onClick={() => {
                const min = minPriceInput ? parseInt(minPriceInput) : minPrice;
                const max = maxPriceInput ? parseInt(maxPriceInput) : maxPrice;
                if (min > max) {
                  toast.error("حداقل قیمت نمی‌تواند بیشتر از حداکثر قیمت باشد");
                  return;
                }
                setPriceRange([min, max]);
                setCurrentPage(1);
              }}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Check className="h-4 w-4 ml-2" />
              اعمال فیلتر قیمت
            </Button>
            
            {/* Reset price filter */}
            {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
              <Button
                onClick={() => {
                  setPriceRange([minPrice, maxPrice]);
                  setMinPriceInput("");
                  setMaxPriceInput("");
                  setCurrentPage(1);
                }}
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="h-3 w-3 ml-1" />
                حذف فیلتر قیمت
              </Button>
            )}
            
            {/* Apply button for mobile */}
            <Button 
              className="w-full lg:hidden"
              style={{ backgroundColor: '#B3886D' }}
              onClick={() => setFilterSheetOpen(false)}
            >
              اعمال فیلتر
            </Button>
          </div>
        </div>

        {/* Products count info */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-primary mb-1">
            {toPersianNumber(filteredAndSortedProducts.length)}
          </p>
          <p className="text-sm text-muted-foreground">محصول یافت شد</p>
        </div>
      </div>
    );
  };

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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black">فروشگاه</h1>
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
            <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                {/* Right side - Filter & Breadcrumb */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Mobile Filter Button */}
                  <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 relative"
                        style={{ borderColor: activeFiltersCount > 0 ? '#B3886D' : undefined }}
                      >
                        <Filter className="h-4 w-4" />
                        فیلترها
                        {activeFiltersCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                            {toPersianNumber(activeFiltersCount)}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto p-0">
                      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                        <h3 className="font-black text-lg">فیلترها</h3>
                        {activeFiltersCount > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={resetFilters}
                            className="text-xs gap-1 text-muted-foreground"
                          >
                            <RotateCcw className="h-3 w-3" />
                            پاک کردن
                          </Button>
                        )}
                      </div>
                      <div className="p-4">
                        <SidebarContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Breadcrumb */}
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <Link to="/" className="hover:text-primary transition-colors">خانه</Link>
                    <span className="mx-1 sm:mx-2">/</span>
                    <span className="text-foreground font-medium">فروشگاه</span>
                  </div>
                  
                  {/* Results count - desktop */}
                  <div className="hidden md:flex items-center text-xs text-muted-foreground border-r pr-3 mr-1">
                    <span className="text-primary font-bold ml-1">{toPersianNumber(filteredAndSortedProducts.length)}</span>
                    محصول
                  </div>
                </div>

                {/* Left side - Controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {/* Items per page selector */}
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                    <span className="text-xs text-muted-foreground px-2 hidden sm:inline">نمایش:</span>
                    {[9, 24, 36].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setItemsPerPage(num);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          itemsPerPage === num 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'hover:bg-background'
                        }`}
                      >
                        {toPersianNumber(num)}
                      </button>
                    ))}
                  </div>

                  {/* Sort dropdown */}
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[130px] sm:w-[160px] text-xs sm:text-sm bg-muted/50 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">پیش‌فرض</SelectItem>
                      <SelectItem value="price-asc">ارزان‌ترین</SelectItem>
                      <SelectItem value="price-desc">گران‌ترین</SelectItem>
                      <SelectItem value="name-asc">نام: الف - ی</SelectItem>
                      <SelectItem value="name-desc">نام: ی - الف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <TooltipProvider>
              <div className={`grid gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 ${
                itemsPerPage === 9 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' 
                  : itemsPerPage === 24 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' 
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              }`}>
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