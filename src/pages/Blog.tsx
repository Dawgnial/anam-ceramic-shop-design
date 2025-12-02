import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toPersianNumber } from "@/lib/utils";
import { Calendar, User, MessageSquare } from "lucide-react";

const Blog = () => {
  // Fetch all published blog posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['all-blog-posts'],
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

  // Format date to Persian
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    // Approximate Persian month (simplified)
    const month = months[date.getMonth()];
    return { day: toPersianNumber(day), month };
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${toPersianNumber(day)} ${month}, ${toPersianNumber(year - 621)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full py-10 md:py-14 flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-[#B3886D] transition-colors">خانه</Link>
            <span>/</span>
            <span className="text-foreground">بلاگ</span>
          </nav>
          <h1 className="text-foreground text-3xl md:text-4xl font-bold text-center">بلاگ</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4" style={{ maxWidth: '95%' }}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Blog Posts - Main Content (75%) */}
            <div className="lg:col-span-3 order-1">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
                  <p>در حال بارگذاری پست‌ها...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">هنوز پستی منتشر نشده است.</p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                  {posts.map((post) => {
                    const { day, month } = formatDate(post.created_at || '');
                    return (
                      <article 
                        key={post.id} 
                        className="bg-white rounded-sm shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Post Image */}
                        <div className="relative">
                          <Link to={`/blog/${post.slug}`}>
                            <img 
                              src={post.image_url || '/placeholder.svg'} 
                              alt={post.title}
                              className="w-full h-64 md:h-80 object-cover transition-transform duration-500 hover:scale-105"
                            />
                            {/* Image Overlay */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                          </Link>
                          
                          {/* Date Badge */}
                          <div className="absolute top-4 right-4 bg-white text-center px-3 py-2 rounded-sm shadow">
                            <span className="block text-2xl font-bold text-foreground leading-tight">{day}</span>
                            <span className="block text-sm text-muted-foreground">{month}</span>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-6 md:p-8">
                          {/* Category Tag */}
                          <div className="mb-3">
                            <span className="inline-block bg-[#B3886D] text-white text-xs px-3 py-1 rounded-sm">
                              بلاگ
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-xl md:text-2xl font-bold mb-4 leading-relaxed">
                            <Link 
                              to={`/blog/${post.slug}`} 
                              className="text-foreground hover:text-[#B3886D] transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h2>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4 border-b border-border pb-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>{formatFullDate(post.created_at || '')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              <span>ارسال توسط مدیر</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4" />
                              <span>{toPersianNumber(0)} دیدگاه</span>
                            </div>
                          </div>

                          {/* Excerpt */}
                          <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                            {post.excerpt}
                          </p>

                          {/* Read More Button */}
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="inline-block bg-[#B3886D] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#B3886D]/90 transition-colors"
                          >
                            ادامه مطلب
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar (25%) */}
            <aside className="lg:col-span-1 order-2">
              <div className="bg-white rounded-sm shadow-md p-6 sticky top-32">
                <h3 className="text-lg font-bold text-foreground mb-6 pb-3 border-b border-border">
                  آخرین مطالب
                </h3>
                
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-16 h-12 bg-muted rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">پستی موجود نیست</p>
                ) : (
                  <ul className="space-y-4">
                    {posts.slice(0, 5).map((post) => (
                      <li key={post.id} className="flex gap-3">
                        <Link to={`/blog/${post.slug}`} className="flex-shrink-0">
                          <img 
                            src={post.image_url || '/placeholder.svg'} 
                            alt={post.title}
                            className="w-16 h-12 object-cover rounded-sm"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="block text-sm font-medium text-foreground hover:text-[#B3886D] transition-colors line-clamp-2 leading-relaxed"
                          >
                            {post.title}
                          </Link>
                          <time className="text-xs text-muted-foreground">
                            {formatFullDate(post.created_at || '')}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>

          </div>
        </div>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Blog;