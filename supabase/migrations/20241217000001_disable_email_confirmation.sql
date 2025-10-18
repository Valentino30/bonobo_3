-- Disable email confirmation requirement for mobile app
-- This ensures users get immediate access after account creation
-- which is critical for the payment flow

-- Note: This migration provides SQL documentation for the configuration change
-- The actual setting must be changed in Supabase Dashboard:
-- Authentication > Settings > Email Auth > "Enable email confirmations" = OFF

-- This file serves as documentation of the required configuration
-- No SQL changes needed - this is a dashboard setting only

-- Migration placeholder: The first account deletion migration (20241217000000_fix_account_deletion.sql)
-- contains the actual changes needed for account deletion to work properly.
