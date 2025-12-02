import { useCallback, useEffect, useState } from "react";
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
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] lg:h-[527px] overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className="relative h-full flex-[0_0_100%] min-w-0"
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              {/* Text overlay - positioned at top center */}
              <div 
                className="absolute inset-0 flex flex-col items-center pt-8 sm:pt-12 md:pt-16 lg:pt-24 text-center px-4"
                style={{ color: slide.color }}
              >
                <p className="text-lg sm:text-xl md:text-2xl lg:text-[26px] mb-1 sm:mb-2 font-normal tracking-wide">
                  {slide.title}
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-extrabold mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {slide.subtitle}
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-[22px] font-medium">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Simple bare arrows */}
      <button
        className="absolute left-4 sm:left-8 md:left-12 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white transition-colors"
        onClick={scrollPrev}
        aria-label="اسلاید قبلی"
      >
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="currentColor">
          <path d="M5.204 16L3 13.91 9.236 8 3 2.09 5.204 0l7.339 6.955c.61.578.61 1.512 0 2.09L5.204 16z" fillRule="nonzero" stroke="none" strokeWidth="1"/>
        </svg>
      </button>

      <button
        className="absolute right-4 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white transition-colors"
        onClick={scrollNext}
        aria-label="اسلاید بعدی"
      >
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rotate-180" fill="currentColor">
          <path d="M5.204 16L3 13.91 9.236 8 3 2.09 5.204 0l7.339 6.955c.61.578.61 1.512 0 2.09L5.204 16z" fillRule="nonzero" stroke="none" strokeWidth="1"/>
        </svg>
      </button>
    </div>
  );
};
