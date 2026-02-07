import { useState, useRef, useCallback, useEffect } from 'react';

interface DragItem {
  id: string;
  name: string;
  correct: boolean;
  zone: string;
}

interface DragAnatomyProps {
  items: DragItem[];
  onDrop: (itemId: string, correct: boolean) => void;
  playSelectionSound: () => void;
}

interface Position {
  x: number;
  y: number;
}

export function DragAnatomy({ 
  items, 
  onDrop,
  playSelectionSound
}: DragAnatomyProps) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [placedItem, setPlacedItem] = useState<{ item: DragItem; zone: string } | null>(null);
  const [flashZone, setFlashZone] = useState<string | null>(null);
  
  // Refs for real-time access
  const draggedItemRef = useRef<DragItem | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep ref in sync
  useEffect(() => {
    draggedItemRef.current = draggedItem;
  }, [draggedItem]);

  const cleanupListeners = useCallback((moveHandler: any, endHandler: any) => {
    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', endHandler);
    document.removeEventListener('touchmove', moveHandler);
    document.removeEventListener('touchend', endHandler);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, item: DragItem) => {
    e.preventDefault();
    
    // Prevent dragging if this item is already correctly placed
    if (placedItem?.item.id === item.id && placedItem?.zone === 'post-pyloric') {
      return;
    }
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Store offset from center for smoother dragging
    dragOffsetRef.current = {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2
    };
    
    setDraggedItem(item);
    setDragPosition({ 
      x: clientX - rect.width / 2, 
      y: clientY - rect.height / 2 
    });
    draggedItemRef.current = item;
    
    playSelectionSound();

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault(); // CRITICAL: Prevent scroll
      
      const moveX = 'touches' in moveEvent 
        ? (moveEvent as TouchEvent).touches[0].clientX 
        : (moveEvent as MouseEvent).clientX;
      const moveY = 'touches' in moveEvent 
        ? (moveEvent as TouchEvent).touches[0].clientY 
        : (moveEvent as MouseEvent).clientY;
      
      setDragPosition({ 
        x: moveX - dragOffsetRef.current.x - 100, // Center the 200px wide item
        y: moveY - dragOffsetRef.current.y - 40   // Center the 80px tall item
      });
      
      // Check zone hover
      const zones = document.querySelectorAll('[data-zone]');
      let foundZone: string | null = null;
      
      zones.forEach((zone) => {
        const zoneRect = zone.getBoundingClientRect();
        const isOver = 
          moveX >= zoneRect.left && 
          moveX <= zoneRect.right && 
          moveY >= zoneRect.top && 
          moveY <= zoneRect.bottom;
        
        if (isOver) {
          foundZone = zone.getAttribute('data-zone');
        }
      });
      
      setHoveredZone(foundZone);
    };

    const handleEnd = (endEvent: MouseEvent | TouchEvent) => {
      const currentItem = draggedItemRef.current;
      
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
      
      // Find drop zone
      const zones = document.querySelectorAll('[data-zone]');
      let droppedInZone: string | null = null;
      
      zones.forEach((zone) => {
        const zoneRect = zone.getBoundingClientRect();
        const isOver = 
          endX >= zoneRect.left && 
          endX <= zoneRect.right && 
          endY >= zoneRect.top && 
          endY <= zoneRect.bottom;
        
        if (isOver) {
          droppedInZone = zone.getAttribute('data-zone');
        }
      });
      
      if (droppedInZone) {
        if (droppedInZone === 'post-pyloric' && currentItem.correct) {
          // Correct placement
          setPlacedItem({ item: currentItem, zone: droppedInZone });
          setFlashZone(null);
          playSelectionSound();
          onDrop(currentItem.id, true);
        } else {
          // Wrong zone - flash red
          setFlashZone(droppedInZone);
          setTimeout(() => setFlashZone(null), 400);
          
          // Return to tray (don't place)
          setPlacedItem(null);
          onDrop(currentItem.id, false);
        }
      }
      
      // Reset drag state
      setDraggedItem(null);
      setDragPosition(null);
      setHoveredZone(null);
      draggedItemRef.current = null;
      
      cleanupListeners(handleMove, handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [placedItem, playSelectionSound, onDrop, cleanupListeners]);

  // Get item to show in tray (filter out placed item)
  const trayItems = items.filter(item => 
    !(placedItem?.item.id === item.id && placedItem?.zone === 'post-pyloric')
  );

  return (
    <div ref={containerRef} className="flex gap-8 h-[500px] select-none">
      {/* Tube Tray */}
      <div className="w-[280px] bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
        <span className="caption uppercase tracking-wider mb-2">Drag to place</span>
        {trayItems.map((item) => (
          <div
            key={item.id}
            onMouseDown={(e) => handleDragStart(e, item)}
            onTouchStart={(e) => handleDragStart(e, item)}
            className={`
              w-full h-20 bg-white border-2 rounded-xl
              flex items-center justify-center cursor-grab touch-none
              transition-all duration-200
              ${draggedItem?.id === item.id ? 'opacity-0' : 'opacity-100'}
              ${item.correct 
                ? 'border-blue hover:-translate-y-0.5 hover:shadow-card' 
                : 'border-blue hover:-translate-y-0.5 hover:shadow-card'
              }
            `}
          >
            <span className="body-text font-medium">{item.name}</span>
          </div>
        ))}
        
        {/* Show placed item as "completed" if correct */}
        {placedItem?.zone === 'post-pyloric' && (
          <div className="w-full h-20 bg-green border-2 border-green rounded-xl flex items-center justify-center">
            <span className="body-text font-medium text-black">{placedItem.item.name}</span>
            <span className="ml-2 text-green-600">✓</span>
          </div>
        )}
      </div>

      {/* Anatomy Area */}
      <div 
        id="anatomy-area"
        className="flex-1 bg-white rounded-2xl shadow-card p-8 relative flex items-center justify-center"
      >
        <svg width="400" height="500" viewBox="0 0 400 500">
          {/* Body outline */}
          <path
            d="M200 50 
               C 240 50, 260 70, 260 100
               C 260 120, 250 135, 245 145
               C 280 155, 320 180, 320 240
               L 320 500
               L 80 500
               L 80 240
               C 80 180, 120 155, 155 145
               C 150 135, 140 120, 140 100
               C 140 70, 160 50, 200 50Z"
            fill="none"
            stroke="#888888"
            strokeWidth="2"
          />
          
          {/* Head */}
          <ellipse cx="200" cy="40" rx="35" ry="45" fill="none" stroke="#888888" strokeWidth="2" />
          
          {/* Gastric zone */}
          <ellipse 
            cx="200" cy="280" rx="70" ry="60"
            fill={hoveredZone === 'gastric' ? '#E5F2F8' : flashZone === 'gastric' ? '#FFD0CF' : 'transparent'}
            stroke={hoveredZone === 'gastric' ? '#7FBEDC' : flashZone === 'gastric' ? '#FF2800' : 'transparent'}
            strokeWidth="2"
            strokeDasharray="5,5"
            data-zone="gastric"
            style={{ transition: 'all 0.2s' }}
          />
          <text x="200" y="360" textAnchor="middle" fill="#888888" fontSize="14">
            Gastric
          </text>
          
          {/* Post-pyloric zone */}
          <ellipse 
            cx="240" cy="340" rx="55" ry="45"
            fill={hoveredZone === 'post-pyloric' ? '#E0F8F0' : flashZone === 'post-pyloric' ? '#FFD0CF' : placedItem?.zone === 'post-pyloric' ? '#E0F8F0' : 'transparent'}
            stroke={hoveredZone === 'post-pyloric' ? '#64DCB4' : flashZone === 'post-pyloric' ? '#FF2800' : placedItem?.zone === 'post-pyloric' ? '#64DCB4' : 'transparent'}
            strokeWidth="2"
            data-zone="post-pyloric"
            style={{ transition: 'all 0.2s' }}
          />
          <text x="240" y="410" textAnchor="middle" fill="#888888" fontSize="14">
            Post-pyloric
          </text>
          
          {/* Show placed item label in zone */}
          {placedItem?.zone === 'post-pyloric' && (
            <text x="240" y="345" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="500">
              {placedItem.item.name}
            </text>
          )}
          
          {/* Parenteral zone */}
          <rect 
            x="330" y="200" width="50" height="100"
            fill={hoveredZone === 'parenteral' ? '#FFF5ED' : flashZone === 'parenteral' ? '#FFD0CF' : 'transparent'}
            stroke={hoveredZone === 'parenteral' ? '#FF7300' : flashZone === 'parenteral' ? '#FF2800' : 'transparent'}
            strokeWidth="2"
            strokeDasharray="5,5"
            data-zone="parenteral"
            style={{ transition: 'all 0.2s' }}
          />
          <text x="355" y="320" textAnchor="middle" fill="#888888" fontSize="14">
            Parenteral
          </text>
        </svg>
      </div>

      {/* Dragged item overlay */}
      {draggedItem && dragPosition && (
        <div
          className="fixed w-[200px] h-20 bg-white border-2 border-blue rounded-xl flex items-center justify-center pointer-events-none z-50 shadow-card-hover"
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
            transform: 'scale(1.1) rotate(3deg)',
          }}
        >
          <span className="body-text font-medium">{draggedItem.name}</span>
        </div>
      )}
    </div>
  );
}