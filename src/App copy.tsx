/** @jsxRuntime classic */
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect, useRef } from 'react'

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: string | number | null): any
  export function jsxs(type: any, props: any, key?: string | number | null): any
  export function jsxDEV(type: any, props: any, key?: string | number | null): any
  export const Fragment: any
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

// ─── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  saffron: '#FF6A00',
  golden: '#F5B800',
  navy: '#0B1957',
  navyLight: '#1A2E7E',
  emerald: '#0A9B5C',
  sky: '#60B2E5',
  violet: '#7C3AED',
  cream: '#FFFDF8',
  softCream: '#FFF8F0',
}

// ─── Icons ─────────────────────────────────────────────────────────────────────
const I = {
  Arrow: ({ c = '' }: { c?: string }) => (
    <svg className={`w-4 h-4 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Mic: ({ c = '' }: { c?: string }) => (
    <svg className={`w-5 h-5 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  Send: ({ c = '' }: { c?: string }) => (
    <svg className={`w-4 h-4 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  ChevDown: ({ c = '' }: { c?: string }) => (
    <svg className={`w-3.5 h-3.5 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Menu: ({ c = '' }: { c?: string }) => (
    <svg className={`w-5 h-5 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: ({ c = '' }: { c?: string }) => (
    <svg className={`w-5 h-5 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Globe: ({ c = '' }: { c?: string }) => (
    <svg className={`w-4 h-4 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Star: ({ c = '' }: { c?: string }) => (
    <svg className={`w-3.5 h-3.5 ${c}`} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Search: ({ c = '' }: { c?: string }) => (
    <svg className={`w-4 h-4 ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
}

// ─── Chakra ────────────────────────────────────────────────────────────────────
function Chakra({ size = 28, color = '#003087', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="4.5" fill="none"/>
      <circle cx="50" cy="50" r="11" stroke={color} strokeWidth="3.5" fill={color} fillOpacity="0.12"/>
      {Array.from({length: 24}, (_, i) => {
        const a = (i * 15 * Math.PI) / 180
        return <line key={i} x1={50+Math.cos(a)*12.5} y1={50+Math.sin(a)*12.5} x2={50+Math.cos(a)*43} y2={50+Math.sin(a)*43} stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      })}
      <circle cx="50" cy="50" r="44" stroke={color} strokeWidth="1.2" fill="none" strokeDasharray="3 2"/>
    </svg>
  )
}

// ─── Logo Mark ─────────────────────────────────────────────────────────────────
function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="logo-glow flex-shrink-0">
      <path d="M8,62 Q8,68 14,68 L38,64 L38,22 L14,26 Q8,28 8,34 Z" fill="#0B1957" opacity="0.95"/>
      <path d="M72,62 Q72,68 66,68 L42,64 L42,22 L66,26 Q72,28 72,34 Z" fill="#1A2E7E" opacity="0.9"/>
      <rect x="37" y="20" width="6" height="48" rx="3" fill="#F5B800"/>
      <circle cx="40" cy="17" r="13" fill="url(#lgSunGrad)"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const r = deg * Math.PI / 180
        return <line key={i} x1={40+Math.cos(r)*14.5} y1={17+Math.sin(r)*14.5} x2={40+Math.cos(r)*21} y2={17+Math.sin(r)*21} stroke="#F5B800" strokeWidth="2.2" strokeLinecap="round" opacity="0.9"/>
      })}
      <g transform="translate(40,17)">
        <circle r="7.5" fill="none" stroke="rgba(11,25,87,0.55)" strokeWidth="1.2"/>
        {Array.from({length: 12}, (_, i) => {
          const a = i * 30 * Math.PI / 180
          return <line key={i} x1={Math.cos(a)*3} y1={Math.sin(a)*3} x2={Math.cos(a)*6.5} y2={Math.sin(a)*6.5} stroke="rgba(11,25,87,0.45)" strokeWidth="0.9" strokeLinecap="round"/>
        })}
      </g>
      <line x1="14" y1="36" x2="36" y2="34" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
      <line x1="14" y1="43" x2="36" y2="41" stroke="rgba(255,255,255,0.16)" strokeWidth="1"/>
      <line x1="14" y1="50" x2="36" y2="48" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      <line x1="44" y1="34" x2="66" y2="36" stroke="rgba(255,255,255,0.16)" strokeWidth="1"/>
      <line x1="44" y1="41" x2="66" y2="43" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      <defs>
        <radialGradient id="lgSunGrad" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFE57A"/>
          <stop offset="50%" stopColor="#FFC107"/>
          <stop offset="100%" stopColor="#FF8F00"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

// ─── Book Intro Animation ──────────────────────────────────────────────────────
function BookIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'idle'|'glow'|'opening'|'open'|'ribbons'|'particles'|'fading'>('idle')

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase('glow'), 300),
      setTimeout(() => setPhase('opening'), 800),
      setTimeout(() => setPhase('open'), 2500),
      setTimeout(() => setPhase('ribbons'), 3000),
      setTimeout(() => setPhase('particles'), 3400),
      setTimeout(() => setPhase('fading'), 4500),
      setTimeout(() => onComplete(), 5300),
    ]
    return () => ts.forEach(clearTimeout)
  }, [onComplete])

  const isFading = phase === 'fading'
  const isOpen = ['open','ribbons','particles','fading'].includes(phase)
  const showRibbons = ['ribbons','particles','fading'].includes(phase)
  const showParticles = ['particles','fading'].includes(phase)

  const particles = [
    { emoji:'🎯', x:18, y:32, dur:'3.4s', delay:'0s' },
    { emoji:'📚', x:74, y:26, dur:'4.1s', delay:'0.3s' },
    { emoji:'💡', x:12, y:58, dur:'3.6s', delay:'0.6s' },
    { emoji:'🚀', x:82, y:58, dur:'4.3s', delay:'0.1s' },
    { emoji:'⭐', x:50, y:18, dur:'3.9s', delay:'0.4s' },
    { emoji:'🏆', x:86, y:40, dur:'3.7s', delay:'0.8s' },
    { emoji:'💻', x:10, y:44, dur:'4.6s', delay:'0.2s' },
    { emoji:'🎓', x:60, y:76, dur:'3.4s', delay:'0.5s' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #050c26 0%, #0B1957 45%, #0f1f5e 100%)',
        transition: 'opacity 0.85s ease',
        opacity: isFading ? 0 : 1,
        pointerEvents: isFading ? 'none' : 'auto',
      }}
    >
      {/* Stars */}
      {Array.from({length: 60}, (_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width: Math.random()*2+0.6, height: Math.random()*2+0.6,
            top: `${Math.random()*80}%`, left: `${Math.random()*100}%`,
            opacity: Math.random()*0.55+0.1,
          }}/>
      ))}

      {/* Ambient glow */}
      <div className="absolute rounded-full pointer-events-none"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(245,184,0,0.15) 0%, transparent 65%)',
          filter: 'blur(60px)',
          transition: 'opacity 1.5s',
          opacity: phase !== 'idle' ? 1 : 0,
        }}/>

      {/* Ribbon ribbons after book opens */}
      {showRibbons && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center" style={{top:'38%'}}>
          <div className="ribbon-saffron absolute h-8 left-0 right-0"
            style={{top:0, background:'linear-gradient(90deg, transparent 5%, rgba(255,106,0,0.55) 40%, rgba(255,160,0,0.55) 60%, transparent 95%)', filter:'blur(3px)'}}/>
          <div className="ribbon-white absolute h-5 left-0 right-0"
            style={{top:32, background:'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.38) 40%, rgba(255,255,255,0.38) 60%, transparent 95%)', filter:'blur(1.5px)'}}/>
          <div className="ribbon-green absolute h-8 left-0 right-0"
            style={{top:52, background:'linear-gradient(90deg, transparent 5%, rgba(10,155,92,0.55) 40%, rgba(10,180,100,0.55) 60%, transparent 95%)', filter:'blur(3px)'}}/>
        </div>
      )}

      {/* Floating emoji particles */}
      {showParticles && particles.map((p, i) => (
        <div key={i} className="float-particle absolute text-2xl select-none pointer-events-none"
          style={{ left:`${p.x}%`, top:`${p.y}%`, '--dur': p.dur, '--delay': p.delay } as React.CSSProperties}>
          {p.emoji}
        </div>
      ))}

      {/* The Book */}
      <div className="book-scene relative" style={{width: 320, height: 400}}>
        {/* Spine */}
        <div className="absolute left-0 top-0 bottom-0 rounded-l-lg overflow-hidden flex items-center justify-center"
          style={{width:42, background:'linear-gradient(180deg,#0a1240,#060d30)', borderLeft:'3px solid rgba(245,184,0,0.6)', boxShadow:'-4px 0 18px rgba(0,0,0,0.55)'}}>
          <span style={{writingMode:'vertical-rl', fontFamily:'Cinzel,serif', fontSize:10, color:'#F5B800', letterSpacing:3.5, transform:'rotate(180deg)', opacity:0.9}}>NAVPRARAMBH</span>
        </div>

        {/* Cover */}
        <div className={`book-cover absolute top-0 bottom-0 ${isOpen ? 'open' : ''}`} style={{left:42, right:0, borderRadius:'0 12px 12px 0'}}>
          {/* Front face */}
          <div className="book-cover-front absolute inset-0 overflow-hidden flex flex-col items-center justify-center"
            style={{background:'linear-gradient(145deg,#0c1448 0%,#172070 55%,#0c1448 100%)', borderRadius:'0 12px 12px 0', border:'1.5px solid rgba(245,184,0,0.28)', boxShadow:'10px 0 40px rgba(0,0,0,0.7)'}}>
            {/* Corner ornaments */}
            {[0,1,2,3].map(i => {
              const pos = ['top-4 left-4','top-4 right-4','bottom-4 right-4','bottom-4 left-4'][i]
              const rot = [0,90,180,270][i]
              return (
                <div key={i} className={`absolute ${pos}`} style={{width:22,height:22,borderTop:'1.5px solid rgba(245,184,0,0.7)',borderLeft:'1.5px solid rgba(245,184,0,0.7)',transform:`rotate(${rot}deg)`}}/>
              )
            })}
            <div className="absolute inset-6 border border-golden/20 rounded"/>
            {/* LogoMark */}
            <div className="relative glow-pulse rounded-2xl flex items-center justify-center mb-4"
              style={{width:76,height:76,background:'linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))',border:'1px solid rgba(245,184,0,0.3)'}}>
              <LogoMark size={58}/>
            </div>
            <div style={{fontFamily:'Cinzel,serif',fontSize:17,fontWeight:700,color:'#F5B800',letterSpacing:4,textAlign:'center'}}>NAVPRARAMBH</div>
            <div style={{fontFamily:'serif',fontSize:13,color:'rgba(245,184,0,0.65)',marginTop:5,letterSpacing:2}}>नवप्रारंभ</div>
            <div className="mt-5 mx-8" style={{height:1,background:'linear-gradient(90deg,transparent,rgba(245,184,0,0.5),transparent)'}}/>
            <div style={{fontFamily:'Inter,sans-serif',fontSize:8.5,color:'rgba(255,255,255,0.35)',marginTop:8,letterSpacing:3,textTransform:'uppercase'}}>Career Operating System</div>
          </div>
          {/* Back face */}
          <div className="book-cover-back absolute inset-0" style={{borderRadius:'0 12px 12px 0',background:'linear-gradient(135deg,#1a2d70,#142060)'}}/>
        </div>

        {/* Pages (visible after open) */}
        <div className="absolute top-3 bottom-3 overflow-hidden" style={{left:46,right:8,background:'linear-gradient(170deg,#FFFCF5,#FFF0D5)',borderRadius:'0 10px 10px 0',boxShadow:'inset -3px 0 12px rgba(0,0,0,0.07)',opacity:isOpen?1:0,transition:'opacity 0.6s 0.7s'}}>
          <div className="p-6">
            <div style={{fontFamily:'Cinzel,serif',fontSize:9.5,color:'#0B1957',opacity:0.4,letterSpacing:2.5}}>CHAPTER I</div>
            <div style={{fontFamily:'Fraunces,serif',fontSize:18,color:'#0B1957',marginTop:7,fontWeight:600,lineHeight:1.3}}>Your Story Begins Here</div>
            <div className="mt-5 space-y-2.5">
              {['Discover Your Path','Build Your Skills','Land Your Dream Role'].map((t,i)=>(
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:[C.saffron,C.emerald,C.golden][i]}}/>
                  <span style={{fontFamily:'Outfit,sans-serif',fontSize:11,color:'#555'}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SIDDHI wakes up */}
      {showParticles && (
        <div className="absolute bottom-24 text-center" style={{transition:'opacity 0.5s',opacity:1}}>
          <div className="flex items-center gap-3.5 px-6 py-3.5 rounded-2xl"
            style={{background:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.18)',backdropFilter:'blur(12px)'}}>
            <span style={{fontSize:22}}>🤖</span>
            <div>
              <div style={{fontFamily:'Cinzel,serif',fontSize:12,color:'#F5B800',letterSpacing:2.5}}>SIDDHI AI</div>
              <div style={{fontFamily:'Outfit,sans-serif',fontSize:13,color:'rgba(255,255,255,0.72)'}}>Awakening... Ready to guide you ✨</div>
            </div>
          </div>
        </div>
      )}

      {/* Skip */}
      <button onClick={onComplete}
        className="absolute bottom-8 right-8 transition-all duration-200 hover:opacity-100"
        style={{fontFamily:'Inter,sans-serif',fontSize:12,color:'rgba(255,255,255,0.35)',letterSpacing:1.5}}>
        Skip intro ›
      </button>
    </div>
  )
}

