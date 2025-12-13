-- Add verification_token column to pending_payments table for secure payment callback validation
ALTER TABLE public.pending_payments 
ADD COLUMN verification_token TEXT;