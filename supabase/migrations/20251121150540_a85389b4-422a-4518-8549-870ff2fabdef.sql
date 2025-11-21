-- Add discount and stock availability fields to products table
ALTER TABLE products 
ADD COLUMN discount_percentage integer,
ADD COLUMN in_stock boolean DEFAULT true;

-- Add constraint to ensure discount is between 0 and 100
ALTER TABLE products
ADD CONSTRAINT discount_percentage_range CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100));