import { useState, useCallback, useEffect, useRef } from 'react';
import type { Question } from '@/types/game';
import { ProgressBar } from '@/components/ProgressBar';
import { ConfidenceSlider } from '@/components/ConfidenceSlider';
import { DragAnatomy } from '@/components/DragAnatomy';
import { SequenceQuestion } from '@/components/SequenceQuestion';

interface QuestionScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (selected: string | string[], confidence: number) => void;
  onNext: () => void;
  playSelectionSound: () => void;
  playConfirmSound: () => void;
  playTimerTick: (urgent?: boolean) => void;
  playTimerExpire: () => void;
}

// Single Select Question
function SingleSelectQuestion({ 
  question, 
  onSelect, 
  selected, 
  playSelectionSound 
}: { 
  question: Question; 
  onSelect: (id: string) => void;
  selected: string | null;
  playSelectionSound: () => void;
}) {
  const handleSelect = useCallback((id: string) => {
    playSelectionSound();
    onSelect(id);
  }, [onSelect, playSelectionSound]);

  if (question.type !== 'single' && question.type !== 'speed') return null;

  return (
    <div className="flex flex-col gap-4">
      {question.options.map((option) => (
        <button
          key={option.id}
          onClick={() => handleSelect(option.id)}
          className={`
            option-card text-left
            ${selected === option.id ? 'selected' : ''}
          `}
        >
          <span className="body-text">{option.text}</span>
        </button>
      ))}
    </div>
  );
}

