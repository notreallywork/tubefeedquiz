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

// Circular score gauge component
function ScoreGauge({ score, maxScore, animated }: { score: number; maxScore: number; animated: boolean }) {
  const percentage = (score / maxScore) * 100;
  const radius = 100;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animated ? circumference - (percentage / 100) * circumference : circumference;

  const getColor = () => {
    if (percentage >= 80) return '#64DCB4';
    if (percentage >= 50) return '#FFAF00';
    return '#FF7300';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="240" height="240" viewBox="0 0 240 240">
        {/* Background circle */}
        <circle
          cx="120" cy="120" r={radius}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <circle
          cx="120" cy="120" r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 120 120)"
          style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Glow effect */}
        <circle
          cx="120" cy="120" r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 120 120)"
          opacity="0.15"
          style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
    </div>
  );
}

// Individual question result card
function QuestionCard({
  index,
  answer,
  question,
  show,
  delay,
}: {
  index: number;
  answer: Answer;
  question: Question;
  show: boolean;
  delay: number;
}) {
  const percentage = Math.round((answer.score / 100) * 100);

  const getScoreBadge = () => {
    if (percentage === 100) return { bg: 'bg-green', text: 'text-black', label: 'Perfect' };
    if (percentage >= 50) return { bg: 'bg-yellow', text: 'text-black', label: 'Partial' };
    return { bg: 'bg-orange-extralight', text: 'text-orange', label: 'Missed' };
  };

  const badge = getScoreBadge();

  const themeIcons: Record<string, string> = {
    timing: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z',
    access: 'M20 12V8h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z',
    tolerance: 'M12 1L3 5v6c0 5.6 3.8 10.7 9 12 5.2-1.3 9-6.4 9-12V5l-9-4zm0 10.99h7c-.5 4.2-3.3 7.9-7 9.01V12H5V6.3l7-3.1v8.79z',
    safety: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM10 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z',
    transition: 'M16 6l2.3 2.3-4.9 4.9-4-4L2 16.6 3.4 18l6-6 4 4 6.3-6.3L22 12V6z',
  };

  return (
    <div
      className="bg-white rounded-xl shadow-card p-5 flex items-center gap-5 transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(16px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Question number + theme icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-extralight flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#007DB9">
          <path d={themeIcons[question.theme] || themeIcons.timing} />
        </svg>
      </div>

      {/* Question info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[16px] font-medium text-grey-extradark">Q{index + 1}</span>
          <span className="text-[14px] text-grey-dark uppercase tracking-wider">{question.theme}</span>
        </div>
        <p className="text-[18px] text-black truncate">{question.title}</p>
      </div>

      {/* Score badge */}
      <div className="flex-shrink-0 flex items-center gap-3">
        <span className={`text-[18px] font-semibold ${percentage === 100 ? 'text-green' : percentage >= 50 ? 'text-yellow' : 'text-orange'}`}>
          {percentage}%
        </span>
        <span className={`px-3 py-1 rounded-full text-[13px] font-medium ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
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
  const [showGauge, setShowGauge] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const scoreAnimated = useRef(false);

  // Animate score count-up
  useEffect(() => {
    if (scoreAnimated.current) return;
    scoreAnimated.current = true;

    // Kick off gauge animation immediately
    requestAnimationFrame(() => setShowGauge(true));

    const duration = 1800;
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
        setTimeout(() => setShowCards(true), 200);
        setTimeout(() => setShowInsight(true), 800);
        setTimeout(() => setShowActions(true), 1100);
      }
    };

    requestAnimationFrame(animate);
  }, [totalScore, playScoreReveal]);

  const percentage = Math.round((totalScore / maxScore) * 100);
  const percentile = percentage >= 90 ? '10%' : percentage >= 75 ? '25%' : percentage >= 50 ? '50%' : '75%';

  const getScoreMessage = () => {
    if (percentage >= 90) return 'Outstanding!';
    if (percentage >= 75) return 'Great work!';
    if (percentage >= 50) return 'Good effort!';
    return 'Keep learning!';
  };

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
      ? `Focus area: ${themeLabels[theme] || 'this topic'}. See resources below to strengthen your knowledge.`
      : `Strong across the board! Especially good at ${themeLabels[theme] || 'this area'}.`;
  };

  const handleViewLeaderboard = () => {
    onNavigate('leaderboard');
  };

  const handlePlayAgain = () => {
    onNavigate('attract');
  };

  const resources = [
    { name: 'Early EN Guide', icon: 'M9 4h6v2H9V4zm0 14h6v2H9v-2zm0-7h6v2H9v-2zm-4 0h2v2H5v-2zm0-7h2v2H5V4zm0 14h2v2H5v-2zm14-7h-2v2h2v-2zm0-7h-2v2h2V4zm0 14h-2v2h2v-2z', color: '#007DB9' },
    { name: 'Access Algorithm', icon: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z', color: '#64DCB4' },
    { name: 'Safety Checklist', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z', color: '#FF7300' },
  ];

  return (
    <div className="screen bg-gradient-to-b from-blue-extralight to-green-extralight overflow-auto">
      <div className="flex-1 flex flex-col items-center px-6 py-8">

        {/* Score Hero Section */}
        <div className="flex flex-col items-center mb-8">
          {/* Score gauge with number overlay */}
          <div className="relative mb-4">
            <ScoreGauge score={totalScore} maxScore={maxScore} animated={showGauge} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[56px] font-bold text-black leading-none">{displayScore}</span>
              <span className="text-[18px] text-grey-extradark mt-1">of {maxScore}</span>
            </div>
          </div>

          {/* Score message */}
          <h2 className="text-[36px] font-semibold text-blue mb-2">{getScoreMessage()}</h2>

          {/* Percentile badge */}
          <div className="flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#64DCB4">
              <path d="M12 15C15.866 15 19 11.866 19 8C19 4.134 15.866 1 12 1C8.134 1 5 4.134 5 8C5 11.866 8.134 15 12 15Z" />
              <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" />
            </svg>
            <span className="text-[18px] font-medium text-grey-extradark">
              Top {percentile} today
            </span>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="w-full max-w-[700px] mb-8">
          <h3 className="text-[20px] font-medium text-grey-extradark mb-4 px-1">Your answers</h3>
          <div className="flex flex-col gap-3">
            {answers.map((answer, idx) => (
              <QuestionCard
                key={idx}
                index={idx}
                answer={answer}
                question={questions[idx]}
                show={showCards}
                delay={idx * 120}
              />
            ))}
          </div>
        </div>

        {/* Learning Insight */}
        <div
          className="w-full max-w-[700px] mb-8 transition-all duration-500"
          style={{
            opacity: showInsight ? 1 : 0,
            transform: showInsight ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <div className="bg-white rounded-xl shadow-card p-6 border-l-4 border-orange flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-extralight rounded-full flex items-center justify-center mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF7300">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <div>
              <span className="text-[14px] font-medium text-grey-extradark uppercase tracking-wider block mb-1">
                Learning insight
              </span>
              <p className="text-[20px] text-black leading-relaxed">{getInsight()}</p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div
          className="w-full max-w-[700px] mb-10 transition-all duration-500"
          style={{
            opacity: showInsight ? 1 : 0,
            transform: showInsight ? 'translateY(0)' : 'translateY(12px)',
            transitionDelay: '200ms',
          }}
        >
          <h3 className="text-[18px] font-medium text-grey-extradark mb-4 px-1">Recommended resources</h3>
          <div className="grid grid-cols-3 gap-4">
            {resources.map((resource, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-card p-5 flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-card-hover transition-all cursor-pointer group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${resource.color}15` }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={resource.color}>
                    <path d={resource.icon} />
                  </svg>
                </div>
                <span className="text-[16px] font-medium text-center text-black">{resource.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex gap-4 pb-8 transition-all duration-500"
          style={{
            opacity: showActions ? 1 : 0,
            transform: showActions ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <button
            onClick={handleViewLeaderboard}
            className="px-10 py-4 bg-white text-blue border-2 border-blue rounded-full text-[22px] font-semibold hover:bg-blue hover:text-white transition-all duration-200 hover:scale-105 active:scale-95"
          >
            View Leaderboard
          </button>
          <button
            onClick={handlePlayAgain}
            className="px-10 py-4 bg-blue text-white rounded-full text-[22px] font-semibold hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Play Again
          </button>
        </div>

      </div>

      {/* Auto-reset indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-grey-extradark bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-xs">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
          <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-[14px]">Auto-reset in 45s</span>
      </div>
    </div>
  );
}
