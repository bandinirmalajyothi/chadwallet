'use client';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

export default function NavBar() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const wallet = user?.wallet?.address;
  const short = wallet ? `${wallet.slice(0,4)}...${wallet.slice(-4)}` : null;

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      height:60, padding:'0 28px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      background:'rgba(8,4,16,0.7)', backdropFilter:'blur(24px)',
      borderBottom:'1px solid var(--border)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
        <div style={{
          width:32, height:32, borderRadius:9,
          background:'linear-gradient(135deg,#7c3aed,#059669)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:900, fontSize:15, color:'white', letterSpacing:'-0.02em',
        }}>C</div>
        <span style={{ fontSize:17, fontWeight:800, letterSpacing:'-0.03em', color:'white' }}>
          chad<span style={{color:'var(--accent-purple-light)'}}>wallet</span>
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display:'flex', gap:28, alignItems:'center' }}>
        {[['Trade','/trade'],['Trending','/#trending'],['Rewards','/rewards']].map(([label,href])=>(
          <Link key={label} href={href} style={{
            color:'var(--text-secondary)', textDecoration:'none',
            fontSize:13, fontWeight:500, transition:'color 0.15s',
          }}
          onMouseEnter={e=>(e.currentTarget.style.color='white')}
          onMouseLeave={e=>(e.currentTarget.style.color='var(--text-secondary)')}
          >{label}</Link>
        ))}
      </div>

      {/* Auth */}
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        {ready && (authenticated ? (
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {short && <div style={{
              padding:'5px 11px', borderRadius:8,
              background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.25)',
              fontSize:12, fontWeight:600, color:'var(--accent-purple-light)', fontFamily:'monospace',
            }}>{short}</div>}
            <button onClick={logout} className="btn-outline" style={{padding:'7px 16px',borderRadius:8,fontSize:12,fontWeight:600}}>Disconnect</button>
          </div>
        ) : (
          <button onClick={login} className="btn-primary" style={{padding:'9px 20px',borderRadius:9,fontSize:13,fontWeight:700}}>
            Connect Wallet
          </button>
        ))}
      </div>
    </nav>
  );
}
