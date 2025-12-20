import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import StructuredData from "@/components/seo/StructuredData";
import { Calendar, ArrowLeft, Clock } from "lucide-react";

const Blog = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['all-published-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const breadcrumbItems = [
    { name: 'خانه', url: 'https://anamzoroof.ir/' },
    { name: 'بلاگ', url: 'https://anamzoroof.ir/blog' },
  ];

  // Function to estimate reading time
  const getReadingTime = (content: string | null) => {
    if (!content) return 3;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StructuredData type="BreadcrumbList" items={breadcrumbItems} />
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#F5F0EB' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-[#B3886D]"></div>
          <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full border border-[#B3886D]"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-[#B3886D]/20"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: '#B3886D', color: 'white' }}>
            مقالات و آموزش‌ها
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4">
            بلاگ آنام
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            دنیای سفال و سرامیک را کشف کنید، از تکنیک‌های ساخت تا نگهداری و زیبایی‌شناسی
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-12 md:py-16">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F0EB' }}>
              <Calendar className="w-12 h-12" style={{ color: '#B3886D' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">پستی برای نمایش وجود ندارد</h2>
            <p className="text-muted-foreground">به زودی مقالات جدید منتشر خواهد شد</p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {posts.map((post, index) => (
              <article 
                key={post.id} 
                className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-[#B3886D]/30 transition-all duration-500 hover:shadow-xl ${
                  index === 0 ? 'md:flex-row' : ''
                }`}
              >
                <div className={`flex flex-col ${index === 0 ? 'lg:flex-row' : 'md:flex-row'}`}>
                  {/* Image */}
                  <div className={`relative overflow-hidden ${index === 0 ? 'lg:w-1/2' : 'md:w-2/5'}`}>
                    <Link to={`/blog/${post.slug}`}>
                      <div className={`relative ${index === 0 ? 'h-72 md:h-80 lg:h-full lg:min-h-[400px]' : 'h-64 md:h-72'}`}>
                        <img 
                          src={post.image_url || '/placeholder.svg'} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>
                    </Link>
                    
                    {/* Featured badge for first post */}
                    {index === 0 && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#B3886D' }}>
                        پیشنهاد ویژه
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex flex-col justify-center p-6 md:p-8 lg:p-10 ${index === 0 ? 'lg:w-1/2' : 'md:w-3/5'}`}>
                    {/* Meta info */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" style={{ color: '#B3886D' }} />
                        <span>{new Date(post.created_at || '').toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" style={{ color: '#B3886D' }} />
                        <span>{getReadingTime(post.content)} دقیقه مطالعه</span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link to={`/blog/${post.slug}`}>
                      <h2 className={`font-bold text-foreground mb-4 leading-relaxed transition-colors hover:text-[#B3886D] ${
                        index === 0 ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'
                      }`}>
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className={`text-muted-foreground leading-relaxed mb-6 ${
                      index === 0 ? 'text-base md:text-lg line-clamp-4' : 'text-sm md:text-base line-clamp-3'
                    }`}>
                      {post.excerpt}
                    </p>

                    {/* Read more button */}
                    <div>
                      <Link to={`/blog/${post.slug}`}>
                        <Button 
                          variant="outline" 
                          className="group/btn border-[#B3886D] text-[#B3886D] hover:bg-[#B3886D] hover:text-white transition-all duration-300 rounded-full px-6"
                        >
                          <span>ادامه مطلب</span>
                          <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/btn:-translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
