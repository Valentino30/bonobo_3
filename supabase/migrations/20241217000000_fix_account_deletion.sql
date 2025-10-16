-- Fix account deletion to properly cascade delete all user data
-- This migration ensures that when a user is deleted, all their chats and entitlements are deleted

-- First, verify the foreign key constraints exist with CASCADE
-- Drop existing foreign keys if they don't have CASCADE
ALTER TABLE public.user_entitlements
DROP CONSTRAINT IF EXISTS user_entitlements_user_id_fkey;

ALTER TABLE public.chats
DROP CONSTRAINT IF EXISTS chats_user_id_fkey;

-- Re-add foreign key constraints with proper CASCADE behavior
ALTER TABLE public.user_entitlements
ADD CONSTRAINT user_entitlements_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.chats
ADD CONSTRAINT chats_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Update the delete_user_completely function to handle both device_id and user_id
-- This ensures complete cleanup even if migration failed
CREATE OR REPLACE FUNCTION delete_user_completely(
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_chats_deleted INTEGER;
  v_entitlements_deleted INTEGER;
  v_device_id TEXT;
BEGIN
  -- Get the device_id if it exists (before migration completed)
  SELECT device_id INTO v_device_id
  FROM auth.users
  WHERE id = p_user_id
  LIMIT 1;

  -- Delete all chats for this user (both by user_id and device_id)
  DELETE FROM public.chats
  WHERE user_id = p_user_id
     OR (v_device_id IS NOT NULL AND device_id = v_device_id);

  GET DIAGNOSTICS v_chats_deleted = ROW_COUNT;

  -- Delete all entitlements for this user (both by user_id and device_id)
  DELETE FROM public.user_entitlements
  WHERE user_id = p_user_id
     OR (v_device_id IS NOT NULL AND device_id = v_device_id);

  GET DIAGNOSTICS v_entitlements_deleted = ROW_COUNT;

  -- Delete the user from auth.users (this will cascade to other tables)
  -- Due to ON DELETE CASCADE, any remaining rows with this user_id will be deleted
  DELETE FROM auth.users
  WHERE id = p_user_id;

  RETURN json_build_object(
    'chats_deleted', v_chats_deleted,
    'entitlements_deleted', v_entitlements_deleted,
    'user_deleted', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION delete_user_completely IS 'Completely deletes a user and all associated data (chats, entitlements). Handles both migrated (user_id) and non-migrated (device_id) data.';

-- Create a cleanup function to remove orphaned data (data without user_id or device_id)
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS JSON AS $$
DECLARE
  v_chats_cleaned INTEGER;
  v_entitlements_cleaned INTEGER;
BEGIN
  -- Delete chats with no user_id or device_id
  DELETE FROM public.chats
  WHERE user_id IS NULL AND device_id IS NULL;

  GET DIAGNOSTICS v_chats_cleaned = ROW_COUNT;

  -- Delete entitlements with no user_id or device_id
  DELETE FROM public.user_entitlements
  WHERE user_id IS NULL AND device_id IS NULL;

  GET DIAGNOSTICS v_entitlements_cleaned = ROW_COUNT;

  RETURN json_build_object(
    'chats_cleaned', v_chats_cleaned,
    'entitlements_cleaned', v_entitlements_cleaned
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_orphaned_data IS 'Removes orphaned data that has neither user_id nor device_id';
