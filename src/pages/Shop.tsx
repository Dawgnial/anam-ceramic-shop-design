import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toPersianNumber } from "@/lib/utils";
import { Heart, ShoppingCart, Shuffle } from "lucide-react";

// Sample product data
const products = [
  {
    id: 1,
    name: "کاسه سرامیکی",
    price: 62000,
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop",
    category: "سرامیکی"
  },
  {
    id: 2,
    name: "قندان سرامیکی",
    price: 248000,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
    category: "سرامیکی"
  },
  {
    id: 3,
    name: "فنجان سرامیکی",
    price: 89000,
    image: "https://images.unsplash.com/photo-1610650876093-a9ec4e8f264b?w=400&h=400&fit=crop",
    category: "سرامیکی",
    badge: "افزودن به سبد خرید"
  },
  {
    id: 4,
    name: "ست ظروف سرامیکی",
    price: 138000,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
    category: "سرامیکی"
  },
  {
    id: 5,
    name: "بشقاب سرامیکی- آبی",
    price: 198000,
    image: "https://images.unsplash.com/photo-1493707553966-283afb8c7aee?w=400&h=400&fit=crop",
    category: "سرامیکی"
  },
  {
    id: 6,
    name: "بشقاب سرامیکی",
    price: 72000,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    category: "سرامیکی"
  }
];

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([628000, 788000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    { id: "all", label: "محصولات" },
    { id: "ceramic", label: "ظروف سرامیکی" },
    { id: "pottery", label: "ظروف سفالی" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">فروشگاه</h1>
          <div className="flex gap-4 justify-center flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                className="px-8"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Products Grid - Main Area (Left in RTL) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div className="text-sm text-gray-600">
                نمایش {toPersianNumber(9)} / {toPersianNumber(24)} از {toPersianNumber(34)}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm">مرتب‌سازی پیش‌فرض</span>
                <Select defaultValue="default">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="مرتب‌سازی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">مرتب‌سازی پیش‌فرض</SelectItem>
                    <SelectItem value="popular">محبوب‌ترین</SelectItem>
                    <SelectItem value="latest">جدیدترین</SelectItem>
                    <SelectItem value="price-low">ارزان‌ترین</SelectItem>
                    <SelectItem value="price-high">گران‌ترین</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="text-sm text-gray-600 mb-6">
              خانه / فروشگاه
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow group relative">
                  
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Icons Overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                        <Shuffle className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Badge for special product */}
                    {product.badge && (
                      <div className="absolute inset-0 bg-gray-800/60 flex items-center justify-center">
                        <div className="bg-[#8B4545] text-white px-6 py-3 rounded-lg transform -rotate-12 shadow-lg">
                          <div className="text-sm font-bold">{product.badge}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 text-center">
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <div className="text-gray-600 text-sm">
                      {toPersianNumber(product.price.toLocaleString())} تومان
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Right Side in RTL */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            
            {/* Categories Filter */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-bold mb-4 text-right">دسته بندی ها</h3>
              <div className="space-y-3">
                {[
                  { id: "ceramic", label: "ظروف سرامیکی" },
                  { id: "pottery", label: "ظروف سفالی" },
                  { id: "products", label: "محصولات" }
                ].map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 justify-end">
                    <label htmlFor={cat.id} className="text-sm cursor-pointer">
                      {cat.label}
                    </label>
                    <Checkbox
                      id={cat.id}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, cat.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-right">فیلتر بر اساس قیمت</h3>
              
              <div className="mb-6">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={1000000}
                  step={10000}
                  className="mb-4"
                />
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <span>فیلتر</span>
                <span className="text-gray-600">
                  قیمت: {toPersianNumber(priceRange[0].toLocaleString())} — {toPersianNumber(priceRange[1].toLocaleString())} تومان
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Shop;
