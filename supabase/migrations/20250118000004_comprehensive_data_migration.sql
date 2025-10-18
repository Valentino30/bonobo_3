-- Comprehensive data migration enhancement
-- Ensures ALL user data is properly migrated from device_id to user_id

-- Drop the old function and create an improved version
DROP FUNCTION IF EXISTS migrate_device_data_to_user(TEXT, UUID);

CREATE OR REPLACE FUNCTION migrate_device_data_to_user(
  p_device_id TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_chats_updated INTEGER;
  v_entitlements_updated INTEGER;
  v_orphaned_entitlements_fixed INTEGER;
BEGIN
  -- STEP 1: Update chats to link them to the user and clear device_id
  UPDATE public.chats
  SET user_id = p_user_id,
      device_id = NULL
  WHERE device_id = p_device_id
    AND user_id IS NULL;

  GET DIAGNOSTICS v_chats_updated = ROW_COUNT;

  -- STEP 2: Update entitlements to link them to the user and clear device_id
  UPDATE public.user_entitlements
  SET user_id = p_user_id,
      device_id = NULL
  WHERE device_id = p_device_id
    AND user_id IS NULL;

  GET DIAGNOSTICS v_entitlements_updated = ROW_COUNT;

  -- STEP 3: Fix orphaned entitlements (entitlements assigned to chats that belong to this user)
  -- This handles the edge case where:
  -- 1. User makes a purchase while anonymous (entitlement has device_id)
  -- 2. User creates account (chats get migrated, but entitlements stay with device_id)
  -- 3. User makes another purchase (new entitlement with device_id)
  -- 4. User signs in again (we need to catch entitlements assigned to user's chats)
  UPDATE public.user_entitlements e
  SET user_id = p_user_id,
      device_id = NULL
  WHERE e.chat_id IN (
    -- Find all chats that belong to this user
    SELECT id FROM public.chats WHERE user_id = p_user_id
  )
  AND e.user_id IS NULL           -- Entitlement not yet migrated
  AND e.device_id IS NOT NULL;    -- Entitlement has device_id

  GET DIAGNOSTICS v_orphaned_entitlements_fixed = ROW_COUNT;

  -- Log the migration results
  RAISE NOTICE 'Migration completed for device_id % -> user_id %', p_device_id, p_user_id;
  RAISE NOTICE '  Chats migrated: %', v_chats_updated;
  RAISE NOTICE '  Entitlements migrated: %', v_entitlements_updated;
  RAISE NOTICE '  Orphaned entitlements fixed: %', v_orphaned_entitlements_fixed;

  RETURN json_build_object(
    'chats_migrated', v_chats_updated,
    'entitlements_migrated', v_entitlements_updated,
    'orphaned_entitlements_fixed', v_orphaned_entitlements_fixed,
    'total_items_migrated', v_chats_updated + v_entitlements_updated + v_orphaned_entitlements_fixed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION migrate_device_data_to_user IS
'Comprehensively migrates all data from device_id to authenticated user_id.
Handles chats, entitlements, and orphaned entitlements assigned to user chats.';

-- Create a function to cleanup ALL orphaned data for existing users
-- This is a one-time fix for users who already have accounts
CREATE OR REPLACE FUNCTION fix_all_orphaned_entitlements()
RETURNS JSON AS $$
DECLARE
  v_fixed_count INTEGER := 0;
  v_user RECORD;
BEGIN
  -- For each user, fix any orphaned entitlements
  FOR v_user IN
    SELECT DISTINCT user_id
    FROM public.chats
    WHERE user_id IS NOT NULL
  LOOP
    -- Fix entitlements assigned to this user's chats
    UPDATE public.user_entitlements e
    SET user_id = v_user.user_id,
        device_id = NULL
    WHERE e.chat_id IN (
      SELECT id FROM public.chats WHERE user_id = v_user.user_id
    )
    AND e.user_id IS NULL
    AND e.device_id IS NOT NULL;

    v_fixed_count := v_fixed_count + (SELECT COUNT(*) FROM public.user_entitlements WHERE user_id = v_user.user_id AND chat_id IS NOT NULL);
  END LOOP;

  RAISE NOTICE 'Fixed % orphaned entitlements across all users', v_fixed_count;

  RETURN json_build_object(
    'orphaned_entitlements_fixed', v_fixed_count,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION fix_all_orphaned_entitlements IS
'One-time cleanup function to fix all existing orphaned entitlements.
Run this after deployment to fix historical data issues.';

-- Execute the cleanup for existing users
SELECT fix_all_orphaned_entitlements();
