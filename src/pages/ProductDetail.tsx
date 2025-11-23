import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShoppingCart, Heart, ArrowLeftRight, Minus, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";
import { ProductReviews } from "@/components/ProductReviews";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ProductFeatures } from "@/components/ProductFeatures";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  
  const { addToCart } = useCart();
  const { toggleWishlist, items: wishlistItems } = useWishlist();
  const { toggleCompare, items: compareItems } = useCompare();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (productError) throw productError;

      // Fetch product categories
      const { data: productCategoriesData, error: pcError } = await supabase
        .from('product_categories')
        .select(`
          category_id,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('product_id', productData.id);

      if (pcError) throw pcError;

      // Fetch product attributes
      const { data: attributesData, error: attrError } = await supabase
        .from('product_attributes')
        .select('*')
        .eq('product_id', productData.id);

      if (attrError) throw attrError;

      return {
        ...productData,
        categories: productCategoriesData?.map((pc: any) => pc.categories) || [],
        category_ids: productCategoriesData?.map((pc: any) => pc.category_id) || [],
        attributes: attributesData || []
      };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
            <p>در حال بارگذاری...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">محصول یافت نشد</h2>
            <Button onClick={() => navigate('/shop')} style={{ backgroundColor: '#B3886D' }}>
              بازگشت به فروشگاه
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const isInCompare = compareItems.some(item => item.id === product.id);

  const handleAddToCart = () => {
    // Check if all required attributes are selected
    const requiredAttributes = product.attributes?.filter((attr: any) => attr.attribute_values.length > 0) || [];
    const missingAttributes = requiredAttributes.filter(
      (attr: any) => !selectedAttributes[attr.attribute_name]
    );

    if (missingAttributes.length > 0) {
      toast.error(`لطفا ${missingAttributes[0].attribute_name} را انتخاب کنید`);
      return;
    }

    if (product.stock < quantity) {
      toast.error('تعداد درخواستی بیشتر از موجودی است');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      attributes: selectedAttributes,
    });

    toast.success('محصول به سبد خرید اضافه شد');
  };

  const handleAddToWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    toast.success(isInWishlist ? 'محصول از علاقه‌مندی‌ها حذف شد' : 'محصول به علاقه‌مندی‌ها اضافه شد');
  };

  const handleAddToCompare = () => {
    if (compareItems.length >= 4 && !isInCompare) {
      toast.error('حداکثر ۴ محصول می‌توانید مقایسه کنید');
      return;
    }

    toggleCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    toast.success(isInCompare ? 'محصول از لیست مقایسه حذف شد' : 'محصول به لیست مقایسه اضافه شد');
  };

  const handleImageClick = () => {
    setZoomImageIndex(selectedImage);
    setIsZoomOpen(true);
  };

  const handlePrevImage = () => {
    setZoomImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setZoomImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate('/')} className="hover:text-foreground">
            خانه
          </button>
          <ChevronLeft className="w-4 h-4" />
          <button onClick={() => navigate('/shop')} className="hover:text-foreground">
            فروشگاه
          </button>
          {product.categories && product.categories.length > 0 && (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="hover:text-foreground">
                {product.categories.map((cat: any) => cat.name).join('، ')}
              </span>
            </>
          )}
          <ChevronLeft className="w-4 h-4" />
          <span className="text-foreground font-medium">{product.name}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Right Side - Images Gallery */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-4 space-y-4">
              {/* Main Image */}
              <div 
                className="aspect-square rounded-lg overflow-hidden border cursor-zoom-in"
                onClick={handleImageClick}
              >
                <img
                  src={product.images[selectedImage] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary scale-95'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${(index + 1).toLocaleString('fa-IR')}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Left Side - Product Info */}
          <div className="order-1 lg:order-2 space-y-6">
          {/* Category */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {product.categories.map((category: any) => (
                <Badge key={category.id} variant="outline" className="text-sm">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

            {/* Product Name */}
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Price & Stock */}
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold" style={{ color: '#B3886D' }}>
                {product.price.toLocaleString('fa-IR')} تومان
              </div>
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0 
                  ? `موجود (${product.stock.toLocaleString('fa-IR')} عدد)`
                  : 'ناموجود'
                }
              </Badge>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">توضیحات محصول</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Attributes */}
            {product.attributes && product.attributes.length > 0 && product.attributes.some((a: any) => a.attribute_values?.length > 0) && (
              <div className="space-y-4">
                {product.attributes.filter((a: any) => a.attribute_values?.length > 0).map((attribute: any) => (
                  <div key={attribute.id} className="space-y-3">
                    <h3 className="font-semibold text-lg">{attribute.attribute_name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {attribute.attribute_values.map((value: string) => (
                        <Button
                          key={value}
                          variant={selectedAttributes[attribute.attribute_name] === value ? "default" : "outline"}
                          onClick={() => setSelectedAttributes({
                            ...selectedAttributes,
                            [attribute.attribute_name]: value
                          })}
                          style={
                            selectedAttributes[attribute.attribute_name] === value
                              ? { backgroundColor: '#B3886D' }
                              : undefined
                          }
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">تعداد</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="w-16 text-center font-semibold text-lg">
                  {quantity.toLocaleString('fa-IR')}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{ backgroundColor: '#B3886D' }}
              >
                <ShoppingCart className="ml-2 h-5 w-5" />
                افزودن به سبد خرید
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className={isInWishlist ? 'border-red-500 text-red-500' : ''}
                >
                  <Heart className={`ml-2 h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleAddToCompare}
                  className={isInCompare ? 'border-blue-500 text-blue-500' : ''}
                >
                  <ArrowLeftRight className="ml-2 h-4 w-4" />
                  {isInCompare ? 'حذف از مقایسه' : 'افزودن به مقایسه'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Features Section */}
        <div className="mt-12">
          <ProductFeatures productId={product.id} />
        </div>

        {/* Product Reviews Section */}
        <div className="mt-12">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products Section */}
        <RelatedProducts 
          categoryId={product.category_ids && product.category_ids.length > 0 ? product.category_ids[0] : null} 
          currentProductId={product.id} 
        />
      </div>

      {/* Image Zoom Modal */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 left-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Previous Button */}
            {product.images.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Image */}
            <img
              src={product.images[zoomImageIndex] || '/placeholder.svg'}
              alt={`${product.name} - ${(zoomImageIndex + 1).toLocaleString('fa-IR')}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Next Button */}
            {product.images.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Image Counter */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                {(zoomImageIndex + 1).toLocaleString('fa-IR')} / {product.images.length.toLocaleString('fa-IR')}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
