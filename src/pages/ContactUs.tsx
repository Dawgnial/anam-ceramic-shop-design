import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, ShoppingBag } from "lucide-react";

const ContactUs = () => {
  const contactInfo = [
    {
      icon: MapPin,
      label: "آدرس",
      value: "خراسان رضوی، مشهد، خیابان نامجو ۱۷، محسن نژاد ۱"
    },
    {
      icon: Clock,
      label: "ساعات کاری",
      value: "هر روز از ساعت ۹ تا ۱۸"
    },
    {
      icon: Phone,
      label: "شماره تماس",
      value: "+۹۸۹۳۸۱۸۹۵۶۸۱",
      link: "tel:+989381895681"
    },
    {
      icon: Mail,
      label: "ایمیل",
      value: "AnamZoroof@gmail.com",
      link: "mailto:AnamZoroof@gmail.com"
    }
  ];

  const socialLinks = [
    {
      icon: Send,
      label: "تلگرام",
      value: "ارتباط از طریق تلگرام",
      link: "https://t.me/Maso681"
    },
    {
      icon: MessageCircle,
      label: "ایتا",
      value: "ارتباط از طریق ایتا",
      link: "https://eitaa.com/joinchat/4204593409Cccb167f053"
    },
    {
      icon: MessageCircle,
      label: "روبیکا",
      value: "@anam_zrof",
      link: "https://rubika.ir/anam_zrof"
    },
    {
      icon: ShoppingBag,
      label: "غرفه در باسلام",
      value: "مشاهده غرفه فروشگاه",
      link: "https://basalam.com/caren_product"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      
      {/* Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black">ارتباط با ما</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-14">
          
          {/* Right Column - Contact Info */}
          <div className="h-full">
            <div className="h-full bg-gradient-to-br from-[#FCF8F4] to-[#F9F3F0] rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border-2 flex flex-col" style={{ borderColor: '#B3886D' }}>
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4" style={{ backgroundColor: '#B3886D' }}>
                  <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold" style={{ color: '#896A59' }}>ارتباط با ما</h2>
              </div>
              
              <div className="flex-1 space-y-4 sm:space-y-5">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="group flex items-center gap-4 p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      style={{ borderRight: '4px solid #B3886D' }}
                    >
                      <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: '#B3886D' }}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">{item.label}</p>
                        {item.link ? (
                          <a
                            href={item.link}
                            className="font-bold text-sm sm:text-base hover:opacity-80 transition-opacity block truncate"
                            style={{ color: '#896A59' }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-bold text-sm sm:text-base" style={{ color: '#896A59' }}>{item.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Left Column - Social Media */}
          <div className="h-full">
            <div className="h-full bg-gradient-to-br from-[#F9F3F0] to-[#FCF8F4] rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border-2 flex flex-col" style={{ borderColor: '#896A59' }}>
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4" style={{ backgroundColor: '#896A59' }}>
                  <Send className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold" style={{ color: '#B3886D' }}>شبکه‌های اجتماعی</h2>
              </div>
              
              <div className="flex-1 space-y-4 sm:space-y-5">
                {socialLinks.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={index}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
                      style={{ borderLeft: '4px solid #896A59' }}
                    >
                      <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: '#896A59' }}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1 font-medium">{item.label}</p>
                        <p className="font-bold text-sm sm:text-base hover:opacity-80 transition-opacity truncate" style={{ color: '#B3886D' }}>
                          {item.value}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: '#B3886D' }}>
                        <svg className="w-4 h-4 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Map Section */}
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2" style={{ borderColor: '#B3886D', height: '350px' }}>
          <iframe
            src="https://neshan.org/maps/places/sb1xyZ_JGVkK#c36.273-59.574-15z-0p"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="نقشه موقعیت فروشگاه"
            className="sm:h-[400px] md:h-[450px]"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;
