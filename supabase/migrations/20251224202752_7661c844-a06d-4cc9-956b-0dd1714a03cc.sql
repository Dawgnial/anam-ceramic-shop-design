-- Add new columns to products table for weight-based shipping
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS weight_with_packaging INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS unit_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'عددی',
ADD COLUMN IF NOT EXISTS has_variations BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preparation_days INTEGER DEFAULT 1;

-- Add comments for documentation
COMMENT ON COLUMN public.products.weight IS 'Product weight in grams';
COMMENT ON COLUMN public.products.weight_with_packaging IS 'Product weight with packaging in grams';
COMMENT ON COLUMN public.products.unit_quantity IS 'Quantity per unit sale';
COMMENT ON COLUMN public.products.unit_type IS 'Type of unit (عددی, کیلو, etc)';
COMMENT ON COLUMN public.products.has_variations IS 'Whether product has color/size variations';
COMMENT ON COLUMN public.products.preparation_days IS 'Days needed to prepare the product';