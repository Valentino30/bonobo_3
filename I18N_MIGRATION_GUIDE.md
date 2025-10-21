# i18n Migration Guide

This guide explains how to migrate hardcoded strings to use the i18n system.

## ✅ Setup Complete

The i18n infrastructure is fully set up:
- ✅ `expo-localization` and `i18n-js` installed
- ✅ English translations in `i18n/locales/en.json`
- ✅ Italian translations in `i18n/locales/it.json`
- ✅ i18n configuration in `i18n/config.ts`
- ✅ TypeScript types in `i18n/types.ts`
- ✅ Example implementation in `app/chats.tsx`

## How to Use i18n

### 1. Import i18n

```typescript
import i18n from '@/i18n/config'
```

### 2. Replace Hardcoded Strings

**Before:**
```typescript
<ThemedButton title="Import Chat" />
<LoadingScreen title="Loading Chats" subtitle="Fetching your conversations..." />
```

**After:**
```typescript
<ThemedButton title={i18n.t('chats.importButton')} />
<LoadingScreen
  title={i18n.t('chats.loading')}
  subtitle={i18n.t('chats.fetching')}
/>
```

### 3. With Interpolation (for dynamic values)

If you need to insert variables into translations:

**Add to translation file:**
```json
{
  "chats": {
    "messageCount": "{{count}} messages"
  }
}
```

**Use in code:**
```typescript
i18n.t('chats.messageCount', { count: 42 })
// Result: "42 messages" (English) or "42 messaggi" (Italian)
```

## Translation Keys Reference

All translation keys are organized in `i18n/locales/en.json`:

### Common
- `common.cancel` - "Cancel"
- `common.delete` - "Delete"
- `common.loading` - "Loading..."
- `common.email` - "Email"
- `common.password` - "Password"
- `common.update` - "Update"
- `common.gotIt` - "GOT IT"
- `common.maybeLater` - "Maybe Later"
- `common.pleaseWait` - "Please wait..."

### Navigation
- `navigation.chats` - "Your Chats"
- `navigation.analysis` - "Analysis"
- `navigation.profile` - "My Profile"
- `navigation.importGuide` - "Import Guide"

### Chats Screen
- `chats.title` - "Your Chats"
- `chats.loading` - "Loading Chats"
- `chats.fetching` - "Fetching your conversations..."
- `chats.empty` - "No chats yet"
- `chats.emptyDescription` - "Import a WhatsApp chat to get started"
- `chats.importButton` - "Import Chat"
- `chats.analyzeButton` - "Analyze"
- `chats.deleteConfirmTitle` - "Delete Chat"
- `chats.deleteConfirmMessage` - "Are you sure you want to delete this chat?"
- `chats.clearAllTitle` - "Clear All Data"
- `chats.clearAllMessage` - "Remove all chats and insights from your device."
- `chats.clearAllButton` - "Clear Data"

### Import Guide Screen
- `importGuide.title` - "How to Import WhatsApp Chats"
- `importGuide.subtitle` - "Follow these steps:"
- `importGuide.supportNote` - "Currently supporting WhatsApp only"
- `importGuide.step1` through `importGuide.step5` - Step instructions

### Analysis Screen
- `analysis.title` - "Analysis"
- `analysis.loading` - "Analyzing your conversation..."
- `analysis.tabs.overview` - "Overview"
- `analysis.tabs.insights` - "Insights"
- `analysis.insights.unlockButton` - "UNLOCK WITH AI"
- `analysis.insights.unlocking` - "UNLOCKING"
- `analysis.insights.redFlags` through `analysis.insights.relationshipTips` - Insight categories

### Profile Screen
- `profile.title` - "My Profile"
- `profile.loading` - "Loading Profile"
- `profile.settings` - "Settings"
- `profile.login` - "Login"
- `profile.logout` - "Logout"
- `profile.deleteAccount` - "Delete Account"
- `profile.changePassword` - "Change Password"

