import featureImg1 from "@/assets/feature-img1.png";
import featureImg2 from "@/assets/feature-img2.png";
import featureImg3 from "@/assets/feature-img3.png";
import featureImg4 from "@/assets/feature-img4.png";

const features = [
  {
    id: 1,
    image: featureImg1,
    title: "انواع سفال",
    description: "جهت براق شدن و محافظت از طرح ازاسپری تثبیت کننده استفاده می شود.",
  },
  {
    id: 2,
    image: featureImg2,
    title: "فرآیند طراحی",
    description: "طرح های کشیده‌شده روی سفال باعث می‌شود تا ظروف تزیینی ایجاد شوند.",
  },
  {
    id: 3,
    image: featureImg3,
    title: "چرخ سفالگری",
    description: "به طور معمول همه مراحل ساخت سفال بر روی این چرخ انجام می شود.",
  },
  {
    id: 4,
    image: featureImg4,
    title: "گل سفالگری",
    description: "خاک رس از بهترین و معتبر ترین خاک های تولیدی در صنعت سفالگری است.",
  },
];

export const Features = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-[75px] bg-background">
      <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="text-center hover:bg-[#F9F3F0] transition-all duration-300 group flex flex-col items-center justify-start py-8 sm:py-10 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 cursor-default border-l border-transparent first:border-r-0 last:border-l-0"
            >
              <div className="mb-4 sm:mb-5 md:mb-6 flex justify-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-[22px] font-bold mb-2 sm:mb-3 text-[#B3886D]">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-[180px] sm:max-w-[200px] md:max-w-[220px] font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
