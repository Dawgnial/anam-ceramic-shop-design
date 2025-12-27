import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Truck, Clock, CreditCard, Banknote, Box } from "lucide-react";
import { iranProvinces, getCitiesForProvince } from "@/data/iranLocations";

type ShippingMethod = "prepaid" | "cod" | "snappbox";

interface ShippingSettings {
  regular_first_kg: number;
  regular_extra_kg: number;
  snappbox_first_kg: number;
  snappbox_extra_kg: number;
}

const Checkout = () => {
  const { items, getTotalPrice, getTotalWeight, getMaxPreparationDays, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("prepaid");
  
  // Shipping settings from database
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    regular_first_kg: 80000,
    regular_extra_kg: 40000,
    snappbox_first_kg: 40000,
    snappbox_extra_kg: 5000
  });

  const totalWeight = getTotalWeight();
  const maxPreparationDays = getMaxPreparationDays();

  // Fetch shipping settings from database
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("shipping_settings")
          .select("*");
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const settings: ShippingSettings = {
            regular_first_kg: 80000,
            regular_extra_kg: 40000,
            snappbox_first_kg: 40000,
            snappbox_extra_kg: 5000
          };
          
          data.forEach((item) => {
            if (item.setting_key in settings) {
              (settings as any)[item.setting_key] = item.setting_value;
            }
          });
          
          setShippingSettings(settings);
        }
      } catch (error) {
        console.error("Error fetching shipping settings:", error);
      }
    };
    
    fetchShippingSettings();
  }, []);

  // Get cities for selected province
  const availableCities = useMemo(() => {
    return province ? getCitiesForProvince(province) : [];
  }, [province]);

  // Check if Mashhad is selected
  const isMashhadSelected = useMemo(() => {
    return city === "مشهد";
  }, [city]);

  // Reset city when province changes
  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setCity("");
    // Reset shipping method if not Mashhad
    if (shippingMethod === "snappbox") {
      setShippingMethod("prepaid");
    }
  };

  // Handle city change
  const handleCityChange = (value: string) => {
    setCity(value);
    // Reset shipping method if not Mashhad
    if (value !== "مشهد" && shippingMethod === "snappbox") {
      setShippingMethod("prepaid");
    }
  };

  // Calculate weight-based shipping cost (regular post) - using settings from database
  const calculateRegularShipping = (): number => {
    const weightInKg = totalWeight / 1000;
    if (weightInKg <= 1) {
      return shippingSettings.regular_first_kg;
    }
    const extraKg = Math.ceil(weightInKg - 1);
    return shippingSettings.regular_first_kg + (extraKg * shippingSettings.regular_extra_kg);
  };

  // Calculate Snapp Box shipping cost for Mashhad - using settings from database
  const calculateSnappBoxShipping = (): number => {
    const weightInKg = Math.ceil(totalWeight / 1000);
    if (weightInKg <= 1) {
      return shippingSettings.snappbox_first_kg;
    }
    const extraKg = weightInKg - 1;
    return shippingSettings.snappbox_first_kg + (extraKg * shippingSettings.snappbox_extra_kg);
  };

  // Get current shipping cost based on method
  const getShippingCost = (): number => {
    if (shippingMethod === "cod") {
      return 0; // Will be paid on delivery
    }
    if (shippingMethod === "snappbox" && isMashhadSelected) {
      return calculateSnappBoxShipping();
    }
    return calculateRegularShipping();
  };

  // Get shipping cost to display (for COD, show the amount that will be paid later)
  const getShippingCostDisplay = (): number => {
    if (shippingMethod === "snappbox" && isMashhadSelected) {
      return calculateSnappBoxShipping();
    }
    return calculateRegularShipping();
  };

  const shippingCost = getShippingCost();

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = getTotalPrice();
    if (appliedCoupon.discount_type === "percentage") {
      const discount = (subtotal * appliedCoupon.discount_value) / 100;
      return appliedCoupon.max_discount ? Math.min(discount, appliedCoupon.max_discount) : discount;
    }
    return appliedCoupon.discount_value;
  };

  const getFinalTotal = () => {
    return getTotalPrice() - getDiscount() + shippingCost;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast({
          title: "کد تخفیف نامعتبر",
          description: "کد تخفیف وارد شده یافت نشد",
          variant: "destructive"
        });
        return;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: "کد منقضی شده",
          description: "این کد تخفیف منقضی شده است",
          variant: "destructive"
        });
        return;
      }

      // Check min purchase
      if (data.min_purchase && getTotalPrice() < data.min_purchase) {
        toast({
          title: "حداقل خرید",
          description: `حداقل مبلغ خرید برای این کد ${toPersianNumber(data.min_purchase)} تومان است`,
          variant: "destructive"
        });
        return;
      }

      // Check usage limit
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        toast({
          title: "محدودیت استفاده",
          description: "این کد تخفیف به حد مجاز استفاده رسیده است",
          variant: "destructive"
        });
        return;
      }

      setAppliedCoupon(data);
      
      // Calculate discount with the new coupon data
      const subtotal = getTotalPrice();
      let discountAmount = 0;
      if (data.discount_type === "percentage") {
        discountAmount = (subtotal * data.discount_value) / 100;
        if (data.max_discount) {
          discountAmount = Math.min(discountAmount, data.max_discount);
        }
      } else {
        discountAmount = data.discount_value;
      }
      
      toast({
        title: "کد تخفیف اعمال شد",
        description: `تخفیف شما: ${toPersianNumber(discountAmount)} تومان`
      });
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast({
        title: "خطا",
        description: "خطا در اعمال کد تخفیف",
        variant: "destructive"
      });
    }
  };

  const handleOnlinePayment = async () => {
    if (!user) {
      toast({
        title: "لطفا وارد شوید",
        description: "برای پرداخت آنلاین ابتدا وارد حساب کاربری خود شوید",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!name.trim() || !phone.trim() || !province || !city || !address.trim()) {
      toast({
        title: "اطلاعات ناقص",
        description: "لطفا تمام فیلدهای الزامی را پر کنید",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone.replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]))) {
      toast({
        title: "شماره تماس نامعتبر",
        description: "شماره موبایل باید با 09 شروع شود و 11 رقم باشد",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "سبد خرید خالی",
        description: "سبد خرید شما خالی است",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const finalAmount = getFinalTotal();
      
      // Prepare order data with product_id for inventory management
      const orderItems = items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price
      }));

      // Build full address with province, city, and postal code
      const fullAddress = `${province}، ${city}${postalCode ? ` - کدپستی: ${postalCode}` : ""} - ${address}`;
      
      // Shipping method description
      const shippingMethodText = shippingMethod === "cod" 
        ? "پس کرایه" 
        : shippingMethod === "snappbox" 
          ? "اسنپ باکس" 
          : "پرداخت آنلاین";

      // Use production domain for ZarinPal callback (must match registered domain)
      const productionDomain = "https://anamzoroof.ir";
      
      // Call zarinpal-request edge function
      const { data, error } = await supabase.functions.invoke("zarinpal-request", {
        body: {
          amount: finalAmount,
          description: `خرید از فروشگاه آنام - ${items.length} محصول - ${shippingMethodText}`,
          mobile: phone,
          callback_url: `${productionDomain}/payment/callback`,
          order_data: {
            shipping_address: `${name} - ${phone} - ${fullAddress} - روش ارسال: ${shippingMethodText}`,
            items: orderItems,
            coupon_id: appliedCoupon?.id || null,
            shipping_method: shippingMethod,
            shipping_cost: shippingMethod === "cod" ? getShippingCostDisplay() : shippingCost
          }
        }
      });

      if (error) {
        console.error("Payment request error:", error);
        toast({
          title: "خطا",
          description: "خطا در اتصال به درگاه پرداخت",
          variant: "destructive"
        });
        return;
      }

      if (data.success && data.payment_url) {
        // Redirect to ZarinPal payment page
        window.location.href = data.payment_url;
      } else {
        console.error("Payment request failed:", data);
        toast({
          title: "خطا",
          description: data.error || "خطا در ایجاد درخواست پرداخت",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast({
        title: "خطا",
        description: "خطا در اتصال به درگاه پرداخت. لطفا دوباره تلاش کنید",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format weight for display
  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      const kg = grams / 1000;
      return `${toPersianNumber(kg.toFixed(1))} کیلوگرم`;
    }
    return `${toPersianNumber(grams)} گرم`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-muted-foreground mb-6">سبد خرید شما خالی است</p>
          <Button onClick={() => navigate("/shop")} style={{ backgroundColor: '#B3886D' }} className="text-white">
            بازگشت به فروشگاه
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <div className="flex items-center gap-3 text-2xl">
          <span className="text-gray-400">سبد خرید</span>
          <span className="text-gray-400">←</span>
          <span className="font-bold text-black">تسویه حساب</span>
          <span className="text-gray-400">←</span>
          <span className="text-gray-400">تکمیل سفارش</span>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buyer Information */}
            <div className="border rounded-lg p-6 bg-background">
              <h2 className="text-2xl font-bold mb-6">اطلاعات خریدار</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">نام و نام خانوادگی *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام خود را وارد کنید"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">شماره تماس *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹XXXXXXXXX"
                  />
                </div>
                
                {/* Province and City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>استان *</Label>
                    <Select value={province} onValueChange={handleProvinceChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="استان را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] bg-background">
                        {iranProvinces.map((prov) => (
                          <SelectItem key={prov.name} value={prov.name}>
                            {prov.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>شهر *</Label>
                    <Select value={city} onValueChange={handleCityChange} disabled={!province}>
                      <SelectTrigger>
                        <SelectValue placeholder={province ? "شهر را انتخاب کنید" : "ابتدا استان را انتخاب کنید"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] bg-background">
                        {availableCities.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode">کدپستی (اختیاری)</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="کدپستی ۱۰ رقمی"
                    maxLength={10}
                  />
                </div>

                <div>
                  <Label htmlFor="address">آدرس کامل *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="خیابان، کوچه، پلاک و واحد"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method Selection */}
            <div className="border rounded-lg p-6 bg-background">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Truck className="h-6 w-6" />
                روش ارسال
              </h2>
              
              <RadioGroup value={shippingMethod} onValueChange={(value) => setShippingMethod(value as ShippingMethod)} className="space-y-4">
                {/* Prepaid Option */}
                <div className={`flex items-start space-x-3 space-x-reverse p-4 rounded-lg border ${shippingMethod === 'prepaid' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="prepaid" id="prepaid" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="prepaid" className="flex items-center gap-2 cursor-pointer font-medium">
                      <CreditCard className="h-5 w-5" />
                      پرداخت آنلاین هزینه ارسال
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      هزینه ارسال به مبلغ سفارش اضافه می‌شود و الان پرداخت می‌کنید
                    </p>
                    <p className="text-sm font-medium mt-2" style={{ color: '#B3886D' }}>
                      هزینه: {toPersianNumber(calculateRegularShipping())} تومان
                    </p>
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div className={`flex items-start space-x-3 space-x-reverse p-4 rounded-lg border ${shippingMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="cod" id="cod" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer font-medium">
                      <Banknote className="h-5 w-5" />
                      پس کرایه (پرداخت هنگام تحویل)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      هزینه ارسال را هنگام تحویل مرسوله به مامور پست پرداخت می‌کنید
                    </p>
                  </div>
                </div>

                {/* Snapp Box Option - Only for Mashhad */}
                {isMashhadSelected && (
                  <div className={`flex items-start space-x-3 space-x-reverse p-4 rounded-lg border ${shippingMethod === 'snappbox' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value="snappbox" id="snappbox" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="snappbox" className="flex items-center gap-2 cursor-pointer font-medium">
                        <Box className="h-5 w-5" />
                        اسنپ باکس (ویژه مشهد)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        ارسال سریع با اسنپ باکس - فقط برای شهر مشهد
                      </p>
                      <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                        <p>• ۱ کیلو اول: {toPersianNumber(shippingSettings.snappbox_first_kg)} تومان</p>
                        <p>• هر کیلو اضافی: {toPersianNumber(shippingSettings.snappbox_extra_kg)} تومان</p>
                      </div>
                      <p className="text-sm font-medium mt-2" style={{ color: '#B3886D' }}>
                        هزینه: {toPersianNumber(calculateSnappBoxShipping())} تومان
                      </p>
                    </div>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Shipping Info - Weight Based */}
            <div className="border rounded-lg p-6 bg-background">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Package className="h-6 w-6" />
                اطلاعات بسته
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span>وزن کل محصولات:</span>
                  </div>
                  <span className="font-medium">{formatWeight(totalWeight)}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-medium">
                    هزینه ارسال ({shippingMethod === 'snappbox' ? 'اسنپ باکس' : 'پست'}):
                  </span>
                  <div className="text-left">
                    {shippingMethod === 'cod' ? (
                      <span className="text-amber-600 font-medium">پرداخت هنگام تحویل</span>
                    ) : (
                      <span className="font-bold text-lg" style={{ color: '#B3886D' }}>
                        {toPersianNumber(shippingCost)} تومان
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Time */}
            {maxPreparationDays > 0 && (
              <div className="border rounded-lg p-6 bg-background">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  زمان آماده‌سازی
                </h2>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                  <p className="text-amber-800 dark:text-amber-200">
                    سفارش شما حداکثر تا <strong>{toPersianNumber(maxPreparationDays)} روز کاری</strong> آماده ارسال خواهد بود.
                  </p>
                </div>
              </div>
            )}

            {/* Coupon Code */}
            <div className="border rounded-lg p-6 bg-background">
              <h2 className="text-2xl font-bold mb-6">کد تخفیف</h2>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="کد تخفیف خود را وارد کنید"
                  disabled={!!appliedCoupon}
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={!!appliedCoupon}
                  style={{ backgroundColor: '#B3886D' }}
                  className="text-white"
                >
                  اعمال
                </Button>
              </div>
              {appliedCoupon && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-700 dark:text-green-400">
                    کد تخفیف "{appliedCoupon.code}" اعمال شد
                  </p>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                    }}
                    className="text-sm underline mt-1"
                  >
                    حذف کد تخفیف
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 bg-background sticky top-4">
              <h2 className="text-2xl font-bold mb-6">خلاصه سفارش</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">
                        {toPersianNumber(item.quantity)} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span>جمع کل محصولات:</span>
                  <span>{formatPrice(getTotalPrice())} تومان</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>تخفیف:</span>
                    <span>-{formatPrice(getDiscount())} تومان</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>هزینه ارسال ({formatWeight(totalWeight)}):</span>
                  {shippingMethod === 'cod' ? (
                    <span className="text-amber-600">پس کرایه</span>
                  ) : (
                    <span>{formatPrice(shippingCost)} تومان</span>
                  )}
                </div>

                {shippingMethod === 'cod' && (
                  <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                    هزینه ارسال هنگام تحویل به مامور پست پرداخت می‌شود
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>مبلغ قابل پرداخت:</span>
                  <span>{formatPrice(getFinalTotal())} تومان</span>
                </div>
              </div>

              <Button
                onClick={handleOnlinePayment}
                disabled={loading}
                className="w-full mt-6 text-white"
                style={{ backgroundColor: '#B3886D' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    در حال پردازش...
                  </>
                ) : (
                  `پرداخت آنلاین - ${formatPrice(getFinalTotal())} تومان`
                )}
              </Button>

              {/* Preparation Time Notice */}
              {maxPreparationDays > 0 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  زمان آماده‌سازی: تا {toPersianNumber(maxPreparationDays)} روز کاری
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
