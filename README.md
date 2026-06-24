# ChadWallet — Founding Engineer Screen

A fomo.family-style Solana trading app built with Next.js, Tailwind CSS, and real-time data.

## 🚀 Live Features

- **Landing page** — dark space aesthetic, hero, feature grid, trending tokens table, app download CTA
- **Rotating token banners** — top (left scroll) + bottom (right scroll) with real BirdEye data
- **Sign in with Apple/Google** — via Privy embedded wallet (auto-creates Solana wallet)
- **Trading page** — 3-column layout (trending list | chart + trades/holders | buy/sell panel)
- **Real-time data** — BirdEye API for prices, OHLCV, live trades, holder distribution
- **Mock data fallback** — works fully without API keys in dev

## 🛠 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Get API keys (all free tier)

#### Privy (Auth + Embedded Wallet)
1. Go to https://dashboard.privy.io → Create app
2. Under **Authentication** → enable Google, Apple, Wallet
3. Under **Embedded wallets** → enable Solana
4. Copy your **App ID**

#### BirdEye (Token Data)
1. Go to https://birdeye.so/data-api → Sign up
2. Create an API key (free tier: 100 req/min)
3. Copy your API key

#### Alchemy (Solana RPC — optional)
1. Go to https://dashboard.alchemy.com → Create app → select Solana
2. Copy your RPC URL

### 3. Configure `.env.local`
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_BIRDEYE_API_KEY=your_birdeye_key_here
NEXT_PUBLIC_ALCHEMY_RPC=https://solana-mainnet.g.alchemy.com/v2/your_key_here
```

### 4. Run locally
```bash
npm run dev
# open http://localhost:3000
```

### 5. Deploy to Vercel
```bash
# Push to GitHub, import repo in Vercel dashboard
# Add all env vars from .env.local in Vercel project settings
vercel --prod
```

## 📁 Project Structure

```
app/
  page.tsx              # Landing page
  trade/
    page.tsx            # Token selection / trending list
    [address]/page.tsx  # Full trading view
  api/
    trending/route.ts   # BirdEye trending tokens API
components/
  ui/
    NavBar.tsx          # Navigation with Privy auth
    TokenBanner.tsx     # Animated scrolling token ticker
  providers/
    PrivyProvider.tsx   # Privy auth setup (Google + Apple + Wallet)
lib/
  birdeye.ts            # BirdEye API integration + mock data
```

## 🔮 Next Steps (Trading Page Enhancements)

- Integrate TradingView Charting Library (requires license or lightweight-charts)
- Connect Jupiter SDK for real swap execution
- Add portfolio/position tracking with Supabase
- Real-time WebSocket trade feed from BirdEye
- Limit orders via Jupiter DCA

## Tech Stack
- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **Privy v3** (Apple + Google login + Solana embedded wallet)
- **BirdEye API** (real-time Solana token data)
- **Vercel** (deployment)
