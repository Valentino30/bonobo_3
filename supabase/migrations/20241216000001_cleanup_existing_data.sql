-- Make device_id nullable since authenticated users don't need it
-- First make the columns nullable
ALTER TABLE public.chats ALTER COLUMN device_id DROP NOT NULL;
ALTER TABLE public.user_entitlements ALTER COLUMN device_id DROP NOT NULL;

-- Cleanup existing chats and entitlements that have both user_id and device_id
-- This fixes data from before the migration function was updated

-- Clear device_id from chats that have a user_id
UPDATE public.chats
SET device_id = NULL
WHERE user_id IS NOT NULL AND device_id IS NOT NULL;

-- Clear device_id from entitlements that have a user_id
UPDATE public.user_entitlements
SET device_id = NULL
WHERE user_id IS NOT NULL AND device_id IS NOT NULL;
