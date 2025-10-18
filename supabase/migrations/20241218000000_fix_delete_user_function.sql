-- Fix delete_user_completely function to properly handle device_id lookup
-- The auth.users table doesn't have a device_id column, so we need to
-- get device_ids from the user's chats and entitlements tables

CREATE OR REPLACE FUNCTION delete_user_completely(
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_chats_deleted INTEGER;
  v_entitlements_deleted INTEGER;
  v_device_ids TEXT[];
BEGIN
  -- Get all device_ids associated with this user from chats and entitlements
  -- This handles cases where the user had data before authentication
  SELECT ARRAY_AGG(DISTINCT device_id) INTO v_device_ids
  FROM (
    SELECT device_id FROM public.chats WHERE user_id = p_user_id
    UNION
    SELECT device_id FROM public.user_entitlements WHERE user_id = p_user_id
  ) AS user_devices
  WHERE device_id IS NOT NULL;

  -- Delete all chats for this user (both by user_id and any associated device_ids)
  DELETE FROM public.chats
  WHERE user_id = p_user_id
     OR (v_device_ids IS NOT NULL AND device_id = ANY(v_device_ids));

  GET DIAGNOSTICS v_chats_deleted = ROW_COUNT;

  -- Delete all entitlements for this user (both by user_id and any associated device_ids)
  DELETE FROM public.user_entitlements
  WHERE user_id = p_user_id
     OR (v_device_ids IS NOT NULL AND device_id = ANY(v_device_ids));

  GET DIAGNOSTICS v_entitlements_deleted = ROW_COUNT;

  -- Delete the user from auth.users (this will cascade to other tables)
  -- Due to ON DELETE CASCADE, any remaining rows with this user_id will be deleted
  DELETE FROM auth.users
  WHERE id = p_user_id;

  RETURN json_build_object(
    'chats_deleted', v_chats_deleted,
    'entitlements_deleted', v_entitlements_deleted,
    'device_ids_cleaned', COALESCE(array_length(v_device_ids, 1), 0),
    'user_deleted', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_user_completely IS 'Completely deletes a user and all associated data (chats, entitlements). Handles both authenticated user_id and any device_ids that were migrated to this user account.';
