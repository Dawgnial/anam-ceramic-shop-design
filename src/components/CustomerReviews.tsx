import { useEffect, useState } from "react";
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
    <section className="py-12 sm:py-16 md:py-20 lg:py-[75px] bg-[#FCF8F4]">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-[35px] font-bold text-center text-foreground mb-8 sm:mb-10 md:mb-12">نظرات مشتریان</h2>

        <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-10">
            {/* Right Arrow */}
            <button
              onClick={goToPrev}
              className="text-[#B3886D] hover:opacity-70 transition-opacity"
              aria-label="نظر قبلی"
            >
              <svg viewBox="0 0 16 16" className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor">
                <path d="M5.204 16L3 13.91 9.236 8 3 2.09 5.204 0l7.339 6.955c.61.578.61 1.512 0 2.09L5.204 16z"/>
              </svg>
            </button>

            {/* Review Card */}
            <div className="flex-1 bg-white shadow-lg h-[200px] sm:h-[240px] md:h-[280px] flex items-center justify-center px-6 sm:px-8 md:px-12">
              <div
                className={`text-center w-full transition-all duration-300 ${
                  isAnimating ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"
                }`}
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-4 sm:mb-5">
                  {[...Array(reviews[currentReview].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-[#B3886D] text-[#B3886D]" />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-sm sm:text-base md:text-lg text-foreground mb-4 sm:mb-6 leading-relaxed px-2 font-light">
                  "{reviews[currentReview].text}"
                </p>
                
                {/* Reviewer Name */}
                <p className="font-bold text-[#B3886D] text-sm sm:text-base">{reviews[currentReview].name}</p>
              </div>
            </div>

            {/* Left Arrow */}
            <button
              onClick={goToNext}
              className="text-[#B3886D] hover:opacity-70 transition-opacity"
              aria-label="نظر بعدی"
            >
              <svg viewBox="0 0 16 16" className="w-6 h-6 sm:w-8 sm:h-8 rotate-180" fill="currentColor">
                <path d="M5.204 16L3 13.91 9.236 8 3 2.09 5.204 0l7.339 6.955c.61.578.61 1.512 0 2.09L5.204 16z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
