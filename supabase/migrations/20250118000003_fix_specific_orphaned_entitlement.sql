-- Fix the specific orphaned entitlement for chat 1760807938998
-- This entitlement has device_id but the chat has user_id

UPDATE public.user_entitlements
SET user_id = '425e39d2-481c-4073-8930-73f30a21fdf3',
    device_id = NULL
WHERE id = '00352025-fa49-40c7-89ff-2eaf67fa1534'
  AND device_id IS NOT NULL
  AND user_id IS NULL;

-- Verify the update
DO $$
DECLARE
  v_entitlement RECORD;
BEGIN
  SELECT * INTO v_entitlement
  FROM public.user_entitlements
  WHERE id = '00352025-fa49-40c7-89ff-2eaf67fa1534';

  IF v_entitlement.user_id IS NOT NULL AND v_entitlement.device_id IS NULL THEN
    RAISE NOTICE 'SUCCESS: Entitlement migrated to user_id: %', v_entitlement.user_id;
  ELSE
    RAISE WARNING 'Entitlement not fully migrated. user_id: %, device_id: %',
      v_entitlement.user_id, v_entitlement.device_id;
  END IF;
END $$;
