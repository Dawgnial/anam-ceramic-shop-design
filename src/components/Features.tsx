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
    <section className="py-10 sm:py-14 md:py-20 lg:min-h-[555px] bg-background flex items-center">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="text-center hover:bg-[#F9F3F0] transition-all duration-300 group flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 md:px-8 cursor-default"
            >
              <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8 flex justify-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-[#B3886D]">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed max-w-[200px] md:max-w-[240px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};