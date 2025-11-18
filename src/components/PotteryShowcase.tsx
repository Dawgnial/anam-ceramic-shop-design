import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import potteryImg from "@/assets/pottery-img-min.jpg";
import ceramicImg from "@/assets/ceramic-img-min.jpg";

export const PotteryShowcase = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Right side - Pottery */}
          <div
            className={`relative h-[400px] transition-transform duration-1000 ${
              isVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <img
              src={potteryImg}
              alt="ظروف سفالی"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h2 className="text-3xl font-bold mb-2">فروش ویژه</h2>
                <h3 className="text-2xl font-bold mb-4">ظروف سفالی</h3>
                <p className="text-sm mb-6 leading-relaxed max-w-md mx-auto">
                  بهترین و با کیفیت ترین ظروف سفالی را با کمترین قیمت در اسرع وقت از فروشگاه پاتری تهیه نمایید
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  خرید کنید
                </Button>
              </div>
            </div>
          </div>

          {/* Left side - Ceramic */}
          <div
            className={`relative h-[400px] transition-transform duration-1000 ${
              isVisible ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <img
              src={ceramicImg}
              alt="ظروف سرامیکی"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h2 className="text-3xl font-bold mb-2">فروش ویژه</h2>
                <h3 className="text-2xl font-bold mb-4">ظروف سرامیکی</h3>
                <p className="text-sm mb-6 leading-relaxed max-w-md mx-auto">
                  بهترین و با کیفیت ترین ظروف سرامیکی رابا کمترین قیمت دراسرع وقت از فروشگاه پاتری تهیه نمایید
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  خرید کنید
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
