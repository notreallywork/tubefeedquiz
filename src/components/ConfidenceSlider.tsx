import { useState, useRef, useCallback, useEffect } from 'react';

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function ConfidenceSlider({ value, onChange }: ConfidenceSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const updateFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    onChange(percent);
  }, [onChange]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    updateFromPosition(clientX);
  }, [updateFromPosition]);

  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    updateFromPosition(clientX);
  }, [isDragging, updateFromPosition]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap to nearest of 5 positions
    const positions = [0.2, 0.4, 0.6, 0.8, 1.0];
    const closest = positions.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    onChange(closest);
  }, [isDragging, value, onChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="caption">How confident are you?</span>
      
      <div 
        ref={sliderRef}
        className="relative w-full max-w-[600px] h-2 bg-grey-light rounded cursor-pointer"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Fill */}
        <div 
          className="absolute left-0 top-0 h-full bg-blue rounded"
          style={{ width: `${value * 100}%` }}
        />
        
        {/* Handle */}
        <div
          className={`
            absolute w-8 h-8 bg-green border-[3px] border-white rounded-full 
            shadow-md -translate-x-1/2 -translate-y-[calc(50%-4px)]
            transition-transform
            ${isDragging ? 'scale-125' : ''}
          `}
          style={{ left: `${value * 100}%` }}
        />
        
        {/* Tick marks */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((pos) => (
          <div
            key={pos}
            className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-grey-dark rounded"
            style={{ left: `${pos * 100}%` }}
          />
        ))}
      </div>
      
      <div className="flex justify-between w-full max-w-[600px] text-[16px] text-grey-extradark">
        <span>Not sure</span>
        <span>Very sure</span>
      </div>
    </div>
  );
}
