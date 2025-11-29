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
    <section className="py-8 sm:py-12 md:py-16 lg:h-[555px] bg-background flex items-center">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-0 h-full">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="text-center hover:bg-[#F9F3F0] transition-colors group h-full flex flex-col items-center justify-center p-4 sm:p-6 md:px-8"
            >
              <div className="mb-3 sm:mb-4 md:mb-6 flex justify-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain"
                />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 md:mb-3" style={{ color: '#B3886D' }}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};