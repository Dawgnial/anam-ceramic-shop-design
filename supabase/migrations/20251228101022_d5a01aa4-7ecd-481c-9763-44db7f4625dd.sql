-- Add missing foreign key so PostgREST can join orders -> profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles (id)
    ON DELETE RESTRICT;
  END IF;
END $$;