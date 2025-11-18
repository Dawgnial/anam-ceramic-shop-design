import { useCallback, useEffect } from "react";
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
    description: "حس زیبایی و اصالت"
  },
  { 
    id: 2, 
    image: slider2, 
    alt: "سفالگری 2",
    title: "فروش آنلاین",
    subtitle: "ظروف سفالی و سرامیک",
    description: "تجلی روح زیبای زندگی در گِل"
  },
  { 
    id: 3, 
    image: slider3, 
    alt: "سفالگری 3",
    title: "فروش آنلاین",
    subtitle: "ظروف سفالی و سرامیک",
    description: "هنر نزد ایرانیان است و بس"
  },
];

export const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, direction: 'rtl' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-muted">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="relative min-w-0 flex-[0_0_100%] h-full">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                <h1 className="text-5xl font-bold mb-2">{slide.title}</h1>
                <h2 className="text-4xl font-semibold mb-4">{slide.subtitle}</h2>
                <p className="text-2xl">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};
