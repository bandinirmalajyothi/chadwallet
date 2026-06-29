'use client';
import { usePrivy } from '@privy-io/react-auth';
import NavBar from '@/components/ui/NavBar';
import TokenBanner from '@/components/ui/TokenBanner';
import { useRouter } from 'next/navigation';
import { getMockTrendingTokens, TrendingToken } from '@/lib/birdeye';
import { useState, useEffect } from 'react';

function fmtPrice(p: number) {
  if (!p) return '$0';
  if (p < 0.00001) return `$${p.toExponential(2)}`;
  if (p < 0.001) return `$${p.toFixed(6)}`;
  if (p < 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(2)}`;
}
function fmtCompact(n: number) {
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

// Star field — matches fomo.family space bg
function Stars() {
  const stars = Array.from({length:120},(_,i)=>({
    x: Math.sin(i*137.5)*50+50,
    y: Math.cos(i*97.3)*50+50,
    r: [0.8,1,1.2,1.5,0.6][i%5],
    o: [0.2,0.4,0.6,0.3,0.5][i%5],
    d: 2+i%4,
  }));
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      {stars.map((s,i)=>(
        <div key={i} style={{
          position:'absolute', left:`${s.x}%`, top:`${s.y}%`,
          width:s.r*2, height:s.r*2, borderRadius:'50%',
          background:'white', opacity:s.o,
          animation:`glowPulse ${s.d}s ease-in-out infinite`,
          animationDelay:`${(i*0.13)%4}s`,
        }}/>
      ))}
    </div>
  );
}

// Glowing orbs like fomo.family
function Orbs() {
  return (
    <>
      <div style={{position:'absolute',top:'10%',left:'50%',transform:'translateX(-50%)',width:700,height:500,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(109,40,217,0.14) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:'40%',left:'15%',width:400,height:300,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(5,150,105,0.09) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:'20%',right:'10%',width:350,height:280,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(139,92,246,0.1) 0%,transparent 70%)',pointerEvents:'none'}}/>
    </>
  );
}

export default function Home() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();
  const [tokens, setTokens] = useState<TrendingToken[]>(getMockTrendingTokens());

  useEffect(()=>{
    fetch('/api/trending').then(r=>r.json()).then(d=>{ if(d?.length) setTokens(d); }).catch(()=>{});
  },[]);

  return (
    <main style={{background:'var(--bg-primary)',minHeight:'100vh',overflowX:'hidden'}}>
      <NavBar />

      {/* ── HERO — matches fomo.family exactly ── */}
      <section style={{
        position:'relative', minHeight:'100vh',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        paddingTop:60, overflow:'hidden',
      }}>
        <Stars />
        <Orbs />

        {/* TOP TOKEN BANNER */}
        <div style={{position:'absolute',top:60,left:0,right:0,zIndex:5}}>
          <TokenBanner direction="left" />
        </div>

        {/* Hero text — fomo style: all lowercase, massive, centered */}
        <div style={{
          position:'relative', zIndex:10, textAlign:'center',
          padding:'0 24px', maxWidth:860,
          animation:'fadeUp 0.8s ease both',
        }}>
          {/* Badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:100, padding:'6px 16px', marginBottom:36,
            fontSize:12, fontWeight:600, color:'var(--text-secondary)',
          }}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent-green-light)',display:'inline-block',animation:'glowPulse 2s ease-in-out infinite'}}/>
            solana · sub-second trades · 50,000+ tokens
          </div>

          {/* Main headline — fomo.family style */}
          <h1 className="headline" style={{
            fontSize:'clamp(52px,9vw,110px)',
            color:'white', marginBottom:8,
          }}>
            where chads
          </h1>
          <h1 className="headline gradient-text" style={{
            fontSize:'clamp(52px,9vw,110px)',
            marginBottom:32,
          }}>
            become legends.
          </h1>

          <p style={{
            fontSize:'clamp(16px,2vw,20px)',
            color:'var(--text-secondary)', lineHeight:1.65,
            maxWidth:500, margin:'0 auto 44px',
            fontWeight:400,
          }}>
            From memecoins to viral tokens, trade any crypto on Solana in seconds. Social-first. Self-custody. Zero complexity.
          </p>

          {/* CTAs */}
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:20}}>
            {/* App Store — white pill like fomo */}
            <a href="https://apps.apple.com/us/app/chadwallet/id6757367474" target="_blank" rel="noopener noreferrer"
              style={{textDecoration:'none'}}>
              <button className="btn-white" style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'14px 28px', borderRadius:14,
                fontSize:15, fontWeight:700,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Download app
              </button>
            </a>

            <a href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www" target="_blank" rel="noopener noreferrer"
              style={{textDecoration:'none'}}>
              <button className="btn-outline" style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'14px 28px', borderRadius:14,
                fontSize:15, fontWeight:700,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2L15.9 12 12 8.1zm16.85-10.95L17.5 11.5 13.4 12l4.1 4.5 2.5-1.38c.71-.39 1-.94 1-1.63s-.28-1.28-.97-1.68zM3.01.24c-.38.42-.51.96-.51 1.59V22.2c0 .63.14 1.17.51 1.59L3.09 24l11.74-11.74v-.52z"/></svg>
                Google Play
              </button>
            </a>

            {!authenticated && (
              <button onClick={login} className="btn-primary" style={{
                padding:'14px 28px', borderRadius:14, fontSize:15, fontWeight:700,
              }}>
                Trade on web →
              </button>
            )}
            {authenticated && (
              <button onClick={()=>router.push('/trade')} className="btn-primary" style={{
                padding:'14px 28px', borderRadius:14, fontSize:15, fontWeight:700,
              }}>
                Open desk →
              </button>
            )}
          </div>

          <p style={{fontSize:12,color:'var(--text-muted)'}}>
            Sign in with Apple or Google · Embedded Solana wallet · You own your crypto
          </p>
        </div>

        {/* BOTTOM TOKEN BANNER */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:5}}>
          <TokenBanner direction="right" />
        </div>
      </section>

      {/* ── SECTION 2: "trade from anywhere" — mirrors fomo.family ── */}
      <section style={{
        padding:'120px 24px', background:'var(--bg-secondary)',
        borderTop:'1px solid var(--border)',
        textAlign:'center', position:'relative', overflow:'hidden',
      }}>
        <Orbs />
        <div style={{position:'relative',zIndex:1,maxWidth:900,margin:'0 auto'}}>
          <div className="tag tag-purple" style={{marginBottom:20,display:'inline-flex'}}>NOW AVAILABLE ON WEB</div>
          <h2 className="headline" style={{fontSize:'clamp(32px,6vw,68px)',marginBottom:16}}>
            trade from anywhere.
          </h2>
          <h2 className="headline gradient-text" style={{fontSize:'clamp(32px,6vw,68px)',marginBottom:32}}>
            never lose a beat.
          </h2>
          <p style={{fontSize:18,color:'var(--text-secondary)',maxWidth:480,margin:'0 auto 56px',lineHeight:1.6}}>
            Open a trade on your phone, close it on your desktop — all in one app.
          </p>

          {/* Mock desktop UI preview — fomo.family shows screenshot */}
          <div style={{
            background:'linear-gradient(135deg,rgba(109,40,217,0.1),rgba(5,150,105,0.06))',
            border:'1px solid var(--border-light)', borderRadius:20,
            padding:'32px', maxWidth:800, margin:'0 auto',
            backdropFilter:'blur(10px)',
          }}>
            {/* Fake trading UI preview */}
            <div style={{display:'grid',gridTemplateColumns:'200px 1fr 200px',gap:12,height:280}}>
              {/* Left: token list preview */}
              <div style={{background:'rgba(255,255,255,0.03)',borderRadius:12,padding:12,overflow:'hidden'}}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.08em'}}>🔥 Trending</div>
                {['BONK','WIF','POPCAT','MYRO','MEW','BOME'].map((s,i)=>(
                  <div key={s} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:11}}>
                    <span style={{fontWeight:700}}>{s}</span>
                    <span style={{color:i%2===0?'var(--accent-green-light)':'var(--accent-red-light)',fontWeight:600}}>{i%2===0?'+':'-'}{(Math.random()*20+1).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              {/* Middle: chart preview */}
              <div style={{background:'rgba(255,255,255,0.03)',borderRadius:12,padding:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:16}}>BONK/SOL</div>
                    <div style={{fontSize:12,color:'var(--accent-green-light)',fontWeight:600}}>+12.4%</div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    {['1m','5m','15m','1h'].map(tf=>(
                      <div key={tf} style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:tf==='15m'?'var(--accent-purple)':'rgba(255,255,255,0.06)',color:tf==='15m'?'white':'var(--text-muted)',fontWeight:600}}>{tf}</div>
                    ))}
                  </div>
                </div>
                {/* Fake chart lines */}
                <svg viewBox="0 0 300 120" style={{width:'100%',height:120}}>
                  <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                  <path d="M0,100 C30,90 60,70 90,60 C120,50 150,55 180,40 C210,25 240,30 270,15 L300,10 L300,120 L0,120Z" fill="url(#g1)"/>
                  <path d="M0,100 C30,90 60,70 90,60 C120,50 150,55 180,40 C210,25 240,30 270,15 L300,10" fill="none" stroke="#10b981" strokeWidth={2}/>
                </svg>
              </div>
              {/* Right: buy panel preview */}
              <div style={{background:'rgba(255,255,255,0.03)',borderRadius:12,padding:12}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:10}}>
                  <div style={{background:'var(--accent-green)',borderRadius:8,padding:'8px',textAlign:'center',fontSize:12,fontWeight:800,color:'white'}}>BUY</div>
                  <div style={{background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'8px',textAlign:'center',fontSize:12,fontWeight:700,color:'var(--text-muted)'}}>SELL</div>
                </div>
                <div style={{background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'10px',marginBottom:8,fontSize:12,color:'var(--text-muted)'}}>0.5 SOL</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:10}}>
                  {['0.1','0.5','1','5'].map(v=>(
                    <div key={v} style={{background:'rgba(255,255,255,0.04)',borderRadius:6,padding:'5px',textAlign:'center',fontSize:10,fontWeight:600,color:'var(--text-muted)'}}>
                      {v} SOL
                    </div>
                  ))}
                </div>
                <div style={{background:'var(--accent-green)',borderRadius:9,padding:'10px',textAlign:'center',fontSize:12,fontWeight:800,color:'white'}}>Buy BONK</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Features — fomo.family "never miss out" cards ── */}
      <section style={{padding:'120px 24px',maxWidth:1100,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:72}}>
          <h2 className="headline" style={{fontSize:'clamp(28px,5vw,60px)',marginBottom:16}}>
            never miss out again
          </h2>
          <p style={{fontSize:16,color:'var(--text-muted)',fontWeight:500}}>the only social-first trading app on solana</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>
          {[
            { tag:'LEADERBOARD', headline:'become a legend, top the leaderboard', icon:'🏆', color:'#fbbf24',
              desc:'Compete with the best traders on Solana. Your PnL is your reputation. Rise to the top.', tagClass:'tag-gold' },
            { tag:'FEED', headline:'discover and follow top traders', icon:'📡', color:'#8b5cf6',
              desc:'See what the best wallets are buying in real time. Copy, learn, and ride the wave before it peaks.', tagClass:'tag-purple' },
            { tag:'ALERTS', headline:'real time notifications for what the best are buying', icon:'🔔', color:'#34d399',
              desc:'Instant push alerts when a whale moves. Know before everyone else. Never be late again.', tagClass:'tag-green' },
            { tag:'EASY ONBOARDING', headline:'create an account in an instant', icon:'⚡', color:'#60a5fa',
              desc:'Sign in with Apple or Google. ChadWallet creates your Solana wallet automatically. Start trading in 30 seconds.', tagClass:'tag-purple' },
            { tag:'ZERO COMPLEXITY', headline:'multichain & gasless', icon:'🌐', color:'#a78bfa',
              desc:'Sub-cent network fees on Solana. No seed phrases, no gas anxiety. Just buy and trade.', tagClass:'tag-purple' },
            { tag:'ONE CLICK TO BUY', headline:'fund with apple pay', icon:'💳', color:'#f472b6',
              desc:'Add SOL instantly with Apple Pay or Google Pay. No crypto experience needed. Just tap.', tagClass:'tag-red' },
          ].map(({tag,headline,icon,color,desc,tagClass})=>(
            <div key={tag} className="glass-card" style={{
              borderRadius:20, padding:'32px 28px',
              transition:'transform 0.2s ease, box-shadow 0.2s ease',
              cursor:'default',
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-4px)';
              e.currentTarget.style.boxShadow=`0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${color}22`;
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0)';
              e.currentTarget.style.boxShadow='none';
            }}
            >
              <div className={`tag ${tagClass}`} style={{marginBottom:20}}>{tag}</div>
              <div style={{fontSize:36,marginBottom:16}}>{icon}</div>
              <h3 style={{fontSize:20,fontWeight:800,letterSpacing:'-0.02em',lineHeight:1.25,marginBottom:12,color:'white'}}>{headline}</h3>
              <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.65}}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: Trending tokens ── */}
      <section id="trending" style={{padding:'0 24px 120px',maxWidth:1100,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:32,flexWrap:'wrap',gap:16}}>
          <div>
            <div className="tag tag-green" style={{marginBottom:12,display:'inline-flex'}}>LIVE · SOLANA</div>
            <h2 className="headline" style={{fontSize:'clamp(26px,4vw,48px)'}}>trending now</h2>
          </div>
          <button onClick={()=>router.push('/trade')} className="btn-outline"
            style={{padding:'10px 22px',borderRadius:10,fontSize:13,fontWeight:700}}>
            view all →
          </button>
        </div>

        <div className="glass-card" style={{borderRadius:20,overflow:'hidden'}}>
          {/* Header */}
          <div style={{display:'grid',gridTemplateColumns:'36px 2fr 1fr 1fr 1fr 110px',padding:'12px 20px',
            fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',
            borderBottom:'1px solid var(--border)'}}>
            <div>#</div><div>Token</div>
            <div style={{textAlign:'right'}}>Price</div>
            <div style={{textAlign:'right'}}>24h</div>
            <div style={{textAlign:'right'}}>Volume</div>
            <div/>
          </div>
          {tokens.slice(0,10).map((t,i)=>{
            const isPos = (t.priceChange24h||0) >= 0;
            return (
              <div key={t.address}
                style={{display:'grid',gridTemplateColumns:'36px 2fr 1fr 1fr 1fr 110px',
                  padding:'13px 20px',alignItems:'center',
                  borderBottom:i<9?'1px solid var(--border)':'none',
                  transition:'background 0.15s',cursor:'pointer'}}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(139,92,246,0.06)')}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                onClick={()=>router.push(`/trade/${t.address}`)}
              >
                <div style={{fontSize:12,color:'var(--text-muted)',fontWeight:700}}>{i+1}</div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {t.logoURI && <img src={t.logoURI} alt="" width={30} height={30} style={{borderRadius:'50%',objectFit:'cover'}} onError={e=>(e.currentTarget.style.display='none')}/>}
                  <div>
                    <div style={{fontWeight:800,fontSize:14}}>{t.symbol}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)'}}>{t.name}</div>
                  </div>
                </div>
                <div style={{textAlign:'right',fontWeight:700,fontSize:13,fontFamily:'monospace'}}>{fmtPrice(t.price)}</div>
                <div style={{textAlign:'right'}}>
                  <span style={{fontWeight:700,fontSize:13,color:isPos?'var(--accent-green-light)':'var(--accent-red-light)'}}>
                    {isPos?'+':''}{(t.priceChange24h||0).toFixed(2)}%
                  </span>
                </div>
                <div style={{textAlign:'right',fontSize:13,color:'var(--text-secondary)'}}>{fmtCompact(t.volume24h)}</div>
                <div style={{textAlign:'right'}}>
                  <button onClick={e=>{e.stopPropagation();router.push(`/trade/${t.address}`);}}
                    className="btn-primary"
                    style={{padding:'6px 16px',borderRadius:8,fontSize:12,fontWeight:700}}>
                    trade
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 5: Social proof CTA — fomo.family "for the rest of us" ── */}
      <section style={{
        padding:'120px 24px', textAlign:'center',
        borderTop:'1px solid var(--border)', position:'relative', overflow:'hidden',
      }}>
        <Stars />
        <Orbs />
        <div style={{position:'relative',zIndex:1,maxWidth:640,margin:'0 auto'}}>
          <h2 className="headline" style={{fontSize:'clamp(32px,6vw,68px)',marginBottom:16}}>
            a trading app
          </h2>
          <h2 className="headline gradient-text" style={{fontSize:'clamp(32px,6vw,68px)',marginBottom:24}}>
            for the rest of us
          </h2>
          <p style={{fontSize:18,color:'var(--text-secondary)',lineHeight:1.6,marginBottom:48}}>
            join thousands of traders making their name on chadwallet
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="https://apps.apple.com/us/app/chadwallet/id6757367474" target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
              <button className="btn-white" style={{display:'flex',alignItems:'center',gap:10,padding:'16px 32px',borderRadius:14,fontSize:16,fontWeight:800}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Download app
              </button>
            </a>
            <a href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www" target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
              <button className="btn-outline" style={{display:'flex',alignItems:'center',gap:10,padding:'16px 32px',borderRadius:14,fontSize:16,fontWeight:800}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2L15.9 12 12 8.1zm16.85-10.95L17.5 11.5 13.4 12l4.1 4.5 2.5-1.38c.71-.39 1-.94 1-1.63s-.28-1.28-.97-1.68zM3.01.24c-.38.42-.51.96-.51 1.59V22.2c0 .63.14 1.17.51 1.59L3.09 24l11.74-11.74v-.52z"/></svg>
                Google Play
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding:'48px 28px', borderTop:'1px solid var(--border)',
        maxWidth:1100, margin:'0 auto',
      }}>
        <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:40,alignItems:'start',flexWrap:'wrap'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#7c3aed,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:13,color:'white'}}>C</div>
              <span style={{fontWeight:800,fontSize:15,letterSpacing:'-0.02em'}}>chadwallet</span>
            </div>
            <p style={{fontSize:12,color:'var(--text-muted)',maxWidth:240,lineHeight:1.6}}>
              where chads become legends.
            </p>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>SOCIAL</div>
            {[['X/Twitter','https://x.com/chadwallet'],['Discord','https://discord.gg/mdCjtyZ8G'],['Telegram','#']].map(([label,href])=>(
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{display:'block',fontSize:13,color:'var(--text-secondary)',textDecoration:'none',marginBottom:8}}
                onMouseEnter={e=>(e.currentTarget.style.color='white')}
                onMouseLeave={e=>(e.currentTarget.style.color='var(--text-secondary)')}
              >{label}</a>
            ))}
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>LEGAL</div>
            {[['Privacy Policy','/privacy'],['Terms of Service','/terms']].map(([label,href])=>(
              <a key={label} href={href} style={{display:'block',fontSize:13,color:'var(--text-secondary)',textDecoration:'none',marginBottom:8}}
                onMouseEnter={e=>(e.currentTarget.style.color='white')}
                onMouseLeave={e=>(e.currentTarget.style.color='var(--text-secondary)')}
              >{label}</a>
            ))}
          </div>
        </div>
        <div style={{marginTop:40,paddingTop:24,borderTop:'1px solid var(--border)',fontSize:11,color:'var(--text-muted)'}}>
          © 2025 ChadWallet. Not financial advice. Trade at your own risk.
        </div>
      </footer>
    </main>
  );
}