### Auth (Login/Signup)
- `auth.emailLabel` - "Email address"
- `auth.emailPlaceholder` - "your@email.com"
- `auth.passwordLabel` - "Password"
- `auth.loginButton` - "Login"
- `auth.createAccountButton` - "Create Account & Continue"
- `auth.missingCredentials` - "Missing Credentials"
- `auth.missingCredentialsMessage` - "Please enter your email and password"
- And many more auth-related messages...

### Paywall
- `paywall.title` - "Unlock AI Insights"
- `paywall.subtitle` - "Get deep relationship analysis powered by advanced AI"
- `paywall.oneTime` - "One-Time Purchase"
- `paywall.weekly` - "Weekly Pass"
- `paywall.monthly` - "Monthly Pass"
- And more...

### Privacy
- `privacy.title` - "Your Privacy Matters"
- `privacy.message` - Full privacy message
- `privacy.dataSecure` - Data security message

### Errors & Alerts
- `errors.generic` - "An error occurred"
- `errors.networkError` - "Network error. Please check your connection."
- `errors.tryAgain` - "Please try again"
- `alerts.success`, `alerts.error`, `alerts.warning`, `alerts.info`

## Files to Update

### Priority 1: Screens (app/)
- ✅ `app/chats.tsx` - Already done (example)
- ⏳ `app/import-guide.tsx`
- ⏳ `app/profile.tsx`
- ⏳ `app/analysis/[chatId].tsx`

### Priority 2: Major Components (components/)
- ⏳ `components/chat-list.tsx`
- ⏳ `components/chat-card.tsx`
- ⏳ `components/analysis-insights.tsx`
- ⏳ `components/analysis-overview.tsx`
- ⏳ `components/locked-insight-card.tsx`
- ⏳ `components/paywall.tsx`
- ⏳ `components/payment-auth-screen.tsx`
- ⏳ `components/login-card.tsx`
- ⏳ `components/password-change-card.tsx`
- ⏳ `components/danger-zone-card.tsx`

### Priority 3: Hooks with User Messages (hooks/)
- ⏳ `hooks/use-chats.ts` - Alert messages
- ⏳ `hooks/use-profile.ts` - Alert messages
- ⏳ `hooks/use-account-creation.ts` - Error messages
- ⏳ `hooks/use-share-import.ts` - Alert messages

## Testing

1. **Test with English locale:**
   - Device settings: English
   - App should show all English text

2. **Test with Italian locale:**
   - Device settings: Italian
   - App should show all Italian text

3. **Test with unsupported locale:**
   - Device settings: French/German/etc
   - App should fallback to English

## Adding New Translations

1. Add to `i18n/locales/en.json`:
```json
{
  "myFeature": {
    "myKey": "English text"
  }
}
```

2. Add corresponding Italian to `i18n/locales/it.json`:
```json
{
  "myFeature": {
    "myKey": "Testo italiano"
  }
}
```

3. Use in code:
```typescript
i18n.t('myFeature.myKey')
```

## Tips

- ✅ Keep translation keys organized by feature/screen
- ✅ Use descriptive key names (e.g., `chats.importButton` not just `import`)
- ✅ Test with both locales before committing
- ✅ Don't translate technical strings (console.log, error codes, etc.)
- ✅ Translate all user-facing text
- ✅ Consider context when translating (button vs heading vs message)

## Language Switching (Optional Future Enhancement)

To add a language selector in settings:

```typescript
import { setLocale } from '@/i18n/config'

// In settings screen
<ThemedButton
  title="Switch to Italian"
  onPress={() => {
    setLocale('it')
    // Force re-render or restart app
  }}
/>
```

## Need Help?

- Check `app/chats.tsx` for a working example
- All translation keys are in `i18n/locales/en.json`
- Italian translations mirror the English structure in `i18n/locales/it.json`
