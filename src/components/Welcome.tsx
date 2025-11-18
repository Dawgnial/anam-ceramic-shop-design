import { useEffect, useState } from "react";
import welcomeImg1 from "@/assets/welcome-img1-min.jpg";
import welcomeImg2 from "@/assets/welcome-img2-min.jpg";

export const Welcome = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
          {/* Right side - Image */}
          <div
            className={`relative transition-transform duration-1000 ${
              isVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <img
              src={welcomeImg1}
              alt="Welcome"
              className="w-full h-[400px] object-cover"
            />
            {/* Text box overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#FCE8D9] p-8 max-w-md text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  خوش آمدید به فروشگاه آنلاین
                </h2>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  ظروف سرامیک و سفال
                </h3>
                <p className="text-foreground text-sm leading-relaxed">
                  ما در فروشگاه آنلاین آنام در تلاش هستیم تا ضمن ارائه خدمات فروش، مشاوره و خدمات پس از فروش به شما علاقه مندان رضایت شما را کسب نماییم.
                </p>
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
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
