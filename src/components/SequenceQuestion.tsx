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
  // Shuffle items for the source pool
  const [shuffledItems] = useState(() => 
    [...items].sort(() => Math.random() - 0.5)
  );
  
  const [sourceItems, setSourceItems] = useState<SequenceItem[]>(shuffledItems);
  const [dropZones, setDropZones] = useState<(SequenceItem | null)[]>([null, null, null, null]);
  const [draggedItem, setDraggedItem] = useState<SequenceItem | null>(null);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const [dragSource, setDragSource] = useState<{ type: 'source' | 'zone'; index: number } | null>(null);
  
  // Refs for real-time access in event handlers
  const draggedItemRef = useRef<SequenceItem | null>(null);
  const dragSourceRef = useRef<{ type: 'source' | 'zone'; index: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep refs in sync
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
      
      setDragPosition({ x: moveX - rect.width / 2, y: moveY - rect.height / 2 });
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

  return (
    <div ref={containerRef} className="flex gap-8 h-[500px] select-none">
      {/* Source Pool */}
      <div 
        id="source-pool"
        className="w-[300px] bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4"
      >
        <span className="caption uppercase tracking-wider mb-2">Drag to order</span>
        {sourceItems.map((item) => (
          <div
            key={item.id}
            onMouseDown={(e) => handleDragStart(e, item, { type: 'source', index: -1 })}
            onTouchStart={(e) => handleDragStart(e, item, { type: 'source', index: -1 })}
            className={`
              w-full h-20 bg-white border-2 border-grey-light rounded-xl
              flex items-center justify-center cursor-grab touch-none
              shadow-card transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-card-hover
              active:scale-95
              ${draggedItem?.id === item.id ? 'opacity-0' : ''}
            `}
          >
            <span className="body-text font-medium px-4 text-center">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Drop Zones */}
      <div className="flex-1 flex flex-col gap-4 justify-center">
        {dropZones.map((zone, index) => (
          <div
            key={index}
            data-drop-index={index}
            className={`
              w-full h-20 rounded-xl flex items-center
              transition-all duration-200
              ${zone 
                ? 'border-2 border-blue bg-blue-extralight border-solid' 
                : 'border-2 border-dashed border-grey-light bg-white/50'
              }
            `}
          >
            <div className="w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center text-[24px] font-semibold ml-4 shrink-0">
              {index + 1}
            </div>
            
            <div className="flex-1 flex items-center justify-center min-w-0">
              {zone ? (
                <div
                  onMouseDown={(e) => handleDragStart(e, zone, { type: 'zone', index })}
                  onTouchStart={(e) => handleDragStart(e, zone, { type: 'zone', index })}
                  className="cursor-grab touch-none px-4 w-full text-center"
                >
                  <span className="body-text font-medium truncate">{zone.text}</span>
                </div>
              ) : (
                <span className="caption">Drop here</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dragged item overlay */}
      {draggedItem && dragPosition && (
        <div
          className="
            fixed w-[280px] h-20 bg-white border-2 border-blue rounded-xl
            flex items-center justify-center pointer-events-none z-50
            shadow-card-hover
          "
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
            transform: 'scale(1.05) rotate(2deg)',
          }}
        >
          <span className="body-text font-medium px-4 text-center">{draggedItem.text}</span>
        </div>
      )}
    </div>
  );
}