-- Drop all triggers and the function with CASCADE
DROP TRIGGER IF EXISTS update_product_stock_trigger ON order_items;
DROP TRIGGER IF EXISTS update_stock_after_order_item ON order_items;
DROP TRIGGER IF EXISTS reduce_stock_after_order_item ON order_items;
DROP FUNCTION IF EXISTS update_product_stock_after_order() CASCADE;