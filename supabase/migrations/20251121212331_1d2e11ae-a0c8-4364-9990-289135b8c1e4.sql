-- Create product_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Enable RLS on product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_categories
CREATE POLICY "Everyone can view product categories"
ON public.product_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert product categories"
ON public.product_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product categories"
ON public.product_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing data from products.category_id to product_categories
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id
FROM public.products
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Create index for better query performance
CREATE INDEX idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON public.product_categories(category_id);

-- Add comment to old category_id column (we keep it for backward compatibility but it's deprecated)
COMMENT ON COLUMN public.products.category_id IS 'Deprecated: Use product_categories table instead for many-to-many relationships';