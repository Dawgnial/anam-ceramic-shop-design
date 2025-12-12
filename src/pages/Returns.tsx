import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { RotateCcw, AlertTriangle, CheckCircle, XCircle, Camera, Package, Clock, CreditCard, Truck, MessageCircle } from "lucide-react";

const Returns = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">بازگشت کالا</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Intro */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <RotateCcw className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              هدف ما تحویل محصول سالم و بدون نقص است. اگر مشکلی در سفارش وجود داشته باشد، امکان بازگشت کالا طبق شرایط زیر وجود دارد.
            </p>
          </div>

          {/* Condition 1: Damage in Transport */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-3">۱) آسیب‌دیدگی در حمل‌ونقل</h3>
                <p className="text-muted-foreground mb-4">اگر محصول در مسیر ارسال آسیب دیده باشد:</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>حداکثر <strong className="text-foreground">۲۴ ساعت</strong> بعد از تحویل</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Camera className="w-4 h-4 text-primary" />
                    <span>عکس و فیلم واضح از آسیب را ارسال کنید</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>محصول بدون هزینه برای شما جایگزین می‌شود یا مبلغ آن بازپرداخت می‌شود</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-sm">
                    <strong>توجه:</strong> بسته‌های شکسته‌شده بدون مستند (عکس/فیلم) قابل بررسی نیست.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Condition 2: Product Mismatch */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-3">۲) مغایرت در محصول</h3>
                <p className="text-muted-foreground mb-4">اگر محصول ارسالی با سفارش شما مغایرت داشته باشد:</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>حداکثر <strong className="text-foreground">۳ روز</strong> بعد از تحویل</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Camera className="w-4 h-4 text-primary" />
                    <span>عکس از محصول دریافت‌شده</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>محصول تعویض می‌شود یا هزینه آن بازگشت داده می‌شود</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Condition 3: Minor Differences */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">۳</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-800 mb-3">تفاوت جزئی در طرح و اندازه</h3>
                <p className="text-blue-700 mb-4">
                  محصولات آنام کاملاً دست‌ساز هستند. به همین دلیل اختلاف جزئی در موارد زیر طبیعی و قابل قبول است:
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">بافت</span>
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">رنگ</span>
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">اندازه (۳ تا ۵ میلی‌متر)</span>
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">جزئیات طرح</span>
                </div>

                <p className="text-blue-700 font-medium">این موارد شامل بازگشت کالا نمی‌شود.</p>
              </div>
            </div>
          </div>

          {/* Condition 4: Regret */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-3">۴) انصراف از خرید</h3>
                <p className="text-muted-foreground">
                  به دلیل ماهیت محصولات دست‌ساز، سفارشی‌سازی و ساخت تکی، امکان بازگشت کالا به دلیل "عدم پسندیدن" وجود ندارد.
                </p>
              </div>
            </div>
          </div>

          {/* How to Request Return */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">نحوه ثبت درخواست بازگشت</h3>
            <p className="text-muted-foreground mb-4">برای ثبت درخواست کافی است:</p>
            
            <div className="space-y-3 mb-6">
              {[
                "شماره سفارش را اعلام کنید",
                "عکس یا فیلم مشکل را ارسال کنید",
                "نوع درخواست خود را مشخص کنید (تعویض یا بازگشت وجه)"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a 
                href="https://t.me/Maso681" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                پشتیبانی تلگرام
              </a>
              <a 
                href="https://eitaa.com/anam_zrof" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                پشتیبانی ایتا
              </a>
            </div>
          </div>

          {/* Refund Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-green-800">بازگشت وجه</h4>
              </div>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• پس از تأیید مشکل، حداکثر طی ۲۴ تا ۷۲ ساعت انجام می‌شود.</li>
                <li>• مبلغ فقط به حسابی که با آن پرداخت شده، برگشت داده می‌شود.</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-800">هزینه ارسال</h4>
              </div>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li>• در موارد آسیب‌دیدگی یا مغایرت ← تمام هزینه‌ها با آنام است.</li>
                <li>• در موارد خارج از این دو مورد ← بازگشت ممکن نیست.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Returns;
