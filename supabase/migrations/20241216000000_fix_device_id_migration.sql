-- Fix the migration function to clear device_id after linking to user
-- This ensures that after a user creates an account, their chats are no longer
-- accessible via the anonymous device_id

CREATE OR REPLACE FUNCTION migrate_device_data_to_user(
  p_device_id TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_chats_updated INTEGER;
  v_entitlements_updated INTEGER;
BEGIN
  -- Update chats to link them to the user and clear device_id
  -- This ensures logged-out users can't see chats that belong to authenticated users
  UPDATE public.chats
  SET user_id = p_user_id,
      device_id = NULL
  WHERE device_id = p_device_id
    AND user_id IS NULL;

  GET DIAGNOSTICS v_chats_updated = ROW_COUNT;

  -- Update entitlements to link them to the user and clear device_id
  UPDATE public.user_entitlements
  SET user_id = p_user_id,
      device_id = NULL
  WHERE device_id = p_device_id
    AND user_id IS NULL;

  GET DIAGNOSTICS v_entitlements_updated = ROW_COUNT;

  RETURN json_build_object(
    'chats_migrated', v_chats_updated,
    'entitlements_migrated', v_entitlements_updated
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION migrate_device_data_to_user IS 'Migrates all data from device_id to authenticated user_id and clears device_id to prevent anonymous access';
