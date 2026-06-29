'use client';
import { useState, useEffect } from 'react';
import { TrendingToken, getMockTrendingTokens } from '@/lib/birdeye';
import { useRouter } from 'next/navigation';

function fmt(price: number) {
  if (!price) return '$0';
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.001) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

export default function TokenBanner({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  const [tokens, setTokens] = useState<TrendingToken[]>(getMockTrendingTokens());
  const router = useRouter();

  useEffect(() => {
    fetch('/api/trending').then(r => r.json()).then(d => { if (d?.length) setTokens(d); }).catch(() => {});
  }, []);

  const doubled = [...tokens, ...tokens];

  return (
    <div style={{
      width: '100%', overflow: 'hidden', padding: '8px 0',
      borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      background: 'rgba(13,11,26,0.6)', backdropFilter: 'blur(10px)',
      position: 'relative',
    }}>
      {/* edge fades */}
      <div style={{ position:'absolute',left:0,top:0,bottom:0,width:100,background:'linear-gradient(to right,var(--bg-primary),transparent)',zIndex:2,pointerEvents:'none' }} />
      <div style={{ position:'absolute',right:0,top:0,bottom:0,width:100,background:'linear-gradient(to left,var(--bg-primary),transparent)',zIndex:2,pointerEvents:'none' }} />

      <div className={direction === 'left' ? 'ticker-left' : 'ticker-right'}
        style={{ display:'flex', gap:6, width:'max-content' }}>
        {doubled.map((t, i) => {
          const isPos = (t.priceChange24h || 0) >= 0;
          return (
            <button key={`${t.address}-${i}`} onClick={() => router.push(`/trade/${t.address}`)}
              style={{
                display:'inline-flex', alignItems:'center', gap:7,
                padding:'5px 12px', background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.07)', borderRadius:100,
                cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
                color:'var(--text-primary)', fontFamily:'inherit',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor='rgba(139,92,246,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
            >
              {t.logoURI && <img src={t.logoURI} alt="" width={16} height={16} style={{borderRadius:'50%',objectFit:'cover'}} onError={e=>(e.currentTarget.style.display='none')} />}
              <span style={{fontSize:12,fontWeight:700}}>{t.symbol}</span>
              <span style={{fontSize:11,color:'var(--text-secondary)',fontFamily:'monospace'}}>{fmt(t.price)}</span>
              <span style={{fontSize:11,fontWeight:700,color:isPos?'var(--accent-green-light)':'var(--accent-red-light)'}}>
                {isPos?'+':''}{(t.priceChange24h||0).toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
