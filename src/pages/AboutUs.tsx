import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import aboutUsPic from "@/assets/about-us-pic2.png";
import backLine from "@/assets/back-line.png";

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-3xl sm:text-4xl md:text-5xl font-extrabold">درباره ما</h1>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Text Content - Left Side */}
          <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">فروشگاه آنلاین آنام</h2>
            <p className="leading-relaxed text-xs sm:text-sm md:text-base" style={{ color: '#A9A9A9' }}>
              فروشگاه اینترنتی آنام به عنوان فروشگاه تخصصی در زمینه سفال، سرامیک و صنایع دستی از ابتدای سال ۱۳۹۰ فعالیت خود را آغاز کرد. ما در فروشگاه آنلاین آنام در تلاش هستیم تا ضمن ارائه خدمات فروش، مشاوره و خدمات پس از فروش به شما علاقه مندان و با حمایت از تولیدات با کیفیت در این حوزه رضایت شما را کسب نماییم و اعلام مینماییم آماده فروش ظروف سفالی و سرامیکی به سراسر کشور هستیم.
            </p>
          </div>

          {/* Image - Right Side */}
          <div className="order-1 md:order-2 flex justify-center">
            <img 
              src={aboutUsPic} 
              alt="ظروف سفالی و سرامیکی آنام" 
              className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px] lg:w-[382px] lg:h-[382px] object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="w-full">
        <img 
          src={backLine} 
          alt="" 
          className="w-full h-auto"
        />
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default AboutUs;