-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS products_with_ratings;

-- Recreate the view without SECURITY DEFINER
CREATE VIEW products_with_ratings AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.description,
  p.price,
  p.stock,
  p.category_id,
  p.images,
  p.colors,
  p.is_featured,
  p.created_at,
  p.updated_at,
  COALESCE(AVG(r.rating), 0) AS average_rating,
  COUNT(r.id) AS review_count
FROM products p
LEFT JOIN product_reviews r ON p.id = r.product_id AND r.is_approved = true
GROUP BY p.id;