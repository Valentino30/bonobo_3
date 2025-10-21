# i18n Migration - Remaining Work

## ✅ Completed So Far

### Screens
- ✅ `app/chats.tsx` - Loading and import button
- ✅ `app/import-guide.tsx` - All text including platform-specific instructions

### Utilities
- ✅ `utils/share-import-alerts.ts` - All alert messages
- ✅ `constants/import-guide.ts` - Import guide steps

### Translation Files
- ✅ `i18n/locales/en.json` - Comprehensive English translations
- ✅ `i18n/locales/it.json` - Complete Italian translations

---

## ⏳ Remaining Files to Update

Based on the current translation files, here's what still needs to be migrated. All the translation keys are **already in the JSON files**, you just need to replace hardcoded strings with `i18n.t()` calls.

### Priority 1: Remaining Screens

#### 1. `app/profile.tsx`
**Hardcoded Strings:**
- "My Profile"
- "Loading Profile"
- "Settings"
- "Login"
- "Logout"
- "Delete Account"
- "Change Password"
- All alert messages (logout confirmation, delete confirmation)

**Translation Keys Available:**
- `profile.title`
- `profile.loading`
- `profile.settings`
- `profile.login`
- `profile.logout`
- `profile.deleteAccount`
- `profile.changePassword`
- `auth.logoutTitle`, `auth.logoutMessage`
- `auth.deleteAccountTitle`, `auth.deleteAccountMessage`, etc.

**Pattern:**
```typescript
import i18n from '@/i18n/config'

// Replace:
<LoadingScreen title="Loading Profile" />
// With:
<LoadingScreen title={i18n.t('profile.loading')} />

// Replace:
<ThemedButton title="Logout" />
// With:
<ThemedButton title={i18n.t('profile.logout')} />
```

---

#### 2. `app/analysis/[chatId].tsx`
**Hardcoded Strings:**
- "Analysis"
- "Analyzing your conversation..."
- Tab names: "Overview", "Insights"

**Translation Keys Available:**
- `analysis.title`
- `analysis.loading`
- `analysis.tabs.overview`
- `analysis.tabs.insights`

**Pattern:**
```typescript
import i18n from '@/i18n/config'

<LoadingScreen title={i18n.t('analysis.loading')} />
<TabButton text={i18n.t('analysis.tabs.overview')} />
<TabButton text={i18n.t('analysis.tabs.insights')} />
```

---

### Priority 2: Major Components

#### 3. `components/analysis-insights.tsx`
**Hardcoded Strings:**
- "UNLOCK WITH AI"
- "UNLOCKING"
- Insight category names: "Red Flags", "Green Flags", etc.

**Translation Keys Available:**
- `analysis.insights.unlockButton`
- `analysis.insights.unlocking`
- `analysis.insights.redFlags`
- `analysis.insights.greenFlags`
- `analysis.insights.attachmentStyle`
- `analysis.insights.reciprocityScore`
- `analysis.insights.compliments`
- `analysis.insights.criticism`
- `analysis.insights.compatibilityScore`
- `analysis.insights.relationshipTips`

---

#### 4. `components/locked-insight-card.tsx`
**Hardcoded Strings:**
- "UNLOCK WITH AI"
- "UNLOCKING"

**Translation Keys Available:**
- `analysis.insights.unlockButton`
- `analysis.insights.unlocking`

---

#### 5. `components/paywall.tsx`
**Hardcoded Strings:**
- "Unlock AI Insights"
- "Get deep relationship analysis powered by advanced AI"
- "One-Time Purchase"
- "Weekly Pass"
- "Monthly Pass"
- "Best value per day!"
- "Maximum flexibility!"

**Translation Keys Available:**
- `paywall.title`
- `paywall.subtitle`
- `paywall.oneTime`
- `paywall.weekly`
- `paywall.monthly`
- `paywall.bestValue`
- `paywall.maxFlexibility`

---

