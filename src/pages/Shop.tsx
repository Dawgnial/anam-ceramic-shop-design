import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { QuickViewDialog } from "@/components/QuickViewDialog";
import { ProductBadges } from "@/components/ProductBadges";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { Heart, ShoppingCart, Search, Shuffle, Filter, X, RotateCcw, Check, ChevronDown, ChevronUp, LayoutGrid, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";
import StructuredData from "@/components/seo/StructuredData";
import PageSEO from "@/components/seo/PageSEO";

const PAGE_SIZE = 12;

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { toggleCompare, items: compareItems } = useCompare();
  
  const [sortOrder, setSortOrder] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const minPriceRef = useRef<HTMLInputElement>(null);
  const maxPriceRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  // Infinite scroll products query
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingProducts,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['shop-products-infinite', selectedCategory, sortOrder, priceRange, inStockOnly],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('products')
        .select('*, product_categories(category_id)', { count: 'exact' });

      // Filter by category
      if (selectedCategory) {
        const { data: productIds } = await supabase
          .from('product_categories')
          .select('product_id')
          .eq('category_id', selectedCategory);
        
        if (productIds && productIds.length > 0) {
          query = query.in('id', productIds.map(p => p.product_id));
        } else {
          return { data: [], nextPage: undefined, totalCount: 0 };
        }
      }

      // Filter by stock
      if (inStockOnly) {
        query = query.eq('in_stock', true).gt('stock', 0);
      }

      // Filter by price
      if (priceRange[0] > 0 || priceRange[1] < 10000000) {
        query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
      }

      // Sort
      switch (sortOrder) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'bestseller':
          query = query.order('sales_count', { ascending: false, nullsFirst: false });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Pagination
      query = query.range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        data: data || [],
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
        totalCount: count || 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Flatten pages into products array
  const products = useMemo(() => {
    return productsData?.pages.flatMap(page => page.data) || [];
  }, [productsData]);

  const totalCount = productsData?.pages[0]?.totalCount || 0;

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (inStockOnly) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000000) count++;
    return count;
  }, [selectedCategory, inStockOnly, priceRange]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory(null);
    setInStockOnly(false);
    setPriceRange([0, 10000000]);
    setMinPriceInput("");
    setMaxPriceInput("");
    setSortOrder("newest");
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
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  فقط موجود
                  <button onClick={() => setInStockOnly(false)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} تومان
                  <button onClick={() => {
                    setPriceRange([0, 10000000]);
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
                {selectedCategory === null && <Check className="h-4 w-4" />}
              </div>
            </button>
            
            {/* Categories list */}
            {displayedCategories.map((category) => {
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

        {/* فیلتر موجودی */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="in-stock-filter" className="text-sm font-medium cursor-pointer">
              فقط محصولات موجود
            </Label>
            <Switch
              id="in-stock-filter"
              checked={inStockOnly}
              onCheckedChange={setInStockOnly}
            />
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
                    ref={minPriceRef}
                    type="number"
                    pattern="[0-9]*"
                    defaultValue={minPriceInput}
                    placeholder="۰"
                    className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2.5 text-center focus:border-primary focus:ring-1 focus:ring-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">تومان</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">حداکثر قیمت</label>
                <div className="relative">
                  <input
                    ref={maxPriceRef}
                    type="number"
                    pattern="[0-9]*"
                    defaultValue={maxPriceInput}
                    placeholder="۱۰,۰۰۰,۰۰۰"
                    className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2.5 text-center focus:border-primary focus:ring-1 focus:ring-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">تومان</span>
                </div>
              </div>
            </div>
            
            {/* Apply price filter button */}
            <Button
              onClick={() => {
                const minValue = minPriceRef.current?.value || "";
                const maxValue = maxPriceRef.current?.value || "";
                const min = minValue ? parseInt(minValue) : 0;
                const max = maxValue ? parseInt(maxValue) : 10000000;
                if (min > max) {
                  toast.error("حداقل قیمت نمی‌تواند بیشتر از حداکثر قیمت باشد");
                  return;
                }
                setMinPriceInput(minValue);
                setMaxPriceInput(maxValue);
                setPriceRange([min, max]);
              }}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Check className="h-4 w-4 ml-2" />
              اعمال فیلتر قیمت
            </Button>
            
            {/* Reset price filter */}
            {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
              <Button
                onClick={() => {
                  setPriceRange([0, 10000000]);
                  setMinPriceInput("");
                  setMaxPriceInput("");
                  if (minPriceRef.current) minPriceRef.current.value = "";
                  if (maxPriceRef.current) maxPriceRef.current.value = "";
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
            {toPersianNumber(totalCount)}
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
      <PageSEO
        title="فروشگاه"
        description="خرید آنلاین ظروف سرامیکی و سفالی دست‌ساز با قیمت مناسب. ارسال به سراسر ایران. فیلتر بر اساس دسته‌بندی و قیمت."
        canonicalUrl="https://anamzoroof.ir/shop"
        keywords="خرید ظروف سرامیکی، فروشگاه سفال، ظروف دست‌ساز، سرامیک ایرانی، خرید آنلاین سفال"
      />
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
                    <span className="text-primary font-bold ml-1">{toPersianNumber(totalCount)}</span>
                    محصول
                  </div>
                </div>

                {/* Left side - Sort dropdown */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {/* Sort dropdown */}
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[130px] sm:w-[160px] text-xs sm:text-sm bg-muted/50 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">جدیدترین</SelectItem>
                      <SelectItem value="bestseller">پرفروش‌ترین</SelectItem>
                      <SelectItem value="popular">محبوب‌ترین</SelectItem>
                      <SelectItem value="price-asc">ارزان‌ترین</SelectItem>
                      <SelectItem value="price-desc">گران‌ترین</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">محصولی یافت نشد</p>
                <Button variant="outline" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4 ml-2" />
                  پاک کردن فیلترها
                </Button>
              </div>
            ) : (
              <TooltipProvider>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                  {products.map((product) => (
                    <div 
                      key={product.id} 
                      className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        {/* Product Badges */}
                        <ProductBadges
                          isNew={product.badge_new}
                          isBestseller={product.badge_bestseller}
                          hasSpecialDiscount={product.badge_special_discount}
                          discountPercentage={product.discount_percentage}
                        />

                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                          onClick={() => navigate(`/product/${product.slug}`)}
                        />

                        {/* Out of Stock Overlay */}
                        {(!product.in_stock || product.stock === 0) && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <span className="bg-white/90 text-foreground px-3 py-1 text-sm font-medium rounded">
                              ناموجود
                            </span>
                          </div>
                        )}
                        
                        {/* Hover Icons */}
                        <div className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          
                          {/* افزودن به سبد خرید */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleAddToCart(product)}
                                className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors"
                                style={{ backgroundColor: '#B3886D' }}
                                disabled={!product.in_stock || product.stock === 0}
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
                        <h3 className="font-semibold text-foreground mb-1 sm:mb-2 hover:text-[#B3886D] transition-colors line-clamp-2 text-xs sm:text-sm md:text-base">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                          {product.discount_percentage ? (
                            <>
                              <span className="text-muted-foreground line-through text-xs">
                                {formatPrice(product.price)}
                              </span>
                              <span className="font-bold text-sm sm:text-base md:text-lg" style={{ color: '#B3886D' }}>
                                {formatPrice(Math.round(product.price * (1 - product.discount_percentage / 100)))} تومان
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-sm sm:text-base md:text-lg" style={{ color: '#B3886D' }}>
                              {formatPrice(product.price)} تومان
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            )}

            {/* Load More Trigger for Infinite Scroll */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال بارگذاری بیشتر...</span>
                </div>
              )}
              {!hasNextPage && products.length > 0 && (
                <p className="text-muted-foreground text-sm">همه محصولات نمایش داده شد</p>
              )}
            </div>
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
