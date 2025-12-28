-- Allow service role to insert order items (for edge functions)
-- First, let's create a policy that allows inserting order items when using service role
-- The service role bypasses RLS, but we need to ensure the insert works

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create items for their own orders" ON order_items;

-- Create a more permissive insert policy for order items
CREATE POLICY "Users can create items for their own orders" 
ON order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
  OR 
  -- Allow service role (edge functions) to insert
  auth.role() = 'service_role'
);

-- Also add a policy to allow service role to insert inventory movements
DROP POLICY IF EXISTS "Admins can create inventory movements" ON inventory_movements;

CREATE POLICY "Admins or service role can create inventory movements" 
ON inventory_movements 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR auth.role() = 'service_role'
);