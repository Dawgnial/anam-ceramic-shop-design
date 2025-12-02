import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import potteryImg from "@/assets/pottery-img-min.jpg";
import ceramicImg from "@/assets/ceramic-img-min.jpg";
export const PotteryShowcase = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  return <section className="bg-background overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Right side - Pottery */}
        <div className={`relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[555px] transition-transform duration-1000 ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
          <img src={potteryImg} alt="ظروف سفالی" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 sm:px-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">فروش ویژه</h2>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">ظروف سفالی</h3>
              <p className="text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed max-w-sm sm:max-w-md mx-auto hidden sm:block">
                بهترین و با کیفیت ترین ظروف سفالی را با کمترین قیمت در اسرع وقت از فروشگاه پاتری تهیه نمایید
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-sm sm:text-base px-4 sm:px-6">
                خرید کنید
              </Button>
            </div>
          </div>
        </div>

        {/* Left side - Ceramic */}
        <div className={`relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[555px] transition-transform duration-1000 ${isVisible ? "translate-x-0" : "-translate-x-full"}`}>
          <img src={ceramicImg} alt="ظروف سرامیکی" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 sm:px-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-sidebar-primary">فروش ویژه</h2>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-sidebar-primary">ظروف سرامیکی</h3>
              <p className="text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed max-w-sm sm:max-w-md mx-auto hidden sm:block text-sidebar-primary">
                بهترین و با کیفیت ترین ظروف سرامیکی رابا کمترین قیمت دراسرع وقت از فروشگاه پاتری تهیه نمایید
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-sm sm:text-base px-4 sm:px-6">
                خرید کنید
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>;
};