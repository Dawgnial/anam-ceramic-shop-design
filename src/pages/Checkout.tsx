import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, toPersianNumber } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Truck, Clock } from "lucide-react";

const Checkout = () => {
  const { items, getTotalPrice, getShippingCost, getTotalWeight, getMaxPreparationDays, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const shippingCost = getShippingCost();
  const totalWeight = getTotalWeight();
  const maxPreparationDays = getMaxPreparationDays();

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

    if (!name.trim() || !phone.trim() || !address.trim()) {
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

      // Use production domain for ZarinPal callback (must match registered domain)
      const productionDomain = "https://anamzoroof.ir";
      
      // Call zarinpal-request edge function
      const { data, error } = await supabase.functions.invoke("zarinpal-request", {
        body: {
          amount: finalAmount,
          description: `خرید از فروشگاه آنام - ${items.length} محصول`,
          mobile: phone,
          callback_url: `${productionDomain}/payment/callback`,
          order_data: {
            shipping_address: `${name} - ${phone} - ${address}`,
            items: orderItems,
            coupon_id: appliedCoupon?.id || null
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
                <div>
                  <Label htmlFor="address">آدرس کامل *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="استان، شهر، خیابان، کوچه، پلاک و واحد"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Info - Weight Based */}
            <div className="border rounded-lg p-6 bg-background">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Truck className="h-6 w-6" />
                هزینه ارسال
              </h2>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    هزینه ارسال بر اساس وزن محصولات محاسبه می‌شود:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>تا ۱ کیلوگرم: {toPersianNumber(80000)} تومان</li>
                    <li>هر کیلوگرم اضافی: {toPersianNumber(30000)} تومان</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span>وزن کل محصولات:</span>
                  </div>
                  <span className="font-medium">{formatWeight(totalWeight)}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="font-medium">هزینه ارسال:</span>
                  <span className="font-bold text-lg" style={{ color: '#B3886D' }}>
                    {toPersianNumber(shippingCost)} تومان
                  </span>
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
                  <span>{formatPrice(shippingCost)} تومان</span>
                </div>
                
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