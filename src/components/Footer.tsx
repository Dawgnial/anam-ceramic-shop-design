import { MessageCircle, Send, MapPin, Clock, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-footer text-white py-8 sm:py-10 md:py-12 lg:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
          {/* Column 1: Logo & Description */}
          <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold">آنام</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-white/90">
              فروشگاه آنلاین آنام با سابقه ۱۰ ساله در تولید و عرضه محصولات سرامیکی، آماده فروش انواع ظروف سرامیکی به سراسر کشور است.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://t.me/anam_zrof" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="https://eitaa.com/joinchat/4204593409Cccb167f053" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="https://basalam.com/caren_product" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">دسترسی سریع</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li><Link to="/" className="text-xs sm:text-sm hover:text-primary transition-colors">صفحه اصلی</Link></li>
              <li><Link to="/about" className="text-xs sm:text-sm hover:text-primary transition-colors">درباره ما</Link></li>
              <li><Link to="/blog" className="text-xs sm:text-sm hover:text-primary transition-colors">بلاگ</Link></li>
              <li><Link to="/contact" className="text-xs sm:text-sm hover:text-primary transition-colors">ارتباط با ما</Link></li>
              <li><Link to="/store-rules" className="text-xs sm:text-sm hover:text-primary transition-colors">قوانین فروشگاه</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">خدمات مشتریان</h4>
            <ul className="space-y-1 sm:space-y-2">
              <li><Link to="/faq" className="text-xs sm:text-sm hover:text-primary transition-colors">پرسش های متداول</Link></li>
              <li><Link to="/buying-guide" className="text-xs sm:text-sm hover:text-primary transition-colors">راهنمای خرید</Link></li>
              <li><Link to="/shipping-method" className="text-xs sm:text-sm hover:text-primary transition-colors">شیوه ارسال</Link></li>
              <li><Link to="/size-guide" className="text-xs sm:text-sm hover:text-primary transition-colors">راهنمای اندازه ها</Link></li>
              <li><Link to="/returns" className="text-xs sm:text-sm hover:text-primary transition-colors">بازگشت کالا</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">تماس با ما</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm leading-relaxed text-white/90">
                  خراسان رضوی، مشهد، خیابان نامجو ۱۷، محسن نژاد ۱
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-white/90">
                  هر روز از ساعت ۹ تا ۱۸
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <a href="tel:+989381895681" className="text-xs sm:text-sm text-white/90 hover:text-primary transition-colors" dir="ltr">
                  +۹۸۹۳۸۱۸۹۵۶۸۱
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <a href="mailto:AnamZoroof@gmail.com" className="text-xs sm:text-sm text-white/90 hover:text-primary transition-colors">
                  AnamZoroof@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Enamad Badge */}
          <div className="flex flex-col items-center justify-center col-span-2 md:col-span-1 mt-4 md:mt-0">
            <a referrerPolicy="origin" target="_blank" href="https://trustseal.enamad.ir/?id=5056189&Code=VeD89YSVDG3yaKZ7tLZH0DnCY8CofFM1">
              <img referrerPolicy="origin" src="https://trustseal.enamad.ir/logo.aspx?id=5056189&Code=VeD89YSVDG3yaKZ7tLZH0DnCY8CofFM1" alt="نماد اعتماد الکترونیکی" className="cursor-pointer max-w-[120px] sm:max-w-[150px]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
