import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    subtitle: "ظروف سرامیکی دست‌ساز",
    description: "تجلی روح زیبای زندگی در گِل",
    color: "#11347A"
  },
  { 
    id: 2, 
    image: slider2, 
    alt: "سفالگری 2",
    title: "فروش آنلاین",
    subtitle: "ظروف سرامیکی دست‌ساز",
    description: "هنر نزد ایرانیان است و بس",
    color: "#28405F"
  },
  { 
    id: 3, 
    image: slider3, 
    alt: "سفالگری 3",
    title: "فروش آنلاین",
    subtitle: "ظروف سرامیکی دست‌ساز",
    description: "حس زیبایی و اصالت",
    color: "#2D211D"
  },
];

export const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      direction: 'rtl',
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative w-full h-[280px] sm:h-[350px] md:h-[450px] lg:h-[527px] overflow-hidden bg-muted">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className="relative h-full"
              style={{ flex: '0 0 100%', minWidth: 0 }}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0 flex flex-col items-center justify-start pt-8 sm:pt-12 md:pt-16 text-center px-4"
                style={{ color: slide.color }}
              >
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1 sm:mb-2">{slide.title}</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-2 sm:mb-4">{slide.subtitle}</h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:opacity-80 transition-opacity"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" strokeWidth={2} />
      </button>

      <button
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:opacity-80 transition-opacity"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" strokeWidth={2} />
      </button>

    </div>
  );
};