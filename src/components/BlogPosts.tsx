import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toPersianNumber } from "@/lib/utils";

export const BlogPosts = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-[75px] bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p className="text-sm md:text-base">در حال بارگذاری...</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-[75px] bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-[35px] font-bold text-foreground mb-4">آخرین پست‌ها</h2>
          <p className="text-muted-foreground">پستی برای نمایش وجود ندارد</p>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const monthIndex = date.getMonth();
    return { day: toPersianNumber(day), month: months[monthIndex] };
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-[75px] bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-[35px] font-bold text-foreground mb-2 sm:mb-3">آخرین پست‌ها</h2>
          <p className="text-muted-foreground text-sm md:text-[15px] font-light">جدیدترین مقالات و اخبار فروشگاه آنام</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => {
            const { day, month } = formatDate(post.created_at || '');
            return (
              <article key={post.id} className="group">
                {/* Image with date badge */}
                <div className="relative overflow-hidden mb-4">
                  <Link to={`/blog/${post.slug}`}>
                    <img
                      src={post.image_url || '/placeholder.svg'}
                      alt={post.title}
                      className="w-full h-[200px] sm:h-[240px] md:h-[280px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  {/* Date Badge */}
                  <div className="absolute top-4 right-4 bg-[#B3886D] text-white text-center px-3 py-2 rounded-sm">
                    <span className="block text-lg sm:text-xl font-bold leading-none">{day}</span>
                    <span className="block text-xs mt-1">{month}</span>
                  </div>
                </div>

                {/* Post Info */}
                <div className="px-1">
                  <Link to={`/blog/${post.slug}`}>
                    <h3 className="text-base sm:text-lg md:text-[22px] font-bold text-foreground mb-2 sm:mb-3 leading-tight hover:text-[#B3886D] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-muted-foreground text-xs sm:text-sm md:text-[15px] leading-relaxed mb-3 sm:mb-4 line-clamp-2 font-light">
                    {post.excerpt}
                  </p>

                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-[#B3886D] text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    بیشتر بخوانید
                    <svg className="w-4 h-4 mr-1 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
