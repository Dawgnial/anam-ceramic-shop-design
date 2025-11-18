import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { Features } from "@/components/Features";
import { Welcome } from "@/components/Welcome";
import { ProductsCarousel } from "@/components/ProductsCarousel";
import { PotteryShowcase } from "@/components/PotteryShowcase";
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
      <Features />
      <Welcome />
      <ProductsCarousel />
      <PotteryShowcase />
      <BlogPosts />
      <CustomerReviews />
      <ImageGallery />
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
