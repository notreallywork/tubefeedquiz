import { useRef, useCallback } from 'react';
import type { ScreenType } from '@/types/game';

interface AttractModeProps {
  onNavigate: (screen: ScreenType) => void;
  onInitAudio: () => void;
  playStartSound: () => void;
}

// Live stats for ticker
const liveStats = [
  "Last round: 62% got Question 3 wrong",
  "Dietitians leading today with avg 420 points",
  "Can you beat the crowd?",
  "Top score today: 480 points by Dr. S.",
  "Nurses averaging 85% on safety questions",
  "Early EN timing: most missed concept"
];

export function AttractMode({ onNavigate, onInitAudio, playStartSound }: AttractModeProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onInitAudio();
    
    // Visual feedback
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.transform = '';
        }
      }, 200);
    }
    
    // Create ripple effect
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
    <div className="screen attract-gradient animate-gradient-shift">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Patient Silhouette with EKG */}
        <div className="relative mb-8">
          <svg 
            width="300" 
            height="400" 
            viewBox="0 0 300 400" 
            className="animate-breathe"
            style={{ transformOrigin: 'bottom' }}
          >
            {/* Body silhouette */}
            <path
              d="M150 60 
                 C 180 60, 200 80, 200 110
                 C 200 130, 190 145, 185 155
                 C 220 165, 250 190, 250 240
                 L 250 400
                 L 50 400
                 L 50 240
                 C 50 190, 80 165, 115 155
                 C 110 145, 100 130, 100 110
                 C 100 80, 120 60, 150 60Z"
              fill="rgba(255,255,255,0.1)"
            />
            
            {/* EKG Line */}
            <path
              d="M 60 200 
                 L 100 200 
                 L 110 180 
                 L 120 220 
                 L 130 160 
                 L 140 240 
                 L 150 200 
                 L 240 200"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ekg"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="heading-1 text-white text-shadow text-center mb-4">
          NUTRITION TIMING CHALLENGE
        </h1>

        {/* Start Button */}
        <button
          ref={buttonRef}
          onClick={handleStart}
          onTouchStart={handleStart}
          className="btn-primary animate-pulse-scale mt-8 relative overflow-hidden"
        >
          TOUCH TO START
        </button>
      </div>

      {/* Stats Ticker */}
      <div className="h-[60px] bg-black/20 flex items-center overflow-hidden">
        <div className="stats-ticker flex items-center gap-16 text-white text-[20px]">
          {liveStats.map((stat, i) => (
            <span key={i} className="flex items-center gap-4 whitespace-nowrap">
              <span className="w-2 h-2 bg-green rounded-full" />
              {stat}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {liveStats.map((stat, i) => (
            <span key={`dup-${i}`} className="flex items-center gap-4 whitespace-nowrap">
              <span className="w-2 h-2 bg-green rounded-full" />
              {stat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
