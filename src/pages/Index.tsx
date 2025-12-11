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
import { AdminFloatingButton } from "@/components/AdminFloatingButton";
import { useAuth } from "@/contexts/AuthContext";
import StructuredData from "@/components/seo/StructuredData";
import WebsiteSchema from "@/components/seo/WebsiteSchema";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";

const Index = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen">
      <StructuredData type="Organization" />
      <WebsiteSchema />
      <LocalBusinessSchema />
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
      {isAdmin && <AdminFloatingButton />}
    </div>
  );
};

export default Index;
