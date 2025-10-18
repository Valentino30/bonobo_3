-- Clean up entitlements assigned to chats that no longer exist
-- This can happen when a user deletes a chat but the entitlement remains

-- Mark entitlements as 'cancelled' if their assigned chat no longer exists
UPDATE public.user_entitlements
SET status = 'cancelled'
WHERE chat_id IS NOT NULL
  AND chat_id NOT IN (SELECT id FROM public.chats)
  AND status = 'active';

-- Log the cleanup
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Cancelled % entitlements for deleted chats', v_count;
END $$;

-- Create a function to automatically cleanup orphaned chat entitlements
CREATE OR REPLACE FUNCTION cleanup_orphaned_chat_entitlements()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.user_entitlements
  SET status = 'cancelled'
  WHERE chat_id IS NOT NULL
    AND chat_id NOT IN (SELECT id FROM public.chats)
    AND status = 'active';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_orphaned_chat_entitlements IS
'Marks entitlements as cancelled if their assigned chat no longer exists.
This handles cases where users delete chats but the entitlement remains.';
