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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="text-center p-8 hover:bg-[#F9F3F0] transition-colors group"
            >
              <div className="mb-6 flex justify-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-32 h-32 object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: '#B3886D' }}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-lg">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
