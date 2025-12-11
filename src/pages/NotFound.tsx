import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home, ShoppingBag, Phone, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { icon: Home, label: "صفحه اصلی", href: "/" },
    { icon: ShoppingBag, label: "فروشگاه", href: "/shop" },
    { icon: BookOpen, label: "بلاگ", href: "/blog" },
    { icon: Phone, label: "تماس با ما", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-accent/20 py-12 px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 Number */}
          <div className="relative mb-8">
            <h1 className="text-[120px] sm:text-[180px] md:text-[220px] font-black text-primary/10 leading-none select-none">
              ۴۰۴
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card rounded-full p-6 shadow-xl border border-border">
                <Search className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            صفحه مورد نظر یافت نشد!
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md mx-auto">
            متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است. 
            می‌توانید از لینک‌های زیر استفاده کنید.
          </p>

          {/* Search Suggestion */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <p className="text-muted-foreground text-sm mb-4">
              آدرس درخواستی: <code className="bg-accent px-2 py-1 rounded text-foreground">{location.pathname}</code>
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-lg transition-all group"
              >
                <link.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-foreground">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Main CTA */}
          <Button asChild size="lg" className="px-8">
            <Link to="/">
              <Home className="w-5 h-5 ml-2" />
              بازگشت به صفحه اصلی
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
