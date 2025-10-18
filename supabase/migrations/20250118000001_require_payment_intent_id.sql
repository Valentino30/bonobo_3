-- CRITICAL SECURITY FIX: Require stripe_payment_intent_id for all entitlements
-- This prevents creation of "free" entitlements without valid payments

-- First, delete any existing entitlements without a valid stripe_payment_intent_id
-- These are invalid test/orphaned entitlements that should never have been created
DELETE FROM public.user_entitlements
WHERE stripe_payment_intent_id IS NULL
   OR stripe_payment_intent_id = '';

-- Add NOT NULL constraint to prevent future creation of entitlements without payment
ALTER TABLE public.user_entitlements
ALTER COLUMN stripe_payment_intent_id SET NOT NULL;

-- Add CHECK constraint to prevent empty strings
ALTER TABLE public.user_entitlements
ADD CONSTRAINT stripe_payment_intent_id_not_empty
CHECK (stripe_payment_intent_id != '');

COMMENT ON CONSTRAINT stripe_payment_intent_id_not_empty ON public.user_entitlements
IS 'Ensures all entitlements have a valid Stripe payment intent ID - prevents free access without payment';
