-- Add new columns to products table for badges
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS badge_new BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badge_bestseller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badge_special_discount BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- Create product_questions table for Q&A
CREATE TABLE public.product_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_answers table
CREATE TABLE public.product_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.product_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  answer TEXT NOT NULL,
  is_admin_answer BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_views table for tracking views
CREATE TABLE public.product_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_carts table for persistent carts
CREATE TABLE public.user_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create ticket_messages table
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL DEFAULT 'user',
  message TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_questions
CREATE POLICY "Everyone can view approved questions"
ON public.product_questions FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can view their own questions"
ON public.product_questions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all questions"
ON public.product_questions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create questions"
ON public.product_questions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all questions"
ON public.product_questions FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for product_answers
CREATE POLICY "Everyone can view approved answers"
ON public.product_answers FOR SELECT
USING (is_approved = true OR is_admin_answer = true);

CREATE POLICY "Users can view their own answers"
ON public.product_answers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all answers"
ON public.product_answers FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create answers"
ON public.product_answers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all answers"
ON public.product_answers FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for product_views
CREATE POLICY "Anyone can create views"
ON public.product_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all product views"
ON public.product_views FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_carts
CREATE POLICY "Users can manage their own cart"
ON public.user_carts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
ON public.support_tickets FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all tickets"
ON public.support_tickets FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for ticket_messages
CREATE POLICY "Users can view messages of their tickets"
ON public.ticket_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.support_tickets 
  WHERE support_tickets.id = ticket_messages.ticket_id 
  AND support_tickets.user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their tickets"
ON public.ticket_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.support_tickets 
  WHERE support_tickets.id = ticket_messages.ticket_id 
  AND support_tickets.user_id = auth.uid()
));

CREATE POLICY "Admins can view all messages"
ON public.ticket_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all messages"
ON public.ticket_messages FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create function to update product view count
CREATE OR REPLACE FUNCTION public.update_product_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET view_count = view_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- Create trigger for view count
CREATE TRIGGER on_product_view_insert
AFTER INSERT ON public.product_views
FOR EACH ROW
EXECUTE FUNCTION public.update_product_view_count();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;