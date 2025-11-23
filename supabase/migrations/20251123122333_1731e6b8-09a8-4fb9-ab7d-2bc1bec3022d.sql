-- Create product_attributes table for custom attributes
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_name text NOT NULL,
  attribute_values text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view product attributes"
  ON public.product_attributes
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product attributes"
  ON public.product_attributes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for better performance
CREATE INDEX idx_product_attributes_product_id ON public.product_attributes(product_id);

-- Add updated_at trigger
CREATE TRIGGER update_product_attributes_updated_at
  BEFORE UPDATE ON public.product_attributes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop and recreate products_with_ratings view without colors
DROP VIEW IF EXISTS products_with_ratings;

CREATE OR REPLACE VIEW products_with_ratings AS
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
  COALESCE(AVG(pr.rating), 0) as average_rating,
  COUNT(pr.id) as review_count
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
GROUP BY p.id, p.name, p.slug, p.description, p.price, p.category_id, p.images, p.stock, p.is_featured, p.created_at, p.updated_at;

-- Now remove colors column from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS colors CASCADE;