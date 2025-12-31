-- Create atomic stock decrement function with row locking
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_product_id uuid,
  p_quantity integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock integer;
BEGIN
  -- Lock row and get stock
  SELECT stock INTO current_stock
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;
  
  -- Check if product exists
  IF current_stock IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if sufficient stock
  IF current_stock < p_quantity THEN
    RETURN false;
  END IF;
  
  -- Update stock atomically
  UPDATE products
  SET stock = stock - p_quantity,
      updated_at = now()
  WHERE id = p_product_id;
  
  RETURN true;
END;
$$;

-- Add constraints on support_chats for guest validation
ALTER TABLE support_chats ADD CONSTRAINT guest_name_length 
  CHECK (guest_name IS NULL OR length(guest_name) <= 100);

ALTER TABLE support_chats ADD CONSTRAINT guest_phone_format 
  CHECK (guest_phone IS NULL OR guest_phone ~ '^[0-9+\-\s()]{5,20}$');