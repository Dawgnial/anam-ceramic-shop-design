import { LazyImage } from "@/components/ui/lazy-image";
import carouselImg1 from "@/assets/carousel-img1.jpg";
import carouselImg2 from "@/assets/carousel-img2.jpg";
import carouselImg3 from "@/assets/carousel-img3.jpg";
import carouselImg4 from "@/assets/carousel-img4.jpg";
import carouselImg5 from "@/assets/carousel-img5.jpg";
import carouselImg6 from "@/assets/carousel-img6.jpg";
import carouselImg7 from "@/assets/carousel-img7.jpg";
import carouselImg8 from "@/assets/carousel-img8.jpg";

const galleryImages = [
  carouselImg1,
  carouselImg2,
  carouselImg3,
  carouselImg4,
  carouselImg5,
  carouselImg6,
  carouselImg7,
  carouselImg8,
];

export const ImageGallery = () => {
  return (
    <section className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {galleryImages.map((image, index) => (
          <LazyImage
            key={index}
            src={image}
            alt={`گالری ${index + 1}`}
            aspectRatio="square"
          />
        ))}
      </div>
    </section>
  );
};