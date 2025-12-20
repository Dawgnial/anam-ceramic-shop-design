import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Ruler, Info, HelpCircle, MessageCircle, ArrowUp, Circle } from "lucide-react";

const SizeGuide = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-black">راهنمای اندازه‌ها</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Intro */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Ruler className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto text-justify">
              در این صفحه می‌توانید ابعاد دقیق محصولات آنام را مشاهده کنید تا هنگام سفارش، انتخابی مطمئن و درست داشته باشید.
              تمام اندازه‌ها با دقت بالا ثبت شده‌اند، اما به دلیل فرایند تولید دستی سفال و سرامیک ممکن است بین ۳ تا ۵ میلی‌متر اختلاف جزئی وجود داشته باشد.
            </p>
          </div>

          {/* Why Size Difference */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-800 mb-2 text-lg">چرا اختلاف اندازه طبیعی است؟</h3>
                <p className="text-amber-700 text-sm sm:text-base leading-relaxed text-justify">
                  محصولات آنام، تولید دستی هستند و فرایندهایی مثل فرم‌دهی، خشک شدن و پخت در کوره باعث تغییرات بسیار جزئی در ابعاد می‌شود.
                  این موارد کاملاً طبیعی و قابل قبول در استاندارد تولید سفال و سرامیک است.
                </p>
              </div>
            </div>
          </div>

          {/* Measurement Standards */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">استاندارد اندازه‌گیری محصولات</h3>
            <p className="text-muted-foreground mb-6">برای یک‌دست بودن اطلاعات، همه اندازه‌ها بر اساس موارد زیر ثبت می‌شوند:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Circle className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-foreground mb-2">قطر (Ø)</h4>
                <p className="text-muted-foreground text-sm">اندازه‌ی دهانهٔ ظرف در پهن‌ترین بخش.</p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <ArrowUp className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-foreground mb-2">ارتفاع (H)</h4>
                <p className="text-muted-foreground text-sm">فاصلهٔ کف ظرف تا لبهٔ بالایی.</p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Ruler className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-foreground mb-2">حجم (در صورت نیاز)</h4>
                <p className="text-muted-foreground text-sm">فقط برای ظروف مایع یا آجیل/پاستا و... حجم بر اساس ظرفیت واقعی اندازه‌گیری شده است.</p>
              </div>
            </div>
          </div>

          {/* How to Measure */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">نحوه اندازه‌گیری توسط کاربر</h3>
            <p className="text-muted-foreground mb-4">اگر می‌خواهید اندازهٔ ظرفی مشابه را با محصول آنام مقایسه کنید:</p>
            
            <div className="space-y-3">
              {[
                "قطر را از لبه خارجی تا لبه خارجی اندازه بگیرید.",
                "ارتفاع را بدون در نظر گرفتن درب (در صورت وجود) اندازه بگیرید.",
                "برای حجم، ظرف را تا لبه پُر کرده و مقدار آب را اندازه بگیرید."
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground pt-0.5">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Tips */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              نکات مهم هنگام انتخاب اندازه
            </h3>
            
            <ul className="space-y-3">
              {[
                "ابعاد محصولات داخل صفحه هر محصول درج شده‌اند.",
                "تصاویر ممکن است نسبت به اندازه واقعی بزرگ‌تر یا کوچک‌تر دیده شوند—ملاک نهایی اعداد هستند.",
                "اگر بین دو سایز شک دارید، همیشه سایز بزرگ‌تر انتخاب منطقی‌تری است.",
                "برای ست‌های چندتایی، ابعاد هر قطعه جداگانه نوشته شده است."
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center sm:text-right flex-1">
                <h4 className="font-bold text-foreground mb-2 text-lg">در صورت نیاز به کمک بیشتر</h4>
                <p className="text-muted-foreground text-sm sm:text-base">
                  برای انتخاب اندازه مناسب می‌توانید از طریق تلگرام یا ایتا با پشتیبانی تماس بگیرید و ابعاد مورد نظر را بپرسید. تصاویر واقعی و اندازه دقیق برایتان ارسال می‌شود.
                </p>
              </div>
              <div className="flex gap-3">
                <a 
                  href="https://t.me/Maso681" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  تلگرام
                </a>
                <a 
                  href="https://eitaa.com/anam_zrof" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm"
                >
                  ایتا
                </a>
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

export default SizeGuide;
