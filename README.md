# Bonobo Chat

A React Native mobile app built with Expo that analyzes WhatsApp chat conversations using AI. Users can import WhatsApp chat exports and receive relationship insights using Google's Gemini AI.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.development
```

Edit `.env.development` with your actual API keys:
- `EXPO_PUBLIC_GEMINI_API_KEY` - Get from https://makersuite.google.com/app/apikey
- `EXPO_PUBLIC_SUPABASE_URL` - From your Supabase project
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - From your Supabase project
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From https://dashboard.stripe.com/test/apikeys

### 3. Start the app

**Development mode (default):**
```bash
npm run start:dev
# or for specific platform:
npm run android:dev
npm run ios:dev
```

**Production mode (for testing production builds):**
```bash
npm run start:prod
# or for specific platform:
npm run android:prod
npm run ios:prod
```

## Environment Management

This project uses separate environments for development and production:

| Environment | Supabase Project | Stripe Keys | Command |
|-------------|------------------|-------------|---------|
| Development | Dev project | Test keys (`pk_test_`, `sk_test_`) | `npm run start:dev` |
| Production | Prod project | Live keys (`pk_live_`, `sk_live_`) | `npm run start:prod` |

### Available Scripts

```bash
# Development
npm run start:dev      # Start in development mode
npm run android:dev    # Start Android in dev mode
npm run ios:dev        # Start iOS in dev mode

# Production
npm run start:prod     # Start in production mode
npm run android:prod   # Start Android in prod mode
npm run ios:prod       # Start iOS in prod mode

# Other commands
npm run lint           # Run linter
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting
```

## Project Structure

```
├── app/                      # Expo Router screens
├── components/               # React components
├── hooks/                    # Custom React hooks
├── services/                 # Business logic & API services
├── supabase/                 # Supabase configuration & Edge Functions
│   ├── functions/           # Edge Functions (server-side)
│   └── migrations/          # Database schema
├── utils/                    # Utility functions
├── scripts/                  # Helper scripts
├── .env.development         # Development environment (gitignored)
├── .env.production          # Production environment (gitignored)
└── .env.example             # Environment template
```

## Features

- 📱 Import WhatsApp chat exports (text or ZIP)
- 🤖 AI-powered relationship insights using Gemini
- 📊 Communication pattern analysis
- 💰 In-app purchases with Stripe
- 🔐 Secure authentication with Supabase
- 🌍 Internationalization (English, Italian)

## Tech Stack

- **Framework:** Expo ~54.0.13 with React Native 0.81.4
- **Routing:** Expo Router (file-based routing)
- **AI:** Google Generative AI (Gemini 2.0 Flash)
- **Backend:** Supabase (database, auth, Edge Functions)
- **Payments:** Stripe React Native SDK
- **State:** React Query (TanStack Query)
- **Language:** TypeScript with strict mode

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [CLAUDE.md](CLAUDE.md) - Development guidelines for AI assistants
- [supabase/functions/README.md](supabase/functions/README.md) - Edge Functions documentation

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

## Development

This project uses:
- **Conventional Commits** for commit messages
- **Expo Router** for file-based routing
- **React Query** for data fetching and caching
- **TypeScript** with strict mode

For detailed development guidelines, see [CLAUDE.md](CLAUDE.md).

## License

Private project - All rights reserved
