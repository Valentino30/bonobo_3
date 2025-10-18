-- Fix orphaned entitlements that have device_id but their associated chat has user_id
-- This happens when a user makes a purchase, then creates an account
-- The chat gets migrated to user_id, but the entitlement stays with device_id

-- Update entitlements to match their associated chat's user_id
UPDATE public.user_entitlements e
SET user_id = c.user_id,
    device_id = NULL
FROM public.chats c
WHERE e.chat_id = c.id              -- Entitlement is assigned to a chat
  AND e.device_id IS NOT NULL       -- Entitlement has device_id
  AND e.user_id IS NULL             -- But no user_id
  AND c.user_id IS NOT NULL         -- Chat has been migrated to user
  AND c.device_id IS NULL;          -- Chat no longer has device_id

-- Log how many were updated
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Migrated % orphaned entitlements to match their chats user_id', v_count;
END $$;
