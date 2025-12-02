import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const BlogPosts = () => {
  // Fetch published blog posts from database
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['published-blog-posts'],
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
      <section className="py-10 sm:py-14 md:py-20 lg:min-h-[716px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p className="text-sm md:text-base">در حال بارگذاری پست‌ها...</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-10 sm:py-14 md:py-20 lg:min-h-[716px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm md:text-base">پستی برای نمایش وجود ندارد</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-14 md:py-20 lg:min-h-[716px] bg-background flex items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground mb-8 sm:mb-10 md:mb-14">آخرین پست‌ها</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <img 
                  src={post.image_url || '/placeholder.svg'} 
                  alt={post.title} 
                  className="w-full h-40 sm:h-48 md:h-56 object-cover" 
                />
              </CardContent>
              <CardFooter className="gap-3 sm:gap-4 p-5 sm:p-6 md:p-8 flex-col flex items-center justify-center bg-white">
                <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground text-center">{post.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base text-center line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.slug}`}>
                  <Button variant="outline" className="text-center font-normal text-sm sm:text-base border-border hover:bg-muted transition-colors rounded-sm">
                    بیشتر بخوانید
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};