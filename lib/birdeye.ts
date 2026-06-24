// BirdEye API integration for real Solana token data
const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '';
const BASE_URL = 'https://public-api.birdeye.so';

export interface TokenOverview {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  logoURI?: string;
  liquidity: number;
}

export interface TrendingToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  logoURI?: string;
  rank: number;
}

export interface Trade {
  txHash: string;
  blockTime: number;
  side: 'buy' | 'sell';
  price: number;
  priceUsd: number;
  volumeUsd: number;
  wallet: string;
}

export interface Holder {
  owner: string;
  amount: number;
  uiAmount: number;
  percentage: number;
}

export interface OHLCVData {
  unixTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const defaultHeaders = () => ({
  'X-API-KEY': BIRDEYE_API_KEY,
  'x-chain': 'solana',
});

// Trending tokens for the banner
export async function getTrendingTokens(limit = 20): Promise<TrendingToken[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=${limit}`,
      { headers: defaultHeaders(), next: { revalidate: 30 } }
    );
    if (!res.ok) throw new Error('BirdEye API error');
    const data = await res.json();
    return (data.data?.tokens || []).map((t: any, i: number) => ({
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      price: t.price,
      priceChange24h: t.price24hChangePercent,
      volume24h: t.volume24hUSD,
      logoURI: t.logoURI,
      rank: i + 1,
    }));
  } catch {
    return getMockTrendingTokens();
  }
}

// Token overview for trading page
export async function getTokenOverview(address: string): Promise<TokenOverview | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/defi/token_overview?address=${address}`,
      { headers: defaultHeaders(), next: { revalidate: 10 } }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const d = data.data;
    return {
      address: d.address,
      symbol: d.symbol,
      name: d.name,
      price: d.price,
      priceChange24h: d.priceChange24hPercent,
      volume24h: d.volume24hUSD,
      marketCap: d.marketCap || d.mc,
      logoURI: d.logoURI,
      liquidity: d.liquidity,
    };
  } catch {
    return null;
  }
}

// OHLCV price chart data
export async function getOHLCV(address: string, timeframe = '15m', limit = 96): Promise<OHLCVData[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const timeMap: Record<string, number> = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1D': 86400 };
    const interval = timeMap[timeframe] || 900;
    const from = now - interval * limit;

    const res = await fetch(
      `${BASE_URL}/defi/ohlcv?address=${address}&type=${timeframe}&time_from=${from}&time_to=${now}`,
      { headers: defaultHeaders() }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data?.items || [];
  } catch {
    return generateMockOHLCV();
  }
}

// Live trades
export async function getLiveTrades(address: string, limit = 20): Promise<Trade[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/defi/txs/token?address=${address}&offset=0&limit=${limit}&tx_type=swap`,
      { headers: defaultHeaders() }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    return (data.data?.items || []).map((t: any) => ({
      txHash: t.txHash,
      blockTime: t.blockUnixTime,
      side: t.side,
      price: t.price,
      priceUsd: t.priceUsd,
      volumeUsd: t.volumeUsd,
      wallet: t.owner,
    }));
  } catch {
    return generateMockTrades();
  }
}

// Token holders
export async function getTokenHolders(address: string, limit = 10): Promise<Holder[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/v1/token/holder?address=${address}&offset=0&limit=${limit}`,
      { headers: defaultHeaders() }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.data?.items || [];
  } catch {
    return generateMockHolders();
  }
}

// ---- Mock data for dev / when API key missing ----
export function getMockTrendingTokens(): TrendingToken[] {
  const tokens = [
    { symbol: 'BONK', name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', price: 0.00002341, priceChange24h: 12.4, volume24h: 48200000 },
    { symbol: 'WIF', name: 'Dogwifhat', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', price: 1.82, priceChange24h: -5.2, volume24h: 92000000 },
    { symbol: 'POPCAT', name: 'Popcat', address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', price: 0.4821, priceChange24h: 23.7, volume24h: 31000000 },
    { symbol: 'MYRO', name: 'Myro', address: 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4', price: 0.07234, priceChange24h: 8.1, volume24h: 15000000 },
    { symbol: 'BOME', name: 'Book of Meme', address: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82', price: 0.00831, priceChange24h: -2.9, volume24h: 28000000 },
    { symbol: 'MEW', name: 'cat in a dogs world', address: 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5', price: 0.00618, priceChange24h: 31.2, volume24h: 55000000 },
    { symbol: 'NEIRO', name: 'Neiro', address: 'neiro1N8JpkW4oPZkNtPGEA5HWU3dPETErEGnXrb9P2', price: 0.00041, priceChange24h: 47.8, volume24h: 19000000 },
    { symbol: 'TRUMP', name: 'TRUMP', address: '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', price: 14.21, priceChange24h: -8.3, volume24h: 124000000 },
    { symbol: 'FWOG', name: 'FWOG', address: 'A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump', price: 0.03291, priceChange24h: 15.6, volume24h: 8900000 },
    { symbol: 'PNUT', name: 'Peanut the Squirrel', address: '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump', price: 0.1234, priceChange24h: -12.1, volume24h: 34000000 },
    { symbol: 'MOODENG', name: 'Moo Deng', address: 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzc8XP', price: 0.00289, priceChange24h: 6.4, volume24h: 7200000 },
    { symbol: 'CHILLGUY', name: 'Chill Guy', address: 'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump', price: 0.0721, priceChange24h: 19.3, volume24h: 12400000 },
    { symbol: 'DOGGO', name: 'Doggo', address: 'A3eME5CetyZPBoWbRUwY3tSe25S6tb18ba9ZPbWk9eFJ', price: 0.00052, priceChange24h: 88.2, volume24h: 3100000 },
    { symbol: 'MICHI', name: 'michi', address: '5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp', price: 0.1891, priceChange24h: -3.7, volume24h: 9800000 },
    { symbol: 'GOAT', name: 'Goatseus Maximus', address: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump', price: 0.2341, priceChange24h: 4.2, volume24h: 18200000 },
  ];
  return tokens.map((t, i) => ({ ...t, rank: i + 1 }));
}

function generateMockOHLCV(): OHLCVData[] {
  const data: OHLCVData[] = [];
  let price = 0.00002;
  const now = Math.floor(Date.now() / 1000);
  for (let i = 95; i >= 0; i--) {
    const change = (Math.random() - 0.47) * 0.08;
    const open = price;
    price = price * (1 + change);
    const high = Math.max(open, price) * (1 + Math.random() * 0.02);
    const low = Math.min(open, price) * (1 - Math.random() * 0.02);
    data.push({ unixTime: now - i * 900, open, high, low, close: price, volume: Math.random() * 1000000 });
  }
  return data;
}

function generateMockTrades(): Trade[] {
  return Array.from({ length: 20 }, (_, i) => ({
    txHash: `tx${Math.random().toString(36).substr(2, 20)}`,
    blockTime: Math.floor(Date.now() / 1000) - i * 30,
    side: Math.random() > 0.5 ? 'buy' : 'sell',
    price: 0.00002341 * (1 + (Math.random() - 0.5) * 0.02),
    priceUsd: 0.00002341,
    volumeUsd: Math.random() * 5000 + 50,
    wallet: `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`,
  }));
}

function generateMockHolders(): Holder[] {
  return Array.from({ length: 10 }, (_, i) => ({
    owner: `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`,
    amount: Math.floor(Math.random() * 10000000),
    uiAmount: Math.floor(Math.random() * 10000000),
    percentage: (10 - i) * (Math.random() * 2 + 1),
  }));
}
