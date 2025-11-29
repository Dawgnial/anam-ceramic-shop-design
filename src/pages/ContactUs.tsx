import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MapPin, MessageSquare, Send } from "lucide-react";

const ContactUs = () => {
  const faqs = [
    {
      question: "زمان ارسال محصولات چقدر است؟",
      answer: "مشهد: سفارش‌ها حداکثر ظرف ۱ تا ۳ ساعت پس از پرداخت، از طریق اسنپ و به‌عهده مشتری ارسال می‌گردد. سایر شهرها: سفارش‌ها طی ۱ تا ۷ روز کاری پس از پرداخت فاکتور ارسال خواهند شد."
    },
    {
      question: "هزینه ارسال چقدر است؟",
      answer: "هزینه ارسال سفارش بر اساس موقعیت جغرافیایی، تعداد بسته‌ها و وزن کالا توسط شرکت‌های حمل‌ونقل (مانند تیپاکس یا چاپار) محاسبه می‌شود. به همین دلیل فروشگاه امکان اعلام مبلغ دقیق پیش از ارسال را ندارد."
    }
  ];

  const contactMethods = [
    {
      icon: Send,
      label: "تلگرام",
      value: "https://t.me/Maso681",
      link: true
    },
    {
      icon: MessageSquare,
      label: "ارسال پیامک",
      value: "۰۹۳۸۱۸۹۵۶۸۱",
      link: false
    },
    {
      icon: Phone,
      label: "تماس تلفنی",
      value: "۰۹۳۸۱۸۹۵۶۸۱",
      link: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      
      {/* Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">ارتباط با ما</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          
          {/* Right Side - Contact Methods Card */}
          <div className="order-1 md:order-2">
            <div className="bg-gradient-to-br from-[#FCF8F4] to-[#F9F3F0] rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border-2" style={{ borderColor: '#B3886D' }}>
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 md:mb-8" style={{ color: '#896A59' }}>راه‌های ارتباطی</h2>
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      style={{ borderRight: '4px solid #B3886D' }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B3886D' }}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">{method.label}</p>
                        {method.link ? (
                          <a
                            href={method.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-sm sm:text-base hover:opacity-80 transition-opacity break-all"
                            style={{ color: '#896A59' }}
                          >
                            {method.value}
                          </a>
                        ) : (
                          <p className="font-bold text-sm sm:text-base" style={{ color: '#896A59' }}>{method.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Left Side - FAQ and Contact Info */}
          <div className="order-2 md:order-1 space-y-6 sm:space-y-8">
            {/* FAQ Section */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center" style={{ color: '#896A59' }}>سوالات متداول</h2>
              <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border rounded-lg sm:rounded-xl px-4 sm:px-6 bg-white shadow-md"
                    style={{ borderColor: '#B3886D' }}
                  >
                    <AccordionTrigger className="text-right hover:no-underline py-3 sm:py-5">
                      <span className="font-bold text-sm sm:text-base" style={{ color: '#896A59' }}>{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-right pb-3 sm:pb-5 text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Contact Info Section */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border" style={{ borderColor: '#B3886D' }}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center" style={{ color: '#896A59' }}>ارتباط با ما</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0" style={{ color: '#B3886D' }} />
                  <div>
                    <p className="font-bold mb-1 text-sm sm:text-base" style={{ color: '#896A59' }}>آدرس:</p>
                    <p className="text-gray-700 text-xs sm:text-sm md:text-base">مشهد، خیابان نامجو ۱۷، محسن نژاد ۱</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0" style={{ color: '#B3886D' }} />
                  <div>
                    <p className="font-bold mb-1 text-sm sm:text-base" style={{ color: '#896A59' }}>شماره تماس:</p>
                    <p className="text-gray-700 text-xs sm:text-sm md:text-base">۰۹۳۸۱۸۹۵۶۸۱</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0" style={{ color: '#B3886D' }} />
                  <div>
                    <p className="font-bold mb-1 text-sm sm:text-base" style={{ color: '#896A59' }}>ایمیل:</p>
                    <a href="mailto:info@yourdomain.com" className="text-blue-600 hover:underline text-xs sm:text-sm md:text-base">
                      info@yourdomain.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t" style={{ borderColor: '#B3886D' }}>
                <p className="font-bold mb-3 text-center text-sm sm:text-base" style={{ color: '#896A59' }}>شبکه‌های اجتماعی</p>
                <div className="flex justify-center gap-3 sm:gap-4">
                  <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ backgroundColor: '#B3886D' }}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ backgroundColor: '#896A59' }}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" style={{ backgroundColor: '#B3886D' }}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Map Section */}
        <div className="w-full rounded-lg sm:rounded-xl overflow-hidden shadow-lg" style={{ height: '300px' }}>
          <iframe
            src="https://neshan.org/maps/municipal/eb06bea0381940c18db02ffed6afec78"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="نقشه موقعیت فروشگاه"
            className="sm:h-[350px] md:h-[450px]"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;