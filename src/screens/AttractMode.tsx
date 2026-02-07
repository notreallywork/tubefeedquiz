import { useRef, useCallback, useEffect, useState } from 'react';
import type { ScreenType } from '@/types/game';

interface AttractModeProps {
  onNavigate: (screen: ScreenType) => void;
  onInitAudio: () => void;
  playStartSound: () => void;
}

// Live stats for ticker — dietitian-focused
const liveStats = [
  "20-50% of hospitalised patients are malnourished at admission",
  "Dietitians average 440 points — can you beat that?",
  "Early EN reduces infection risk by up to 40%",
  "Top score today: 480 by a clinical dietitian",
  "68% get the refeeding question wrong under pressure",
  "If the gut works, use it — but when doesn't it?",
  "Only 50% correctly sequence the EN weaning protocol"
];

// Floating particle component for visual depth
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 3 + Math.random() * 6,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 14,
    opacity: 0.08 + Math.random() * 0.15,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: `rgba(255, 255, 255, ${p.opacity})`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function AttractMode({ onNavigate, onInitAudio, playStartSound }: AttractModeProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onInitAudio();

    if (buttonRef.current) {
      buttonRef.current.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.transform = '';
        }
      }, 200);
    }

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const ripple = document.createElement('div');
    ripple.className = 'absolute rounded-full bg-white/60 pointer-events-none animate-ripple';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.left = `${clientX - rect.left}px`;
    ripple.style.top = `${clientY - rect.top}px`;
    target.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);

    playStartSound();

    setTimeout(() => {
      onNavigate('profile');
    }, 300);
  }, [onNavigate, onInitAudio, playStartSound]);

  return (
    <div className="screen attract-gradient-v2">
      {/* Floating particles */}
      <FloatingParticles />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">

        {/* Animated Enteral Tube Illustration */}
        <div className={`relative mb-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <svg
            width="360"
            height="280"
            viewBox="0 0 360 280"
            className="drop-shadow-lg"
          >
            {/* IV Bag silhouette */}
            <rect x="155" y="10" width="50" height="8" rx="4" fill="rgba(255,255,255,0.15)" />
            <path
              d="M160 18 L160 30 Q160 36, 164 36 L196 36 Q200 36, 200 30 L200 18Z"
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />
            {/* Bag body */}
            <path
              d="M152 36 L152 110 Q152 130, 170 135 L180 138 L190 135 Q208 130, 208 110 L208 36Z"
              fill="rgba(255,255,255,0.08)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            {/* Liquid level with animated shimmer */}
            <path
              d="M154 65 Q170 60, 180 65 Q190 70, 206 65 L206 110 Q206 128, 190 133 L180 136 L170 133 Q154 128, 154 110Z"
              fill="rgba(100, 220, 180, 0.15)"
              className="animate-liquid-shimmer"
            />
            {/* Drip chamber */}
            <rect x="176" y="138" width="8" height="22" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            {/* Animated drip */}
            <circle cx="180" cy="145" r="2" fill="rgba(100, 220, 180, 0.5)" className="animate-drip" />

            {/* Feeding tube line — animated draw */}
            <path
              d="M180 160
                 L180 185
                 Q180 200, 195 205
                 L240 215
                 Q265 222, 265 240
                 L265 270"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="300"
              className="animate-tube-draw"
            />

            {/* Stomach silhouette */}
            <path
              d="M220 230
                 Q200 225, 195 240
                 Q188 260, 210 275
                 Q235 288, 260 275
                 Q280 262, 282 245
                 Q284 230, 270 225
                 Q255 218, 240 225
                 Z"
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Small intestine hint */}
            <path
              d="M215 275 Q220 290, 235 290 Q250 290, 250 278"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
            />

            {/* Pulse ring around tube tip */}
            <circle cx="265" cy="270" r="8" fill="none" stroke="rgba(100, 220, 180, 0.3)" strokeWidth="1.5" className="animate-pulse-ring" />
            <circle cx="265" cy="270" r="4" fill="rgba(100, 220, 180, 0.4)" />

            {/* Decorative molecules */}
            <g className="animate-float-slow">
              <circle cx="85" cy="80" r="5" fill="rgba(255,255,255,0.1)" />
              <circle cx="92" cy="73" r="3" fill="rgba(255,255,255,0.08)" />
              <line x1="85" y1="80" x2="92" y2="73" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </g>
            <g className="animate-float-slow" style={{ animationDelay: '3s' }}>
              <circle cx="290" cy="90" r="4" fill="rgba(255,255,255,0.1)" />
              <circle cx="300" cy="85" r="3" fill="rgba(255,255,255,0.07)" />
              <circle cx="296" cy="97" r="2.5" fill="rgba(255,255,255,0.06)" />
              <line x1="290" y1="90" x2="300" y2="85" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              <line x1="290" y1="90" x2="296" y2="97" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </g>
          </svg>
        </div>

        {/* Badge */}
        <div className={`mb-5 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 text-white/80 text-[18px] font-medium tracking-wider uppercase">
            Enteral Nutrition Challenge
          </span>
        </div>

        {/* Title */}
        <h1 className={`text-white text-center mb-3 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              fontSize: '96px',
              fontWeight: 800,
              letterSpacing: '6px',
              lineHeight: 1,
              textShadow: '0 4px 30px rgba(0,0,0,0.3), 0 0 80px rgba(100,220,180,0.15)',
            }}>
          GUT CHECK
        </h1>

        {/* Subtitle */}
        <p className={`text-white/70 text-[26px] font-light text-center mb-10 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
           style={{ letterSpacing: '1px' }}>
          Think you know your tubes? Prove it.
        </p>

        {/* Start Button */}
        <div className={`transition-all duration-700 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            ref={buttonRef}
            onClick={handleStart}
            onTouchStart={handleStart}
            className="group relative overflow-hidden rounded-full font-bold text-[26px] tracking-wide text-white px-16 py-5 transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse-scale"
            style={{
              background: 'linear-gradient(135deg, #FF7300, #FF9A44)',
              boxShadow: '0 6px 30px rgba(255, 115, 0, 0.45), 0 0 60px rgba(255, 115, 0, 0.15)',
            }}
          >
            <span className="relative z-10">TAP TO PLAY</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>

        {/* Subtle challenge hint */}
        <p className={`text-white/40 text-[16px] mt-5 transition-all duration-700 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          5 questions &middot; 500 points &middot; Are you feeding best practice?
        </p>
      </div>

      {/* Stats Ticker */}
      <div className="h-[56px] bg-black/25 backdrop-blur-sm flex items-center overflow-hidden border-t border-white/5">
        <div className="stats-ticker flex items-center gap-16 text-white/80 text-[18px] font-light">
          {liveStats.map((stat, i) => (
            <span key={i} className="flex items-center gap-4 whitespace-nowrap">
              <span className="w-[6px] h-[6px] bg-green rounded-full opacity-80" />
              {stat}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {liveStats.map((stat, i) => (
            <span key={`dup-${i}`} className="flex items-center gap-4 whitespace-nowrap">
              <span className="w-[6px] h-[6px] bg-green rounded-full opacity-80" />
              {stat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
