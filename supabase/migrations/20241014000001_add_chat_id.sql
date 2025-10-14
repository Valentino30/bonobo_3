-- Add chat_id column to track which chat the one-time analysis was used for
ALTER TABLE public.user_entitlements
ADD COLUMN IF NOT EXISTS chat_id TEXT;

-- Create index for faster lookups by chat_id
CREATE INDEX IF NOT EXISTS idx_chat_id ON public.user_entitlements(chat_id);
