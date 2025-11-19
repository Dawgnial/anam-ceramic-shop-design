import { Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-4xl font-bold">علاقه‌مندی‌ها</h1>
      </div>

      {/* Empty State */}
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-6">
          <Heart className="w-24 h-24 text-muted-foreground" />
          <div className="text-center space-y-3 max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground">این لیست علاقه‌مندی‌ها خالی است.</h2>
            <p className="text-muted-foreground text-lg">
              شما هنوز هیچ کالایی در لیست دلخواه ندارید. محصولات جالب بسیاری را در صفحه "فروشگاه" ما پیدا خواهید کرد.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/shop')}
            className="text-white"
            style={{ backgroundColor: '#B3886D' }}
          >
            بازگشت به فروشگاه
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
