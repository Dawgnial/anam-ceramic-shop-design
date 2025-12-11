import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { ShoppingCart, CreditCard, Truck, CheckCircle } from "lucide-react";

const BuyingGuide = () => {
  const steps = [
    {
      icon: ShoppingCart,
      title: "انتخاب محصول",
      description: "محصول مورد نظر خود را از فروشگاه انتخاب کنید و به سبد خرید اضافه نمایید. می‌توانید تعداد محصولات را تغییر دهید یا محصولات دیگر را نیز اضافه کنید."
    },
    {
      icon: CreditCard,
      title: "تکمیل اطلاعات و پرداخت",
      description: "اطلاعات ارسال شامل نام، آدرس و شماره تماس را وارد کنید. سپس از طریق درگاه امن زرین‌پال پرداخت را انجام دهید."
    },
    {
      icon: Truck,
      title: "ارسال سفارش",
      description: "پس از تایید پرداخت، سفارش شما آماده‌سازی و ارسال می‌شود. کد رهگیری برای پیگیری مرسوله به شما ارسال خواهد شد."
    },
    {
      icon: CheckCircle,
      title: "دریافت سفارش",
      description: "سفارش خود را در آدرس تعیین شده دریافت کنید. لطفاً قبل از تحویل گرفتن، بسته‌بندی را بررسی نمایید."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">راهنمای خرید</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-foreground text-center mb-8 sm:mb-12 text-base sm:text-lg">
            خرید از فروشگاه آنام بسیار ساده است. با دنبال کردن مراحل زیر می‌توانید به راحتی سفارش خود را ثبت کنید.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed text-justify">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 bg-accent/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">نکات مهم:</h3>
            <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
              <li>• قبل از تکمیل خرید، اطلاعات سفارش خود را بررسی کنید.</li>
              <li>• آدرس و شماره تماس را به صورت دقیق وارد نمایید.</li>
              <li>• در صورت بروز هرگونه مشکل، با پشتیبانی تماس بگیرید.</li>
              <li>• فاکتور خرید را تا زمان دریافت کالا نزد خود نگه دارید.</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default BuyingGuide;
