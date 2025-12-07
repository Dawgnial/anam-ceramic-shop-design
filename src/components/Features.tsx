import featureImg1 from "@/assets/feature-img1.png";
import featureImg2 from "@/assets/feature-img2.png";
import featureImg3 from "@/assets/feature-img3.png";
import featureImg4 from "@/assets/feature-img4.png";

const features = [
  {
    id: 1,
    image: featureImg1,
    title: "انواع سرامیک",
    description: "برای براق شدن و محافظت از طرح، از اسپری تثبیت‌کننده استفاده می‌شود.",
  },
  {
    id: 2,
    image: featureImg2,
    title: "فرآیند طراحی",
    description: "طرح‌های کشیده‌شده روی بدنه سرامیک باعث می‌شود ظروف تزیینی زیبا و منحصربه‌فرد ایجاد شوند.",
  },
  {
    id: 3,
    image: featureImg3,
    title: "چرخ ساخت سرامیک",
    description: "در بسیاری از ظروف سرامیکی، شکل‌دهی اولیه با چرخ مخصوص سرامیک انجام می‌شود.",
  },
  {
    id: 4,
    image: featureImg4,
    title: "خاک سرامیک",
    description: "خاک سرامیکی از بهترین و استانداردترین مواد اولیه برای تولید محصولات سرامیکی باکیفیت است.",
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
              className="text-center hover:bg-[#F9F3F0] transition-colors group h-full flex flex-col items-center justify-start p-4 sm:p-6 md:px-8 pt-8 sm:pt-10 md:pt-12"
            >
              <div className="mb-4 sm:mb-5 md:mb-6 flex justify-center items-center">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain"
                />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold mb-2 sm:mb-3" style={{ color: '#B3886D' }}>
                {feature.title}
              </h3>
              <p className="text-xs sm:text-xs md:text-sm leading-relaxed max-w-[200px]" style={{ color: '#222222' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};