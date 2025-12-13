import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

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

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:h-[588px] bg-reviews flex items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-center text-foreground mb-6 sm:mb-8 md:mb-12">نظرات مشتریان</h2>

        <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Left Arrow */}
            <button
              onClick={handleNext}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-primary hover:opacity-80 transition-opacity border border-primary/30"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>

            {/* Review Card */}
            <Card className="flex-1 border-none shadow-lg min-h-[220px] sm:min-h-[260px] md:min-h-[300px] flex items-center">
              <CardContent className="p-6 sm:p-8 md:p-10 text-center w-full">
                <div
                  className={`transition-transform duration-300 ${
                    isAnimating ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
                  }`}
                >
                  <div className="flex justify-center gap-1 mb-4 sm:mb-5">
                    {[...Array(reviews[currentReview].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground mb-4 sm:mb-5 leading-relaxed">
                    "{reviews[currentReview].text}"
                  </p>
                  <p className="font-bold text-primary text-sm sm:text-base md:text-lg">{reviews[currentReview].name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Right Arrow */}
            <button
              onClick={handlePrev}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-primary hover:opacity-80 transition-opacity border border-primary/30"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
