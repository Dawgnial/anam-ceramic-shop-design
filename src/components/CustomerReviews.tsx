import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "مریم احمدی",
    text: "کیفیت محصولات عالی و بسته‌بندی بسیار حرفه‌ای بود. از خرید خود بسیار راضی هستم.",
    rating: 5,
  },
  {
    id: 2,
    name: "علی رضایی",
    text: "ظروف زیبا و دست‌ساز با قیمت مناسب. حتماً دوباره خرید می‌کنم.",
    rating: 5,
  },
  {
    id: 3,
    name: "فاطمه کریمی",
    text: "محصولات منحصر به فرد و خدمات پس از فروش عالی. پیشنهاد می‌کنم.",
    rating: 5,
  },
];

export const CustomerReviews = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const goToPrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
      setIsAnimating(false);
    }, 150);
  };

  const goToNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:h-[588px] bg-reviews flex items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground mb-6 sm:mb-8 md:mb-12">نظرات مشتریان</h2>

        <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
            {/* Right Arrow (>) */}
            <button
              onClick={goToPrev}
              className="text-2xl sm:text-3xl md:text-4xl text-primary hover:opacity-70 transition-opacity font-light"
              aria-label="نظر قبلی"
            >
              &gt;
            </button>

            <Card className="border-none shadow-lg flex-1 h-[220px] sm:h-[260px] md:h-[300px] flex items-center bg-white">
              <CardContent className="p-4 sm:p-6 md:p-8 text-center w-full">
                <div
                  className={`transition-all duration-300 ${
                    isAnimating ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"
                  }`}
                >
                  <div className="flex justify-center gap-1 mb-3 sm:mb-4">
                    {[...Array(reviews[currentReview].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-foreground mb-4 sm:mb-6 leading-relaxed px-2">
                    "{reviews[currentReview].text}"
                  </p>
                  <p className="font-bold text-primary text-sm sm:text-base">{reviews[currentReview].name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Left Arrow (<) */}
            <button
              onClick={goToNext}
              className="text-2xl sm:text-3xl md:text-4xl text-primary hover:opacity-70 transition-opacity font-light"
              aria-label="نظر بعدی"
            >
              &lt;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};