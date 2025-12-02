import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Blog = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-4xl font-bold">بلاگ</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">محتوای بلاگ به زودی اضافه خواهد شد.</p>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
