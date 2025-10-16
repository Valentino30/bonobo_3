-- Disable email confirmation requirement for mobile app
-- This ensures users get immediate access after account creation
-- which is critical for the payment flow

-- Note: This migration provides SQL documentation for the configuration change
-- The actual setting must be changed in Supabase Dashboard:
-- Authentication > Settings > Email Auth > "Enable email confirmations" = OFF

-- This file serves as documentation of the required configuration
-- and can be used to verify the setting in production

-- To verify the setting is correct, you can check:
SELECT setting_name, value
FROM auth.config
WHERE setting_name = 'email_confirm';

-- Expected result: email_confirm should be false or not present

COMMENT ON SCHEMA auth IS 'Authentication schema - email confirmation should be DISABLED for immediate mobile app access';
