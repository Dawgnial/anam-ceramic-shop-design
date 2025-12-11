import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://anamzoroof.ir';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating Torob XML feed...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all products with their categories
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        discount_percentage,
        in_stock,
        stock,
        images,
        description,
        product_categories (
          category_id,
          categories:category_id (
            name
          )
        )
      `)
      .eq('in_stock', true)
      .gt('stock', 0);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw new Error('Failed to fetch products');
    }

    console.log(`Found ${products?.length || 0} products`);

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<products>
`;

    if (products && products.length > 0) {
      for (const product of products) {
        // Calculate final price with discount
        const originalPrice = product.price;
        const discountPercentage = product.discount_percentage || 0;
        const finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100));

        // Get category name
        let categoryName = 'ظروف سرامیکی';
        if (product.product_categories && product.product_categories.length > 0) {
          const firstCategory = product.product_categories[0] as unknown as { categories: { name: string } | null };
          if (firstCategory.categories && firstCategory.categories.name) {
            categoryName = firstCategory.categories.name;
          }
        }

        // Get first image URL
        const imageUrl = product.images && product.images.length > 0 
          ? product.images[0] 
          : '';

        // Escape XML special characters
        const escapeXml = (str: string) => {
          if (!str) return '';
          return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        };

        // Availability status
        const availability = product.in_stock && product.stock > 0 ? 'instock' : 'outofstock';

        xml += `  <product>
    <product_id>${product.id}</product_id>
    <title><![CDATA[${product.name}]]></title>
    <price>${finalPrice}</price>
    <old_price>${discountPercentage > 0 ? originalPrice : ''}</old_price>
    <page_url>${SITE_URL}/product/${product.slug}</page_url>
    <image_url>${escapeXml(imageUrl)}</image_url>
    <category><![CDATA[${categoryName}]]></category>
    <availability>${availability}</availability>
    <guarantee><![CDATA[گارانتی اصالت و سلامت کالا]]></guarantee>
    <short_desc><![CDATA[${product.description ? product.description.substring(0, 200) : ''}]]></short_desc>
  </product>
`;
      }
    }

    xml += `</products>`;

    console.log('XML feed generated successfully');

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating Torob feed:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>خطا در تولید فید</error>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
        },
      }
    );
  }
});
