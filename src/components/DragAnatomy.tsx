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

  const getZoneStyle = (zone: string) => {
    const isHovered = hoveredZone === zone;
    const isFlashing = flashZone === zone;
    const isPlaced = placedItem?.zone === zone;

    if (isFlashing) return { bg: 'rgba(255, 40, 0, 0.15)', border: '#FF2800', shadow: '0 0 20px rgba(255,40,0,0.3)' };
    if (isPlaced) return { bg: 'rgba(100, 220, 180, 0.2)', border: '#64DCB4', shadow: '0 0 16px rgba(100,220,180,0.4)' };
    if (isHovered) return { bg: 'rgba(0, 125, 185, 0.1)', border: '#007DB9', shadow: '0 0 16px rgba(0,125,185,0.3)' };
    return { bg: 'transparent', border: '#BBBBBB', shadow: 'none' };
  };

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
              border-blue hover:-translate-y-0.5 hover:shadow-card
            `}
          >
            <span className="body-text font-medium">{item.name}</span>
          </div>
        ))}

        {/* Show placed item as "completed" if correct */}
        {placedItem?.zone === 'post-pyloric' && (
          <div className="w-full h-20 bg-green border-2 border-green rounded-xl flex items-center justify-center">
            <span className="body-text font-medium text-black">{placedItem.item.name}</span>
            <span className="ml-2 text-green-600">&#10003;</span>
          </div>
        )}
      </div>

      {/* Anatomy Area - Clean medical diagram */}
      <div
        id="anatomy-area"
        className="flex-1 bg-white rounded-2xl shadow-card relative flex items-center justify-center overflow-hidden"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #007DB9 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        <svg width="480" height="460" viewBox="0 0 480 460" className="relative z-10">
          <defs>
            {/* Gradient for the body silhouette */}
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8EEF2" />
              <stop offset="100%" stopColor="#D4DEE6" />
            </linearGradient>
            {/* Gradient for the esophagus/GI tract */}
            <linearGradient id="giGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB87A" />
              <stop offset="100%" stopColor="#FF9A4D" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Drop shadow */}
            <filter id="dropShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Clean torso silhouette */}
          <g filter="url(#dropShadow)">
            {/* Head */}
            <ellipse cx="240" cy="42" rx="32" ry="38" fill="url(#bodyGrad)" stroke="#C0CCD6" strokeWidth="1.5" />
            {/* Neck */}
            <rect x="225" y="76" width="30" height="24" rx="8" fill="url(#bodyGrad)" stroke="#C0CCD6" strokeWidth="1.5" />
            {/* Torso - smooth rounded shape */}
            <path
              d="M170 100
                 C 170 100, 145 110, 130 140
                 C 115 170, 110 210, 112 250
                 C 114 290, 120 340, 130 380
                 L 130 440
                 L 350 440
                 L 350 380
                 C 360 340, 366 290, 368 250
                 C 370 210, 365 170, 350 140
                 C 335 110, 310 100, 310 100
                 Z"
              fill="url(#bodyGrad)"
              stroke="#C0CCD6"
              strokeWidth="1.5"
            />
            {/* Shoulders / arms (stumps) */}
            <path d="M170 100 C 150 105, 100 120, 80 150 C 75 160, 78 168, 90 165 C 110 158, 138 140, 155 128"
              fill="url(#bodyGrad)" stroke="#C0CCD6" strokeWidth="1.5" />
            <path d="M310 100 C 330 105, 380 120, 400 150 C 405 160, 402 168, 390 165 C 370 158, 342 140, 325 128"
              fill="url(#bodyGrad)" stroke="#C0CCD6" strokeWidth="1.5" />
          </g>

          {/* GI Tract illustration */}
          <g opacity="0.9">
            {/* Esophagus - tube from throat */}
            <path
              d="M240 80 L240 185"
              fill="none"
              stroke="url(#giGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Stomach */}
            <path
              d="M240 185
                 C 240 185, 200 190, 185 215
                 C 170 240, 175 270, 195 285
                 C 215 300, 250 295, 265 275
                 C 280 255, 275 230, 265 215
                 C 255 200, 240 195, 240 195"
              fill="#FFE0C2"
              stroke="#FF9A4D"
              strokeWidth="2"
              opacity="0.8"
            />
            <text x="222" y="250" textAnchor="middle" fill="#CC6600" fontSize="11" fontWeight="500" opacity="0.6">Stomach</text>

            {/* Duodenum / Small intestine entrance */}
            <path
              d="M265 275
                 C 280 290, 300 300, 305 320
                 C 310 340, 295 360, 275 365
                 C 255 370, 240 355, 235 340"
              fill="none"
              stroke="#FF9A4D"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>

          {/* IV line indicator (parenteral) */}
          <g opacity="0.6">
            <line x1="95" y1="130" x2="115" y2="160" stroke="#BBBBBB" strokeWidth="2" strokeDasharray="4,3" />
            <circle cx="90" cy="125" r="6" fill="none" stroke="#BBBBBB" strokeWidth="1.5" />
            <line x1="87" y1="125" x2="93" y2="125" stroke="#BBBBBB" strokeWidth="1.5" />
            <line x1="90" y1="122" x2="90" y2="128" stroke="#BBBBBB" strokeWidth="1.5" />
          </g>

          {/* Drop Zones - clean rounded rectangles with labels */}
          {/* Gastric Zone */}
          <g data-zone="gastric">
            <rect
              x="160" y="190" width="130" height="105" rx="16"
              fill={getZoneStyle('gastric').bg}
              stroke={getZoneStyle('gastric').border}
              strokeWidth="2"
              strokeDasharray={hoveredZone === 'gastric' || flashZone === 'gastric' || placedItem?.zone === 'gastric' ? '0' : '6,4'}
              style={{
                transition: 'all 0.25s ease',
                filter: getZoneStyle('gastric').shadow !== 'none' ? `drop-shadow(${getZoneStyle('gastric').shadow})` : 'none'
              }}
            />
          </g>

          {/* Post-pyloric Zone */}
          <g data-zone="post-pyloric">
            <rect
              x="220" y="305" width="110" height="75" rx="16"
              fill={getZoneStyle('post-pyloric').bg}
              stroke={getZoneStyle('post-pyloric').border}
              strokeWidth="2"
              strokeDasharray={hoveredZone === 'post-pyloric' || flashZone === 'post-pyloric' || placedItem?.zone === 'post-pyloric' ? '0' : '6,4'}
              style={{
                transition: 'all 0.25s ease',
                filter: getZoneStyle('post-pyloric').shadow !== 'none' ? `drop-shadow(${getZoneStyle('post-pyloric').shadow})` : 'none'
              }}
            />
            {/* Show placed item label in zone */}
            {placedItem?.zone === 'post-pyloric' && (
              <text x="275" y="348" textAnchor="middle" fill="#007DB9" fontSize="13" fontWeight="600">
                {placedItem.item.name}
              </text>
            )}
          </g>

          {/* Parenteral Zone */}
          <g data-zone="parenteral">
            <rect
              x="68" y="120" width="70" height="60" rx="14"
              fill={getZoneStyle('parenteral').bg}
              stroke={getZoneStyle('parenteral').border}
              strokeWidth="2"
              strokeDasharray={hoveredZone === 'parenteral' || flashZone === 'parenteral' || placedItem?.zone === 'parenteral' ? '0' : '6,4'}
              style={{
                transition: 'all 0.25s ease',
                filter: getZoneStyle('parenteral').shadow !== 'none' ? `drop-shadow(${getZoneStyle('parenteral').shadow})` : 'none'
              }}
            />
          </g>

          {/* Zone Labels - positioned outside the body with leader lines */}
          {/* Gastric label */}
          <g>
            <line x1="155" y1="242" x2="120" y2="242" stroke="#888" strokeWidth="1" opacity="0.5" />
            <circle cx="120" cy="242" r="3" fill="#888" opacity="0.5" />
            <text x="115" y="247" textAnchor="end" fill="#666" fontSize="13" fontWeight="500">Gastric</text>
          </g>

          {/* Post-pyloric label */}
          <g>
            <line x1="335" y1="342" x2="370" y2="342" stroke="#888" strokeWidth="1" opacity="0.5" />
            <circle cx="370" cy="342" r="3" fill="#888" opacity="0.5" />
            <text x="377" y="347" textAnchor="start" fill="#666" fontSize="13" fontWeight="500">Post-pyloric</text>
          </g>

          {/* Parenteral label */}
          <g>
            <line x1="103" y1="115" x2="103" y2="100" stroke="#888" strokeWidth="1" opacity="0.5" />
            <circle cx="103" cy="100" r="3" fill="#888" opacity="0.5" />
            <text x="103" y="93" textAnchor="middle" fill="#666" fontSize="13" fontWeight="500">Parenteral</text>
          </g>

          {/* Nose/tube entry indicator */}
          <circle cx="228" cy="50" r="4" fill="#FFB87A" opacity="0.6" />

          {/* Instruction hint at bottom */}
          <text x="240" y="455" textAnchor="middle" fill="#BBBBBB" fontSize="12">
            Drag a tube to the correct placement zone
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
