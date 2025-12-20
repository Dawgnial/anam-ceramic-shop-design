import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Search, ShoppingCart, CreditCard, Truck, Package, MapPin, RotateCcw, Headphones } from "lucide-react";

const BuyingGuide = () => {
  const steps = [
    {
      icon: Search,
      number: "۱",
      title: "انتخاب محصول",
      items: [
        "از دسته‌بندی‌ها یا جستجو استفاده کنید.",
        "داخل صفحه هر محصول، توضیحات، ابعاد، تصاویر و موجودی نمایش داده می‌شود.",
        "محصول مورد نظر را به سبد خرید اضافه کنید."
      ]
    },
    {
      icon: ShoppingCart,
      number: "۲",
      title: "ثبت سفارش",
      items: [
        "وارد سبد خرید شوید و کالاها را بررسی کنید.",
        "روی «تسویه حساب» بزنید.",
        "اطلاعات نام، شماره تماس، آدرس و کدپستی را وارد کنید.",
        "در صورت نیاز، توضیحات خود را در بخش «یادداشت سفارش» ثبت کنید."
      ]
    },
    {
      icon: CreditCard,
      number: "۳",
      title: "روش‌های پرداخت",
      items: [
        "پرداخت آنلاین از طریق درگاه امن زرین‌پال",
        "پشتیبانی از کارت‌های عضو شتاب",
        "پس از پرداخت، فاکتور به‌صورت فایل قابل دانلود در حساب کاربری/صفحه سفارش شما قرار می‌گیرد (پیامکی ارسال نمی‌شود).",
        "ممکن است پیامک از طرف شرکت پستی برای اطلاع‌رسانی ارسال شود."
      ]
    },
    {
      icon: Truck,
      number: "۴",
      title: "ارسال سفارش",
      items: [
        "ارسال به سراسر کشور با پست یا تیپاکس",
        "بسته‌بندی امن مخصوص محصولات سفالی و سرامیکی",
        "زمان تحویل: معمولاً ۲ تا ۵ روز کاری بسته به مقصد"
      ]
    },
    {
      icon: MapPin,
      number: "۵",
      title: "پیگیری سفارش",
      items: [
        "کد رهگیری پست/تیپاکس برای شما در صفحه سفارش قرار می‌گیرد.",
        "از طریق بخش «پیگیری سفارش» نیز قابل مشاهده است."
      ]
    },
    {
      icon: RotateCcw,
      number: "۶",
      title: "تعویض و مرجوعی",
      items: [
        "در صورت آسیب‌دیدگی محصول در حمل‌ونقل، تا ۲۴ ساعت پس از تحویل عکس ارسال کنید تا تعویض یا بازگشت وجه انجام شود.",
        "محصولات سفارشی قابل مرجوعی نیستند."
      ]
    },
    {
      icon: Headphones,
      number: "۷",
      title: "پشتیبانی",
      items: [
        "پشتیبانی از طریق تلگرام و ایتا",
        "لینک‌های پشتیبانی در صفحه تماس با ما قرار دارد.",
        "ساعات پاسخ‌گویی: هر روز ۹ تا ۱۸"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-black">راهنمای خرید</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="text-center space-y-4 mb-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">راهنمای خرید از فروشگاه آنام</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              با دنبال کردن مراحل زیر می‌توانید به راحتی سفارش خود را ثبت و پیگیری کنید.
            </p>
          </div>
          
          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">{step.title}</h3>
                    <ul className="space-y-2">
                      {step.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground text-sm sm:text-base">
                          <span className="text-primary mt-1.5">•</span>
                          <span className="text-justify">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a 
              href="/shop" 
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl p-4 hover:bg-primary/90 transition-colors font-medium"
            >
              <Package className="w-5 h-5" />
              مشاهده محصولات
            </a>
            <a 
              href="/shipping-method" 
              className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl p-4 hover:bg-secondary/80 transition-colors font-medium"
            >
              <Truck className="w-5 h-5" />
              شیوه ارسال
            </a>
            <a 
              href="/returns" 
              className="flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-xl p-4 hover:bg-accent/80 transition-colors font-medium"
            >
              <RotateCcw className="w-5 h-5" />
              بازگشت کالا
            </a>
          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default BuyingGuide;
