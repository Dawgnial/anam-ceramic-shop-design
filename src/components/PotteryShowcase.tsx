import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import potteryImg from "@/assets/pottery-img-min.jpg";
import ceramicImg from "@/assets/ceramic-img-min.jpg";

export const PotteryShowcase = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Right side - Pottery (سفالی) */}
        <div
          className={`relative h-[350px] sm:h-[420px] md:h-[480px] lg:h-[555px] transition-all duration-1000 ease-out ${
            isVisible ? "translate-x-0 opacity-100" : "translate-x-[100px] opacity-0"
          }`}
        >
          <img
            src={potteryImg}
            alt="ظروف سفالی"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 sm:px-6">
              <p className="text-base sm:text-lg md:text-xl lg:text-[22px] font-medium mb-1 sm:mb-2">فروش ویژه</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[35px] font-bold mb-3 sm:mb-4 md:mb-6">ظروف سفالی</h2>
              <p className="text-xs sm:text-sm md:text-[15px] mb-5 sm:mb-6 md:mb-8 leading-relaxed max-w-xs sm:max-w-sm md:max-w-md mx-auto hidden sm:block opacity-90 font-light">
                بهترین و با کیفیت ترین ظروف سفالی را با کمترین قیمت در اسرع وقت از فروشگاه آنام تهیه نمایید
              </p>
              <Link to="/shop">
                <Button className="bg-[#B3886D] hover:bg-[#B3886D]/90 text-white text-sm sm:text-base px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 rounded-full font-medium">
                  خرید کنید
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Left side - Ceramic (سرامیکی) */}
        <div
          className={`relative h-[350px] sm:h-[420px] md:h-[480px] lg:h-[555px] transition-all duration-1000 ease-out ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-[100px] opacity-0"
          }`}
        >
          <img
            src={ceramicImg}
            alt="ظروف سرامیکی"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 sm:px-6">
              <p className="text-base sm:text-lg md:text-xl lg:text-[22px] font-medium mb-1 sm:mb-2">فروش ویژه</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[35px] font-bold mb-3 sm:mb-4 md:mb-6">ظروف سرامیکی</h2>
              <p className="text-xs sm:text-sm md:text-[15px] mb-5 sm:mb-6 md:mb-8 leading-relaxed max-w-xs sm:max-w-sm md:max-w-md mx-auto hidden sm:block opacity-90 font-light">
                بهترین و با کیفیت ترین ظروف سرامیکی را با کمترین قیمت در اسرع وقت از فروشگاه آنام تهیه نمایید
              </p>
              <Link to="/shop">
                <Button className="bg-[#B3886D] hover:bg-[#B3886D]/90 text-white text-sm sm:text-base px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 rounded-full font-medium">
                  خرید کنید
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
