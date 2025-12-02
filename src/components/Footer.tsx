import { Link } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-[#896A59] text-white py-10 sm:py-12 md:py-16 lg:py-[75px]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Column 1: Logo & Description */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <img src={logo} alt="آنام" className="h-12 sm:h-14 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm leading-relaxed text-white/90 font-light">
              فروشگاه آنلاین آنام، با سابقه 10 ساله در تولید و عرضه محصولات سفالین آماده فروش ظروف سفالی و سرامیکی به سراسر کشور است.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://t.me/anam_zrof" target="_blank" rel="noopener noreferrer" className="hover:text-[#B3886D] transition-colors">
                <Send className="h-5 w-5" />
              </a>
              <a href="https://eitaa.com/joinchat/4204593409Cccb167f053" target="_blank" rel="noopener noreferrer" className="hover:text-[#B3886D] transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://basalam.com/caren_product" target="_blank" rel="noopener noreferrer" className="hover:text-[#B3886D] transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-5">دسترسی سریع</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link to="/" className="text-sm hover:text-[#B3886D] transition-colors font-light">صفحه اصلی</Link></li>
              <li><Link to="/about" className="text-sm hover:text-[#B3886D] transition-colors font-light">درباره ما</Link></li>
              <li><Link to="/blog" className="text-sm hover:text-[#B3886D] transition-colors font-light">بلاگ</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-[#B3886D] transition-colors font-light">ارتباط با ما</Link></li>
              <li><Link to="/store-rules" className="text-sm hover:text-[#B3886D] transition-colors font-light">قوانین فروشگاه</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-5">خدمات مشتریان</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="/faq" className="text-sm hover:text-[#B3886D] transition-colors font-light">پرسش های متداول</a></li>
              <li><a href="/buying-guide" className="text-sm hover:text-[#B3886D] transition-colors font-light">راهنمای خرید</a></li>
              <li><a href="/shipping" className="text-sm hover:text-[#B3886D] transition-colors font-light">شیوه ارسال</a></li>
              <li><a href="/size-guide" className="text-sm hover:text-[#B3886D] transition-colors font-light">راهنمای اندازه ها</a></li>
              <li><a href="/returns" className="text-sm hover:text-[#B3886D] transition-colors font-light">بازگشت کالا</a></li>
            </ul>
          </div>

          {/* Column 4: Enamad Badge */}
          <div className="flex flex-col items-center justify-start col-span-2 md:col-span-1">
            <a 
              referrerPolicy="origin" 
              target="_blank" 
              href="https://trustseal.enamad.ir/?id=5056189&Code=VeD89YSVDG3yaKZ7tLZH0DnCY8CofFM1"
            >
              <img 
                referrerPolicy="origin" 
                src="https://trustseal.enamad.ir/logo.aspx?id=5056189&Code=VeD89YSVDG3yaKZ7tLZH0DnCY8CofFM1" 
                alt="نماد اعتماد الکترونیکی" 
                className="cursor-pointer max-w-[120px]"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
