import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Ruler, Info } from "lucide-react";

const SizeGuide = () => {
  const sizeCategories = [
    {
      title: "فنجان و ماگ",
      items: [
        { name: "فنجان اسپرسو", height: "۵-۶", diameter: "۵-۶", capacity: "۶۰-۹۰" },
        { name: "فنجان چای", height: "۶-۸", diameter: "۷-۹", capacity: "۱۵۰-۲۰۰" },
        { name: "ماگ متوسط", height: "۹-۱۰", diameter: "۸-۹", capacity: "۲۵۰-۳۰۰" },
        { name: "ماگ بزرگ", height: "۱۰-۱۲", diameter: "۹-۱۰", capacity: "۳۵۰-۴۵۰" },
      ]
    },
    {
      title: "بشقاب",
      items: [
        { name: "بشقاب دسر", height: "۲-۳", diameter: "۱۵-۱۸", capacity: "-" },
        { name: "بشقاب غذاخوری", height: "۲-۳", diameter: "۲۴-۲۸", capacity: "-" },
        { name: "بشقاب سرو", height: "۳-۴", diameter: "۳۰-۳۵", capacity: "-" },
        { name: "دیس بزرگ", height: "۴-۵", diameter: "۳۵-۴۵", capacity: "-" },
      ]
    },
    {
      title: "کاسه",
      items: [
        { name: "کاسه کوچک", height: "۵-۷", diameter: "۱۰-۱۲", capacity: "۲۰۰-۳۰۰" },
        { name: "کاسه سوپ", height: "۷-۹", diameter: "۱۴-۱۶", capacity: "۴۰۰-۵۰۰" },
        { name: "کاسه سالاد", height: "۸-۱۰", diameter: "۱۸-۲۲", capacity: "۸۰۰-۱۰۰۰" },
        { name: "کاسه بزرگ سرو", height: "۱۰-۱۲", diameter: "۲۵-۳۰", capacity: "۱۵۰۰-۲۰۰۰" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">راهنمای اندازه‌ها</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Intro */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Ruler className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              برای انتخاب بهتر محصولات، اندازه‌های استاندارد ظروف سرامیکی را در جدول زیر مشاهده کنید. تمام اندازه‌ها تقریبی هستند و ممکن است بسته به طراحی محصول کمی متفاوت باشند.
            </p>
          </div>

          {/* Size Tables */}
          {sizeCategories.map((category, catIndex) => (
            <div key={catIndex} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-primary/10 px-6 py-4">
                <h3 className="text-lg font-bold text-foreground">{category.title}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent/50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">نوع محصول</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">ارتفاع (سانتی‌متر)</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">قطر (سانتی‌متر)</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">ظرفیت (میلی‌لیتر)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-t border-border hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3 text-right text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.height}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.diameter}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{item.capacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
            <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-amber-800 mb-2">توجه:</h4>
              <p className="text-amber-700 text-sm sm:text-base leading-relaxed">
                از آنجا که محصولات ما دست‌ساز هستند، ممکن است اندازه‌های واقعی با جدول فوق تفاوت جزئی داشته باشند. برای اطلاع از اندازه دقیق هر محصول، به صفحه جزئیات آن محصول مراجعه کنید.
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

export default SizeGuide;
