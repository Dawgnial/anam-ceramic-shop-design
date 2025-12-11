import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StructuredData from "@/components/seo/StructuredData";

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

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData type="BreadcrumbList" items={breadcrumbItems} />
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[165px] flex items-center justify-center" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-4xl font-bold">بلاگ</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B3886D' }}></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground">پستی برای نمایش وجود ندارد.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                  <p className="text-muted-foreground text-xs">
                    {new Date(post.created_at || '').toLocaleDateString('fa-IR')}
                  </p>
                  <Link to={`/blog/${post.slug}`}>
                    <Button variant="outline" className="text-center font-normal">
                      بیشتر بخوانید
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