// ─── Navigation ────────────────────────────────────────────────────────────────
const NAV_LINKS = ['Home', 'Dashboard', 'Career Explorer', 'Courses', 'Jobs', 'Certifications']
const NAV_MORE = ['Internships', 'Roadmaps', 'Placement Prep', 'Knowledge Games', 'Resume Builder', 'Mock Interviews', 'Hackathons', 'Scholarships', 'Events']

function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-navy/8' : 'bg-white/90 backdrop-blur-md'}`}
      style={{borderBottom: scrolled ? '1px solid rgba(11,25,87,0.06)' : '1px solid rgba(11,25,87,0.05)'}}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 flex-shrink-0">
            <LogoMark size={40}/>
            <div>
              <div style={{fontFamily:'Cinzel,serif',fontWeight:700,fontSize:15,letterSpacing:0.5,lineHeight:1.1}}>
                <span style={{color:C.saffron}}>NAV</span>
                <span style={{color:C.navy}}>PRA</span>
                <span style={{color:C.emerald}}>RAMBH</span>
              </div>
              <div style={{fontFamily:'Outfit,sans-serif',fontSize:9,color:'#aaa',letterSpacing:1.5,marginTop:1}}>Rise Like the Sun</div>
            </div>
          </a>

          {/* Center nav links */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(item => (
              <a key={item} href="#"
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:bg-navy/5 hover:text-navy"
                style={{fontFamily:'Inter,sans-serif',color:'#444',fontSize:13.5}}>
                {item}
              </a>
            ))}
            <div className="relative">
              <button onClick={() => setMoreOpen(!moreOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-navy/5 transition-all"
                style={{fontFamily:'Inter,sans-serif',color:'#444',fontSize:13.5}}>
                More <I.ChevDown c={`transition-transform ${moreOpen ? 'rotate-180' : ''}`}/>
              </button>
              {moreOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-52 glass rounded-2xl shadow-xl shadow-navy/10 p-2 z-50">
                  {NAV_MORE.map(item => (
                    <a key={item} href="#" className="block px-3 py-2 rounded-xl text-sm hover:bg-navy/5 transition-colors"
                      style={{fontFamily:'Inter,sans-serif',color:C.navy,fontSize:13}}>
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <button className="p-2 rounded-xl hover:bg-navy/5 transition-all">
              <I.Search c="text-gray-400"/>
            </button>
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-navy/5 transition-all"
                style={{fontFamily:'Inter,sans-serif',fontSize:13,color:C.navy}}>
                <I.Globe/> English <I.ChevDown/>
              </button>
              {langOpen && (
                <div className="absolute top-full mt-2 right-0 w-40 glass rounded-2xl shadow-xl p-2 z-50">
                  {['English','हिंदी','தமிழ்','తెలుగు','मराठी'].map(l => (
                    <button key={l} className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-navy/5 transition-colors"
                      style={{fontFamily:'Outfit,sans-serif',color:C.navy}}>{l}</button>
                  ))}
                </div>
              )}
            </div>
            <button className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-navy/5 transition-all"
              style={{fontFamily:'Inter,sans-serif',color:C.navy}}>
              Login
            </button>
            <button className="btn-gradient flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{fontFamily:'Inter,sans-serif'}}>
              ☀ Start Journey
            </button>
          </div>

          <button className="lg:hidden p-2 rounded-xl hover:bg-navy/5" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <I.Close/> : <I.Menu/>}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-navy/5 px-5 py-4 space-y-1">
          {[...NAV_LINKS,...NAV_MORE].map(item => (
            <a key={item} href="#" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-navy/5"
              style={{fontFamily:'Inter,sans-serif',color:C.navy}}>{item}</a>
          ))}
          <div className="pt-3 flex gap-3">
            <button className="flex-1 text-sm font-medium py-2.5 rounded-xl border border-navy/15 hover:bg-navy/5"
              style={{fontFamily:'Inter,sans-serif',color:C.navy}}>Login</button>
            <button className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-white btn-gradient"
              style={{fontFamily:'Inter,sans-serif'}}>☀ Start Journey</button>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero Sunrise Visual (center panel) ───────────────────────────────────────
function HeroSunriseVisual() {
  const floaters = [
    { icon:'🎯', label:'Career', x:'6%', y:'25%', dur:'4.2s', delay:'0s' },
    { icon:'💻', label:'Coding', x:'78%', y:'20%', dur:'3.9s', delay:'0.4s' },
    { icon:'📄', label:'Resume', x:'3%', y:'56%', dur:'4.6s', delay:'0.8s' },
    { icon:'🏆', label:'Jobs', x:'80%', y:'54%', dur:'3.7s', delay:'0.2s' },
    { icon:'🗺️', label:'Roadmap', x:'14%', y:'78%', dur:'4.9s', delay:'0.6s' },
    { icon:'🎓', label:'Learn', x:'70%', y:'76%', dur:'4.1s', delay:'1.0s' },
    { icon:'📚', label:'Skills', x:'42%', y:'5%', dur:'3.6s', delay:'0.3s' },
    { icon:'⭐', label:'Achieve', x:'48%', y:'83%', dur:'4.4s', delay:'0.7s' },
  ]

  return (
    <div className="relative w-full" style={{height:520}}>
      {/* Outer glow rings */}
      <div className="ring-pulse" style={{width:420,height:420,border:'1.5px solid rgba(245,184,0,0.13)',borderRadius:'50%',position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}/>
      <div className="ring-pulse" style={{width:330,height:330,border:'1.5px solid rgba(10,155,92,0.1)',borderRadius:'50%',position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',animationDelay:'0.8s'}}/>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:250,height:250,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,220,60,0.1) 0%,rgba(255,152,0,0.06) 45%,transparent 70%)'}}/>

      {/* Sunrise radial halo behind sun */}
      <div style={{position:'absolute',top:'8%',left:'50%',transform:'translateX(-50%)',width:300,height:300,background:'radial-gradient(circle,rgba(255,220,50,0.22) 0%,rgba(255,152,0,0.12) 40%,transparent 70%)',filter:'blur(12px)',borderRadius:'50%'}}/>

      {/* Sun disc */}
      <div className="sun-orb absolute left-1/2 -translate-x-1/2"
        style={{top:'12%',width:72,height:72,borderRadius:'50%',background:'radial-gradient(circle at 40% 38%,#FFE57A 0%,#FFC107 55%,#FF8F00 100%)'}}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Chakra size={44} color="rgba(11,25,87,0.4)" className="chakra-spin"/>
        </div>
      </div>

      {/* Sun rays */}
      {Array.from({length: 16}, (_, i) => {
        const angle = i * (360/16)
        const len = 36 + (i % 4) * 10
        return (
          <div key={i} className="ray-pulse absolute"
            style={{
              width: 3, height: len,
              top: '12%', left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) translateY(-36px) rotate(${angle}deg) translateY(-100%)`,
              background: 'linear-gradient(to top,rgba(255,193,7,0.8),transparent)',
              borderRadius: 3,
              animationDelay: `${i * 0.1}s`,
            }}/>
        )
      })}

      {/* Floating skill icons */}
      {floaters.map((p, i) => (
        <div key={i} className="float-particle absolute flex flex-col items-center gap-1 cursor-default"
          style={{left:p.x,top:p.y,['--dur' as string]:p.dur,['--delay' as string]:p.delay}}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg glass"
            style={{boxShadow:'0 4px 18px rgba(11,25,87,0.1)',border:'1px solid rgba(255,255,255,0.7)'}}>
            {p.icon}
          </div>
          <span style={{fontFamily:'Inter,sans-serif',fontSize:9,color:'#666',fontWeight:500}}>{p.label}</span>
        </div>
      ))}

      {/* Open book at center bottom */}
      <div className="absolute left-1/2 -translate-x-1/2 float-anim" style={{bottom:'4%',width:280,height:170}}>
        <svg viewBox="0 0 280 170" fill="none" width="280" height="170">
          <defs>
            <linearGradient id="leftPage" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d1648"/>
              <stop offset="100%" stopColor="#0B1957"/>
            </linearGradient>
            <linearGradient id="rightPage" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A2E7E"/>
              <stop offset="100%" stopColor="#15266b"/>
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="140" cy="162" rx="110" ry="6" fill="rgba(11,25,87,0.12)"/>
          {/* Left page */}
          <path d="M140,155 Q96,150 14,136 L14,26 Q78,38 140,40 Z" fill="url(#leftPage)" stroke="#F5B800" strokeWidth="1.5"/>
          {/* Right page */}
          <path d="M140,155 Q184,150 266,136 L266,26 Q202,38 140,40 Z" fill="url(#rightPage)" stroke="#F5B800" strokeWidth="1.5"/>
          {/* Spine */}
          <rect x="136" y="34" width="8" height="124" rx="4" fill="#F5B800"/>
          {/* Sunrise glow at spine top */}
          <circle cx="140" cy="34" r="14" fill="url(#bookSunGrad)" opacity="0.9"/>
          {/* Left page text */}
          <text x="77" y="58" fontFamily="Cinzel,serif" fontSize="9" fill="#F5B800" textAnchor="middle" letterSpacing="2">NAVPRARAMBH</text>
          <text x="77" y="72" fontFamily="serif" fontSize="8" fill="rgba(245,184,0,0.5)" textAnchor="middle">नवप्रारंभ</text>
          <line x1="28" y1="80" x2="132" y2="78" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"/>
          <line x1="28" y1="93" x2="132" y2="91" stroke="rgba(255,255,255,0.13)" strokeWidth="1.2"/>
          <line x1="28" y1="106" x2="132" y2="104" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2"/>
          <line x1="28" y1="119" x2="132" y2="117" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2"/>
          {/* Right page roadmap */}
          <text x="203" y="58" fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(255,255,255,0.5)" textAnchor="middle" letterSpacing="1.5">CAREER PATH</text>
          {['Discover','Learn','Practice','Get Hired'].map((t,i)=>(
            <g key={i}>
              <circle cx="160" cy={72+i*20} r="4.5" fill={[C.saffron,C.golden,C.emerald,C.sky][i]} opacity="0.9"/>
              <text x="170" y={76+i*20} fontFamily="Outfit,sans-serif" fontSize="8.5" fill="rgba(255,255,255,0.65)">{t}</text>
            </g>
          ))}
          <defs>
            <radialGradient id="bookSunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFE57A"/>
              <stop offset="60%" stopColor="#FFC107"/>
              <stop offset="100%" stopColor="#FF8F00"/>
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Live badge */}
      <div className="absolute glass rounded-2xl px-3 py-2 flex items-center gap-2"
        style={{top:'30%',right:'2%',boxShadow:'0 8px 28px rgba(11,25,87,0.1)',border:'1px solid rgba(255,255,255,0.7)'}}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
          style={{background:`linear-gradient(135deg,${C.saffron},${C.golden})`}}>🤖</div>
        <div>
          <div style={{fontFamily:'Cinzel,serif',fontSize:9,color:C.golden,letterSpacing:1.5}}>SIDDHI AI</div>
          <div className="flex gap-0.5 items-center mt-0.5">
            <div className="ai-dot w-1.5 h-1.5 rounded-full" style={{background:C.saffron}}/>
            <div className="ai-dot w-1.5 h-1.5 rounded-full" style={{background:C.saffron}}/>
            <div className="ai-dot w-1.5 h-1.5 rounded-full" style={{background:C.saffron}}/>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SIDDHI AI Panel ───────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon:'🔍', label:'Find Job Opportunities' },
  { icon:'📄', label:'Create Resume' },
  { icon:'📚', label:'Learn New Skills' },
  { icon:'🎤', label:'Practice Interview' },
  { icon:'🗺️', label:'Explore Career Paths' },
]

function SiddhiPanel() {
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [typing, setTyping] = useState(false)
  const [msgs, setMsgs] = useState([
    { role:'ai', text:'Namaste! 👋\nI\'m **SIDDHI AI**.\nHow can I help you today?' }
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}) }, [msgs])

  const send = (text = input) => {
    if (!text.trim()) return
    setMsgs(m => [...m, {role:'user',text}])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs(m => [...m, {role:'ai',text:`I'm analyzing "${text}" for you! Based on current market trends, I'd suggest a structured skill roadmap. Let me build your personalized career plan! ✨`}])
    }, 1600)
  }

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{boxShadow:'0 20px 60px rgba(11,25,87,0.14),0 4px 20px rgba(11,25,87,0.06)',border:'1px solid rgba(255,255,255,0.6)',background:'rgba(255,255,255,0.9)',backdropFilter:'blur(24px)'}}>

      {/* Header */}
      <div className="px-5 py-4 relative overflow-hidden"
        style={{background:`linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`}}>
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 80% 50%,rgba(245,184,0,0.35) 0%,transparent 55%)',opacity:0.25}}/>
        <div className="relative flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute rounded-full ring-pulse" style={{inset:-4,border:'2px solid rgba(245,184,0,0.45)',transform:'scale(1.3)'}}/>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl float-anim"
              style={{background:'linear-gradient(135deg,rgba(245,184,0,0.22),rgba(255,106,0,0.14))',border:'1px solid rgba(245,184,0,0.35)'}}>
              🤖
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2" style={{borderColor:C.navy}}/>
          </div>
          <div className="flex-1">
            <div style={{fontFamily:'Cinzel,serif',fontSize:16,fontWeight:700,color:C.golden,letterSpacing:1.5}}>SIDDHI AI</div>
            <div style={{fontFamily:'Inter,sans-serif',fontSize:11,color:'rgba(255,255,255,0.5)'}}>Your Career Copilot • Online</div>
          </div>
          <div className="flex gap-1 opacity-60">
            {['bg-red-400','bg-amber-400','bg-green-400'].map((col,i) => <div key={i} className={`w-2.5 h-2.5 rounded-full ${col}`}/>)}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="px-4 py-4 space-y-3" style={{maxHeight:190,overflowY:'auto'}}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            {m.role==='ai' && (
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-base mr-2 flex-shrink-0 mt-0.5"
                style={{background:`linear-gradient(135deg,${C.saffron},${C.golden})`}}>🤖</div>
            )}
            <div className={`max-w-[82%] px-4 py-3 rounded-2xl leading-relaxed ${m.role==='user'?'rounded-tr-sm':'rounded-tl-sm'}`}
              style={{
                fontFamily:'Outfit,sans-serif',fontSize:13,
                background:m.role==='user'?`linear-gradient(135deg,${C.saffron},${C.golden})`:'rgba(11,25,87,0.04)',
                color:m.role==='user'?'white':C.navy,
                border:m.role==='user'?'none':'1px solid rgba(11,25,87,0.07)',
              }}>
              {m.text.split('**').map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-base"
              style={{background:`linear-gradient(135deg,${C.saffron},${C.golden})`}}>🤖</div>
            <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center"
              style={{background:'rgba(11,25,87,0.04)',border:'1px solid rgba(11,25,87,0.07)'}}>
              <div className="ai-dot w-1.5 h-1.5 rounded-full bg-navy/35"/>
              <div className="ai-dot w-1.5 h-1.5 rounded-full bg-navy/35"/>
              <div className="ai-dot w-1.5 h-1.5 rounded-full bg-navy/35"/>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-3 space-y-1.5">
        {QUICK_ACTIONS.map(q => (
          <button key={q.label} onClick={() => send(q.label)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-navy/4 hover:border-navy/20 text-left"
            style={{fontFamily:'Inter,sans-serif',background:'rgba(255,255,255,0.65)',borderColor:'rgba(11,25,87,0.08)',color:C.navy}}>
            <span style={{fontSize:15}}>{q.icon}</span>
            <span style={{fontSize:12.5}}>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border"
          style={{background:'rgba(11,25,87,0.025)',borderColor:'rgba(11,25,87,0.09)'}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent outline-none"
            style={{fontFamily:'Outfit,sans-serif',fontSize:13,color:C.navy}}/>
          <button onClick={() => setListening(!listening)}
            className={`p-2 rounded-xl transition-all ${listening?'bg-red-50 text-red-500':'hover:bg-navy/5 text-gray-400'}`}>
            {listening ? (
              <div className="flex gap-0.5 items-end h-4 w-5">
                {[1,2,3,4,5].map(j => <div key={j} className="voice-bar flex-1 rounded-full bg-red-500"/>)}
              </div>
            ) : <I.Mic/>}
          </button>
          <button onClick={() => send()}
            className="p-2.5 rounded-xl text-white transition-all hover:scale-105 btn-gradient">
            <I.Send/>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
const STATS = [
  { val:'2.4L+', label:'Students Rising', icon:'🚀', color:C.saffron },
  { val:'12,400+', label:'Hiring Companies', icon:'🏢', color:C.emerald },
  { val:'4.6x', label:'Interview Rate', icon:'📈', color:C.navy },
  { val:'95%', label:'Career Improvement', icon:'⭐', color:C.golden },
]

function StatsBar() {
  return (
    <div className="glass rounded-2xl px-6 py-5 mx-5 lg:mx-0"
      style={{boxShadow:'0 8px 32px rgba(11,25,87,0.08)',border:'1px solid rgba(255,255,255,0.65)'}}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <div key={i} className="text-center stat-hover cursor-default">
            <div className="text-2xl mb-1.5">{s.icon}</div>
            <div style={{fontFamily:'Fraunces,serif',fontSize:28,fontWeight:700,color:s.color,lineHeight:1}}>
              {s.val}
            </div>
            <div style={{fontFamily:'Inter,sans-serif',fontSize:11.5,color:'#888',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feature Cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon:'🤖', color:C.saffron, bg:'#FFF1E6', title:'SIDDHI AI', sub:'AI Career Copilot', desc:'Chat. Learn. Get Guidance.' },
  { icon:'💼', color:C.emerald, bg:'#E6F7F1', title:'Jobs & Internships', sub:'Real Opportunities', desc:'Find. Apply. Grow.' },
  { icon:'📚', color:C.navyLight, bg:'#EEF1FF', title:'Courses & Certifications', sub:'Industry Skills', desc:'Build In-Demand Skills.' },
  { icon:'📄', color:C.golden, bg:'#FFFBEA', title:'Resume Builder', sub:'ATS Optimized', desc:'Create Professional Resume.' },
  { icon:'🎯', color:C.violet, bg:'#F5F3FF', title:'Placement Preparation', sub:'Aptitude • Logical • Verbal', desc:'Crack Interviews.' },
  { icon:'🎮', color:'#0891B2', bg:'#E0F7FA', title:'Knowledge Games', sub:'Learn with Fun', desc:'Play • Earn XP • Grow.' },
]

function FeatureGrid() {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
      <div className="text-center mb-14">
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{background:'#EEF1FF',color:C.navyLight,fontFamily:'Inter,sans-serif',letterSpacing:1.2}}>
          PLATFORM FEATURES
        </div>
        <h2 style={{fontFamily:'Fraunces,serif',fontSize:'clamp(26px,4vw,44px)',fontWeight:700,color:C.navy,lineHeight:1.2}}>
          Everything You Need for a<br/>
          <span className="saffron-underline" style={{color:C.saffron}}>Successful Career</span>
        </h2>
        <p style={{fontFamily:'Outfit,sans-serif',fontSize:15,color:'#777',marginTop:14,maxWidth:480,margin:'14px auto 0'}}>
          One platform. Every tool. Infinite possibilities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <div key={i} className="card-lift feature-card rounded-2xl p-6 border cursor-pointer"
            style={{background:'rgba(255,255,255,0.9)',borderColor:'rgba(11,25,87,0.07)',boxShadow:'0 4px 20px rgba(11,25,87,0.055)'}}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform hover:scale-110"
              style={{background:f.bg}}>
              {f.icon}
            </div>
            <h3 style={{fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:16,color:C.navy}}>{f.title}</h3>
            <div style={{fontFamily:'Inter,sans-serif',fontSize:12,color:f.color,fontWeight:600,marginTop:3}}>{f.sub}</div>
            <p style={{fontFamily:'Outfit,sans-serif',fontSize:13,color:'#888',marginTop:8,lineHeight:1.6}}>{f.desc}</p>
            <div className="mt-4 flex items-center gap-1" style={{color:f.color}}>
              <span style={{fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:600}}>Explore</span>
              <I.Arrow/>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Career Journey Timeline ───────────────────────────────────────────────────
const JOURNEY = [
  { step:'Discover', icon:'🔭', color:C.saffron, desc:'50+ career paths' },
  { step:'Learn', icon:'📚', color:C.golden, desc:'Curated skill roadmaps' },
  { step:'Practice', icon:'⚡', color:C.emerald, desc:'Labs & exercises' },
  { step:'Certify', icon:'🏅', color:C.violet, desc:'Industry certs' },
  { step:'Apply', icon:'📋', color:'#0891B2', desc:'1-click apply' },
  { step:'Achieve', icon:'🏆', color:C.golden, desc:'Dream role' },
]

function CareerJourney() {
  return (
    <section style={{background:'linear-gradient(180deg,#FFFDF8,#FFF8F0)'}} className="py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{background:'#FFF1E6',color:C.saffron,fontFamily:'Inter,sans-serif',letterSpacing:1.2}}>
            YOUR PATH TO SUCCESS
          </div>
          <h2 style={{fontFamily:'Fraunces,serif',fontSize:'clamp(26px,4vw,44px)',fontWeight:700,color:C.navy}}>
            Career Sunrise Journey
          </h2>
          <p style={{fontFamily:'Outfit,sans-serif',fontSize:15,color:'#888',marginTop:12}}>
            Every sunrise brings a new step forward.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-9 left-0 right-0 h-0.5 hidden md:block"
            style={{background:`linear-gradient(90deg,transparent 4%,rgba(245,184,0,0.3) 12%,rgba(245,184,0,0.3) 88%,transparent 96%)`}}/>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {JOURNEY.map((j, i) => (
              <div key={j.step} className="card-rise flex flex-col items-center text-center group"
                style={{animationDelay:`${i*0.1}s`}}>
                <div className="relative mb-4 z-10">
                  <div className="w-18 h-18 rounded-2xl flex items-center justify-center text-2xl cursor-pointer transition-all group-hover:scale-110"
                    style={{width:72,height:72,background:`linear-gradient(135deg,${j.color}18,${j.color}08)`,border:`2px solid ${j.color}30`,boxShadow:`0 4px 20px ${j.color}22`}}>
                    {j.icon}
                  </div>
                  <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{border:`2px solid ${j.color}`,borderRadius:16}}/>
                </div>
                <div style={{fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:14,color:C.navy}}>{j.step}</div>
                <div style={{fontFamily:'Inter,sans-serif',fontSize:11,color:'#999',marginTop:4}}>{j.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Success Stories ───────────────────────────────────────────────────────────
const STORIES = [
  { name:'Priya Sharma', role:'SDE at Amazon', college:'NIT Trichy', img:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format', quote:'SIDDHI AI helped me crack the Amazon interview in 3 months. The personalized roadmap was a game-changer.' },
  { name:'Arjun Mehta', role:'Data Analyst at Flipkart', college:'VIT Vellore', img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format', quote:'The career roadmap and daily practice gave me the clarity and confidence I was missing for 2 years.' },
  { name:'Deepika Rao', role:'Product Manager at Swiggy', college:'BITS Pilani', img:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format', quote:'ATS resume builder doubled my callback rate. NAVPRARAMBH is truly a complete career ecosystem.' },
]

function SuccessStories() {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
      <div className="text-center mb-14">
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{background:'#E6F7F1',color:C.emerald,fontFamily:'Inter,sans-serif',letterSpacing:1.2}}>
          SUCCESS STORIES
        </div>
        <h2 style={{fontFamily:'Fraunces,serif',fontSize:'clamp(26px,4vw,44px)',fontWeight:700,color:C.navy}}>
          Students Who Rose Like the Sun
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {STORIES.map((s, i) => (
          <div key={i} className="card-lift card-rise rounded-2xl p-7 border"
            style={{background:'rgba(255,255,255,0.92)',borderColor:'rgba(11,25,87,0.07)',boxShadow:'0 4px 20px rgba(11,25,87,0.06)',animationDelay:`${i*0.12}s`}}>
            <div className="flex gap-0.5 mb-4">
              {[1,2,3,4,5].map(j => <I.Star key={j} c="text-amber-400"/>)}
            </div>
            <p style={{fontFamily:'Outfit,sans-serif',fontSize:14,color:'#444',fontStyle:'italic',lineHeight:1.75,marginBottom:20}}>
              "{s.quote}"
            </p>
            <div className="flex items-center gap-3">
              <img src={s.img} alt={s.name} className="w-11 h-11 rounded-full object-cover"/>
              <div>
                <div style={{fontFamily:'Outfit,sans-serif',fontWeight:600,fontSize:14,color:C.navy}}>{s.name}</div>
                <div style={{fontFamily:'Inter,sans-serif',fontSize:11,color:'#999'}}>{s.role} • {s.college}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── CTA Section ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 pb-24">
      <div className="relative rounded-3xl overflow-hidden py-20 px-8 text-center"
        style={{background:`linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 55%,${C.navy} 100%)`}}>
        <div className="absolute inset-0" style={{backgroundImage:`radial-gradient(circle at 25% 50%,rgba(245,184,0,0.25) 0%,transparent 50%),radial-gradient(circle at 75% 50%,rgba(10,155,92,0.18) 0%,transparent 50%)`}}/>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-8 pointer-events-none">
          <Chakra size={240} color="rgba(245,184,0,0.15)"/>
        </div>
        <div className="relative z-10">
          <div className="flex justify-center mb-5">
            <LogoMark size={60}/>
          </div>
          <h2 style={{fontFamily:'Fraunces,serif',fontSize:'clamp(24px,4vw,48px)',fontWeight:700,color:'white',marginBottom:14,lineHeight:1.2}}>
            Your Journey Begins at Sunrise
          </h2>
          <p style={{fontFamily:'Outfit,sans-serif',fontSize:16,color:'rgba(255,255,255,0.6)',maxWidth:500,margin:'0 auto 36px',lineHeight:1.7}}>
            Join 2.4 lakh+ students building their dream careers with India's first AI Career Operating System.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-gradient inline-flex items-center gap-2 px-9 py-4 rounded-2xl text-white text-base font-semibold"
              style={{fontFamily:'Inter,sans-serif'}}>
              ☀ Start Your Journey <I.Arrow/>
            </button>
            <button className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-semibold text-base border border-white/20 hover:bg-white/10 transition-all"
              style={{color:'white',fontFamily:'Inter,sans-serif'}}>
              ▶ Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title:'Platform', links:['Career Explorer','Jobs','Internships','Courses','Certifications'] },
    { title:'Tools', links:['SIDDHI AI','Resume Builder','Mock Interviews','Placement Prep','Knowledge Games'] },
    { title:'Community', links:['Forums','Mentors','Events','Hackathons','Scholarships'] },
    { title:'Company', links:['About Us','Blog','Careers','Press','Contact'] },
  ]
  return (
    <footer style={{borderTop:`1px solid rgba(11,25,87,0.07)`,background:'rgba(255,253,248,0.98)'}}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <LogoMark size={38}/>
              <div>
                <div style={{fontFamily:'Cinzel,serif',fontSize:13,fontWeight:700,letterSpacing:0.5}}>
                  <span style={{color:C.saffron}}>NAV</span>
                  <span style={{color:C.navy}}>PRA</span>
                  <span style={{color:C.emerald}}>RAMBH</span>
                </div>
                <div style={{fontFamily:'serif',fontSize:11,color:C.saffron,opacity:0.8}}>नवप्रारंभ</div>
              </div>
            </div>
            <p style={{fontFamily:'Outfit,sans-serif',fontSize:12.5,color:'#999',lineHeight:1.8}}>
              India's first AI-powered Career Operating System. Rise like the sun, brighten your path.
            </p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{fontFamily:'Inter,sans-serif',fontSize:11,fontWeight:700,color:C.navy,letterSpacing:1.5,textTransform:'uppercase',marginBottom:14}}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="transition-colors hover:opacity-80"
                      style={{fontFamily:'Outfit,sans-serif',fontSize:13,color:'#aaa'}}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t gap-4"
          style={{borderColor:'rgba(11,25,87,0.06)'}}>
          <p style={{fontFamily:'Inter,sans-serif',fontSize:12,color:'#ccc'}}>© 2026 NAVPRARAMBH. India's Career Operating System.</p>
          <div className="flex gap-6">
            {['Privacy','Terms','Accessibility','Language'].map(l => (
              <a key={l} href="#" className="hover:opacity-70 transition-opacity"
                style={{fontFamily:'Inter,sans-serif',fontSize:12,color:'#ccc'}}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('navp_v3'))

  const done = () => {
    sessionStorage.setItem('navp_v3','1')
    setShowIntro(false)
  }

  return (
    <>
      {showIntro && <BookIntro onComplete={done}/>}

      <div className="sunrise-bg min-h-screen page-in">
        <Navigation/>

        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden">
          <div className="hero-sunrise-glow"/>
          <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-24 pb-12">
            <div className="grid lg:grid-cols-12 gap-6 xl:gap-10 items-start">

              {/* ── LEFT: Hero text + CTAs ── */}
              <div className="lg:col-span-5 space-y-7 pt-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                  style={{background:'rgba(255,255,255,0.8)',borderColor:'rgba(11,25,87,0.1)',backdropFilter:'blur(12px)'}}>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
                  <span style={{fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:500,color:C.navy}}>India's First AI Career Operating System</span>
                  <span style={{fontFamily:'Inter,sans-serif',fontSize:11,color:C.saffron,fontWeight:700}}>NEW ✦</span>
                </div>

                {/* Big title */}
                <div>
                  <h1 style={{fontFamily:'Fraunces,serif',fontWeight:800,lineHeight:1.0,letterSpacing:-1,fontSize:'clamp(46px,5.5vw,80px)',margin:0}}>
                    <span style={{color:C.saffron}}>NAV</span>
                    <span style={{color:C.navy}}>PRA</span>
                    <span style={{color:C.emerald}}>RAMBH</span>
                  </h1>
                  <h2 style={{fontFamily:'Fraunces,serif',fontWeight:700,fontSize:'clamp(22px,3vw,36px)',color:C.navy,marginTop:8,lineHeight:1.2}}>
                    Rise like the sun.<br/>
                    <span style={{color:'#333'}}>Brighten your </span>
                    <span style={{color:C.saffron}}>career path.</span>
                  </h2>
                </div>

                <p style={{fontFamily:'Outfit,sans-serif',fontSize:15.5,color:'#666',lineHeight:1.8,maxWidth:460}}>
                  AI-powered career operating system for students, freshers and professionals. Learn. Practice. Grow. <span style={{color:C.saffron,fontWeight:600}}>Get Hired.</span>
                </p>

                {/* Quick feature pills */}
                <div className="flex flex-wrap gap-2.5">
                  {[
                    {icon:'📖', label:'Learn'},
                    {icon:'🎯', label:'Practice'},
                    {icon:'🏆', label:'Get Certified'},
                    {icon:'🚀', label:'Build Career'},
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer card-lift"
                      style={{background:'rgba(255,255,255,0.85)',borderColor:'rgba(11,25,87,0.08)',boxShadow:'0 2px 8px rgba(11,25,87,0.05)',fontFamily:'Outfit,sans-serif',fontSize:13,color:C.navy,fontWeight:500}}>
                      <span>{item.icon}</span> {item.label}
                    </div>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className="btn-gradient inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold"
                    style={{fontFamily:'Inter,sans-serif',fontSize:14}}>
                    ☀ Start Your Journey <I.Arrow/>
                  </button>
                  <button className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold border card-lift"
                    style={{fontFamily:'Inter,sans-serif',fontSize:14,color:C.navy,borderColor:'rgba(11,25,87,0.15)',background:'rgba(255,255,255,0.8)'}}>
                    🗺️ Explore Careers
                  </button>
                  <button className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-medium border transition-all hover:bg-white/60"
                    style={{fontFamily:'Inter,sans-serif',fontSize:14,color:'#888',borderColor:'rgba(11,25,87,0.1)'}}>
                    ▶ Watch Demo
                  </button>
                </div>

                {/* Stats mini row */}
                <div className="flex items-center gap-5 pt-2">
                  {[
                    {val:'2.4L+', label:'Students Rising', color:C.saffron},
                    {val:'12,400+', label:'Hiring Companies', color:C.emerald},
                    {val:'4.6x', label:'Interview Rate', color:C.navy},
                  ].map((s,i) => (
                    <div key={i} className="text-center">
                      <div style={{fontFamily:'Fraunces,serif',fontSize:22,fontWeight:700,color:s.color,lineHeight:1}}>{s.val}</div>
                      <div style={{fontFamily:'Inter,sans-serif',fontSize:10.5,color:'#999',marginTop:3}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── CENTER: Sunrise + Book Visual ── */}
              <div className="hidden lg:block lg:col-span-4">
                <HeroSunriseVisual/>
              </div>

              {/* ── RIGHT: SIDDHI AI ── */}
              <div className="lg:col-span-3 space-y-4 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
                  <span style={{fontFamily:'Cinzel,serif',fontSize:11,color:C.emerald,letterSpacing:2,fontWeight:600}}>SIDDHI AI — CAREER COPILOT</span>
                </div>
                <SiddhiPanel/>
              </div>

            </div>
          </div>
        </section>

        {/* ── Feature Grid ── */}
        <FeatureGrid/>

        {/* ── Career Journey ── */}
        <CareerJourney/>

        {/* ── Success Stories ── */}
        <SuccessStories/>

        {/* ── CTA ── */}
        <CTASection/>

        <Footer/>
      </div>
    </>
  )
}
