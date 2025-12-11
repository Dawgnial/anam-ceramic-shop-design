-- Recreate views with SECURITY INVOKER to fix security definer warning
-- Drop existing views
DROP VIEW IF EXISTS public.low_stock_products;
DROP VIEW IF EXISTS public.products_with_ratings;

-- Recreate low_stock_products view with SECURITY INVOKER
CREATE VIEW public.low_stock_products 
WITH (security_invoker = true)
AS
SELECT 
    id,
    name,
    slug,
    stock,
    low_stock_threshold,
    images[1] AS image,
    (low_stock_threshold - stock) AS stock_shortage
FROM products p
WHERE (stock <= low_stock_threshold) AND (in_stock = true)
ORDER BY stock;

-- Recreate products_with_ratings view with SECURITY INVOKER
CREATE VIEW public.products_with_ratings
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.category_id,
    p.images,
    p.stock,
    p.is_featured,
    p.created_at,
    p.updated_at,
    COALESCE(avg(pr.rating), 0::numeric) AS average_rating,
    count(pr.id) AS review_count
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
GROUP BY p.id, p.name, p.slug, p.description, p.price, p.category_id, p.images, p.stock, p.is_featured, p.created_at, p.updated_at;