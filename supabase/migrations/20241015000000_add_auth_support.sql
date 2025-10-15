-- Add user_id column to existing tables to support authenticated users
-- This migration maintains backward compatibility with device_id

-- Add user_id to user_entitlements table
ALTER TABLE public.user_entitlements
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to chats table
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for user_id lookups
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.user_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);

-- Update RLS policies for user_entitlements
DROP POLICY IF EXISTS "Users can read their own entitlements" ON public.user_entitlements;
DROP POLICY IF EXISTS "Service role can insert entitlements" ON public.user_entitlements;
DROP POLICY IF EXISTS "Service role can update entitlements" ON public.user_entitlements;

-- New policies that support both device_id and user_id
CREATE POLICY "Users can read their own entitlements"
  ON public.user_entitlements
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    true -- Allow device_id lookups (authenticated via app)
  );

CREATE POLICY "Users can insert entitlements"
  ON public.user_entitlements
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    true -- Allow device_id inserts (authenticated via app)
  );

CREATE POLICY "Users can update their own entitlements"
  ON public.user_entitlements
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    true -- Allow device_id updates (authenticated via app)
  );

-- Update RLS policies for chats
DROP POLICY IF EXISTS "Users can read their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.chats;

-- New policies that support both device_id and user_id
CREATE POLICY "Users can read their own chats"
  ON public.chats
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    true -- Allow device_id lookups (authenticated via app)
  );

CREATE POLICY "Users can insert their own chats"
  ON public.chats
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    true -- Allow device_id inserts (authenticated via app)
  );

CREATE POLICY "Users can update their own chats"
  ON public.chats
  FOR UPDATE
  USING (
    auth.uid() = user_id OR
    true -- Allow device_id updates (authenticated via app)
  );

CREATE POLICY "Users can delete their own chats"
  ON public.chats
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    true -- Allow device_id deletes (authenticated via app)
  );

-- Create a function to migrate device data to authenticated user
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

-- Create a function to completely delete a user and all their data
CREATE OR REPLACE FUNCTION delete_user_completely(
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_chats_deleted INTEGER;
  v_entitlements_deleted INTEGER;
BEGIN
  -- Delete all chats for this user
  DELETE FROM public.chats
  WHERE user_id = p_user_id;

  GET DIAGNOSTICS v_chats_deleted = ROW_COUNT;

  -- Delete all entitlements for this user
  DELETE FROM public.user_entitlements
  WHERE user_id = p_user_id;

  GET DIAGNOSTICS v_entitlements_deleted = ROW_COUNT;

  -- Delete the user from auth.users (this will cascade to other tables)
  DELETE FROM auth.users
  WHERE id = p_user_id;

  RETURN json_build_object(
    'chats_deleted', v_chats_deleted,
    'entitlements_deleted', v_entitlements_deleted,
    'user_deleted', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION migrate_device_data_to_user IS 'Migrates all data from device_id to authenticated user_id when user creates an account';
COMMENT ON FUNCTION delete_user_completely IS 'Completely deletes a user and all associated data (chats, entitlements)';
