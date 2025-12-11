import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { RotateCcw, CheckCircle, XCircle, Phone } from "lucide-react";

const Returns = () => {
  const acceptedReasons = [
    "کالا دارای عیب فنی یا آسیب‌دیدگی باشد",
    "کالای ارسالی با سفارش شما مغایرت داشته باشد",
    "کالا در حین حمل و نقل آسیب دیده باشد",
    "کالا با توضیحات درج شده در سایت تفاوت داشته باشد"
  ];

  const notAcceptedReasons = [
    "تغییر نظر یا سلیقه پس از دریافت کالا",
    "استفاده شدن از کالا",
    "آسیب‌دیدگی ناشی از استفاده نادرست",
    "گذشتن بیش از ۷ روز از تاریخ دریافت"
  ];

  const steps = [
    "با پشتیبانی فروشگاه تماس بگیرید و مشکل را گزارش دهید.",
    "تصاویر واضح از کالا و عیب مورد نظر ارسال کنید.",
    "پس از تایید، کالا را با بسته‌بندی اصلی برگردانید.",
    "مبلغ پرداختی ظرف ۴۸ ساعت به حساب شما واریز می‌شود."
  ];

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
              رضایت شما برای ما اهمیت دارد. در صورت وجود مشکل در محصول دریافتی، می‌توانید طبق شرایط زیر درخواست بازگشت کالا ثبت کنید.
            </p>
          </div>

          {/* Accepted/Not Accepted */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-green-800">شرایط پذیرش بازگشت</h3>
              </div>
              <ul className="space-y-3">
                {acceptedReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-green-700 text-sm sm:text-base">
                    <span className="text-green-500 mt-1">✓</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text--800">شرایط عدم پذیرش</h3>
              </div>
              <ul className="space-y-3">
                {notAcceptedReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-700 text-sm sm:text-base">
                    <span className="text-red-500 mt-1">✗</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Return Steps */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">مراحل بازگشت کالا:</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact for Returns */}
          <div className="bg-accent/50 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center sm:text-right">
              <h4 className="font-bold text-foreground mb-1">برای ثبت درخواست بازگشت:</h4>
              <p className="text-muted-foreground text-sm sm:text-base">
                با شماره <span className="font-bold text-primary ltr inline-block">۰۹۳۸۱۸۹۵۶۸۱</span> تماس بگیرید یا از طریق تلگرام پیام دهید.
              </p>
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
