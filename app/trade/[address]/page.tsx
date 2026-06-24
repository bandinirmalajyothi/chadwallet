'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import NavBar from '@/components/ui/NavBar';
import { 
  TrendingToken, TokenOverview, Trade, Holder, OHLCVData,
  getMockTrendingTokens, getTokenOverview, getLiveTrades, getTokenHolders, getOHLCV
} from '@/lib/birdeye';

function formatPrice(price: number) {
  if (!price) return '$0.00';
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.001) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}
function formatCompact(n: number) {
  if (!n) return '$0';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function shortAddr(addr: string) {
  if (!addr) return '...';
  return `${addr.slice(0,4)}...${addr.slice(-4)}`;
}
function timeAgo(unix: number) {
  const s = Math.floor(Date.now() / 1000) - unix;
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

// Mini SVG chart from OHLCV data
function MiniChart({ data, positive }: { data: OHLCVData[]; positive: boolean }) {
  if (!data.length) return null;
  const prices = data.map(d => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 300, h = 80;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const fill = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  });
  const fillPath = `M ${fill[0]} L ${fill.join(' L ')} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 80 }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
          <stop offset="100%" stopColor={positive ? '#10b981' : '#ef4444'} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke={positive ? '#10b981' : '#ef4444'} strokeWidth={1.5} />
    </svg>
  );
}

export default function TradeTokenPage() {
  const params = useParams();
  const address = params.address as string;
  const { login, authenticated, user } = usePrivy();

  const [allTokens, setAllTokens] = useState<TrendingToken[]>(getMockTrendingTokens());
  const [overview, setOverview] = useState<TokenOverview | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [ohlcv, setOHLCV] = useState<OHLCVData[]>([]);
  const [timeframe, setTimeframe] = useState('15m');
  const [tab, setTab] = useState<'trades' | 'holders'>('trades');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const currentToken = allTokens.find(t => t.address === address) || allTokens[0];

  useEffect(() => {
    fetch('/api/trending').then(r => r.json()).then(d => { if (d?.length) setAllTokens(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    Promise.all([
      getTokenOverview(address),
      getLiveTrades(address),
      getTokenHolders(address),
      getOHLCV(address, timeframe),
    ]).then(([ov, tr, ho, oh]) => {
      if (ov) setOverview(ov);
      setTrades(tr);
      setHolders(ho);
      setOHLCV(oh);
      setLoading(false);
    });
  }, [address]);

  useEffect(() => {
    if (!address) return;
    getOHLCV(address, timeframe).then(setOHLCV);
  }, [timeframe, address]);

  // Auto-refresh trades every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      getLiveTrades(address).then(setTrades);
    }, 10000);
    return () => clearInterval(interval);
  }, [address]);

  const handleTrade = async () => {
    if (!authenticated) { login(); return; }
    if (!amount) return;
    setTxStatus('Confirming transaction...');
    setTimeout(() => {
      setTxStatus(`✅ ${side === 'buy' ? 'Bought' : 'Sold'} ${amount} SOL of ${currentToken?.symbol || 'token'}!`);
      setTimeout(() => setTxStatus(null), 4000);
    }, 1500);
  };

  const displayData = overview || (currentToken ? {
    address: currentToken.address,
    symbol: currentToken.symbol,
    name: currentToken.name,
    price: currentToken.price,
    priceChange24h: currentToken.priceChange24h,
    volume24h: currentToken.volume24h,
    marketCap: 0,
    liquidity: 0,
  } : null);

  const isPositive = (displayData?.priceChange24h || 0) >= 0;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ paddingTop: 64, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header bar with token info */}
        {displayData && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                {displayData.symbol?.[0]}
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: 17 }}>{displayData.symbol}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>{displayData.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace' }}>{formatPrice(displayData.price)}</div>
                <div style={{ fontSize: 12, color: isPositive ? 'var(--accent-green-light)' : 'var(--accent-red)', fontWeight: 600 }}>
                  {isPositive ? '▲' : '▼'} {Math.abs(displayData.priceChange24h || 0).toFixed(2)}% (24h)
                </div>
              </div>
              {[
                { label: '24h Vol', value: formatCompact(displayData.volume24h) },
                { label: 'Mkt Cap', value: displayData.marketCap ? formatCompact(displayData.marketCap) : 'N/A' },
                { label: 'Liquidity', value: displayData.liquidity ? formatCompact(displayData.liquidity) : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* LEFT: Trending token list */}
          <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', height: 'calc(100vh - 140px)' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔥 Trending</div>
            {allTokens.map(token => {
              const isActive = token.address === address;
              const isPos = token.priceChange24h >= 0;
              return (
                <a key={token.address} href={`/trade/${token.address}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    background: isActive ? 'var(--bg-card)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: isActive ? '2px solid var(--accent-purple-light)' : '2px solid transparent',
                    textDecoration: 'none', color: 'inherit', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-card)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 18, flexShrink: 0 }}>{token.rank}</span>
                  {token.logoURI && <img src={token.logoURI} alt="" width={26} height={26} style={{ borderRadius: '50%', flexShrink: 0 }} onError={e => (e.currentTarget.style.display='none')} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{token.symbol}</div>
                    <div style={{ fontSize: 11, color: isPos ? 'var(--accent-green-light)' : 'var(--accent-red)', fontWeight: 600 }}>
                      {isPos?'+':''}{token.priceChange24h?.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{formatPrice(token.price)}</div>
                </a>
              );
            })}
          </div>

          {/* MIDDLE: Chart + trades/holders */}
          <div style={{ overflowY: 'auto', height: 'calc(100vh - 140px)', borderRight: '1px solid var(--border)' }}>
            {/* Chart area */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Price Chart</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['1m','5m','15m','1h','4h','1D'].map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)}
                      style={{
                        padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                        background: timeframe === tf ? 'var(--accent-purple)' : 'var(--bg-card)',
                        color: timeframe === tf ? 'white' : 'var(--text-muted)',
                      }}>{tf}</button>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '12px', minHeight: 200 }}>
                {ohlcv.length > 0 ? (
                  <>
                    <MiniChart data={ohlcv} positive={isPositive} />
                    {/* Simple OHLCV bars */}
                    <div style={{ display: 'flex', gap: 2, marginTop: 8, height: 40, alignItems: 'flex-end' }}>
                      {ohlcv.slice(-48).map((bar, i) => {
                        const maxVol = Math.max(...ohlcv.map(b => b.volume));
                        const h = (bar.volume / maxVol) * 36;
                        const isGreen = bar.close >= bar.open;
                        return <div key={i} style={{ flex: 1, height: h, background: isGreen ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)', borderRadius: 1, minWidth: 2 }} />;
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      {['O','H','L','C'].map((label, i) => {
                        const last = ohlcv[ohlcv.length - 1];
                        const vals = [last?.open, last?.high, last?.low, last?.close];
                        return (
                          <div key={label} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: 600 }}>{label}: </span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{formatPrice(vals[i] || 0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    {loading ? 'Loading chart data...' : 'Chart data unavailable'}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs: Trades / Holders */}
            <div>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {(['trades', 'holders'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{
                      flex: 1, padding: '12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderBottom: tab === t ? '2px solid var(--accent-purple-light)' : '2px solid transparent',
                      textTransform: 'capitalize', transition: 'all 0.15s',
                    }}
                  >{t === 'trades' ? '⚡ Live Trades' : '👥 Holders'}</button>
                ))}
              </div>

              {tab === 'trades' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 80px', padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                    <div>Time</div><div>Type</div><div style={{textAlign:'right'}}>Price</div><div style={{textAlign:'right'}}>Value</div><div style={{textAlign:'right'}}>Wallet</div>
                  </div>
                  {trades.map((trade, i) => (
                    <div key={`${trade.txHash}-${i}`} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 80px', padding: '9px 14px', fontSize: 12, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                      <div style={{ color: 'var(--text-muted)' }}>{timeAgo(trade.blockTime)}</div>
                      <div>
                        <span className={trade.side === 'buy' ? 'tag tag-green' : 'tag tag-red'} style={{ fontSize: 10, padding: '2px 6px' }}>
                          {trade.side.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{formatPrice(trade.priceUsd)}</div>
                      <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCompact(trade.volumeUsd)}</div>
                      <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11 }}>{shortAddr(trade.wallet)}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'holders' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 80px', padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
                    <div>#</div><div>Wallet</div><div style={{textAlign:'right'}}>Amount</div><div style={{textAlign:'right'}}>Share</div>
                  </div>
                  {holders.map((h, i) => (
                    <div key={`${h.owner}-${i}`} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 80px', padding: '10px 14px', fontSize: 12, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                      <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i+1}</div>
                      <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{shortAddr(h.owner)}</div>
                      <div style={{ textAlign: 'right', fontFamily: 'monospace' }}>{(h.uiAmount || h.amount || 0).toLocaleString()}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple-light)' }}>{(h.percentage || 0).toFixed(2)}%</div>
                        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 3 }}>
                          <div style={{ height: '100%', width: `${Math.min(h.percentage || 0, 100)}%`, background: 'var(--accent-purple)', borderRadius: 2 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Buy/Sell panel */}
          <div style={{ overflowY: 'auto', height: 'calc(100vh - 140px)', padding: 16 }}>
            {/* Buy/Sell toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 20, background: 'var(--bg-card)', padding: 4, borderRadius: 12 }}>
              {(['buy', 'sell'] as const).map(s => (
                <button key={s} onClick={() => setSide(s)}
                  style={{
                    padding: '10px', borderRadius: 9, fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none',
                    background: side === s ? (s === 'buy' ? 'var(--accent-green)' : 'var(--accent-red)') : 'transparent',
                    color: side === s ? 'white' : 'var(--text-muted)',
                    textTransform: 'capitalize', transition: 'all 0.2s',
                  }}
                >{s}</button>
              ))}
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Amount (SOL)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.0"
                  style={{
                    width: '100%', padding: '12px 60px 12px 14px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, color: 'var(--text-primary)', fontSize: 16,
                    fontWeight: 600, outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent-purple-light)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>SOL</span>
              </div>
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16 }}>
              {['0.1', '0.5', '1', '5'].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  style={{
                    padding: '7px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', border: '1px solid var(--border)',
                    background: amount === v ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                  }}
                >{v} SOL</button>
              ))}
            </div>

            {/* Price estimate */}
            {amount && displayData && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>You {side === 'buy' ? 'get' : 'sell'}</span>
                  <span style={{ fontWeight: 700 }}>
                    {amount && displayData.price 
                      ? `~${(parseFloat(amount) * 175 / displayData.price).toLocaleString(undefined, {maximumFractionDigits: 0})} ${displayData.symbol}`
                      : '—'
                    }
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Network fee</span>
                  <span style={{ color: 'var(--accent-green-light)', fontWeight: 600 }}>~$0.001</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total</span>
                  <span style={{ fontWeight: 800 }}>{amount} SOL (~${(parseFloat(amount) * 175).toFixed(2)})</span>
                </div>
              </div>
            )}

            {/* Trade button */}
            <button
              onClick={handleTrade}
              style={{
                width: '100%', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 800,
                cursor: 'pointer', border: 'none',
                background: authenticated
                  ? side === 'buy' ? 'var(--accent-green)' : 'var(--accent-red)'
                  : 'var(--accent-purple)',
                color: 'white',
                transition: 'all 0.2s', letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {authenticated
                ? side === 'buy' ? `Buy ${displayData?.symbol || 'Token'}` : `Sell ${displayData?.symbol || 'Token'}`
                : 'Connect Wallet to Trade'
              }
            </button>

            {txStatus && (
              <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--accent-green)', fontSize: 13, textAlign: 'center', color: 'var(--accent-green-light)' }}>
                {txStatus}
              </div>
            )}

            {/* Position summary (if authenticated) */}
            {authenticated && (
              <div style={{ marginTop: 20, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Position</div>
                <div style={{ padding: '14px' }}>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>—</div>
                    No position in {displayData?.symbol || 'this token'}
                  </div>
                </div>
              </div>
            )}

            {/* Wallet info */}
            {authenticated && user?.wallet?.address && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 10, fontSize: 12 }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Connected wallet</div>
                <div style={{ fontFamily: 'monospace', color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                  {shortAddr(user.wallet.address)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
