import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toPersianNumber } from "@/lib/utils";
import { Calendar, User, ArrowRight } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Fetch single blog post
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch recent posts for sidebar
  const { data: recentPosts = [] } = useQuery({
    queryKey: ['recent-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${toPersianNumber(day)} ${month}, ${toPersianNumber(year - 621)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
            <p>در حال بارگذاری...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">پست یافت نشد</h2>
            <Link to="/blog" className="text-[#B3886D] hover:underline">
              بازگشت به بلاگ
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <Link to="/blog" className="hover:text-[#B3886D] transition-colors">بلاگ</Link>
            <span>/</span>
            <span className="text-foreground">{post.title}</span>
          </nav>
          <h1 className="text-foreground text-2xl md:text-3xl lg:text-4xl font-bold text-center max-w-4xl mx-auto leading-relaxed">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4" style={{ maxWidth: '95%' }}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Post Content (75%) */}
            <article className="lg:col-span-3 order-1">
              <div className="bg-white rounded-sm shadow-md overflow-hidden max-w-4xl mx-auto">
                {/* Featured Image */}
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                )}

                {/* Post Content */}
                <div className="p-6 md:p-10">
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatFullDate(post.created_at || '')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>ارسال توسط مدیر</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div 
                    className="prose prose-lg max-w-none text-foreground leading-loose"
                    dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || '' }}
                  />

                  {/* Back to Blog */}
                  <div className="mt-10 pt-6 border-t border-border">
                    <button 
                      onClick={() => navigate('/blog')}
                      className="inline-flex items-center gap-2 text-[#B3886D] hover:underline font-medium"
                    >
                      <ArrowRight className="w-4 h-4" />
                      بازگشت به بلاگ
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar (25%) */}
            <aside className="lg:col-span-1 order-2">
              <div className="bg-white rounded-sm shadow-md p-6 sticky top-32">
                <h3 className="text-lg font-bold text-foreground mb-6 pb-3 border-b border-border">
                  آخرین مطالب
                </h3>
                
                {recentPosts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">پستی موجود نیست</p>
                ) : (
                  <ul className="space-y-4">
                    {recentPosts.map((recentPost) => (
                      <li key={recentPost.id} className="flex gap-3">
                        <Link to={`/blog/${recentPost.slug}`} className="flex-shrink-0">
                          <img 
                            src={recentPost.image_url || '/placeholder.svg'} 
                            alt={recentPost.title}
                            className="w-16 h-12 object-cover rounded-sm"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/blog/${recentPost.slug}`}
                            className={`block text-sm font-medium transition-colors line-clamp-2 leading-relaxed ${
                              recentPost.slug === slug 
                                ? 'text-[#B3886D]' 
                                : 'text-foreground hover:text-[#B3886D]'
                            }`}
                          >
                            {recentPost.title}
                          </Link>
                          <time className="text-xs text-muted-foreground">
                            {formatFullDate(recentPost.created_at || '')}
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

export default BlogPost;