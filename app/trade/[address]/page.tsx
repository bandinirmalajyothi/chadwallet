'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import NavBar from '@/components/ui/NavBar';
import {
  TrendingToken, TokenOverview, Trade, Holder, OHLCVData,
  getMockTrendingTokens, getTokenOverview, getLiveTrades, getTokenHolders, getOHLCV
} from '@/lib/birdeye';

function fmtPrice(p: number) {
  if (!p) return '$0.00';
  if (p < 0.00001) return `$${p.toExponential(2)}`;
  if (p < 0.001) return `$${p.toFixed(6)}`;
  if (p < 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(2)}`;
}
function fmtCompact(n: number) {
  if (!n) return '$0';
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function shortAddr(a: string) {
  if (!a || a.length < 8) return a;
  return `${a.slice(0,4)}...${a.slice(-4)}`;
}
function timeAgo(unix: number) {
  const s = Math.floor(Date.now()/1000) - unix;
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m`;
  return `${Math.floor(s/3600)}h`;
}

function MiniSparkline({ data, positive }: { data: OHLCVData[]; positive: boolean }) {
  if (!data.length) return null;
  const prices = data.map(d => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 320, H = 100;
  const pts = prices.map((p, i) => `${(i/(prices.length-1))*W},${H-((p-min)/range)*H}`).join(' ');
  const fillPts = prices.map((p,i)=>`${(i/(prices.length-1))*W},${H-((p-min)/range)*H}`);
  const fill = `M ${fillPts[0]} L ${fillPts.join(' L ')} L ${W},${H} L 0,${H} Z`;
  const color = positive ? '#10b981' : '#ef4444';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H,display:'block'}}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#cg)"/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
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
  const [tab, setTab] = useState<'trades'|'holders'>('trades');
  const [side, setSide] = useState<'buy'|'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<string|null>(null);
  const [search, setSearch] = useState('');

  const currentToken = allTokens.find(t=>t.address===address) || allTokens[0];
  const displayData = overview || (currentToken ? {
    address:currentToken.address, symbol:currentToken.symbol, name:currentToken.name,
    price:currentToken.price, priceChange24h:currentToken.priceChange24h,
    volume24h:currentToken.volume24h, marketCap:0, liquidity:0,
  } : null);
  const isPositive = (displayData?.priceChange24h||0) >= 0;

  useEffect(()=>{
    fetch('/api/trending').then(r=>r.json()).then(d=>{if(d?.length) setAllTokens(d);}).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!address) return;
    Promise.all([getTokenOverview(address),getLiveTrades(address),getTokenHolders(address),getOHLCV(address,timeframe)])
      .then(([ov,tr,ho,oh])=>{
        if(ov) setOverview(ov);
        setTrades(tr); setHolders(ho); setOHLCV(oh);
      });
  },[address]);

  useEffect(()=>{ if(address) getOHLCV(address,timeframe).then(setOHLCV); },[timeframe,address]);

  useEffect(()=>{
    const iv = setInterval(()=>{ if(address) getLiveTrades(address).then(setTrades); },10000);
    return ()=>clearInterval(iv);
  },[address]);

  const handleTrade = () => {
    if(!authenticated){ login(); return; }
    if(!amount) return;
    setTxStatus('Confirming...');
    setTimeout(()=>{
      setTxStatus(`✅ ${side==='buy'?'Bought':'Sold'} ${amount} SOL of ${displayData?.symbol||'token'}!`);
      setTimeout(()=>setTxStatus(null),4000);
    },1400);
  };

  const filteredTokens = allTokens.filter(t=>
    !search || t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const colH = 'calc(100vh - 60px)';

  return (
    <div style={{background:'var(--bg-primary)',height:'100vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <NavBar />

      <div style={{flex:1,display:'grid',gridTemplateColumns:'240px 1fr 280px',overflow:'hidden',marginTop:60}}>

        {/* ── LEFT: Token list (fomo.family sidebar style) ── */}
        <div style={{
          borderRight:'1px solid var(--border)',
          display:'flex',flexDirection:'column',
          height:colH, overflow:'hidden',
          background:'rgba(8,4,16,0.6)',
        }}>
          {/* Search */}
          <div style={{padding:'12px 12px 8px'}}>
            <div style={{position:'relative'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2.5} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search tokens..."
                style={{
                  width:'100%', padding:'8px 10px 8px 30px',
                  background:'rgba(255,255,255,0.05)', border:'1px solid var(--border-light)',
                  borderRadius:9, color:'var(--text-primary)', fontSize:12, outline:'none',
                  fontFamily:'inherit', boxSizing:'border-box',
                }}
                onFocus={e=>(e.target.style.borderColor='var(--accent-purple-light)')}
                onBlur={e=>(e.target.style.borderColor='var(--border-light)')}
              />
            </div>
          </div>
          <div style={{padding:'4px 12px 6px',fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em'}}>
            🔥 Trending
          </div>

          {/* Token rows */}
          <div style={{flex:1,overflowY:'auto'}}>
            {filteredTokens.map(token=>{
              const isActive = token.address===address;
              const isPos = (token.priceChange24h||0)>=0;
              return (
                <a key={token.address} href={`/trade/${token.address}`}
                  style={{
                    display:'flex',alignItems:'center',gap:9,
                    padding:'9px 12px', textDecoration:'none', color:'inherit',
                    background:isActive?'rgba(139,92,246,0.1)':'transparent',
                    borderLeft:isActive?'2px solid var(--accent-purple-light)':'2px solid transparent',
                    borderBottom:'1px solid rgba(255,255,255,0.03)',
                    transition:'background 0.1s',
                  }}
                  onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}
                >
                  {/* Rank */}
                  <span style={{fontSize:10,color:'var(--text-muted)',width:16,flexShrink:0,textAlign:'right'}}>{token.rank}</span>
                  {/* Logo */}
                  <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(255,255,255,0.06)',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {token.logoURI
                      ? <img src={token.logoURI} alt="" width={28} height={28} style={{borderRadius:'50%',objectFit:'cover'}} onError={e=>{e.currentTarget.style.display='none';}}/>
                      : <span style={{fontSize:11,fontWeight:800}}>{token.symbol[0]}</span>
                    }
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontWeight:800,fontSize:13,letterSpacing:'-0.01em'}}>{token.symbol}</span>
                      <span style={{fontSize:11,fontWeight:700,color:isPos?'var(--accent-green-light)':'var(--accent-red-light)'}}>
                        {isPos?'+':''}{(token.priceChange24h||0).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:2}}>
                      <span style={{fontSize:10,color:'var(--text-muted)'}}>{fmtCompact(token.volume24h)}</span>
                      <span style={{fontSize:10,fontFamily:'monospace',color:'var(--text-secondary)'}}>{fmtPrice(token.price)}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* ── MIDDLE: Chart + info ── */}
        <div style={{
          display:'flex',flexDirection:'column',
          height:colH, overflow:'hidden',
          borderRight:'1px solid var(--border)',
        }}>
          {/* Token header */}
          {displayData && (
            <div style={{
              padding:'12px 20px', borderBottom:'1px solid var(--border)',
              display:'flex', alignItems:'center', gap:20, flexShrink:0,
              background:'rgba(8,4,16,0.5)',
            }}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:38,height:38,borderRadius:'50%',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:16,flexShrink:0}}>
                  {displayData.symbol?.[0]}
                </div>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontWeight:900,fontSize:18,letterSpacing:'-0.02em'}}>{displayData.symbol}</span>
                    <span style={{fontSize:12,color:'var(--text-muted)'}}>/{displayData.name}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--text-muted)',fontFamily:'monospace'}}>{address?.slice(0,8)}...{address?.slice(-6)}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:28,alignItems:'center',flexWrap:'wrap'}}>
                <div>
                  <div style={{fontSize:22,fontWeight:900,fontFamily:'monospace',letterSpacing:'-0.02em'}}>{fmtPrice(displayData.price)}</div>
                  <div style={{fontSize:13,fontWeight:700,color:isPositive?'var(--accent-green-light)':'var(--accent-red-light)'}}>
                    {isPositive?'▲':'▼'} {Math.abs(displayData.priceChange24h||0).toFixed(2)}%
                  </div>
                </div>
                {[
                  {l:'24h Vol', v:fmtCompact(displayData.volume24h)},
                  {l:'Mkt Cap', v:displayData.marketCap?fmtCompact(displayData.marketCap):'—'},
                  {l:'Liquidity', v:displayData.liquidity?fmtCompact(displayData.liquidity):'—'},
                ].map(({l,v})=>(
                  <div key={l}>
                    <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:2}}>{l}</div>
                    <div style={{fontSize:14,fontWeight:800}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart */}
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',flexShrink:0,background:'rgba(8,4,16,0.3)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text-muted)'}}>Price Chart</span>
              <div style={{display:'flex',gap:3}}>
                {['1m','5m','15m','1h','4h','1D'].map(tf=>(
                  <button key={tf} onClick={()=>setTimeframe(tf)} style={{
                    padding:'4px 10px',borderRadius:6,fontSize:11,fontWeight:700,
                    cursor:'pointer',border:'none',
                    background:timeframe===tf?'var(--accent-purple)':'rgba(255,255,255,0.05)',
                    color:timeframe===tf?'white':'var(--text-muted)',
                    transition:'all 0.15s',fontFamily:'inherit',
                  }}>{tf}</button>
                ))}
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,0.02)',borderRadius:12,padding:'12px 12px 4px',minHeight:130}}>
              {ohlcv.length > 0 ? (
                <>
                  <MiniSparkline data={ohlcv} positive={isPositive}/>
                  {/* Volume bars */}
                  <div style={{display:'flex',gap:1.5,height:28,alignItems:'flex-end',marginTop:4}}>
                    {ohlcv.slice(-60).map((bar,i)=>{
                      const maxV = Math.max(...ohlcv.map(b=>b.volume));
                      const h = Math.max(2,(bar.volume/maxV)*26);
                      return <div key={i} style={{flex:1,height:h,background:bar.close>=bar.open?'rgba(16,185,129,0.35)':'rgba(239,68,68,0.35)',borderRadius:1}}/>;
                    })}
                  </div>
                  {/* OHLC values */}
                  <div style={{display:'flex',gap:20,marginTop:8}}>
                    {['O','H','L','C'].map((label,i)=>{
                      const last = ohlcv[ohlcv.length-1];
                      const vals = [last?.open,last?.high,last?.low,last?.close];
                      const colors = ['var(--text-secondary)','var(--accent-green-light)','var(--accent-red-light)','var(--text-primary)'];
                      return (
                        <div key={label} style={{fontSize:11}}>
                          <span style={{color:'var(--text-muted)',fontWeight:600}}>{label} </span>
                          <span style={{fontFamily:'monospace',color:colors[i],fontWeight:700}}>{fmtPrice(vals[i]||0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{height:130,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:12}}>Loading chart...</div>
              )}
            </div>
          </div>

          {/* Tabs: Live trades / Holders */}
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',borderBottom:'1px solid var(--border)',flexShrink:0}}>
              {([['trades','⚡ Live Trades'],['holders','👥 Holders']] as const).map(([key,label])=>(
                <button key={key} onClick={()=>setTab(key as any)} style={{
                  flex:1,padding:'11px',fontSize:12,fontWeight:700,cursor:'pointer',
                  border:'none',background:'transparent',fontFamily:'inherit',
                  color:tab===key?'white':'var(--text-muted)',
                  borderBottom:tab===key?'2px solid var(--accent-purple-light)':'2px solid transparent',
                  transition:'all 0.15s',
                }}>{label}</button>
              ))}
            </div>

            <div style={{flex:1,overflowY:'auto'}}>
              {tab==='trades' && (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'50px 60px 1fr 1fr 70px',padding:'7px 16px',
                    fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',
                    letterSpacing:'0.07em',borderBottom:'1px solid var(--border)',position:'sticky',top:0,background:'var(--bg-primary)'}}>
                    <div>Time</div><div>Side</div><div style={{textAlign:'right'}}>Price</div><div style={{textAlign:'right'}}>Value</div><div style={{textAlign:'right'}}>Wallet</div>
                  </div>
                  {trades.map((t,i)=>(
                    <div key={`${t.txHash}-${i}`} style={{
                      display:'grid',gridTemplateColumns:'50px 60px 1fr 1fr 70px',
                      padding:'8px 16px',fontSize:11,borderBottom:'1px solid rgba(255,255,255,0.03)',
                      alignItems:'center',transition:'background 0.1s',
                    }}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                    >
                      <div style={{color:'var(--text-muted)',fontSize:10}}>{timeAgo(t.blockTime)}</div>
                      <div>
                        <span style={{
                          fontSize:9,padding:'2px 7px',borderRadius:100,fontWeight:800,
                          background:t.side==='buy'?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)',
                          color:t.side==='buy'?'var(--accent-green-light)':'var(--accent-red-light)',
                          border:`1px solid ${t.side==='buy'?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}`,
                        }}>{t.side.toUpperCase()}</span>
                      </div>
                      <div style={{textAlign:'right',fontFamily:'monospace',fontWeight:700,fontSize:11}}>{fmtPrice(t.priceUsd)}</div>
                      <div style={{textAlign:'right',color:'var(--text-secondary)',fontSize:11}}>{fmtCompact(t.volumeUsd)}</div>
                      <div style={{textAlign:'right',color:'var(--text-muted)',fontFamily:'monospace',fontSize:10}}>{shortAddr(t.wallet)}</div>
                    </div>
                  ))}
                </>
              )}
              {tab==='holders' && (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'28px 1fr 1fr 90px',padding:'7px 16px',
                    fontSize:9,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',
                    letterSpacing:'0.07em',borderBottom:'1px solid var(--border)',position:'sticky',top:0,background:'var(--bg-primary)'}}>
                    <div>#</div><div>Wallet</div><div style={{textAlign:'right'}}>Amount</div><div style={{textAlign:'right'}}>Share %</div>
                  </div>
                  {holders.map((h,i)=>(
                    <div key={`${h.owner}-${i}`} style={{
                      display:'grid',gridTemplateColumns:'28px 1fr 1fr 90px',
                      padding:'10px 16px',fontSize:11,borderBottom:'1px solid rgba(255,255,255,0.03)',
                      alignItems:'center',
                    }}>
                      <div style={{color:'var(--text-muted)',fontWeight:700}}>{i+1}</div>
                      <div style={{fontFamily:'monospace',color:'var(--text-secondary)',fontSize:11}}>{shortAddr(h.owner)}</div>
                      <div style={{textAlign:'right',fontFamily:'monospace',fontSize:11}}>{(h.uiAmount||h.amount||0).toLocaleString()}</div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:11,fontWeight:800,color:'var(--accent-purple-light)',marginBottom:3}}>{(h.percentage||0).toFixed(2)}%</div>
                        <div style={{height:3,background:'var(--border)',borderRadius:2}}>
                          <div style={{height:'100%',width:`${Math.min(h.percentage||0,100)}%`,background:'var(--accent-purple)',borderRadius:2}}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Buy/Sell panel — fomo.family style ── */}
        <div style={{
          height:colH, overflowY:'auto',
          background:'rgba(8,4,16,0.5)',
          display:'flex',flexDirection:'column',
        }}>
          <div style={{padding:'16px 16px 0',flexShrink:0}}>
            {/* Buy / Sell toggle */}
            <div style={{
              display:'grid',gridTemplateColumns:'1fr 1fr',
              background:'rgba(255,255,255,0.04)',
              borderRadius:14,padding:4,marginBottom:20,
            }}>
              {(['buy','sell'] as const).map(s=>(
                <button key={s} onClick={()=>setSide(s)} style={{
                  padding:'11px',borderRadius:11,fontSize:14,fontWeight:900,
                  cursor:'pointer',border:'none',fontFamily:'inherit',letterSpacing:'-0.01em',
                  background:side===s
                    ?(s==='buy'?'linear-gradient(135deg,#059669,#047857)':'linear-gradient(135deg,#dc2626,#b91c1c)')
                    :'transparent',
                  color:side===s?'white':'var(--text-muted)',
                  transition:'all 0.2s',textTransform:'uppercase',
                }}>{s}</button>
              ))}
            </div>

            {/* Amount input */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.07em'}}>Amount</div>
              <div style={{position:'relative'}}>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width:'100%',padding:'13px 54px 13px 14px',boxSizing:'border-box',
                    background:'rgba(255,255,255,0.05)',border:'1px solid var(--border-light)',
                    borderRadius:11,color:'white',fontSize:18,fontWeight:800,
                    outline:'none',fontFamily:'monospace',
                  }}
                  onFocus={e=>(e.target.style.borderColor='var(--accent-purple-light)')}
                  onBlur={e=>(e.target.style.borderColor='var(--border-light)')}
                />
                <span style={{
                  position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                  fontSize:13,fontWeight:800,color:'var(--text-muted)',pointerEvents:'none',
                }}>SOL</span>
              </div>
            </div>

            {/* Quick amounts */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:16}}>
              {['0.1','0.5','1','5'].map(v=>(
                <button key={v} onClick={()=>setAmount(v)} style={{
                  padding:'8px 4px',borderRadius:9,fontSize:12,fontWeight:700,
                  cursor:'pointer',fontFamily:'inherit',
                  border:`1px solid ${amount===v?'var(--accent-purple-light)':'var(--border-light)'}`,
                  background:amount===v?'rgba(139,92,246,0.15)':'rgba(255,255,255,0.03)',
                  color:amount===v?'var(--accent-purple-light)':'var(--text-secondary)',
                  transition:'all 0.15s',
                }}>{v}</button>
              ))}
            </div>

            {/* Estimate */}
            {amount && parseFloat(amount) > 0 && displayData && (
              <div style={{
                background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',
                borderRadius:11,padding:'12px 14px',marginBottom:16,fontSize:12,
              }}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                  <span style={{color:'var(--text-muted)'}}>You {side==='buy'?'receive':'spend'}</span>
                  <span style={{fontWeight:800,color:'white'}}>
                    ~{displayData.price ? (parseFloat(amount)*175/displayData.price).toLocaleString(undefined,{maximumFractionDigits:0}) : '—'} {displayData.symbol}
                  </span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                  <span style={{color:'var(--text-muted)'}}>Network fee</span>
                  <span style={{color:'var(--accent-green-light)',fontWeight:700}}>~$0.001</span>
                </div>
                <div style={{height:1,background:'var(--border)',margin:'8px 0'}}/>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:'var(--text-muted)',fontWeight:600}}>Total</span>
                  <span style={{fontWeight:900,fontSize:13}}>{amount} SOL</span>
                </div>
              </div>
            )}

            {/* Trade button */}
            <button onClick={handleTrade} style={{
              width:'100%',padding:'15px',borderRadius:13,fontSize:15,fontWeight:900,
              cursor:'pointer',border:'none',fontFamily:'inherit',letterSpacing:'-0.01em',
              background:authenticated
                ?(side==='buy'?'linear-gradient(135deg,#059669,#047857)':'linear-gradient(135deg,#dc2626,#b91c1c)')
                :'linear-gradient(135deg,#7c3aed,#5b21b6)',
              color:'white',transition:'all 0.2s',marginBottom:12,
            }}
            onMouseEnter={e=>(e.currentTarget.style.opacity='0.88')}
            onMouseLeave={e=>(e.currentTarget.style.opacity='1')}
            >
              {authenticated
                ?(side==='buy'?`Buy ${displayData?.symbol||''}`:` Sell ${displayData?.symbol||''}`)
                :'Connect wallet to trade'
              }
            </button>

            {txStatus && (
              <div style={{
                padding:'11px 14px',borderRadius:10,fontSize:12,fontWeight:700,textAlign:'center',
                background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',
                color:'var(--accent-green-light)',marginBottom:12,
              }}>{txStatus}</div>
            )}
          </div>

          {/* Position panel */}
          <div style={{padding:'0 16px',flexShrink:0}}>
            <div style={{
              border:'1px solid var(--border)',borderRadius:13,overflow:'hidden',
            }}>
              <div style={{
                padding:'10px 14px',borderBottom:'1px solid var(--border)',
                fontSize:10,fontWeight:800,color:'var(--text-muted)',
                textTransform:'uppercase',letterSpacing:'0.08em',
              }}>Your Position</div>
              {authenticated ? (
                <div style={{padding:'20px 14px',textAlign:'center'}}>
                  <div style={{fontSize:24,marginBottom:6}}>—</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>No open position</div>
                  <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>Buy {displayData?.symbol||''} to open one</div>
                </div>
              ) : (
                <div style={{padding:'20px 14px',textAlign:'center'}}>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:12}}>Connect wallet to see your positions</div>
                  <button onClick={login} className="btn-primary" style={{padding:'9px 20px',borderRadius:9,fontSize:12,fontWeight:700}}>Connect</button>
                </div>
              )}
            </div>

            {/* Wallet chip */}
            {authenticated && user?.wallet?.address && (
              <div style={{
                marginTop:12,padding:'10px 14px',
                background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.2)',
                borderRadius:10,display:'flex',alignItems:'center',gap:8,
              }}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'var(--accent-green-light)',flexShrink:0,animation:'glowPulse 2s ease-in-out infinite'}}/>
                <div>
                  <div style={{fontSize:10,color:'var(--text-muted)',marginBottom:2}}>Connected</div>
                  <div style={{fontSize:12,fontFamily:'monospace',color:'var(--accent-purple-light)',fontWeight:700}}>
                    {shortAddr(user.wallet.address)}
                  </div>
                </div>
              </div>
            )}

            <div style={{height:20}}/>
          </div>
        </div>
      </div>
    </div>
  );
}