#### 6. `components/payment-auth-screen.tsx`
**Hardcoded Strings:**
- "Secure Your Purchase"
- "Create an account to access your insights from any device and keep your purchases safe"
- "Email address"
- "Password"
- "Confirm password"
- "Create Account & Continue"
- "Maybe Later"
- All error messages

**Translation Keys Available:**
- `paywall.secureTitle`
- `paywall.secureSubtitle`
- `auth.emailLabel`
- `auth.passwordLabel`
- `auth.confirmPasswordLabel`
- `auth.createAccountButton`
- `common.maybeLater`
- All error messages in `auth.*` and `errors.*`

---

#### 7. `components/login-card.tsx`
**Hardcoded Strings:**
- "Email address"
- "Password"
- "Login"
- "your@email.com"
- "Minimum 8 characters"

**Translation Keys Available:**
- `auth.emailLabel`
- `auth.emailPlaceholder`
- `auth.passwordLabel`
- `auth.passwordPlaceholder`
- `auth.loginButton`

---

#### 8. `components/password-change-card.tsx`
**Hardcoded Strings:**
- "Change Password"
- "New password (min. 8 characters)"
- "Confirm new password"
- "Update"
- "Cancel"

**Translation Keys Available:**
- `profile.changePassword`
- `auth.newPasswordLabel`
- `auth.confirmNewPasswordLabel`
- `common.update`
- `common.cancel`

---

#### 9. `components/danger-zone-card.tsx`
**Hardcoded Strings:**
- "Clear All Data"
- "Remove all chats and insights from your device."
- "Delete Account"
- "Permanently delete your account and all data. This cannot be undone."

**Translation Keys Available:**
- `chats.clearAllTitle`
- `chats.clearAllMessage`
- `profile.deleteAccount`
- `auth.deleteAccountMessage`

---

#### 10. `components/chat-list.tsx`
**Hardcoded Strings:**
- "No chats yet"
- "Import a WhatsApp chat to get started"
- "Analyze" button

**Translation Keys Available:**
- `chats.empty`
- `chats.emptyDescription`
- `chats.analyzeButton`

---

#### 11. `components/chat-card.tsx`
**Hardcoded Strings:**
- "Analyze" button
- Any labels or helper text

**Translation Keys Available:**
- `chats.analyzeButton`

---

#### 12. `components/welcome-state.tsx` (if it exists)
**Pattern:**
```typescript
import i18n from '@/i18n/config'
```

---

### Priority 3: Hooks with User Messages

#### 13. `hooks/use-profile.ts`
**Hardcoded Strings:**
- "Missing Credentials"
- "Please enter your email and password"
- "Login Failed"
- "Password Too Short"
- "Password must be at least 8 characters"
- "Password Mismatch"
- "Passwords do not match"
- "Password Updated"
- "Your password has been updated successfully"
- "Update Failed"
- "Logout"
- "Are you sure you want to logout?"
- "Delete Account"
- Various delete account confirmation messages
- "Account Deleted"
- "Your account and all data have been permanently deleted."
- "Error"

**Translation Keys Available:**
- All in `auth.*` section:
  - `auth.missingCredentials`
  - `auth.missingCredentialsMessage`
  - `auth.loginFailed`
  - `auth.passwordTooShort`
  - `auth.passwordTooShortMessage`
  - `auth.passwordMismatch`
  - `auth.passwordMismatchMessage`
  - `auth.passwordUpdated`
  - `auth.passwordUpdatedMessage`
  - `auth.updateFailed`
  - `auth.logoutTitle`
  - `auth.logoutMessage`
  - `auth.deleteAccountTitle`
  - `auth.deleteAccountWarning`
  - `auth.deleteAccountFinalWarning`
  - `auth.deleteAccountFinalMessage`
  - `auth.deleteEverythingButton`
  - `auth.accountDeleted`
  - `auth.accountDeletedMessage`
  - `errors.error`

**Pattern:**
```typescript
import i18n from '@/i18n/config'

// Replace:
onShowAlert('Missing Credentials', 'Please enter your email and password', [{ text: 'OK' }])
// With:
onShowAlert(i18n.t('auth.missingCredentials'), i18n.t('auth.missingCredentialsMessage'), [{ text: i18n.t('alerts.ok') }])
```

