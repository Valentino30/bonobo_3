-- Add missing DELETE policy for user_entitlements table
-- This is required for the delete_user_completely function to work

-- Create policy to allow deletion (service role + security definer functions)
CREATE POLICY "Allow delete for authenticated operations"
  ON public.user_entitlements
  FOR DELETE
  USING (true);

COMMENT ON POLICY "Allow delete for authenticated operations" ON public.user_entitlements
IS 'Allows deletion of entitlements via SECURITY DEFINER functions like delete_user_completely';
