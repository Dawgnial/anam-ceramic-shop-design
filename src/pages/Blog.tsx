import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import StructuredData from "@/components/seo/StructuredData";
import PageSEO from "@/components/seo/PageSEO";
import { Calendar, ArrowLeft, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";

const POSTS_PER_PAGE = 5;

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Fetch total count for pagination
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['blog-posts-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      if (error) throw error;
      return count || 0;
    },
  });

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['published-blog-posts', currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(from, to);

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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO
        title="بلاگ"
        description="مقالات و آموزش‌های تخصصی درباره سرامیک، سفال و صنایع دستی ایرانی. راهنمای خرید و نگهداری ظروف سرامیکی."
        canonicalUrl="https://anamzoroof.ir/blog"
        keywords="بلاگ سرامیک، مقالات سفال، آموزش سرامیک، صنایع دستی ایرانی"
      />
      <StructuredData type="BreadcrumbList" items={breadcrumbItems} />
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-3xl sm:text-4xl md:text-5xl font-extrabold">بلاگ</h1>
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
          <>
            <div className="space-y-8 md:space-y-12">
              {posts.map((post, index) => (
                <article 
                  key={post.id} 
                  className={`group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-[#B3886D]/30 transition-all duration-500 hover:shadow-xl ${
                    index === 0 && currentPage === 1 ? 'md:flex-row' : ''
                  }`}
                >
                  <div className={`flex flex-col ${index === 0 && currentPage === 1 ? 'lg:flex-row' : 'md:flex-row'}`}>
                    {/* Image */}
                    <div className={`relative overflow-hidden ${index === 0 && currentPage === 1 ? 'lg:w-1/2' : 'md:w-2/5'}`}>
                      <Link to={`/blog/${post.slug}`}>
                        <div className={`relative ${index === 0 && currentPage === 1 ? 'h-72 md:h-80 lg:h-full lg:min-h-[400px]' : 'h-64 md:h-72'}`}>
                          <img 
                            src={post.image_url || '/placeholder.svg'} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </Link>
                      
                      {/* Featured badge for first post on first page */}
                      {index === 0 && currentPage === 1 && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#B3886D' }}>
                          پیشنهاد ویژه
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex flex-col justify-center p-6 md:p-8 lg:p-10 ${index === 0 && currentPage === 1 ? 'lg:w-1/2' : 'md:w-3/5'}`}>
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
                        <h2 className={`font-black text-foreground mb-4 leading-relaxed transition-colors hover:text-[#B3886D] ${
                          index === 0 && currentPage === 1 ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'
                        }`}>
                          {post.title}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      <p className={`text-muted-foreground leading-relaxed mb-6 ${
                        index === 0 && currentPage === 1 ? 'text-base md:text-lg line-clamp-4' : 'text-sm md:text-base line-clamp-3'
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-10 w-10 rounded-full border-border hover:border-[#B3886D] hover:text-[#B3886D] disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => goToPage(page as number)}
                        className={`h-10 w-10 rounded-full ${
                          currentPage === page 
                            ? 'text-white' 
                            : 'border-border hover:border-[#B3886D] hover:text-[#B3886D]'
                        }`}
                        style={currentPage === page ? { backgroundColor: '#B3886D' } : {}}
                      >
                        {toPersianNumber(page as number)}
                      </Button>
                    )
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 rounded-full border-border hover:border-[#B3886D] hover:text-[#B3886D] disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Posts Info */}
            {totalCount > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                نمایش {toPersianNumber((currentPage - 1) * POSTS_PER_PAGE + 1)} تا {toPersianNumber(Math.min(currentPage * POSTS_PER_PAGE, totalCount))} از {toPersianNumber(totalCount)} مقاله
              </p>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
