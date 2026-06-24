'use client';
import { useState, useEffect, useRef } from 'react';
import { TrendingToken, getMockTrendingTokens } from '@/lib/birdeye';
import { useRouter } from 'next/navigation';

interface TokenBannerProps {
  direction?: 'left' | 'right';
}

function formatPrice(price: number): string {
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.001) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

function TokenCard({ token, onClick }: { token: TrendingToken; onClick: (t: TrendingToken) => void }) {
  const isPositive = token.priceChange24h >= 0;
  return (
    <button
      onClick={() => onClick(token)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '100px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'all 0.15s ease',
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-purple-light)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card-hover)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
      }}
    >
      {token.logoURI && (
        <img src={token.logoURI} alt={token.symbol} width={18} height={18} style={{ borderRadius: '50%', objectFit: 'cover' }} onError={e => (e.currentTarget.style.display = 'none')} />
      )}
      <span style={{ fontSize: '13px', fontWeight: 600 }}>{token.symbol}</span>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatPrice(token.price)}</span>
      <span style={{ fontSize: '11px', fontWeight: 600, color: isPositive ? 'var(--accent-green-light)' : 'var(--accent-red)' }}>
        {isPositive ? '+' : ''}{token.priceChange24h?.toFixed(1)}%
      </span>
    </button>
  );
}

export default function TokenBanner({ direction = 'left' }: TokenBannerProps) {
  const [tokens, setTokens] = useState<TrendingToken[]>(getMockTrendingTokens());
  const router = useRouter();

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(data => { if (data?.length) setTokens(data); })
      .catch(() => {});
  }, []);

  const doubled = [...tokens, ...tokens];

  const handleClick = (token: TrendingToken) => {
    router.push(`/trade/${token.address}`);
  };

  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      padding: '10px 0',
      position: 'relative',
      background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.03), transparent)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, var(--bg-primary), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, var(--bg-primary), transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div
        className={direction === 'left' ? 'ticker-left' : 'ticker-right'}
        style={{ display: 'flex', gap: '8px', width: 'max-content' }}
      >
        {doubled.map((token, i) => (
          <TokenCard key={`${token.address}-${i}`} token={token} onClick={handleClick} />
        ))}
      </div>
    </div>
  );
}
