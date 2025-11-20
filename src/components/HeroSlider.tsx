import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import slider1 from "@/assets/slider1-min.jpg";
import slider2 from "@/assets/slider2-min.jpg";
import slider3 from "@/assets/slider3-min.jpg";

const slides = [
  { 
    id: 1, 
    image: slider1, 
    alt: "سفالگری 1",
    title: "فروش آنلاین",
    subtitle: "ظروف سفالی و سرامیک",
    description: "تجلی روح زیبای زندگی در گِل",
    color: "#11347A"
  },
  { 
    id: 2, 
    image: slider2, 
    alt: "سفالگری 2",
    title: "فروش آنلاین",
    subtitle: "ظروف سفالی و سرامیک",
    description: "هنر نزد ایرانیان است و بس",
    color: "#28405F"
  },
  { 
    id: 3, 
    image: slider3, 
    alt: "سفالگری 3",
    title: "فروش آنلاین",
    subtitle: "ظروف سفالی و سرامیک",
    description: "حس زیبایی و اصالت",
    color: "#2D211D"
  },
];

export const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full h-[527px] overflow-hidden bg-muted" dir="rtl">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%] h-full">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-start pt-16 text-center" style={{ color: slide.color }}>
                <p className="text-3xl mb-2">{slide.title}</p>
                <h1 className="text-6xl font-bold mb-4">{slide.subtitle}</h1>
                <p className="text-2xl">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:opacity-80 transition-opacity"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-12 w-12" strokeWidth={2} />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:opacity-80 transition-opacity"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className="h-12 w-12" strokeWidth={2} />
      </button>
    </div>
  );
};
