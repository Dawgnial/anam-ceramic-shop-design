-- Create trigger for automatic stock reduction after order
CREATE TRIGGER reduce_stock_after_order_item
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_after_order();

-- Add low_stock_threshold column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10;

-- Create a view for low stock products
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.stock,
  p.low_stock_threshold,
  p.images[1] as image,
  (p.low_stock_threshold - p.stock) as stock_shortage
FROM products p
WHERE p.stock <= p.low_stock_threshold
  AND p.in_stock = true
ORDER BY p.stock ASC;

-- Grant access to the view
GRANT SELECT ON low_stock_products TO authenticated;