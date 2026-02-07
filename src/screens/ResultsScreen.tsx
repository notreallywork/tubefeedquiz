import { useState, useEffect, useRef } from 'react';
import type { ScreenType, Answer, Question } from '@/types/game';

interface ResultsScreenProps {
  totalScore: number;
  maxScore: number;
  answers: Answer[];
  questions: Question[];
  onNavigate: (screen: ScreenType) => void;
  playScoreReveal: () => void;
}

export function ResultsScreen({ 
  totalScore, 
  maxScore, 
  answers, 
  questions,
  onNavigate,
  playScoreReveal
}: ResultsScreenProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showBars, setShowBars] = useState(false);
  const scoreAnimated = useRef(false);

  // Animate score count-up
  useEffect(() => {
    if (scoreAnimated.current) return;
    scoreAnimated.current = true;
    
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayScore(Math.round(eased * totalScore));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        playScoreReveal();
        setTimeout(() => setShowBars(true), 300);
      }
    };
    
    requestAnimationFrame(animate);
  }, [totalScore, playScoreReveal]);

  const percentage = Math.round((totalScore / maxScore) * 100);
  const percentile = percentage >= 90 ? '10%' : percentage >= 75 ? '25%' : percentage >= 50 ? '50%' : '75%';

  // Find weakest area
  const weakestQuestion = answers.reduce<(Answer & { index: number }) | null>((prev, curr, idx) => {
    if (!prev || curr.score < prev.score) {
      return { ...curr, index: idx };
    }
    return prev;
  }, null);

  const getInsight = () => {
    if (!weakestQuestion) return "Great job on all questions!";
    const theme = questions[weakestQuestion.index]?.theme;
    const themeLabels: Record<string, string> = {
      timing: 'timing decisions',
      access: 'access selection',
      tolerance: 'intolerance management',
      safety: 'safety protocols',
      transition: 'weaning protocols'
    };
    return weakestQuestion.score < 50 
      ? `Review ${themeLabels[theme] || 'this topic'} — see resources below.`
      : `You excelled at ${themeLabels[theme] || 'this area'}. Great work!`;
  };

  const handleViewLeaderboard = () => {
    onNavigate('leaderboard');
  };

  const handlePlayAgain = () => {
    onNavigate('attract');
  };

  return (
    <div className="screen bg-green-extralight overflow-auto">
      {/* Header */}
      <div className="pt-16 pb-8 text-center">
        <h2 className="heading-2 text-blue">CHALLENGE COMPLETE</h2>
      </div>

      {/* Score Display */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-baseline gap-2">
          <span className="score-display text-green">{displayScore}</span>
          <span className="text-[36px] text-grey-extradark">/ {maxScore}</span>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <span className="text-[28px] font-medium text-blue">
            Top {percentile} today
          </span>
          <div className="w-20 h-20 bg-green rounded-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 15C15.866 15 19 11.866 19 8C19 4.134 15.866 1 12 1C8.134 1 5 4.134 5 8C5 11.866 8.134 15 12 15Z" 
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" 
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="max-w-[1000px] mx-auto px-10 mb-8">
        <div className="space-y-4">
          {answers.map((answer, idx) => {
            const answerPercentage = (answer.score / 100) * 100;
            const barColor = answer.score === 100 ? 'bg-green' : answer.score > 0 ? 'bg-yellow' : 'bg-grey-light';
            
            return (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-12 text-[20px] text-grey-extradark">Q{idx + 1}</span>
                <div className="flex-1 h-6 bg-grey-light rounded-full overflow-hidden">
                  <div 
                    className={`
                      h-full rounded-full transition-all duration-500
                      ${barColor}
                    `}
                    style={{ 
                      width: showBars ? `${answerPercentage}%` : '0%',
                      transitionDelay: `${idx * 100}ms`
                    }}
                  />
                </div>
                <span className="w-16 text-right text-[20px] text-black">
                  {Math.round(answerPercentage)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalized Insight */}
      <div className="max-w-[800px] mx-auto px-10 mb-8">
        <div className="bg-white rounded-2xl shadow-card p-8 border-l-4 border-orange">
          <span className="caption block mb-2">Your learning moment:</span>
          <p className="body-text font-medium">{getInsight()}</p>
        </div>
      </div>

      {/* Resources */}
      <div className="max-w-[800px] mx-auto px-10 mb-12">
        <span className="caption block mb-4">Recommended at booth:</span>
        <div className="flex gap-6">
          {['Early EN Guide', 'Access Algorithm', 'Safety Checklist'].map((resource, i) => (
            <div 
              key={i}
              className="w-[200px] h-[120px] bg-white rounded-xl shadow-card p-4 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-card-hover transition-all cursor-pointer"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#007DB9" strokeWidth="2"/>
                <path d="M8 12H16M8 8H16M8 16H12" stroke="#007DB9" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-[18px] font-medium text-center">{resource}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex justify-center gap-6 pb-12">
        <button
          onClick={handleViewLeaderboard}
          className="btn-blue w-[280px] h-[72px]"
        >
          VIEW LEADERBOARD
        </button>
        <button
          onClick={handlePlayAgain}
          className="btn-green w-[280px] h-[72px]"
        >
          PLAY AGAIN
        </button>
      </div>

      {/* Auto-reset indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-grey-extradark">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
          <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className="text-[16px]">Auto-reset in 45s</span>
      </div>
    </div>
  );
}
