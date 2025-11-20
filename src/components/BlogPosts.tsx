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
      <section className="h-[716px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
          <p>در حال بارگذاری پست‌ها...</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="h-[716px] bg-background flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">پستی برای نمایش وجود ندارد</p>
        </div>
      </section>
    );
  }

  return (
    <section className="h-[716px] bg-background flex items-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">آخرین پست‌ها</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={post.image_url || '/placeholder.svg'} 
                  alt={post.title} 
                  className="w-full h-48 object-cover" 
                />
              </CardContent>
              <CardFooter className="gap-3 p-6 flex-col flex items-center justify-center">
                <h3 className="font-bold text-lg text-foreground text-center">{post.title}</h3>
                <p className="text-muted-foreground text-sm text-center line-clamp-3">
                  {post.excerpt}
                </p>
                <Button variant="outline" className="text-center font-normal">
                  بیشتر بخوانید
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};