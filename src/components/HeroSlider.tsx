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
    <div className="relative w-full h-[300px] sm:h-[380px] md:h-[480px] lg:h-[527px] overflow-hidden bg-muted">
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
                className="absolute inset-0 flex flex-col items-center justify-start pt-10 sm:pt-14 md:pt-20 lg:pt-24 text-center px-4"
                style={{ color: slide.color }}
              >
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1 sm:mb-2 font-light">{slide.title}</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 md:mb-4">{slide.subtitle}</h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Left Arrow (>) */}
      <button
        className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-10 text-white hover:opacity-70 transition-opacity text-4xl sm:text-5xl md:text-6xl font-extralight"
        onClick={scrollPrev}
        aria-label="اسلاید قبلی"
      >
        &gt;
      </button>

      {/* Right Arrow (<) */}
      <button
        className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-10 text-white hover:opacity-70 transition-opacity text-4xl sm:text-5xl md:text-6xl font-extralight"
        onClick={scrollNext}
        aria-label="اسلاید بعدی"
      >
        &lt;
      </button>

    </div>
  );
};