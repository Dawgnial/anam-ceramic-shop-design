import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import welcomeImg1 from "@/assets/welcome-img1-min.jpg";
import welcomeImg2 from "@/assets/welcome-img2-min.jpg";

export const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="bg-background overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
        {/* Right side - Image with text overlay */}
        <div
          className={`relative transition-transform duration-1000 ${
            isVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <img
            src={welcomeImg1}
            alt="Welcome"
            className="w-full h-[500px] object-cover"
          />
          {/* Text box overlay - border only */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div 
              className="border-4 p-12 max-w-2xl text-center"
              style={{ borderColor: '#FCE8D9' }}
            >
              <h2 className="text-3xl text-foreground mb-4">
                خوش آمدید به فروشگاه آنلاین
              </h2>
              <h3 className="text-5xl font-bold text-foreground mb-6">
                ظروف سرامیک و سفال
              </h3>
              <p className="text-foreground text-lg leading-relaxed mb-6">
                ما در فروشگاه آنلاین آنام در تلاش هستیم تا ضمن ارائه خدمات فروش، مشاوره و خدمات پس از فروش به شما علاقه مندان رضایت شما را کسب نماییم.
              </p>
              <Button 
                variant="outline" 
                className="border-2 text-lg px-8 py-6"
                style={{ borderColor: '#FCE8D9', color: 'inherit' }}
              >
                اطلاعات بیشتر
              </Button>
            </div>
          </div>
        </div>

        {/* Left side - Image */}
        <div
          className={`transition-transform duration-1000 ${
            isVisible ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <img
            src={welcomeImg2}
            alt="Welcome"
            className="w-full h-[500px] object-cover"
          />
        </div>
      </div>
    </section>
  );
};
