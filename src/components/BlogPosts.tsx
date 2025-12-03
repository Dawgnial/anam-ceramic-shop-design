import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";

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
      <section className="py-8 sm:py-12 md:py-16 lg:h-[716px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p className="text-sm md:text-base">در حال بارگذاری پست‌ها...</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:h-[716px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm md:text-base">پستی برای نمایش وجود ندارد</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:h-[716px] bg-background flex items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground mb-6 sm:mb-8 md:mb-12">آخرین پست‌ها</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={post.image_url || '/placeholder.svg'} 
                  alt={post.title} 
                  className="w-full h-36 sm:h-40 md:h-48 object-cover" 
                />
              </CardContent>
              <CardFooter className="gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 flex-col flex items-center justify-center">
                <h3 className="font-bold text-base sm:text-lg text-foreground text-center">{post.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm text-center line-clamp-3">
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.slug}`}>
                  <Button variant="outline" className="text-center font-normal text-sm sm:text-base">
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