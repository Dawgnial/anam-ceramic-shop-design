-- Create shipping_settings table for configurable shipping costs
CREATE TABLE public.shipping_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value integer NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view shipping settings
CREATE POLICY "Everyone can view shipping settings"
ON public.shipping_settings
FOR SELECT
USING (true);

-- Only admins can manage shipping settings
CREATE POLICY "Admins can manage shipping settings"
ON public.shipping_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default values
INSERT INTO public.shipping_settings (setting_key, setting_value, description) VALUES
  ('regular_first_kg', 80000, 'هزینه ارسال پست - کیلو اول'),
  ('regular_extra_kg', 40000, 'هزینه ارسال پست - هر کیلو اضافی'),
  ('snappbox_first_kg', 40000, 'هزینه اسنپ باکس - کیلو اول'),
  ('snappbox_extra_kg', 5000, 'هزینه اسنپ باکس - هر کیلو اضافی');

-- Create trigger for updated_at
CREATE TRIGGER update_shipping_settings_updated_at
BEFORE UPDATE ON public.shipping_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();