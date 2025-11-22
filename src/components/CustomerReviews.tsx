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

  return (
    <section className="h-[588px] bg-reviews flex items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">نظرات مشتریان</h2>

        <div className="max-w-2xl mx-auto overflow-hidden">
          <Card className="border-none shadow-lg min-h-[280px] flex items-center">
            <CardContent className="p-8 text-center w-full">
              <div
                className={`transition-transform duration-300 ${
                  isAnimating ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
                }`}
              >
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(reviews[currentReview].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg text-foreground mb-4 leading-relaxed">
                  "{reviews[currentReview].text}"
                </p>
                <p className="font-bold text-primary">{reviews[currentReview].name}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)}
              className="text-primary hover:opacity-80 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentReview ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentReview(index)}
              />
            ))}
            
            <button
              onClick={() => setCurrentReview((prev) => (prev + 1) % reviews.length)}
              className="text-primary hover:opacity-80 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
