import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
}

const SITE_URL = 'https://anamzoroof.ir'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })

    if (productsError) {
      console.error('Error fetching products:', productsError)
    }

    // Fetch all published blog posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })

    if (postsError) {
      console.error('Error fetching blog posts:', postsError)
    }

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    const today = new Date().toISOString().split('T')[0]

    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/shop', priority: '0.9', changefreq: 'daily' },
      { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
      { loc: '/faq', priority: '0.6', changefreq: 'monthly' },
      { loc: '/buying-guide', priority: '0.5', changefreq: 'monthly' },
      { loc: '/size-guide', priority: '0.5', changefreq: 'monthly' },
      { loc: '/shipping-method', priority: '0.5', changefreq: 'monthly' },
      { loc: '/returns', priority: '0.5', changefreq: 'monthly' },
      { loc: '/store-rules', priority: '0.4', changefreq: 'monthly' },
      { loc: '/cart', priority: '0.4', changefreq: 'monthly' },
      { loc: '/wishlist', priority: '0.4', changefreq: 'monthly' },
      { loc: '/compare', priority: '0.4', changefreq: 'monthly' },
    ]

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add products
    if (products && products.length > 0) {
      for (const product of products) {
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split('T')[0]
          : today
        xml += `  <url>
    <loc>${SITE_URL}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
      }
      console.log(`Added ${products.length} products to sitemap`)
    }

    // Add blog posts
    if (posts && posts.length > 0) {
      for (const post of posts) {
        const lastmod = post.updated_at 
          ? new Date(post.updated_at).toISOString().split('T')[0]
          : today
        xml += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
      }
      console.log(`Added ${posts.length} blog posts to sitemap`)
    }

    // Add categories
    if (categories && categories.length > 0) {
      for (const category of categories) {
        const lastmod = category.updated_at 
          ? new Date(category.updated_at).toISOString().split('T')[0]
          : today
        xml += `  <url>
    <loc>${SITE_URL}/shop?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`
      }
      console.log(`Added ${categories.length} categories to sitemap`)
    }

    xml += `</urlset>`

    console.log('Sitemap generated successfully')

    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://anamzoroof.ir/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        headers: corsHeaders,
        status: 200,
      }
    )
  }
})