---

#### 14. `hooks/use-account-creation.ts`
**Hardcoded Strings:**
- "Please fill in all fields"
- "Please enter a valid email address"
- "Password must be at least 8 characters"
- "Passwords do not match"
- "Failed to create account"
- "Account created but email confirmation is required. Please check your email and then login."
- "An unexpected error occurred"

**Translation Keys Available:**
- Can use existing `auth.*` keys or add new ones to `i18n/locales/en.json` if needed
- Most of these validation messages should be added to the JSON files

**Action Needed:**
1. Add missing validation keys to `en.json` and `it.json`
2. Replace hardcoded strings with `i18n.t()` calls

---

#### 15. `hooks/use-chats.ts`
**Hardcoded Strings:**
- Alert messages for delete confirmation
- "Are you sure you want to delete this chat?"
- "Delete Chat"
- etc.

**Translation Keys Available:**
- `chats.deleteConfirmTitle`
- `chats.deleteConfirmMessage`
- `common.cancel`
- `common.delete`

---

### Priority 4: Components with Minor Text

#### 16. `components/analysis-loading.tsx`
Check if it has any hardcoded strings (probably just uses the prop passed to it)

#### 17. `components/loading-screen.tsx`
Check if it has any hardcoded strings

#### 18. `components/info-card.tsx`
Check if it has any hardcoded strings (privacy message already handled)

#### 19. `components/info-banner.tsx`
Check if it has any hardcoded strings

---

## Quick Migration Checklist

For each file, follow this process:

1. **Read the file** to identify hardcoded user-facing strings
2. **Import i18n**: Add `import i18n from '@/i18n/config'` at the top
3. **Replace strings**: Change `"Hardcoded Text"` to `i18n.t('category.key')`
4. **Test**: Run the app to ensure translations work
5. **Format**: Run `npx prettier --write path/to/file.tsx`
6. **Commit**: Commit the changes with a clear message

## Example Migration

**Before:**
```typescript
export default function ProfileScreen() {
  return (
    <View>
      <ThemedText>My Profile</ThemedText>
      <ThemedButton title="Logout" onPress={handleLogout} />
      <ThemedButton title="Delete Account" onPress={handleDelete} />
    </View>
  )
}
```

**After:**
```typescript
import i18n from '@/i18n/config'

export default function ProfileScreen() {
  return (
    <View>
      <ThemedText>{i18n.t('profile.title')}</ThemedText>
      <ThemedButton title={i18n.t('profile.logout')} onPress={handleLogout} />
      <ThemedButton title={i18n.t('profile.deleteAccount')} onPress={handleDelete} />
    </View>
  )
}
```

## Translation Keys Reference

All keys are in `i18n/locales/en.json`. The structure is:
- `common.*` - Common UI elements
- `navigation.*` - Navigation labels
- `chats.*` - Chats screen
- `importGuide.*` - Import guide
- `analysis.*` - Analysis screen
- `profile.*` - Profile screen
- `auth.*` - Authentication
- `paywall.*` - Paywall/payment
- `privacy.*` - Privacy messages
- `errors.*` - Error messages
- `alerts.*` - Alert button texts
- `import.*` - Import alerts

## Testing

After updating each file:
1. Test in English (device locale: en)
2. Test in Italian (device locale: it)
3. Verify dynamic values interpolate correctly
4. Check that all strings display properly

## Need to Add New Translations?

If you find hardcoded strings not in the JSON files:

1. Add to `i18n/locales/en.json`:
```json
{
  "yourSection": {
    "yourKey": "English text here"
  }
}
```

2. Add to `i18n/locales/it.json`:
```json
{
  "yourSection": {
    "yourKey": "Testo italiano qui"
  }
}
```

3. Use in code:
```typescript
i18n.t('yourSection.yourKey')
```

---

**Estimated remaining work:** ~15-20 files
**Time estimate:** 2-3 hours for careful, systematic migration
**Current progress:** ~20% complete (4/20 files done)
