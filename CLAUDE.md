# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bonobo Chat is a React Native mobile app built with Expo that analyzes WhatsApp chat conversations using AI. Users import WhatsApp chat exports (text or ZIP format), and the app provides relationship insights using Google's Gemini AI, including communication patterns, red/green flags, attachment styles, and compatibility scores.

## Tech Stack

- **Framework**: Expo ~54.0.13 with React Native 0.81.4
- **Routing**: Expo Router (file-based routing)
- **AI**: Google Generative AI (Gemini 2.0 Flash)
- **Backend**: Supabase (user entitlements, chat storage)
- **Payments**: Stripe React Native
- **Language**: TypeScript with strict mode

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start

# Platform-specific
npm run android
npm run ios
npm run web

# Linting
npm run lint
```

## Git Commit Guidelines

**IMPORTANT**: Always use [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages:

```
<type>(<scope>): <description>

[optional body]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`

**Scopes**: `hooks`, `components`, `storage`, `ai`, `i18n`, `ui`, `navigation`, `auth`, `payments`

**Examples**:
- `refactor(hooks): remove unused exports from useChats`
- `feat(ai): add support for multiple AI models`
- `fix(storage): handle race condition in chat deletion`
- `docs(readme): update installation instructions`

## Architecture

### File-Based Routing (app/)

The app uses Expo Router with file-based routing:

- `app/_layout.tsx` - Root layout wrapper
- `app/index.tsx` - Entry point (redirects to chats)
- `app/chats.tsx` - Main screen showing imported chat list
- `app/import-guide.tsx` - Instructions for importing WhatsApp chats
- `app/analysis/[chatId].tsx` - Dynamic route for chat analysis with tabs (Overview/Insights)

### Services (services/)

Business logic layer that interacts with external services (Supabase, Stripe, AI):

- `supabase.ts` - Supabase client initialization
- `chat-storage.ts` - Chat CRUD operations with Supabase
- `auth-service.ts` - User authentication and account management
- `payment-service.ts` - User entitlements and access control
- `stripe-service.ts` - Stripe payment integration
- `ai-service.ts` - Gemini AI integration for relationship insights

### Utilities (utils/)

Pure helper functions and utilities:

- `device-id.ts` - Device identification using SecureStore
- `whatsapp-parser.ts` - Parses WhatsApp export format
- `zip-extractor.ts` - ZIP file extraction utilities
- `chat-analyzer.ts` - Statistical analysis (message counts, response times, interest levels)
- `string-helpers.ts` - String manipulation utilities
- `validation.ts` - Input validation functions
- `currency-service.ts` - Currency formatting utilities

### Key Components (components/)

- `chat-list.tsx` - Displays imported chats with participant info
- `chat-card.tsx` - Individual chat card with analysis button
- `analysis-loading.tsx` - Animated loading screen during analysis
- `loading-screen.tsx` - Reusable loading component
- `insight-card.tsx` - Shows unlocked AI insights
- `locked-insight-card.tsx` - Shows locked insights with unlock button
- `paywall.tsx` - Payment modal with plan selection
- `comparison-card.tsx` - Displays comparative stats (e.g., message counts per participant)
- `simple-stat-card.tsx` - Single statistic display

### Hooks (hooks/)

**Core Data Hooks**:
- `use-chats.ts` - Manages chat data fetching and deletion via React Query
- `use-chat-analysis.ts` - Handles chat analysis operations
- `use-insight-unlock.ts` - Manages AI insight unlock flow

**Share Intent Hooks**:
- `use-share-intent.ts` - Handles Android/iOS share intents for chat imports
- `use-share-import.ts` - Processes shared WhatsApp data with alert UI integration
- `use-share-data-processor.ts` - Core share data processing logic

**Payment & Auth Hooks**:
- `use-payment-flow.ts` - Manages payment flow and entitlements
- `use-paywall.ts` - Controls paywall modal state
- `use-profile.ts` - User authentication and profile management
- `use-account-creation.ts` - Account creation flow

**UI Hooks**:
- `use-custom-alert.ts` - Custom alert system (returns JSX directly)
- `use-translation.ts` - i18n translation utilities

## Data Models

**StoredChat** (`services/chat-storage.ts:26-35`):
```typescript
{
  id: string
  text: string // Raw WhatsApp export
  timestamp: Date
  participants?: string[]
  messageCount?: number
  analysis?: ChatAnalysisData // Cached basic stats
  aiInsights?: AIInsights // Cached AI analysis
  unlockedInsights?: string[] // IDs of unlocked insight categories
}
```

**AIInsights** (`services/ai-service.ts:6-49`):
8 insight categories: redFlags, greenFlags, attachmentStyle, reciprocityScore, compliments, criticism, compatibilityScore, relationshipTips

## Payment & Access Control

- **Free**: Basic statistical analysis (Overview tab)
- **Paid**: AI-powered insights (Insights tab with individual unlock mechanism)
- Three plans: One-Time ($2.99), Weekly ($4.99), Monthly ($9.99)
- Entitlements stored in Supabase `user_entitlements` table
- One-time purchases are chat-specific (assigned on first unlock)
- Subscriptions grant unlimited access during validity period

**Access Flow**:
1. User taps "Unlock" on locked insight → `handleUnlockInsight()` in `app/analysis/[chatId].tsx:100`
2. Check access via `PaymentService.hasAccess(chatId)` → `services/payment-service.ts:45`
3. If no access → show paywall
4. If has access → generate AI insights (if not cached) and unlock specific insight
5. For one-time purchases, assign to chat via `PaymentService.assignAnalysisToChat()` → `services/payment-service.ts:126`

## Important Patterns

**Hook Architecture**:
- Hooks manage data and business logic, components handle orchestration
- Custom hooks return JSX directly when they own UI (e.g., `useCustomAlert` returns `alert` JSX)
- Avoid prop drilling - hooks call other hooks internally when needed
- Keep hooks focused - separate data fetching, processing, and UI concerns
- React Query hooks in `hooks/queries/` for all data operations

**Caching Strategy**:
- Basic analysis is run once and cached in Supabase (`analysis` field)
- AI insights are generated only when user unlocks first insight and cached (`aiInsights` field)
- Individual insight unlocks tracked in `unlockedInsights` array
- Loading states managed at chat ID granularity to prevent re-analysis on navigation

**Share Intent Handling**:
- App accepts WhatsApp text exports and ZIP files via share sheet
- Share intent orchestration at component level in `app/chats.tsx`
- `useShareIntent` retrieves share data from native intent
- `useShareImport` processes data and displays alerts
- Includes timeout handling for stale share intents (3s defensive workaround)
- ZIP files extracted via JSZip to find `_chat.txt` file

**Environment Variables**:
- `EXPO_PUBLIC_GEMINI_API_KEY` - Required for AI analysis
- Supabase credentials configured in `services/supabase.ts`
- Use `.env.example` as template for local `.env` file

## Path Aliases

- `@/*` - Root directory (configured in `tsconfig.json:6`)
- Example: `import { ChatStorage } from '@/services/chat-storage'`

## Supabase Schema

Located in `supabase/migrations/`:
- `chats` table: stores chat data per device
- `user_entitlements` table: tracks purchases and subscriptions
- Includes Edge Functions in `supabase/functions/` for payment processing

## Testing & Debugging

- Payment testing utilities in `PaymentService`: `clearEntitlement()`, `resetEntitlementsForTesting()`
- Extensive console logging throughout for debugging (especially in AI and payment flows)
- Use `expo start` dev server for hot reload and debugging
