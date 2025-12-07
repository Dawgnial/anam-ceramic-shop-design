import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import welcomeImg1 from "@/assets/welcome-img1-new.jpg";
import welcomeImg2 from "@/assets/welcome-img2-new.jpg";
export const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  return <section className="bg-background overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
        {/* Right side - Image with text overlay */}
        <div className={`relative transition-transform duration-1000 ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
          <img src={welcomeImg1} alt="Welcome" className="w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] object-cover" />
          {/* Text box overlay - border only */}
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="border-2 sm:border-4 p-4 sm:p-6 md:p-8 lg:p-12 max-w-[95%] sm:max-w-2xl text-center" style={{
            borderColor: '#FCE8D9'
          }}>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground mb-2 sm:mb-4">
                خوش آمدید به فروشگاه آنلاین
              </h2>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6">ظروف سرامیکی</h3>
              <p className="text-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 hidden sm:block">
                ما در فروشگاه آنلاین آنام در تلاش هستیم تا ضمن ارائه خدمات فروش، مشاوره و خدمات پس از فروش به شما علاقه مندان رضایت شما را کسب نماییم.
              </p>
              <Button variant="outline" className="border-2 text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-2 sm:py-4 md:py-6" style={{
              borderColor: '#FCE8D9',
              color: 'inherit'
            }}>
                اطلاعات بیشتر
              </Button>
            </div>
          </div>
        </div>

        {/* Left side - Image */}
        <div className={`transition-transform duration-1000 hidden md:block ${isVisible ? "translate-x-0" : "-translate-x-full"}`}>
          <img src={welcomeImg2} alt="Welcome" className="w-full h-[450px] lg:h-[500px] object-cover" />
        </div>
      </div>
    </section>;
};