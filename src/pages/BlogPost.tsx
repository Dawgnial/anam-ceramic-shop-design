import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import DOMPurify from "dompurify";
import PageSEO from "@/components/seo/PageSEO";
import ArticleSchema from "@/components/seo/ArticleSchema";
import StructuredData from "@/components/seo/StructuredData";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#B3886D' }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center px-4" style={{ backgroundColor: '#DDDDDD' }}>
          <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">پست یافت نشد</h1>
        </div>
        <div className="flex-1 container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">این پست وجود ندارد یا منتشر نشده است.</p>
          <Link to="/blog" className="text-[#B3886D] hover:underline">
            بازگشت به بلاگ
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(post.content || '', {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
  });

  const pageTitle = `${post.title} | بلاگ آنام`;
  const pageDescription = post.excerpt || post.title;
  const pageImage = post.image_url || 'https://anamzoroof.ir/og-image.png';
  const pageUrl = `https://anamzoroof.ir/blog/${post.slug}`;

  const breadcrumbItems = [
    { name: 'خانه', url: 'https://anamzoroof.ir/' },
    { name: 'بلاگ', url: 'https://anamzoroof.ir/blog' },
    { name: post.title, url: pageUrl },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PageSEO
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={pageUrl}
        ogImage={pageImage}
        ogType="article"
        article={{
          publishedTime: post.created_at || undefined,
          modifiedTime: post.updated_at || undefined,
        }}
      />
      <ArticleSchema
        title={post.title}
        description={pageDescription}
        image={pageImage}
        datePublished={post.created_at || ''}
        dateModified={post.updated_at || undefined}
        url={pageUrl}
      />
      <StructuredData type="BreadcrumbList" items={breadcrumbItems} />
      
      <Header />
      
      {/* Hero Banner */}
      <div className="w-full h-[100px] sm:h-[130px] md:h-[165px] flex items-center justify-center px-4" style={{ backgroundColor: '#DDDDDD' }}>
        <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold">بلاگ</h1>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-[#B3886D]">خانه</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-[#B3886D]">بلاگ</Link>
            <span className="mx-2">/</span>
            <span>{post.title}</span>
          </div>

          {/* Post Image */}
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              loading="lazy"
            />
          )}

          {/* Post Title */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h2>

          {/* Post Date */}
          <p className="text-muted-foreground text-sm mb-8">
            {new Date(post.created_at || '').toLocaleDateString('fa-IR')}
          </p>

          {/* Post Content - Sanitized */}
          <div 
            className="prose prose-lg max-w-none text-foreground leading-8 blog-content"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Back Link */}
          <div className="mt-12 pt-8 border-t">
            <Link to="/blog" className="text-[#B3886D] hover:underline">
              ← بازگشت به بلاگ
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
