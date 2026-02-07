import { useState, useRef, useCallback, useEffect } from 'react';

interface SequenceItem {
  id: string;
  text: string;
  order: number;
}

interface SequenceQuestionProps {
  items: SequenceItem[];
  correctOrder: string[];
  onComplete: (order: string[]) => void;
  playSelectionSound: () => void;
}

interface Position {
  x: number;
  y: number;
}

export function SequenceQuestion({
  items,
  onComplete,
  playSelectionSound
}: SequenceQuestionProps) {
  const [shuffledItems] = useState(() =>
    [...items].sort(() => Math.random() - 0.5)
  );

  const [sourceItems, setSourceItems] = useState<SequenceItem[]>(shuffledItems);
  const [dropZones, setDropZones] = useState<(SequenceItem | null)[]>([null, null, null, null]);
  const [draggedItem, setDraggedItem] = useState<SequenceItem | null>(null);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const [dragSource, setDragSource] = useState<{ type: 'source' | 'zone'; index: number } | null>(null);
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);

  const draggedItemRef = useRef<SequenceItem | null>(null);
  const dragSourceRef = useRef<{ type: 'source' | 'zone'; index: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    draggedItemRef.current = draggedItem;
  }, [draggedItem]);

  useEffect(() => {
    dragSourceRef.current = dragSource;
  }, [dragSource]);

  const cleanupListeners = useCallback((moveHandler: (e: MouseEvent | TouchEvent) => void, endHandler: (e: MouseEvent | TouchEvent) => void) => {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', endHandler);
    document.removeEventListener('touchmove', moveHandler);
    document.removeEventListener('touchend', endHandler);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, item: SequenceItem, source: { type: 'source' | 'zone'; index: number }) => {
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    dragSizeRef.current = { width: rect.width, height: rect.height };

    setDraggedItem(item);
    setDragPosition({ x: clientX - rect.width / 2, y: clientY - rect.height / 2 });
    setDragSource(source);

    draggedItemRef.current = item;
    dragSourceRef.current = source;

    playSelectionSound();

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();

      const moveX = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientX
        : (moveEvent as MouseEvent).clientX;
      const moveY = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientY
        : (moveEvent as MouseEvent).clientY;

      setDragPosition({
        x: moveX - dragSizeRef.current.width / 2,
        y: moveY - dragSizeRef.current.height / 2
      });

      // Check which drop zone is being hovered
      const dropZoneElements = document.querySelectorAll('[data-drop-index]');
      let foundZone: number | null = null;
      dropZoneElements.forEach((el) => {
        const zoneRect = el.getBoundingClientRect();
        if (moveX >= zoneRect.left && moveX <= zoneRect.right && moveY >= zoneRect.top && moveY <= zoneRect.bottom) {
          foundZone = parseInt(el.getAttribute('data-drop-index') || '-1');
        }
      });
      setHoveredZone(foundZone);
    };

    const handleEnd = (endEvent: MouseEvent | TouchEvent) => {
      const currentItem = draggedItemRef.current;
      const currentSource = dragSourceRef.current;

      if (!currentItem) {
        cleanupListeners(handleMove, handleEnd);
        return;
      }

      const endX = 'touches' in endEvent
        ? (endEvent as TouchEvent).changedTouches[0].clientX
        : (endEvent as MouseEvent).clientX;
      const endY = 'touches' in endEvent
        ? (endEvent as TouchEvent).changedTouches[0].clientY
        : (endEvent as MouseEvent).clientY;

      const dropZoneElements = document.querySelectorAll('[data-drop-index]');
      let droppedIndex = -1;

      dropZoneElements.forEach((el) => {
        const zoneRect = el.getBoundingClientRect();
        const isOver =
          endX >= zoneRect.left &&
          endX <= zoneRect.right &&
          endY >= zoneRect.top &&
          endY <= zoneRect.bottom;

        if (isOver) {
          const idx = parseInt(el.getAttribute('data-drop-index') || '-1');
          if (idx >= 0) droppedIndex = idx;
        }
      });

      const sourcePool = document.getElementById('source-pool');
      let droppedInSource = false;
      if (sourcePool) {
        const poolRect = sourcePool.getBoundingClientRect();
        droppedInSource =
          endX >= poolRect.left &&
          endX <= poolRect.right &&
          endY >= poolRect.top &&
          endY <= poolRect.bottom;
      }

      if (droppedIndex >= 0) {
        setDropZones(prev => {
          const newZones = [...prev];
          const displacedItem = newZones[droppedIndex];

          if (currentSource?.type === 'zone' && currentSource.index !== droppedIndex) {
            newZones[currentSource.index] = null;
          }

          newZones[droppedIndex] = currentItem;

          if (displacedItem && displacedItem.id !== currentItem.id) {
            setTimeout(() => {
              setSourceItems(s => [...s, displacedItem]);
            }, 0);
          }

          return newZones;
        });

        if (currentSource?.type === 'source') {
          setSourceItems(prev => prev.filter(i => i.id !== currentItem.id));
        }
      } else if (droppedInSource && currentSource?.type === 'zone') {
        setSourceItems(prev => [...prev, currentItem]);
        setDropZones(prev => {
          const newZones = [...prev];
          if (currentSource.index >= 0) {
            newZones[currentSource.index] = null;
          }
          return newZones;
        });
      }

      setDraggedItem(null);
      setDragPosition(null);
      setDragSource(null);
      setHoveredZone(null);
      draggedItemRef.current = null;
      dragSourceRef.current = null;

      cleanupListeners(handleMove, handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [cleanupListeners, playSelectionSound]);

  useEffect(() => {
    if (dropZones.every(zone => zone !== null)) {
      onComplete(dropZones.map(z => z!.id));
    }
  }, [dropZones, onComplete]);

  const stepLabels = ['First', 'Second', 'Third', 'Fourth'];

  return (
    <div ref={containerRef} className="flex gap-10 select-none" style={{ minHeight: '380px' }}>
      {/* Source Pool */}
      <div
        id="source-pool"
        className="flex-1 flex flex-col"
      >
        <span className="text-[16px] font-semibold text-grey-extradark uppercase tracking-wider mb-3">
          Available steps
        </span>
        <div className="flex flex-col gap-3 flex-1">
          {sourceItems.map((item) => (
            <div
              key={item.id}
              onMouseDown={(e) => handleDragStart(e, item, { type: 'source', index: -1 })}
              onTouchStart={(e) => handleDragStart(e, item, { type: 'source', index: -1 })}
              className={`
                bg-white border-2 border-grey-light rounded-xl
                flex items-center cursor-grab touch-none
                shadow-xs transition-all duration-200 px-5 py-4
                hover:-translate-y-0.5 hover:shadow-card hover:border-blue-light
                active:scale-[0.98]
                ${draggedItem?.id === item.id ? 'opacity-0' : ''}
              `}
            >
              <div className="w-8 h-8 rounded-lg bg-grey-extralight flex items-center justify-center mr-4 shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6h8M4 10h8" stroke="#BBB" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[18px] font-medium leading-snug">{item.text}</span>
            </div>
          ))}
          {sourceItems.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-grey-dark text-[16px] rounded-xl border-2 border-dashed border-grey-light">
              All steps placed
            </div>
          )}
        </div>
      </div>

      {/* Arrow indicator between columns */}
      <div className="flex items-center justify-center w-10">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 16h16M18 10l6 6-6 6" stroke="#BBB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Drop Zones */}
      <div className="flex-1 flex flex-col">
        <span className="text-[16px] font-semibold text-grey-extradark uppercase tracking-wider mb-3">
          Correct order
        </span>
        <div className="flex flex-col gap-3 flex-1">
          {dropZones.map((zone, index) => {
            const isHovered = hoveredZone === index && !zone;
            return (
              <div
                key={index}
                data-drop-index={index}
                className={`
                  rounded-xl flex items-center transition-all duration-200 px-4 py-3
                  ${zone
                    ? 'border-2 border-blue bg-blue-extralight'
                    : isHovered
                      ? 'border-2 border-blue border-dashed bg-blue-extralight/50'
                      : 'border-2 border-dashed border-grey-light bg-grey-extralight/50'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-bold mr-4 shrink-0 transition-colors duration-200
                  ${zone ? 'bg-blue text-white' : 'bg-grey-light text-grey-extradark'}
                `}>
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {zone ? (
                    <div
                      onMouseDown={(e) => handleDragStart(e, zone, { type: 'zone', index })}
                      onTouchStart={(e) => handleDragStart(e, zone, { type: 'zone', index })}
                      className="cursor-grab touch-none"
                    >
                      <span className="text-[18px] font-medium leading-snug">{zone.text}</span>
                    </div>
                  ) : (
                    <span className="text-[16px] text-grey-dark italic">{stepLabels[index]}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dragged item overlay */}
      {draggedItem && dragPosition && (
        <div
          className="fixed bg-white border-2 border-blue rounded-xl flex items-center pointer-events-none z-50 shadow-card-hover px-5 py-4"
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
            width: dragSizeRef.current.width || 'auto',
            transform: 'scale(1.03) rotate(1.5deg)',
            opacity: 0.95,
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-extralight flex items-center justify-center mr-4 shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6h8M4 10h8" stroke="#007DB9" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[18px] font-medium leading-snug">{draggedItem.text}</span>
        </div>
      )}
    </div>
  );
}
