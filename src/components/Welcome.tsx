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
        <div className={`relative transition-transform duration-1000 ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
          <img 
            src={welcomeImg1} 
            alt="Welcome" 
            className="w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] object-cover" 
          />
          {/* Text box overlay - rectangular border extending to left image */}
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div 
              className="border-2 sm:border-4 p-4 sm:p-6 md:p-8 lg:p-12 text-center bg-white/90 backdrop-blur-sm relative z-10"
              style={{
                borderColor: '#FCE8D9',
                width: 'calc(100% + 120px)',
                maxWidth: '750px',
                marginLeft: '-120px',
              }}
            >
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground mb-2 sm:mb-4 font-semibold">
                خوش آمدید به فروشگاه آنلاین
              </h2>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground mb-3 sm:mb-4 md:mb-6 whitespace-nowrap">
                ظروف سرامیکی
              </h3>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-6 hidden sm:block font-normal" style={{ color: '#A9A9A9' }}>
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

        {/* Left side - Image */}
        <div className={`transition-transform duration-1000 hidden md:block ${isVisible ? "translate-x-0" : "-translate-x-full"}`}>
          <img 
            src={welcomeImg2} 
            alt="Welcome" 
            className="w-full h-[450px] lg:h-[500px] object-cover" 
          />
        </div>
      </div>
    </section>
  );
};
