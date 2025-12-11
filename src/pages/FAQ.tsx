import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "زمان ارسال سفارش چقدر است؟",
      answer: "برای شهر مشهد ارسال سفارشات بین ۱ تا ۳ ساعت از طریق اسنپ انجام می‌شود. برای سایر شهرها، ارسال سفارشات بین ۱ تا ۷ روز کاری انجام می‌شود."
    },
    {
      question: "هزینه ارسال چگونه محاسبه می‌شود؟",
      answer: "هزینه ارسال بر اساس استان مقصد محاسبه می‌شود. شما می‌توانید در صفحه تسویه حساب، استان خود را انتخاب کنید و هزینه ارسال به صورت خودکار محاسبه خواهد شد."
    },
    {
      question: "آیا امکان بازگشت کالا وجود دارد؟",
      answer: "بله، در صورتی که کالا دارای عیب یا آسیب باشد، می‌توانید ظرف ۷ روز از تاریخ دریافت، درخواست بازگشت کالا را ثبت کنید. لطفاً قبل از باز کردن بسته‌بندی، از سالم بودن کالا اطمینان حاصل کنید."
    },
    {
      question: "روش‌های پرداخت چیست؟",
      answer: "پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود. شما می‌توانید با کارت‌های عضو شبکه شتاب پرداخت خود را انجام دهید."
    },
    {
      question: "آیا محصولات گارانتی دارند؟",
      answer: "محصولات ما دست‌ساز و با کیفیت بالا هستند. در صورت وجود هرگونه عیب فنی در محصول، تا ۷ روز پس از دریافت امکان تعویض وجود دارد."
    },
    {
      question: "چگونه می‌توانم سفارش خود را پیگیری کنم؟",
      answer: "پس از ثبت سفارش و پرداخت، می‌توانید از طریق پروفایل کاربری خود وضعیت سفارش را مشاهده کنید. همچنین پس از ارسال، کد رهگیری برای شما ارسال خواهد شد."
    },
    {
      question: "آیا امکان خرید عمده وجود دارد؟",
      answer: "بله، برای خرید عمده با ما از طریق صفحه تماس با ما ارتباط برقرار کنید تا شرایط ویژه برای شما ارائه شود."
    },
    {
      question: "محصولات قابل شستشو در ماشین ظرفشویی هستند؟",
      answer: "برخی از محصولات سرامیکی قابل شستشو در ماشین ظرفشویی هستند، اما توصیه می‌شود برای حفظ کیفیت و ماندگاری طرح‌ها، محصولات را با دست بشویید."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">پرسش‌های متداول</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="text-right text-base sm:text-lg font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed text-justify">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default FAQ;
