import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import welcomeImg1 from "@/assets/welcome-img1-min.jpg";
import welcomeImg2 from "@/assets/welcome-img2-min.jpg";

export const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-background overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Right side - Image with text overlay (در RTL این سمت راست است) */}
        <div
          className={`relative transition-all duration-1000 ease-out ${
            isVisible ? "translate-x-0 opacity-100" : "translate-x-[100px] opacity-0"
          }`}
        >
          <img
            src={welcomeImg1}
            alt="خوش آمدید به آنام"
            className="w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[555px] object-cover"
          />
          {/* Text box overlay - border only style matching reference */}
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div 
              className="border border-[#FCE8D9] p-6 sm:p-8 md:p-10 lg:p-14 max-w-[90%] sm:max-w-xl md:max-w-lg text-center bg-transparent"
            >
              <p className="text-base sm:text-lg md:text-xl text-foreground mb-2 sm:mb-3 font-light">
                خوش آمدید به فروشگاه آنلاین
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 md:mb-8">
                ظروف سرامیک و سفال
              </h2>
              <p className="text-foreground/90 text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-6 md:mb-8 hidden sm:block max-w-md mx-auto">
                ما در فروشگاه آنلاین آنام در تلاش هستیم تا ضمن ارائه خدمات فروش، مشاوره و خدمات پس از فروش به شما علاقه مندان رضایت شما را کسب نماییم.
              </p>
              <Link to="/about">
                <Button 
                  variant="outline" 
                  className="border border-[#FCE8D9] bg-transparent text-foreground text-sm sm:text-base px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 hover:bg-[#FCE8D9]/10 transition-colors rounded-none"
                >
                  اطلاعات بیشتر
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Left side - Image only (در RTL این سمت چپ است) */}
        <div
          className={`transition-all duration-1000 ease-out hidden md:block ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-[100px] opacity-0"
          }`}
        >
          <img
            src={welcomeImg2}
            alt="محصولات سرامیکی آنام"
            className="w-full h-[500px] lg:h-[555px] object-cover"
          />
        </div>
      </div>
    </section>
  );
};