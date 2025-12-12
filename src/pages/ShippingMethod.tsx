import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Truck, Clock, MapPin, Package, Shield, Box, CreditCard, Search } from "lucide-react";

const ShippingMethod = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">شیوه ارسال</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Intro */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">شیوه ارسال سفارش‌ها</h2>
          </div>

          {/* Section 1: Shipping Methods */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">۱</span>
              روش‌های ارسال
            </h3>
            <p className="text-muted-foreground mb-4">سفارش‌های فروشگاه آنام از طریق یکی از روش‌های زیر ارسال می‌شوند:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-blue-800">پست پیشتاز</h4>
                </div>
                <p className="text-blue-700 text-sm">مناسب ارسال به تمام شهرها با زمان تحویل ۲ تا ۵ روز کاری.</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-bold text-green-800">تیپاکس</h4>
                </div>
                <p className="text-green-700 text-sm">سریع‌تر از پست، مناسب شهرهای بزرگ و مراکز استان.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Processing Time */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">۲</span>
              زمان آماده‌سازی سفارش
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>پس از ثبت سفارش، بسته‌ها طی ۱ تا ۲ روز کاری آماده ارسال می‌شوند.</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>بسته‌بندی محصولات کاملاً ایمن بوده و مخصوص ظروف سرامیکی طراحی شده است.</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Safe Packaging */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">۳</span>
              بسته‌بندی امن
            </h3>
            <p className="text-muted-foreground mb-4">برای جلوگیری از آسیب‌دیدگی:</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Box, text: "کارتن ضخیم" },
                { icon: Shield, text: "ضربه‌گیر چندلایه" },
                { icon: Package, text: "جداسازی کامل قطعات" },
                { icon: Shield, text: "تست مقاومت بسته" }
              ].map((item, index) => (
                <div key={index} className="bg-accent/50 rounded-lg p-4 text-center">
                  <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <span className="text-sm text-foreground font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                در صورت بروز آسیب در مسیر حمل، سفارش تعویض یا مبلغ آن بازگشت داده می‌شود.
              </p>
            </div>
          </div>

          {/* Section 4: Shipping Cost */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">۴</span>
              هزینه ارسال
            </h3>
            <p className="text-muted-foreground mb-3">هزینه ارسال بر اساس:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">وزن بسته</span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">مقصد</span>
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">روش ارسال</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-5 h-5 text-primary" />
              <span>به‌صورت خودکار در مرحله پرداخت محاسبه و نمایش داده می‌شود.</span>
            </div>
          </div>

          {/* Section 5: Order Tracking */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">۵</span>
              پیگیری سفارش
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Search className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>پس از ارسال، کد رهگیری پست یا تیپاکس در صفحه سفارش قرار می‌گیرد.</span>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>همچنین ممکن است پیامک رهگیری توسط شرکت حمل‌ونقل ارسال شود.</span>
              </li>
            </ul>
          </div>

          {/* Section 6: Coverage */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">۶</span>
                محدوده ارسال
              </h3>
              <p className="text-muted-foreground">ارسال به تمام نقاط کشور امکان‌پذیر است.</p>
            </div>
          </div>

        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default ShippingMethod;
