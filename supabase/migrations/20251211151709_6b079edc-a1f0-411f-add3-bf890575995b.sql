-- Fix security for low_stock_products view
-- Since views can't have RLS directly, we'll create a secure function instead

-- First, drop the existing view
DROP VIEW IF EXISTS public.low_stock_products;

-- Create a secure function that only admins can access
CREATE OR REPLACE FUNCTION public.get_low_stock_products()
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  stock integer,
  low_stock_threshold integer,
  stock_shortage integer,
  image text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.stock,
    p.low_stock_threshold,
    (p.low_stock_threshold - p.stock) as stock_shortage,
    p.images[1] as image
  FROM products p
  WHERE p.stock IS NOT NULL 
    AND p.low_stock_threshold IS NOT NULL 
    AND p.stock < p.low_stock_threshold
    AND has_role(auth.uid(), 'admin')
  ORDER BY stock_shortage DESC;
$$;

-- Recreate the view using the secure function (for backward compatibility)
CREATE VIEW public.low_stock_products AS
SELECT * FROM public.get_low_stock_products();

-- For pending_payments, let's review and ensure proper security
-- The current policies look correct, but let's add an extra layer of security
-- by ensuring anonymous users cannot access anything

-- First, let's check if there's an issue with the "Service role" policy
-- The policy with USING: true might be too permissive for non-service role users
-- Let's drop and recreate it properly

DROP POLICY IF EXISTS "Service role can manage all pending payments" ON public.pending_payments;

-- The remaining policies are:
-- "Users can create pending payments" - INSERT with auth.uid() = user_id
-- "Users can view their own pending payments" - SELECT with auth.uid() = user_id
-- These are correct and sufficient for regular users

-- Add explicit policy for admins to view all pending payments (for admin panel)
CREATE POLICY "Admins can view all pending payments"
ON public.pending_payments
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add explicit policy for admins to manage pending payments
CREATE POLICY "Admins can manage pending payments"
ON public.pending_payments
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));