// Multi Select Question
function MultiSelectQuestion({ 
  question, 
  onSelect, 
  selected, 
  playSelectionSound 
}: { 
  question: Question; 
  onSelect: (ids: string[]) => void;
  selected: string[];
  playSelectionSound: () => void;
}) {
  if (question.type !== 'multi') return null;
  
  const maxSelections = question.correctCombination?.length || 2;

  const handleToggle = useCallback((id: string) => {
    playSelectionSound();
    onSelect(
      selected.includes(id) 
        ? selected.filter(s => s !== id)
        : selected.length >= maxSelections 
          ? selected 
          : [...selected, id]
    );
  }, [onSelect, selected, maxSelections, playSelectionSound]);

  const isComplete = selected.length === maxSelections;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <span className="caption">
          Select {maxSelections} options
        </span>
        <span className={`text-[20px] font-medium ${isComplete ? 'text-green' : 'text-orange'}`}>
          {selected.length} of {maxSelections} selected
        </span>
      </div>
      {question.options?.map((option) => {
        const isSelected = selected.includes(option.id);
        const isDisabled = !isSelected && selected.length >= maxSelections;
        
        return (
          <button
            key={option.id}
            onClick={() => handleToggle(option.id)}
            disabled={isDisabled}
            className={`
              option-card text-left flex items-center gap-4
              ${isSelected ? 'selected' : ''}
              ${isDisabled ? 'opacity-50' : ''}
            `}
          >
            <div className={`game-checkbox ${isSelected ? 'checked' : ''}`}>
              {isSelected && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L7 12L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="body-text">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}

// Speed Round Question
function SpeedQuestion({ 
  question, 
  onSelect, 
  timeLimit,
  playTimerTick,
  playTimerExpire
}: { 
  question: Question; 
  onSelect: (id: string) => void;
  timeLimit: number;
  playTimerTick: (urgent?: boolean) => void;
  playTimerExpire: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          playTimerExpire();
          onSelect(''); // Auto-submit empty
          return 0;
        }
        
        // Play tick sound every second
        if (Math.floor(newTime) !== Math.floor(prev)) {
          playTimerTick(newTime <= 3);
        }
        
        return newTime;
      });
    }, 100);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [timeLimit, onSelect, playTimerTick, playTimerExpire]);

  const handleSelect = useCallback((id: string) => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    onSelect(id);
  }, [onSelect]);

  const progress = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft <= 3;

  if (question.type !== 'speed') return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Timer Bar */}
      <div className="timer-bar rounded overflow-hidden">
        <div 
          className={`timer-fill ${isUrgent ? 'animate-timer-pulse' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Large touch targets */}
      <div className="flex flex-col gap-4 mt-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className="
              w-full h-[100px] bg-white border-2 border-grey-light rounded-xl
              px-8 flex items-center
              hover:border-blue-light hover:-translate-y-0.5 hover:shadow-card
              active:scale-[0.98] active:border-blue
              transition-all duration-150
            "
          >
            <span className="text-[28px] font-normal">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Patient Card Component
function PatientCard({ context, visual }: { context: Question['context']; visual?: string }) {
  return (
    <div className="game-card p-10 max-w-[1200px] mx-auto w-full">
      <div className="space-y-2 mb-6">
        <p className="body-large font-medium">{context.patient}</p>
        {context.details.map((detail, i) => (
          <p key={i} className="body-text text-grey-extradark">{detail}</p>
        ))}
      </div>
      
      {/* Timeline visualization for timing questions */}
      {visual === 'timeline_surgery_day2' && (
        <div className="mt-8">
          <svg width="600" height="80" viewBox="0 0 600 80" className="mx-auto">
            {/* Base line */}
            <line x1="50" y1="40" x2="550" y2="40" stroke="#E5E5E5" strokeWidth="4" />
            
            {/* Day 0 - Surgery */}
            <circle cx="100" cy="40" r="12" fill="#007DB9" />
            <text x="100" y="70" textAnchor="middle" className="text-[18px] fill-grey-extradark">
              Surgery (Day 0)
            </text>
            
            {/* Day 1 */}
            <circle cx="300" cy="40" r="12" fill="#007DB9" />
            <text x="300" y="70" textAnchor="middle" className="text-[18px] fill-grey-extradark">
              Day 1
            </text>
            
            {/* Day 2 - Now */}
            <circle cx="500" cy="40" r="12" fill="#FF7300" className="animate-pulse-scale" />
            <text x="500" y="70" textAnchor="middle" className="text-[18px] fill-orange font-medium">
              Now (Day 2)
            </text>
          </svg>
        </div>
      )}
      
      {/* Context card for access questions */}
      {visual === 'anatomy_torso' && (
        <div className="mt-6 bg-orange-extralight rounded-xl p-6 border-l-4 border-orange">
          <p className="body-text">High aspiration risk, gastric feeding failing</p>
        </div>
      )}
    </div>
  );
}

export function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  onNext,
  playSelectionSound,
  playConfirmSound,
  playTimerTick,
  playTimerExpire
}: QuestionScreenProps) {
  const [selected, setSelected] = useState<string | string[] | null>(
    question.type === 'multi' || question.type === 'sequence' ? [] : null
  );
  const [confidence, setConfidence] = useState<number>(0.6);

  // Reset state when question changes
  useEffect(() => {
    setSelected(question.type === 'multi' || question.type === 'sequence' ? [] : null);
    setConfidence(0.6);
  }, [question]);

  const handleSelect = useCallback((value: string | string[]) => {
    setSelected(value);
    
    // For speed questions, auto-submit
    if (question.type === 'speed') {
      onSubmitAnswer(value as string, 3);
      onNext();
    }
  }, [question.type, onSubmitAnswer, onNext]);

  const handleDragSubmit = useCallback((itemId: string) => {
    setSelected(itemId);
    onSubmitAnswer(itemId, Math.round(confidence * 5));
    onNext();
  }, [onSubmitAnswer, onNext, confidence]);

  const handleSequenceComplete = useCallback((order: string[]) => {
    setSelected(order);
    onSubmitAnswer(order, Math.round(confidence * 5));
    onNext();
  }, [onSubmitAnswer, onNext, confidence]);

  const handleConfirm = useCallback(() => {
    if (selected === null) return;
    playConfirmSound();
    onSubmitAnswer(selected, Math.round(confidence * 5));
    onNext();
  }, [selected, confidence, onSubmitAnswer, onNext, playConfirmSound]);

  const canConfirm = selected !== null && (
    question.type === 'drag_anatomy' || 
    (question.type === 'multi' && (selected as string[]).length === (question.correctCombination?.length || 2)) ||
    (question.type === 'single' && selected !== null)
  );

  const themeLabels: Record<string, string> = {
    timing: 'TIMING',
    access: 'ACCESS',
    tolerance: 'TOLERANCE',
    safety: 'SAFETY',
    transition: 'TRANSITION'
  };

  return (
    <div className={`screen ${question.type === 'speed' ? 'bg-orange-extralight' : 'bg-blue-extralight'}`}>
      {/* Progress Bar */}
      <ProgressBar current={questionNumber} total={totalQuestions} />

      {/* Header */}
      <div className="px-10 py-6 flex items-center justify-between">
        <span className="caption uppercase tracking-wider">
          QUESTION {questionNumber} OF {totalQuestions} • {themeLabels[question.theme]}
        </span>
        {question.type === 'speed' && (
          <span className="text-orange font-semibold text-[20px]">SPEED ROUND</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-10 py-4 overflow-auto">
        {/* Patient Card */}
        <PatientCard context={question.context} visual={question.context.visual} />

        {/* Question Text */}
        <div className="max-w-[1200px] mx-auto w-full mt-8 mb-6">
          <h3 className="heading-3">{question.title}</h3>
        </div>

        {/* Question Type Specific */}
        <div className="max-w-[1200px] mx-auto w-full flex-1">
          {(question.type === 'single') && (
            <SingleSelectQuestion 
              question={question} 
              onSelect={handleSelect}
              selected={selected as string | null}
              playSelectionSound={playSelectionSound}
            />
          )}
          
          {question.type === 'multi' && (
            <MultiSelectQuestion 
              question={question} 
              onSelect={setSelected}
              selected={selected as string[]}
              playSelectionSound={playSelectionSound}
            />
          )}
          
          {question.type === 'speed' && (
            <SpeedQuestion 
              question={question} 
              onSelect={handleSelect}
              timeLimit={question.timeLimit || 10}
              playTimerTick={playTimerTick}
              playTimerExpire={playTimerExpire}
            />
          )}
          
          {question.type === 'drag_anatomy' && (
            <DragAnatomy 
              items={question.items}
              onDrop={handleDragSubmit}
              playSelectionSound={playSelectionSound}
            />
          )}
          
          {question.type === 'sequence' && (
            <SequenceQuestion 
              items={question.items}
              correctOrder={question.correctOrder}
              onComplete={handleSequenceComplete}
              playSelectionSound={playSelectionSound}
            />
          )}
        </div>

        {/* Confidence Slider (not for speed, drag, or sequence) */}
        {question.type !== 'speed' && question.type !== 'drag_anatomy' && question.type !== 'sequence' && (
          <div className="max-w-[800px] mx-auto w-full mt-8">
            <ConfidenceSlider value={confidence} onChange={setConfidence} />
          </div>
        )}
      </div>

      {/* Footer with Confirm Button */}
      {question.type !== 'speed' && question.type !== 'drag_anatomy' && question.type !== 'sequence' && (
        <div className="px-10 py-6 flex justify-center border-t border-grey-light">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`
              w-[400px] h-20 rounded-full text-[28px] font-semibold text-white
              transition-all duration-200
              ${canConfirm 
                ? 'bg-blue hover:scale-105' 
                : 'bg-grey-dark opacity-50 cursor-not-allowed'
              }
            `}
          >
            CONFIRM ANSWER
          </button>
        </div>
      )}
    </div>
  );
}
