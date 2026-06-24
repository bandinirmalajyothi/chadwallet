'use client';
import { usePrivy } from '@privy-io/react-auth';
import NavBar from '@/components/ui/NavBar';
import TokenBanner from '@/components/ui/TokenBanner';
import { useRouter } from 'next/navigation';
import { getMockTrendingTokens } from '@/lib/birdeye';
import { useState, useEffect } from 'react';

function formatCompact(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPrice(price: number): string {
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.001) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

function StarField() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 80 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: Math.random() * 2 + 1,
          height: Math.random() * 2 + 1,
          borderRadius: '50%',
          background: 'white',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.6 + 0.1,
          animation: `glow-anim ${2 + Math.random() * 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        }} />
      ))}
    </div>
  );
}

export default function Home() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();
  const [tokens, setTokens] = useState(getMockTrendingTokens());

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(data => { if (data?.length) setTokens(data); })
      .catch(() => {});
  }, []);

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      <NavBar />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', paddingTop: '64px' }}>
        <StarField />

        {/* Background glows */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Top banner */}
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0 }}>
          <TokenBanner direction="left" />
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 780, zIndex: 1, marginTop: 60 }}>
          <div className="tag tag-purple" style={{ marginBottom: 20, display: 'inline-flex' }}>
            ⚡ Powered by Solana · Sub-second trades
          </div>

          <h1 style={{
            fontSize: 'clamp(42px, 8vw, 88px)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            marginBottom: 24,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            trade like<br />
            <span className="gradient-text">a chad.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 520,
            margin: '0 auto 40px',
          }}>
            Buy, sell, and track memecoins and viral tokens on Solana.
            Real-time data. One tap to trade. No brain required.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {!authenticated ? (
              <button
                onClick={login}
                className="btn-primary"
                style={{ padding: '16px 36px', borderRadius: 14, fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}
              >
                Start Trading Free →
              </button>
            ) : (
              <button
                onClick={() => router.push('/trade')}
                className="btn-primary"
                style={{ padding: '16px 36px', borderRadius: 14, fontSize: 17, fontWeight: 800 }}
              >
                Open Trading Desk →
              </button>
            )}

            <a
              href="https://apps.apple.com/us/app/chadwallet/id6757367474"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              style={{ padding: '16px 28px', borderRadius: 14, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-primary)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              style={{ padding: '16px 28px', borderRadius: 14, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-primary)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2L15.9 12 12 8.1zm16.85-10.95L17.5 11.5 13.4 12l4.1 4.5 2.5-1.38c.71-.39 1-.94 1-1.63s-.28-1.28-.97-1.68zM3.01.24c-.38.42-.51.96-.51 1.59V22.2c0 .63.14 1.17.51 1.59L3.09 24l11.74-11.74v-.52z"/></svg>
              Google Play
            </a>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Sign in with Apple or Google · Embedded Solana wallet · Zero gas on first trade
          </p>
        </div>

        {/* Floating stats */}
        <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 40, zIndex: 1 }}>
          {[
            { label: 'Daily Volume', value: '$2.4B+' },
            { label: 'Tokens Listed', value: '50,000+' },
            { label: 'Traders', value: '180K+' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Bottom ticker */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <TokenBanner direction="right" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="tag tag-green" style={{ marginBottom: 16, display: 'inline-flex' }}>WHY CHADWALLET</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif" }}>
            Built for degens.<br />Fast enough for pros.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            {
              icon: '⚡',
              title: 'Sub-second execution',
              desc: 'Trades settle in under 400ms on Solana. By the time other DEXs confirm, you\'re already in profit.',
              accent: '#7c3aed',
            },
            {
              icon: '📊',
              title: 'Real-time charts',
              desc: 'Live OHLCV data, holder distribution, and trade feed — everything a degen needs on one screen.',
              accent: '#10b981',
            },
            {
              icon: '🔐',
              title: 'Self-custody wallet',
              desc: 'Sign in with Google or Apple. ChadWallet creates a Solana wallet you actually own — no seed phrase anxiety.',
              accent: '#f59e0b',
            },
            {
              icon: '🎯',
              title: 'Jupiter-powered swaps',
              desc: 'Best-price routing across every major Solana DEX. You always get the best rate, guaranteed.',
              accent: '#ef4444',
            },
            {
              icon: '🔥',
              title: 'Trending token feed',
              desc: 'Real-time BirdEye data surfaces the hottest tokens before they go parabolic. Be early, not late.',
              accent: '#8b5cf6',
            },
            {
              icon: '📱',
              title: 'Mobile-first design',
              desc: 'Trade on your phone, track on your desktop. One account, every device. Seamless.',
              accent: '#06b6d4',
            },
          ].map(({ icon, title, desc, accent }) => (
            <div key={title} className="card-glow" style={{
              background: 'var(--bg-card)', borderRadius: 16, padding: 28,
              transition: 'transform 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${accent}1a`, border: `1px solid ${accent}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 16,
              }}>{icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRENDING TOKENS TABLE ── */}
      <section id="trending" style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div className="tag tag-purple" style={{ marginBottom: 10, display: 'inline-flex' }}>LIVE DATA</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>Trending on Solana</h2>
          </div>
          <button onClick={() => router.push('/trade')} className="btn-outline" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
            View All →
          </button>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 1fr 120px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <div>#</div>
            <div>Token</div>
            <div style={{ textAlign: 'right' }}>Price</div>
            <div style={{ textAlign: 'right' }}>24h %</div>
            <div style={{ textAlign: 'right' }}>Volume</div>
            <div style={{ textAlign: 'right' }}>Action</div>
          </div>
          {tokens.slice(0, 10).map((token, i) => {
            const isPos = token.priceChange24h >= 0;
            return (
              <div key={token.address}
                style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 1fr 120px', padding: '14px 20px', borderBottom: i < 9 ? '1px solid var(--border)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {token.logoURI && <img src={token.logoURI} alt={token.symbol} width={28} height={28} style={{ borderRadius: '50%' }} onError={e => (e.currentTarget.style.display = 'none')} />}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{token.symbol}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{token.name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>{formatPrice(token.price)}</div>
                <div style={{ textAlign: 'right' }}>
                  <span className={isPos ? 'positive' : 'negative'} style={{ fontWeight: 700, fontSize: 13 }}>
                    {isPos ? '+' : ''}{token.priceChange24h?.toFixed(2)}%
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' }}>{formatCompact(token.volume24h)}</div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => router.push(`/trade/${token.address}`)}
                    className="btn-primary"
                    style={{ padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}
                  >Trade</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── APP DOWNLOAD CTA ── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>📱</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
            Trade anywhere.<br />Never miss a pump.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
            The ChadWallet mobile app gives you instant alerts, one-tap buys, and a full trading desk in your pocket.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://apps.apple.com/us/app/chadwallet/id6757367474" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '14px 24px', borderRadius: 14, cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.7 }}>Download on the</div>
                  <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>App Store</div>
                </div>
              </div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '14px 24px', borderRadius: 14, border: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2L15.9 12 12 8.1zm16.85-10.95L17.5 11.5 13.4 12l4.1 4.5 2.5-1.38c.71-.39 1-.94 1-1.63s-.28-1.28-.97-1.68zM3.01.24c-.38.42-.51.96-.51 1.59V22.2c0 .63.14 1.17.51 1.59L3.09 24l11.74-11.74v-.52z"/></svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>Get it on</div>
                  <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>Google Play</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px 24px', maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: 'white' }}>C</div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>ChadWallet</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © 2025 ChadWallet. Not financial advice. Trade at your own risk.
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Twitter', 'Discord', 'Telegram'].map(s => (
            <a key={s} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >{s}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}
