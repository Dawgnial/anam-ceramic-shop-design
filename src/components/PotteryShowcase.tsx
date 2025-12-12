import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LazyImage } from "./ui/lazy-image";
import potteryImg from "@/assets/pottery-img-min.jpg";
import ceramicImg from "@/assets/ceramic-img-min.jpg";

export const PotteryShowcase = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleShopNavigate = () => {
    navigate("/shop");
  };

  return (
    <section className="bg-background overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Right side - Ceramic */}
        <div className={`relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[555px] transition-transform duration-1000 ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
          <LazyImage src={ceramicImg} alt="ظروف سرامیکی" className="h-full" />
          <div className="absolute inset-0 flex items-start justify-center pt-8 sm:pt-12 md:pt-16 lg:pt-20">
            <div className="text-center px-4 sm:px-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 text-foreground">
                فروش ویژه
              </h2>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2 sm:mb-3 text-primary">
                ظروف سرامیکی
              </h3>
              <p className="text-xs sm:text-sm md:text-base mb-4 sm:mb-5 leading-relaxed max-w-xs sm:max-w-sm mx-auto text-foreground/80 font-light">
                بهترین و با کیفیت ترین ظروف سرامیکی رابا کمترین قیمت دراسرع وقت از فروشگاه پاتری تهیه نمایید
              </p>
              <Button 
                onClick={handleShopNavigate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-2.5 rounded-none"
              >
                خرید کنید
              </Button>
            </div>
          </div>
        </div>

        {/* Left side - Pottery */}
        <div className={`relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[555px] transition-transform duration-1000 ${isVisible ? "translate-x-0" : "-translate-x-full"}`}>
          <LazyImage src={potteryImg} alt="ظروف سفالی" className="h-full" />
          <div className="absolute inset-0 flex items-start justify-center pt-8 sm:pt-12 md:pt-16 lg:pt-20">
            <div className="text-center px-4 sm:px-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 text-white">
                فروش ویژه
              </h2>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2 sm:mb-3 text-primary">
                ظروف سفالی
              </h3>
              <p className="text-xs sm:text-sm md:text-base mb-4 sm:mb-5 leading-relaxed max-w-xs sm:max-w-sm mx-auto text-white/90 font-light">
                بهترین و با کیفیت ترین ظروف سفالی را با کمترین قیمت در اسرع وقت از فروشگاه پاتری تهیه نمایید
              </p>
              <Button 
                onClick={handleShopNavigate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base px-6 sm:px-8 py-2 sm:py-2.5 rounded-none"
              >
                خرید کنید
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};