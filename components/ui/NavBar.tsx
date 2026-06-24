'use client';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const walletAddress = user?.wallet?.address;
  const shortAddress = walletAddress ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}` : null;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 24px',
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(7,6,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: '10px',
          background: 'linear-gradient(135deg, #7c3aed, #10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 16, color: 'white',
        }}>C</div>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Chad<span style={{ color: 'var(--accent-purple-light)' }}>Wallet</span>
        </span>
      </Link>

      {/* Center links */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="nav-links">
        {[
          { label: 'Trade', href: '/trade' },
          { label: 'Trending', href: '/#trending' },
          { label: 'Portfolio', href: '/portfolio' },
        ].map(({ label, href }) => (
          <Link key={label} href={href} style={{
            color: 'var(--text-secondary)', textDecoration: 'none',
            fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >{label}</Link>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {ready && (
          authenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {shortAddress && (
                <div style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  fontSize: 13, fontWeight: 500, color: 'var(--accent-purple-light)',
                  fontFamily: 'monospace',
                }}>{shortAddress}</div>
              )}
              <button
                onClick={() => logout()}
                className="btn-outline"
                style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
              >Disconnect</button>
            </div>
          ) : (
            <button
              onClick={login}
              className="btn-primary"
              style={{ padding: '9px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}
            >Connect Wallet</button>
          )
        )}
      </div>
    </nav>
  );
}
