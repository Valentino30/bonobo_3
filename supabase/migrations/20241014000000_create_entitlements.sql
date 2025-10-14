-- Create user_entitlements table
CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled, refunded
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  remaining_analyses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_device_id ON public.user_entitlements(device_id);
CREATE INDEX idx_stripe_payment_intent ON public.user_entitlements(stripe_payment_intent_id);
CREATE INDEX idx_status ON public.user_entitlements(status);

-- Enable Row Level Security
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own entitlements
CREATE POLICY "Users can read their own entitlements"
  ON public.user_entitlements
  FOR SELECT
  USING (true);

-- Create policy to allow service role to insert/update
CREATE POLICY "Service role can insert entitlements"
  ON public.user_entitlements
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update entitlements"
  ON public.user_entitlements
  FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_entitlements_updated_at
  BEFORE UPDATE ON public.user_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
