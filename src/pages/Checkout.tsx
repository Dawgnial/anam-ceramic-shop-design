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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toPersianNumber } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [shippingMethod, setShippingMethod] = useState("standard");

  const shippingCosts = {
    standard: 50000,
    express: 100000,
    free: 0
  };

  const getShippingCost = () => {
    if (getTotalPrice() > 1000000) return 0; // Free shipping over 1M
    return shippingCosts[shippingMethod as keyof typeof shippingCosts];
  };

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
    return getTotalPrice() - getDiscount() + getShippingCost();
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
      toast({
        title: "کد تخفیف اعمال شد",
        description: `تخفیف شما: ${toPersianNumber(getDiscount())} تومان`
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

  const handleSubmitOrder = async () => {
    if (!user) {
      toast({
        title: "لطفا وارد شوید",
        description: "برای ثبت سفارش ابتدا وارد حساب کاربری خود شوید",
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
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          shipping_address: `${name} - ${phone} - ${address}`,
          total_amount: getFinalTotal(),
          status: "pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        product_image: item.image,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update coupon usage if applied
      if (appliedCoupon) {
        await supabase
          .from("coupons")
          .update({ used_count: (appliedCoupon.used_count || 0) + 1 })
          .eq("id", appliedCoupon.id);
      }

      // Clear cart
      clearCart();

      toast({
        title: "سفارش ثبت شد",
        description: "سفارش شما با موفقیت ثبت شد"
      });

      navigate("/profile");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "خطا",
        description: "خطا در ثبت سفارش. لطفا دوباره تلاش کنید",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
                    placeholder="09XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="address">آدرس *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="آدرس کامل خود را وارد کنید"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="border rounded-lg p-6 bg-background">
              <h2 className="text-2xl font-bold mb-6">روش ارسال</h2>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div className="flex items-center space-x-2 gap-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="cursor-pointer">
                      ارسال عادی (۳-۷ روز کاری)
                    </Label>
                  </div>
                  <span>{toPersianNumber(shippingCosts.standard)} تومان</span>
                </div>
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div className="flex items-center space-x-2 gap-2">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="cursor-pointer">
                      ارسال سریع (۱-۳ روز کاری)
                    </Label>
                  </div>
                  <span>{toPersianNumber(shippingCosts.express)} تومان</span>
                </div>
                {getTotalPrice() > 1000000 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 gap-2">
                      <RadioGroupItem value="free" id="free" />
                      <Label htmlFor="free" className="cursor-pointer">
                        ارسال رایگان (خرید بالای یک میلیون تومان)
                      </Label>
                    </div>
                    <span className="text-green-600 font-bold">رایگان</span>
                  </div>
                )}
              </RadioGroup>
            </div>

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
                        {toPersianNumber(item.quantity)} × {toPersianNumber(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span>جمع کل محصولات:</span>
                  <span>{toPersianNumber(getTotalPrice())} تومان</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>تخفیف:</span>
                    <span>-{toPersianNumber(getDiscount())} تومان</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>هزینه ارسال:</span>
                  <span>
                    {getShippingCost() === 0 ? (
                      <span className="text-green-600 font-bold">رایگان</span>
                    ) : (
                      `${toPersianNumber(getShippingCost())} تومان`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>مبلغ قابل پرداخت:</span>
                  <span>{toPersianNumber(getFinalTotal())} تومان</span>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full mt-6 text-white"
                style={{ backgroundColor: '#B3886D' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    در حال ثبت سفارش...
                  </>
                ) : (
                  "تکمیل خرید"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
