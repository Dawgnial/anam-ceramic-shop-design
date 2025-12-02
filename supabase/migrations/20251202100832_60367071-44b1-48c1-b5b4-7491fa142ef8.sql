-- Create shipping_costs table for provinces
CREATE TABLE public.shipping_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  province_name text NOT NULL UNIQUE,
  shipping_cost integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active shipping costs"
ON public.shipping_costs
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage shipping costs"
ON public.shipping_costs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_shipping_costs_updated_at
BEFORE UPDATE ON public.shipping_costs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all 31 provinces of Iran with default 0 cost
INSERT INTO public.shipping_costs (province_name, shipping_cost) VALUES
('آذربایجان شرقی', 0),
('آذربایجان غربی', 0),
('اردبیل', 0),
('اصفهان', 0),
('البرز', 0),
('ایلام', 0),
('بوشهر', 0),
('تهران', 0),
('چهارمحال و بختیاری', 0),
('خراسان جنوبی', 0),
('خراسان رضوی', 0),
('خراسان شمالی', 0),
('خوزستان', 0),
('زنجان', 0),
('سمنان', 0),
('سیستان و بلوچستان', 0),
('فارس', 0),
('قزوین', 0),
('قم', 0),
('کردستان', 0),
('کرمان', 0),
('کرمانشاه', 0),
('کهگیلویه و بویراحمد', 0),
('گلستان', 0),
('گیلان', 0),
('لرستان', 0),
('مازندران', 0),
('مرکزی', 0),
('هرمزگان', 0),
('همدان', 0),
('یزد', 0);