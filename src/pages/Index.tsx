import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductsCarousel } from "@/components/ProductsCarousel";
import { BlogPosts } from "@/components/BlogPosts";
import { CustomerReviews } from "@/components/CustomerReviews";
import { ImageGallery } from "@/components/ImageGallery";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSlider />
      <ProductsCarousel />
      <BlogPosts />
      <CustomerReviews />
      <ImageGallery />
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
