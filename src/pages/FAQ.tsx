import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { HelpCircle, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageSEO from "@/components/seo/PageSEO";
import FAQSchema from "@/components/seo/FAQSchema";
import StructuredData from "@/components/seo/StructuredData";

const FAQ = () => {
  const faqs = [
    {
      question: "آیا تمام محصولات شما سرامیکی هستند؟",
      answer: "بله. تمامی محصولات فروشگاه آنام کاملاً سرامیکی بوده و با کیفیت بالا تولید و لعاب‌کاری شده‌اند."
    },
    {
      question: "آیا امکان مشاهده‌ی تصاویر واقعی محصول وجود دارد؟",
      answer: "بله، تمام عکس‌ها واقعی هستند و از نمونه‌های موجود در انبار گرفته شده‌اند. رنگ و بافت محصول با عکس‌ها تطابق دارد."
    },
    {
      question: "ارسال سفارش چقدر طول می‌کشد؟",
      answer: "سفارش‌ها معمولا بین ۲۴ تا ۷۲ ساعت پردازش و ارسال می‌شوند. زمان تحویل بسته به شهر شما متفاوت است."
    },
    {
      question: "آیا امکان پرداخت آنلاین امن وجود دارد؟",
      answer: "بله، پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود و کاملاً امن و تاییدشده است."
    },
    {
      question: "آیا می‌توان سفارش را لغو یا مرجوع کرد؟",
      answer: "تا قبل از ارسال، امکان لغو سفارش وجود دارد. برای مرجوعی، محصول باید استفاده‌نشده و سالم باشد."
    },
    {
      question: "آیا امکان خرید عمده وجود دارد؟",
      answer: "بله، برای خرید عمده یا سفارش‌های اختصاصی می‌توانید از طریق تلگرام یا ایتا با ما در تماس باشید."
    },
    {
      question: "قیمت‌ها ثابت هستند یا ممکن است تغییر کنند؟",
      answer: "قیمت‌ها بر اساس هزینه تولید و مواد اولیه به‌روز می‌شوند، اما سعی می‌کنیم قیمت نهایی برای مشتری کاملاً منصفانه باشد."
    }
  ];

  const breadcrumbItems = [
    { name: 'خانه', url: 'https://anamzoroof.ir/' },
    { name: 'پرسش‌های متداول', url: 'https://anamzoroof.ir/faq' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PageSEO
        title="پرسش‌های متداول"
        description="پاسخ سوالات رایج درباره خرید ظروف سرامیکی، ارسال سفارش، پرداخت آنلاین و مرجوعی کالا در فروشگاه آنام."
        canonicalUrl="https://anamzoroof.ir/faq"
        keywords="سوالات متداول آنام، راهنمای خرید سرامیک، پشتیبانی فروشگاه آنام"
      />
      <FAQSchema faqs={faqs} />
      <StructuredData type="BreadcrumbList" items={breadcrumbItems} />
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-black">پرسش‌های متداول</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Intro */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              پاسخ سوالات رایج مشتریان را در این صفحه بخوانید. اگر پاسخ سوال خود را پیدا نکردید، از طریق پشتیبانی با ما در ارتباط باشید.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-xl px-5 bg-card hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-right text-base sm:text-lg font-medium hover:no-underline py-5">
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                      {index + 1}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed text-justify pb-5 pr-11">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 border border-primary/20">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center sm:text-right flex-1">
              <h4 className="font-bold text-foreground mb-2 text-lg">سوال دیگری دارید؟</h4>
              <p className="text-muted-foreground text-sm sm:text-base">
                از طریق تلگرام یا ایتا با پشتیبانی تماس بگیرید. ساعات پاسخ‌گویی: هر روز ۹ تا ۱۸
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

      <Footer />
      <BackToTop />
    </div>
  );
};

export default FAQ;
