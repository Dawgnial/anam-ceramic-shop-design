import { useState } from "react";
import { Link } from "react-router-dom";
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
import { toast } from "@/hooks/use-toast";

// Sample product data - این محصولات نمونه هستند و بعدا از دیتابیس می‌آیند
const products = [
  {
    id: 1,
    name: "کاسه سرامیکی",
    price: 250000,
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop",
    category: "سرامیکی",
    color: "قرمز"
  },
  {
    id: 2,
    name: "بشقاب دستساز",
    price: 180000,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
    category: "سفالی",
    color: "زرد"
  },
  {
    id: 3,
    name: "ماگ سفالی",
    price: 120000,
    image: "https://images.unsplash.com/photo-1610650876093-a9ec4e8f264b?w=400&h=400&fit=crop",
    category: "سفالی",
    color: "نارنجی"
  },
  {
    id: 4,
    name: "سرویس چای خوری",
    price: 450000,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
    category: "سرامیکی",
    color: "زرد"
  },
  {
    id: 5,
    name: "کاسه نقاشی شده",
    price: 280000,
    image: "https://images.unsplash.com/photo-1493707553966-283afb8c7aee?w=400&h=400&fit=crop",
    category: "سرامیکی",
    color: "قرمز"
  },
  {
    id: 6,
    name: "بشقاب تزئینی",
    price: 350000,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    category: "سفالی",
    color: "نارنجی"
  },
  {
    id: 7,
    name: "گلدان سرامیکی",
    price: 200000,
    image: "https://images.unsplash.com/photo-1516886635086-2b3c423c0947?w=400&h=400&fit=crop",
    category: "سرامیکی",
    color: "زرد"
  },
  {
    id: 8,
    name: "سرویس قهوه خوری",
    price: 520000,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    category: "سرامیکی",
    color: "قرمز"
  },
];

const Shop = () => {
  const { addToCart } = useCart();
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("default");
  const [priceRange, setPriceRange] = useState([120000, 520000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // محاسبه min و max قیمت از محصولات
  const minPrice = Math.min(...products.map(p => p.price));
  const maxPrice = Math.max(...products.map(p => p.price));

  // محاسبه تعداد محصولات برای هر رنگ
  const colorCounts = products.reduce((acc, product) => {
    acc[product.color] = (acc[product.color] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast({
      title: "محصول به سبد خرید اضافه شد",
      description: product.name,
    });
  };

  // محاسبه محصولات برای نمایش
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = products.slice(startIndex, endIndex);

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
              <p className="text-sm text-muted-foreground">موردی وجود ندارد</p>
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
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
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
                            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}>
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
                            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}>
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
                            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: '#B3886D' }}>
                              <Heart className="w-5 h-5 text-white" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>افزودن به علاقه مندی</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
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
