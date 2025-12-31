import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import welcomeImg1 from "@/assets/welcome-img2-new.jpg";
import welcomeImg2 from "@/assets/welcome-img1-new.jpg";

export const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <section className="bg-background overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center relative">
        {/* Right side - Image with text overlay */}
        <div className={`relative z-20 transition-transform duration-1000 ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
          <img 
            src={welcomeImg1} 
            alt="ظروف سرامیکی آنام" 
            className="w-full h-[280px] xs:h-[320px] sm:h-[400px] md:h-[450px] lg:h-[500px] object-cover" 
            loading="lazy"
          />
          {/* Text box overlay - responsive positioning, on desktop extends over cactus */}
          <div className="absolute inset-0 flex items-center justify-center p-3 xs:p-4 sm:p-6 md:p-8 md:justify-start md:left-auto md:-right-20 lg:-right-32">
            <div 
              className="border-2 sm:border-4 p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 text-center relative z-30 w-[90%] sm:w-[85%] md:w-auto mx-auto bg-background/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
              style={{
                borderColor: '#FCE8D9',
                maxWidth: '750px',
              }}
            >
              <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-foreground mb-2 sm:mb-4 font-semibold">
                خوش آمدید به فروشگاه آنلاین
              </h2>
              <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground mb-2 xs:mb-3 sm:mb-4 md:mb-6">
                ظروف سرامیکی
              </h3>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4 md:mb-6 hidden xs:block font-normal line-clamp-3 sm:line-clamp-none" style={{ color: '#A9A9A9' }}>
                ما در فروشگاه آنلاین پاتری در تلاش هستیم تا ضمن ارائه خدمات فروش، مشاوره و خدمات پس از فروش به شما علاقه مندان رضایت شما را کسب نماییم.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/about')}
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300 hover:text-white" 
                style={{
                  borderColor: '#E0B2A3',
                  color: 'inherit',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E0B2A3';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'inherit';
                }}
              >
                اطلاعات بیشتر
              </Button>
            </div>
          </div>
        </div>

        {/* Left side - Image (hidden on mobile) */}
        <div className={`relative z-10 transition-transform duration-1000 hidden md:block ${isVisible ? "translate-x-0" : "-translate-x-full"}`}>
          <img 
            src={welcomeImg2} 
            alt="ظروف سفالی دست‌ساز" 
            className="w-full h-[450px] lg:h-[500px] object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};
