'use client';
import { useEffect, useState } from 'react';
import { getMockTrendingTokens, TrendingToken } from '@/lib/birdeye';
import NavBar from '@/components/ui/NavBar';
import { useRouter } from 'next/navigation';

function formatPrice(price: number) {
  if (!price) return '$0.00';
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.001) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}
function formatCompact(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function TradePage() {
  const [tokens, setTokens] = useState<TrendingToken[]>(getMockTrendingTokens());
  const [selected, setSelected] = useState<TrendingToken | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(data => {
        if (data?.length) {
          setTokens(data);
          setSelected(data[0]);
        }
      })
      .catch(() => { setSelected(tokens[0]); });
  }, []);

  useEffect(() => {
    if (tokens.length && !selected) setSelected(tokens[0]);
  }, [tokens]);

  const handleSelect = (token: TrendingToken) => {
    router.push(`/trade/${token.address}`);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ paddingTop: 64 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Trade</h1>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Select a token to start trading</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 108px)' }}>
          {/* Token List */}
          <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              🔥 Trending
            </div>
            {tokens.map(token => {
              const isPos = token.priceChange24h >= 0;
              return (
                <div key={token.address}
                  onClick={() => handleSelect(token)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    background: selected?.address === token.address ? 'var(--bg-card)' : 'transparent',
                    transition: 'background 0.15s',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                  onMouseEnter={e => { if (selected?.address !== token.address) e.currentTarget.style.background = 'var(--bg-card)'; }}
                  onMouseLeave={e => { if (selected?.address !== token.address) e.currentTarget.style.background = 'transparent'; }}
                >
                  {token.logoURI && <img src={token.logoURI} alt={token.symbol} width={32} height={32} style={{ borderRadius: '50%', flexShrink: 0 }} onError={e => (e.currentTarget.style.display = 'none')} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{token.symbol}</span>
                      <span style={{ fontWeight: 600, fontSize: 13, fontFamily: 'monospace' }}>{formatPrice(token.price)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatCompact(token.volume24h)}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isPos ? 'var(--accent-green-light)' : 'var(--accent-red)' }}>
                        {isPos ? '+' : ''}{token.priceChange24h?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Right: empty state prompt */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Click a token to open trading view</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
