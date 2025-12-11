-- Create pending_payments table for storing payment data before verification
CREATE TABLE public.pending_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  shipping_address TEXT NOT NULL,
  items JSONB NOT NULL,
  coupon_id UUID NULL,
  authority TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  order_id UUID NULL,
  ref_id TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_payments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own pending payments
CREATE POLICY "Users can view their own pending payments"
ON public.pending_payments
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create pending payments
CREATE POLICY "Users can create pending payments"
ON public.pending_payments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow service role to manage all pending payments (for edge functions)
CREATE POLICY "Service role can manage all pending payments"
ON public.pending_payments
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_pending_payments_updated_at
BEFORE UPDATE ON public.pending_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();