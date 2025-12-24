import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { LazyImage } from "./ui/lazy-image";
import { BlogGridSkeleton } from "./ui/blog-card-skeleton";

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
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-center text-foreground mb-6 sm:mb-8 md:mb-12">آخرین پست‌ها</h2>
          <BlogGridSkeleton count={3} />
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
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-center text-foreground mb-6 sm:mb-8 md:mb-12">آخرین پست‌ها</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden flex flex-col h-full max-w-[400px] mx-auto w-full border border-border rounded-lg shadow-sm bg-card">
              <CardContent className="p-0">
                <LazyImage 
                  src={post.image_url || '/placeholder.svg'} 
                  alt={post.title} 
                  className="h-40 sm:h-44 md:h-52" 
                />
              </CardContent>
              <CardFooter className="gap-2 sm:gap-3 p-4 sm:p-5 md:p-6 flex-col flex items-center justify-between flex-1 bg-card">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <h3 className="font-extrabold text-base sm:text-lg text-foreground text-center">{post.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm text-center line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <Link to={`/blog/${post.slug}`} className="mt-auto">
                  <Button 
                    variant="outline" 
                    className="text-center font-normal text-sm sm:text-base"
                    style={{ borderColor: '#E0B2A3' }}
                  >
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
