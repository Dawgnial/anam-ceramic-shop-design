-- Add product features table
CREATE TABLE public.product_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  feature_key text NOT NULL,
  feature_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add product reviews table
CREATE TABLE public.product_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add discount coupons table
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL,
  min_purchase integer DEFAULT 0,
  max_discount integer,
  usage_limit integer,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add inventory movements table for tracking stock changes
CREATE TABLE public.inventory_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'return', 'adjustment')),
  reference_id uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_features
CREATE POLICY "Everyone can view product features"
ON public.product_features FOR SELECT USING (true);

CREATE POLICY "Admins can manage product features"
ON public.product_features FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for product_reviews
CREATE POLICY "Everyone can view approved reviews"
ON public.product_reviews FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own reviews"
ON public.product_reviews FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reviews"
ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.product_reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for coupons
CREATE POLICY "Everyone can view active coupons"
ON public.coupons FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for inventory_movements
CREATE POLICY "Admins can view inventory movements"
ON public.inventory_movements FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create inventory movements"
ON public.inventory_movements FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create triggers
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update product stock after order
CREATE OR REPLACE FUNCTION public.update_product_stock_after_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update product stock
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  
  -- Log inventory movement
  INSERT INTO inventory_movements (product_id, quantity, movement_type, reference_id, notes)
  VALUES (NEW.product_id, -NEW.quantity, 'sale', NEW.order_id, 'Automatic stock reduction after order');
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic stock reduction
CREATE TRIGGER update_stock_after_order_item
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_product_stock_after_order();

-- Add average rating column to products (computed on-the-fly via view)
CREATE OR REPLACE VIEW public.products_with_ratings AS
SELECT 
  p.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as review_count
FROM products p
LEFT JOIN product_reviews r ON p.id = r.product_id AND r.is_approved = true
GROUP BY p.id;