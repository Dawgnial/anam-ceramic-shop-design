import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Truck, Clock, MapPin, Package } from "lucide-react";

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
          
          {/* Shipping Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground">ارسال فوری (مشهد)</h3>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                برای شهر مشهد، ارسال سفارشات از طریق اسنپ انجام می‌شود و معمولاً بین ۱ تا ۳ ساعت پس از تایید سفارش، کالا به دست شما می‌رسد.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground">ارسال پستی (سایر شهرها)</h3>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                برای سایر شهرها، ارسال از طریق پست پیشتاز یا تیپاکس انجام می‌شود. زمان تحویل بین ۱ تا ۷ روز کاری متغیر است.
              </p>
            </div>
          </div>

          {/* Shipping Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-accent/50 rounded-xl p-5 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">زمان ارسال</h4>
              <p className="text-muted-foreground text-sm">۱ تا ۷ روز کاری</p>
            </div>
            <div className="bg-accent/50 rounded-xl p-5 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">پوشش سراسری</h4>
              <p className="text-muted-foreground text-sm">ارسال به تمام نقاط ایران</p>
            </div>
            <div className="bg-accent/50 rounded-xl p-5 text-center">
              <Package className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">بسته‌بندی ایمن</h4>
              <p className="text-muted-foreground text-sm">بسته‌بندی مقاوم و محافظ</p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">نکات مهم درباره ارسال:</h3>
            <ul className="space-y-3 text-muted-foreground text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                هزینه ارسال بر اساس استان مقصد در صفحه تسویه حساب محاسبه می‌شود.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                محصولات با بسته‌بندی ویژه و مقاوم ارسال می‌شوند تا از آسیب جلوگیری شود.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                پس از ارسال، کد رهگیری مرسوله برای شما ارسال خواهد شد.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                ساعت تحویل کالا از ۹ صبح تا ۵ عصر می‌باشد.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                لطفاً هنگام تحویل، بسته‌بندی کالا را قبل از امضای رسید بررسی کنید.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default ShippingMethod;
