import { useState, useEffect, useCallback } from 'react';
import type { Question, Answer, Profession } from '@/types/game';

interface RevealModalProps {
  question: Question;
  answer: Answer;
  playerProfession: Profession | null;
  onContinue: () => void;
  playCorrectSound: () => void;
  playPartialSound: () => void;
  playIncorrectSound: () => void;
}

export function RevealModal({ 
  question, 
  answer, 
  playerProfession,
  onContinue,
  playCorrectSound,
  playPartialSound,
  playIncorrectSound
}: RevealModalProps) {
  const [timeLeft, setTimeLeft] = useState(8);
  const [showContent, setShowContent] = useState(false);

  // Determine result type
  const isPerfect = answer.score === 100;
  const isPartial = answer.score > 0 && answer.score < 100;
  const isIncorrect = answer.score === 0;

  useEffect(() => {
    // Play appropriate sound
    setTimeout(() => {
      if (isPerfect) playCorrectSound();
      else if (isPartial) playPartialSound();
      else playIncorrectSound();
    }, 200);

    // Show content with animation
    setTimeout(() => setShowContent(true), 100);

    // Auto-advance timer
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPerfect, isPartial, isIncorrect, playCorrectSound, playPartialSound, playIncorrectSound, onContinue]);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  // Get banner styles based on result
  const getBannerStyles = () => {
    if (isPerfect) return { bg: 'bg-green', text: 'CORRECT', icon: 'check' as const };
    if (isPartial) return { bg: 'bg-yellow', text: 'ACCEPTABLE', icon: 'minus' as const };
    return { bg: 'bg-blue-extralight', text: 'LEARNING POINT', icon: 'info' as const, textColor: 'text-blue' };
  };

  const banner = getBannerStyles();

  // Get selected option text
  const getSelectedText = () => {
    if (question.type === 'drag_anatomy') {
      const item = question.items.find((i: { id: string; name: string }) => i.id === answer.selected);
      return item?.name || String(answer.selected);
    }
    if (question.type === 'sequence') {
      return 'Custom order';
    }
    if (Array.isArray(answer.selected)) {
      return answer.selected.map(id => {
        const opt = question.options?.find(o => o.id === id);
        return opt?.text || id;
      }).join(', ');
    }
    const opt = question.options?.find(o => o.id === answer.selected);
    return opt?.text || String(answer.selected);
  };

  // Get optimal answer text
  const getOptimalText = () => {
    if (question.type === 'drag_anatomy') {
      const item = question.items.find((i: { id: string; name: string }) => i.id === question.optimalAnswer);
      return item?.name || question.optimalAnswer;
    }
    if (question.type === 'sequence') {
      const sortedItems = [...question.items].sort((a, b) => a.order - b.order);
      return sortedItems.map((i: { text: string }) => i.text).join(' → ');
    }
    const opt = question.options?.find(o => o.id === question.optimalAnswer);
    return opt?.text || question.optimalAnswer;
  };

  return (
    <div className="modal-overlay" onClick={handleContinue}>
      <div 
        className={`
          modal-card transform transition-all duration-300
          ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Result Banner */}
        <div 
          className={`
            -mx-12 -mt-12 px-12 py-6 rounded-t-3xl flex items-center justify-center gap-4
            ${banner.bg}
          `}
        >
          {/* Icon */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isPerfect || isPartial ? 'bg-white/30' : 'bg-blue/20'}
          `}>
            {banner.icon === 'check' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {banner.icon === 'minus' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            )}
            {banner.icon === 'info' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#007DB9" strokeWidth="2"/>
                <path d="M12 7V12M12 16V17" stroke="#007DB9" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          
          <span className={`text-[32px] font-bold ${banner.textColor || 'text-black'}`}>
            {banner.text}
          </span>
        </div>

        {/* Content */}
        <div className="py-8 space-y-6">
          {/* Your Answer */}
          <div>
            <span className="caption block mb-2">You selected:</span>
            <p className="body-text">{getSelectedText()}</p>
          </div>

          {/* Optimal Answer (if not perfect) */}
          {!isPerfect && (
            <div>
              <span className="caption block mb-2">Optimal choice:</span>
              <p className="body-text text-green">{getOptimalText()}</p>
            </div>
          )}

          {/* Rationale */}
          <div>
            <p className="text-[20px] text-grey-extradark leading-relaxed">
              {question.learningPoint}
            </p>
          </div>

          {/* Shock Stat */}
          <div className="bg-orange-extralight rounded-xl p-6 border-l-4 border-orange flex items-start gap-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-1">
              <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.645 18.302 1.553 18.645 1.553 18.994C1.553 19.343 1.645 19.686 1.82 19.988C1.995 20.29 2.247 20.539 2.55 20.71C2.853 20.881 3.196 20.968 3.545 20.965H20.455C20.804 20.968 21.147 20.881 21.45 20.71C21.753 20.539 22.005 20.29 22.18 19.988C22.355 19.686 22.447 19.343 22.447 18.994C22.447 18.645 22.355 18.302 22.18 18L13.71 3.86C13.532 3.566 13.28 3.323 12.982 3.156C12.683 2.988 12.347 2.902 12.005 2.905C11.663 2.902 11.327 2.988 11.028 3.156C10.73 3.323 10.478 3.566 10.3 3.86H10.29Z" 
                stroke="#FF7300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[20px] text-orange font-medium">
              {question.shockStat}
            </p>
          </div>

          {/* Profession Comparison */}
          <div>
            <span className="caption block mb-4">How others answered:</span>
            <div className="flex items-end gap-8">
              {Object.entries(question.professionSplit).map(([prof, pct]) => {
                const isPlayerProf = playerProfession === prof;
                return (
                  <div key={prof} className="flex flex-col items-center gap-2">
                    <div 
                      className={`
                        w-16 rounded-t-lg transition-all duration-500
                        ${isPlayerProf ? 'bg-green' : 'bg-grey-light'}
                      `}
                      style={{ 
                        height: `${pct * 100}px`,
                        animationDelay: `${Object.keys(question.professionSplit).indexOf(prof) * 100}ms`
                      }}
                    />
                    <span className={`
                      text-[16px] capitalize
                      ${isPlayerProf ? 'text-green font-semibold' : 'text-grey-extradark'}
                    `}>
                      {prof}s
                    </span>
                    <span className="text-[14px] text-grey-extradark">
                      {Math.round(pct * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resource Hook */}
          <div className="bg-blue-extralight rounded-xl p-4 border-l-4 border-blue">
            <p className="text-[20px] text-blue">
              Learn more: &apos;{question.resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}&apos; card at Booth
            </p>
          </div>
        </div>

        {/* Continue Button with Timer */}
        <div className="flex justify-center relative">
          <button
            onClick={handleContinue}
            className="
              w-[300px] h-16 rounded-full bg-blue text-white
              text-[24px] font-semibold
              hover:scale-105 transition-transform
              relative overflow-hidden
            "
          >
            CONTINUE
            {/* Progress bar */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all linear"
              style={{ width: `${(timeLeft / 8) * 100}%` }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
