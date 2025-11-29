import { MessageCircle, Send } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-footer text-white h-[345px] flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Column 1: Logo & Description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">آنام</h3>
            <p className="text-sm leading-relaxed text-white/90">
              فروشگاه آنلاین آنام، با سابقه 10 ساله در تولید و عرضه محصولات سفالین آماده فروش ظروف سفالی و سرامیکی به سراسر کشور است.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://t.me/anam_zrof" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Send className="h-5 w-5" />
              </a>
              <a href="https://eitaa.com/joinchat/4204593409Cccb167f053" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://basalam.com/caren_product" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm hover:text-primary transition-colors">صفحه اصلی</a></li>
              <li><a href="/about" className="text-sm hover:text-primary transition-colors">درباره ما</a></li>
              <li><a href="/blog" className="text-sm hover:text-primary transition-colors">بلاگ</a></li>
              <li><a href="/contact" className="text-sm hover:text-primary transition-colors">ارتباط با ما</a></li>
              <li><a href="/store-rules" className="text-sm hover:text-primary transition-colors">قوانین فروشگاه</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-lg font-bold mb-4">خدمات مشتریان</h4>
            <ul className="space-y-2">
              <li><a href="/faq" className="text-sm hover:text-primary transition-colors">پرسش های متداول</a></li>
              <li><a href="/buying-guide" className="text-sm hover:text-primary transition-colors">راهنمای خرید</a></li>
              <li><a href="/shipping" className="text-sm hover:text-primary transition-colors">شیوه ارسال</a></li>
              <li><a href="/size-guide" className="text-sm hover:text-primary transition-colors">راهنمای اندازه ها</a></li>
              <li><a href="/returns" className="text-sm hover:text-primary transition-colors">بازگشت کالا</a></li>
            </ul>
          </div>

          {/* Column 4: Enamad Badge */}
          <div className="flex flex-col items-center justify-start">
            <a 
              referrerPolicy="origin" 
              target="_blank" 
              href="https://trustseal.enamad.ir/?id=5056189&Code=VeD89YSVDG3yaKZ7tLZH0DnCY8CofFM1"
            >
              <img 
                referrerPolicy="origin" 
                src="https://trustseal.enamad.ir/logo.aspx?id=5056189&Code=VeD89YSVDG3yaKZ7tLZH0DnCY8CofFM1" 
                alt="نماد اعتماد الکترونیکی" 
                className="cursor-pointer"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
