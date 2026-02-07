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

  const draggedItemRef = useRef<DragItem | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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

    if (placedItem?.item.id === item.id && placedItem?.zone === 'post-pyloric') {
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

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
      moveEvent.preventDefault();

      const moveX = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientX
        : (moveEvent as MouseEvent).clientX;
      const moveY = 'touches' in moveEvent
        ? (moveEvent as TouchEvent).touches[0].clientY
        : (moveEvent as MouseEvent).clientY;

      setDragPosition({
        x: moveX - dragOffsetRef.current.x - 100,
        y: moveY - dragOffsetRef.current.y - 28
      });

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
          setPlacedItem({ item: currentItem, zone: droppedInZone });
          setFlashZone(null);
          playSelectionSound();
          onDrop(currentItem.id, true);
        } else {
          setFlashZone(droppedInZone);
          setTimeout(() => setFlashZone(null), 400);
          setPlacedItem(null);
          onDrop(currentItem.id, false);
        }
      }

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

  const getZoneDash = (zone: string) => {
    return hoveredZone === zone || flashZone === zone || placedItem?.zone === zone ? '0' : '6,4';
  };

  return (
    <div ref={containerRef} className="flex gap-6 h-[500px] select-none">
      {/* Tube Tray */}
      <div className="w-[260px] flex flex-col gap-3 pt-2">
        <span className="caption uppercase tracking-wider mb-1 px-1">Drag to place</span>
        {trayItems.map((item) => (
          <div
            key={item.id}
            onMouseDown={(e) => handleDragStart(e, item)}
            onTouchStart={(e) => handleDragStart(e, item)}
            className={`
              w-full h-[56px] bg-white border-2 rounded-xl
              flex items-center justify-center cursor-grab touch-none
              transition-all duration-200 px-3
              ${draggedItem?.id === item.id ? 'opacity-0' : 'opacity-100'}
              border-blue hover:-translate-y-0.5 hover:shadow-card
            `}
          >
            <span className="text-[20px] font-medium text-center leading-tight">{item.name}</span>
          </div>
        ))}

        {placedItem?.zone === 'post-pyloric' && (
          <div className="w-full h-[56px] bg-green-extralight border-2 border-green rounded-xl flex items-center justify-center px-3">
            <span className="text-[20px] font-medium text-black">{placedItem.item.name}</span>
            <span className="ml-2 text-[20px]">&#10003;</span>
          </div>
        )}
      </div>

      {/* Anatomy Diagram */}
      <div
        id="anatomy-area"
        className="flex-1 bg-white rounded-2xl shadow-card relative flex items-center justify-center overflow-hidden"
      >
        <svg width="520" height="480" viewBox="0 0 520 480" className="relative z-10">
          <defs>
            <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5DEB3" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E8C99B" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="esophGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8A0A0" />
              <stop offset="100%" stopColor="#D4817F" />
            </linearGradient>
            <linearGradient id="stomachGrad" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#F2B8A0" />
              <stop offset="50%" stopColor="#E89880" />
              <stop offset="100%" stopColor="#D4817F" />
            </linearGradient>
            <linearGradient id="intestineGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E8A090" />
              <stop offset="100%" stopColor="#D09080" />
            </linearGradient>
            <radialGradient id="stomachInner" cx="0.4" cy="0.4" r="0.6">
              <stop offset="0%" stopColor="#F5C8B0" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E8A090" stopOpacity="0.2" />
            </radialGradient>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.06" />
            </filter>
            <filter id="organGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Rugae pattern for stomach interior */}
            <pattern id="rugae" x="0" y="0" width="20" height="12" patternUnits="userSpaceOnUse">
              <path d="M0 6 Q5 3, 10 6 Q15 9, 20 6" fill="none" stroke="#D09070" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>

          {/* --- TORSO OUTLINE --- */}
          {/* Clean anterior torso, medical illustration style */}
          <g filter="url(#softShadow)">
            {/* Torso - anatomically proportioned, no head/arms, just trunk */}
            <path
              d="M160 30
                 C 140 32, 110 50, 95 80
                 C 78 115, 72 160, 72 200
                 C 72 260, 78 320, 88 370
                 L 92 430 L 100 460
                 L 420 460 L 428 430
                 L 432 370
                 C 442 320, 448 260, 448 200
                 C 448 160, 442 115, 425 80
                 C 410 50, 380 32, 360 30
                 C 330 24, 295 20, 260 20
                 C 225 20, 190 24, 160 30 Z"
              fill="url(#skinGrad)"
              stroke="#D4C4A8"
              strokeWidth="1.2"
            />
            {/* Clavicle lines */}
            <path d="M160 42 Q200 50, 260 48 Q320 50, 360 42" fill="none" stroke="#D4C4A8" strokeWidth="0.8" opacity="0.5" />
            {/* Rib hints - very subtle */}
            <g opacity="0.12" stroke="#C0A888" strokeWidth="0.8" fill="none">
              <path d="M140 90 Q200 100, 260 98 Q320 100, 380 90" />
              <path d="M130 120 Q200 132, 260 130 Q320 132, 390 120" />
              <path d="M125 150 Q200 164, 260 162 Q320 164, 395 150" />
              <path d="M122 180 Q200 196, 260 194 Q320 196, 398 180" />
              <path d="M130 210 Q200 224, 260 222 Q320 224, 390 210" />
            </g>
            {/* Midline */}
            <line x1="260" y1="30" x2="260" y2="460" stroke="#D4C4A8" strokeWidth="0.5" opacity="0.2" />
          </g>

          {/* --- NASAL ENTRY POINT --- */}
          <g opacity="0.7">
            <circle cx="252" cy="14" r="5" fill="#E0C0A0" stroke="#C8A080" strokeWidth="1" />
            <text x="270" y="18" fill="#999" fontSize="10" fontWeight="400">Nasal entry</text>
          </g>

          {/* --- ESOPHAGUS --- */}
          <path
            d="M256 20 C256 40, 254 60, 250 80 C246 100, 240 130, 238 155 C236 170, 234 185, 230 200"
            fill="none"
            stroke="url(#esophGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Esophagus inner lumen */}
          <path
            d="M256 20 C256 40, 254 60, 250 80 C246 100, 240 130, 238 155 C236 170, 234 185, 230 200"
            fill="none"
            stroke="#F5D0C0"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* --- STOMACH --- */}
          <g filter="url(#organGlow)">
            {/* Stomach - realistic J-shape */}
            <path
              d="M230 200
                 C 225 195, 195 195, 180 210
                 C 160 230, 150 260, 155 290
                 C 160 320, 180 345, 210 350
                 C 235 354, 260 348, 278 332
                 C 296 316, 306 292, 300 268
                 C 295 250, 280 238, 268 230
                 C 256 222, 245 215, 240 210
                 C 236 206, 232 203, 230 200 Z"
              fill="url(#stomachGrad)"
              stroke="#C07060"
              strokeWidth="1.5"
              opacity="0.85"
            />
            {/* Stomach rugae texture */}
            <path
              d="M230 200
                 C 225 195, 195 195, 180 210
                 C 160 230, 150 260, 155 290
                 C 160 320, 180 345, 210 350
                 C 235 354, 260 348, 278 332
                 C 296 316, 306 292, 300 268
                 C 295 250, 280 238, 268 230
                 C 256 222, 245 215, 240 210
                 C 236 206, 232 203, 230 200 Z"
              fill="url(#rugae)"
              opacity="0.5"
            />
            {/* Stomach inner highlight */}
            <path
              d="M210 220
                 C 195 235, 175 260, 178 285
                 C 180 305, 195 325, 215 335"
              fill="none"
              stroke="#F5D5C5"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* Greater curvature fold lines */}
            <g opacity="0.2" stroke="#A06050" strokeWidth="0.8" fill="none">
              <path d="M185 225 Q195 240, 175 260" />
              <path d="M175 265 Q170 280, 175 300" />
              <path d="M185 310 Q200 330, 220 340" />
            </g>
            {/* Fundus label */}
            <text x="178" y="228" fill="#A07060" fontSize="9" fontWeight="400" opacity="0.6">Fundus</text>
            {/* Body label */}
            <text x="168" y="280" fill="#A07060" fontSize="9" fontWeight="400" opacity="0.6">Body</text>
          </g>

          {/* --- PYLORUS (gateway between stomach and duodenum) --- */}
          <g opacity="0.7">
            <circle cx="278" cy="335" r="6" fill="#D09080" stroke="#B07060" strokeWidth="1.2" />
            <circle cx="278" cy="335" r="2.5" fill="#F0D0C0" />
          </g>

          {/* --- DUODENUM --- */}
          <path
            d="M278 341
               C 285 355, 300 365, 315 370
               C 340 378, 358 375, 365 360
               C 372 345, 370 325, 358 312
               C 346 300, 330 298, 318 305"
            fill="none"
            stroke="url(#intestineGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.65"
          />
          {/* Duodenum inner */}
          <path
            d="M278 341
               C 285 355, 300 365, 315 370
               C 340 378, 358 375, 365 360
               C 372 345, 370 325, 358 312
               C 346 300, 330 298, 318 305"
            fill="none"
            stroke="#F5D5C5"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* --- JEJUNUM (beginning) --- */}
          <path
            d="M318 305
               C 305 310, 290 325, 285 340
               C 280 360, 290 378, 305 388
               C 320 398, 340 395, 350 385"
            fill="none"
            stroke="url(#intestineGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* --- SUBCLAVIAN VEIN area for parenteral --- */}
          <g opacity="0.5">
            <path
              d="M155 55 C165 50, 175 48, 190 52"
              fill="none"
              stroke="#7090C0"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M155 55 C145 58, 135 65, 130 75"
              fill="none"
              stroke="#7090C0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Small catheter icon */}
            <line x1="140" y1="48" x2="155" y2="55" stroke="#7090C0" strokeWidth="1.5" strokeDasharray="3,2" />
          </g>

          {/* === DROP ZONES === */}

          {/* Gastric Zone — over the stomach */}
          <g data-zone="gastric">
            <rect
              x="148" y="195" width="155" height="162" rx="14"
              fill={getZoneStyle('gastric').bg}
              stroke={getZoneStyle('gastric').border}
              strokeWidth="2"
              strokeDasharray={getZoneDash('gastric')}
              style={{
                transition: 'all 0.25s ease',
                filter: getZoneStyle('gastric').shadow !== 'none' ? `drop-shadow(${getZoneStyle('gastric').shadow})` : 'none'
              }}
            />
          </g>

          {/* Post-pyloric Zone — over duodenum/jejunum */}
          <g data-zone="post-pyloric">
            <rect
              x="275" y="298" width="100" height="100" rx="14"
              fill={getZoneStyle('post-pyloric').bg}
              stroke={getZoneStyle('post-pyloric').border}
              strokeWidth="2"
              strokeDasharray={getZoneDash('post-pyloric')}
              style={{
                transition: 'all 0.25s ease',
                filter: getZoneStyle('post-pyloric').shadow !== 'none' ? `drop-shadow(${getZoneStyle('post-pyloric').shadow})` : 'none'
              }}
            />
            {placedItem?.zone === 'post-pyloric' && (
              <text x="325" y="354" textAnchor="middle" fill="#007DB9" fontSize="12" fontWeight="600">
                {placedItem.item.name}
              </text>
            )}
          </g>

          {/* Parenteral Zone — over subclavian/upper chest */}
          <g data-zone="parenteral">
            <rect
              x="110" y="35" width="85" height="55" rx="12"
              fill={getZoneStyle('parenteral').bg}
              stroke={getZoneStyle('parenteral').border}
              strokeWidth="2"
              strokeDasharray={getZoneDash('parenteral')}
              style={{
                transition: 'all 0.25s ease',
                filter: getZoneStyle('parenteral').shadow !== 'none' ? `drop-shadow(${getZoneStyle('parenteral').shadow})` : 'none'
              }}
            />
          </g>

          {/* === ZONE LABELS with leader lines === */}

          {/* Gastric label */}
          <g>
            <line x1="145" y1="275" x2="85" y2="275" stroke="#999" strokeWidth="0.8" opacity="0.6" />
            <circle cx="85" cy="275" r="2.5" fill="#999" opacity="0.6" />
            <text x="80" y="279" textAnchor="end" fill="#777" fontSize="12" fontWeight="500">Gastric</text>
          </g>

          {/* Post-pyloric label */}
          <g>
            <line x1="378" y1="348" x2="420" y2="348" stroke="#999" strokeWidth="0.8" opacity="0.6" />
            <circle cx="420" cy="348" r="2.5" fill="#999" opacity="0.6" />
            <text x="428" y="352" textAnchor="start" fill="#777" fontSize="12" fontWeight="500">Post-pyloric</text>
          </g>

          {/* Parenteral label */}
          <g>
            <line x1="152" y1="32" x2="152" y2="18" stroke="#999" strokeWidth="0.8" opacity="0.6" />
            <circle cx="152" cy="18" r="2.5" fill="#999" opacity="0.6" />
            <text x="152" y="12" textAnchor="middle" fill="#777" fontSize="12" fontWeight="500">Parenteral (IV)</text>
          </g>

          {/* Anatomical labels */}
          <text x="248" y="140" fill="#B09080" fontSize="10" fontWeight="400" opacity="0.5">Oesophagus</text>
          <text x="282" y="340" fill="#A07060" fontSize="9" fontWeight="400" opacity="0.5">Pylorus</text>
          <text x="368" y="355" fill="#A07060" fontSize="9" fontWeight="400" opacity="0" />

          {/* Instruction */}
          <text x="260" y="472" textAnchor="middle" fill="#BBB" fontSize="12">
            Drag a tube type to the correct placement zone
          </text>
        </svg>
      </div>

      {/* Dragged item overlay */}
      {draggedItem && dragPosition && (
        <div
          className="fixed w-[200px] h-[56px] bg-white border-2 border-blue rounded-xl flex items-center justify-center pointer-events-none z-50 shadow-card-hover px-3"
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
            transform: 'scale(1.08) rotate(2deg)',
          }}
        >
          <span className="text-[20px] font-medium text-center leading-tight">{draggedItem.name}</span>
        </div>
      )}
    </div>
  );
}
