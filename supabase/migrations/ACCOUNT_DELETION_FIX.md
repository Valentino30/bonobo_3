# Account Deletion Fix

## Problem

When deleting an account, the associated chats and entitlements were not being deleted. This left orphaned data in the database.

## Root Causes

1. **Foreign key constraints** may not have had `ON DELETE CASCADE` set properly
2. **delete_user_completely function** didn't handle edge cases where:
   - User data wasn't fully migrated from device_id to user_id
   - Multiple data sources (device_id AND user_id) existed

## Solution

The migration `20241217000000_fix_account_deletion.sql` fixes this by:

1. ✅ Ensuring foreign key constraints have `ON DELETE CASCADE`
2. ✅ Updating `delete_user_completely()` function to handle both user_id and device_id
3. ✅ Adding `cleanup_orphaned_data()` function to remove orphaned records

## How to Apply the Fix

### Option 1: Push Migration to Production (Recommended)

```bash
# Push the new migration to your production database
supabase db push
```

This will:
- Fix the foreign key constraints
- Update the delete function
- Add the cleanup function

### Option 2: Manual SQL Execution

If you prefer to run the migration manually:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `20241217000000_fix_account_deletion.sql`
3. Execute the SQL
4. Verify the functions were created:
   ```sql
   SELECT routine_name
   FROM information_schema.routines
   WHERE routine_name IN ('delete_user_completely', 'cleanup_orphaned_data');
   ```

## Cleanup Existing Orphaned Data

If you already have orphaned data from the deleted account, you can clean it up:

### Option 1: Using the Cleanup Function

In Supabase SQL Editor:

```sql
-- Run the cleanup function
SELECT cleanup_orphaned_data();

-- Verify cleanup results
SELECT
  (SELECT COUNT(*) FROM chats WHERE user_id IS NULL AND device_id IS NULL) as orphaned_chats,
  (SELECT COUNT(*) FROM user_entitlements WHERE user_id IS NULL AND device_id IS NULL) as orphaned_entitlements;
```

### Option 2: Manual Cleanup

If you know the specific user_id or device_id:

```sql
-- Delete chats for a specific user
DELETE FROM chats WHERE user_id = 'your-user-id-here';

-- Delete entitlements for a specific user
DELETE FROM user_entitlements WHERE user_id = 'your-user-id-here';

-- Or if you know the device_id
DELETE FROM chats WHERE device_id = 'your-device-id-here';
DELETE FROM user_entitlements WHERE device_id = 'your-device-id-here';
```

### Option 3: Clean All Orphaned Data

**⚠️ WARNING**: This deletes ALL data with no user_id or device_id!

```sql
-- Delete all orphaned chats
DELETE FROM chats WHERE user_id IS NULL AND device_id IS NULL;

-- Delete all orphaned entitlements
DELETE FROM user_entitlements WHERE user_id IS NULL AND device_id IS NULL;
```

## Testing the Fix

1. **Create a test account**:
   - Sign up with a test email
   - Import a chat
   - Make a purchase

2. **Verify data was created**:
   ```sql
   SELECT * FROM chats WHERE user_id = 'your-user-id';
   SELECT * FROM user_entitlements WHERE user_id = 'your-user-id';
   ```

3. **Delete the account** via the app

4. **Verify data was deleted**:
   ```sql
   -- Should return 0 rows
   SELECT * FROM chats WHERE user_id = 'your-user-id';
   SELECT * FROM user_entitlements WHERE user_id = 'your-user-id';
   ```

## How Account Deletion Works Now

When `AuthService.deleteAccount()` is called:

1. **App calls** `delete_user_completely(user_id)` RPC function
2. **Function deletes**:
   - All chats where `user_id` matches OR `device_id` matches
   - All entitlements where `user_id` matches OR `device_id` matches
3. **Function deletes** the user from `auth.users`
4. **Cascade triggers**: Any remaining rows with that `user_id` are automatically deleted due to `ON DELETE CASCADE`

## Verification Queries

After applying the fix, verify everything is set up correctly:

```sql
-- Check foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name IN ('user_id')
  AND tc.table_name IN ('chats', 'user_entitlements');

-- Expected result: delete_rule should be 'CASCADE' for both tables
```

## Prevention

To prevent this issue in the future:

1. ✅ Always use `ON DELETE CASCADE` for foreign keys to auth.users
2. ✅ Test account deletion in development before production
3. ✅ Monitor orphaned data with periodic checks
4. ✅ Ensure migration functions run successfully during signup

## Support

If you encounter issues:

1. Check Supabase logs for errors
2. Verify the migration was applied successfully
3. Run verification queries to check foreign key constraints
4. Test with a fresh test account
