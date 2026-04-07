/**
 * SortableImageGrid — A premium drag-and-drop image grid.
 *
 * Uses Pointer Events (works on desktop + touch) with smooth CSS
 * transform-based animations inspired by Apple Photos / Framer Motion.
 *
 * Features:
 *  - Pointer-event based (no HTML5 DnD quirks)
 *  - Lifted card with shadow + scale on drag
 *  - Smooth gap animation as items shift
 *  - Lazy loading + Supabase thumbnail transforms
 *  - Skeleton placeholders while images load
 *  - "Principal" badge on first image
 *  - Delete button on hover
 *  - Drag handle (grip icon)
 *  - Works on mobile without long-press delay
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical, X, Star, ImageIcon } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────

interface SortableImageGridProps {
  images: string[];
  onReorder: (images: string[]) => void;
  onDelete: (url: string) => void;
}

// ─── Thumbnail helper ────────────────────────────────────────────────

/**
 * For Supabase Storage URLs, append render/image/transform params
 * to get a smaller thumbnail. For other URLs, return as-is.
 */
function thumbUrl(url: string, width = 400): string {
  // Supabase storage public URL pattern
  if (url.includes('/storage/v1/object/public/')) {
    // Use Supabase Image Transformation if available
    const transformed = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/',
    );
    const sep = transformed.includes('?') ? '&' : '?';
    return `${transformed}${sep}width=${width}&quality=60&resize=contain`;
  }
  return url;
}

// ─── Skeleton placeholder ─────────────────────────────────────────────

function ImageSkeleton() {
  return (
    <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
      <ImageIcon className="w-6 h-6 text-gray-300" />
    </div>
  );
}

// ─── Single image card ───────────────────────────────────────────────

interface ImageCardProps {
  url: string;
  index: number;
  isFirst: boolean;
  onDelete: (url: string) => void;
  onPointerDown: (index: number, e: React.PointerEvent) => void;
  isDragging: boolean;
  style?: React.CSSProperties;
}

function ImageCard({
  url,
  index,
  isFirst,
  onDelete,
  onPointerDown,
  isDragging,
  style,
}: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`
        relative group aspect-[4/3] rounded-xl overflow-hidden select-none
        transition-shadow duration-200
        ${isDragging
          ? 'z-50 shadow-2xl shadow-black/25 scale-[1.05] ring-2 ring-brand-gold/60'
          : 'shadow-sm hover:shadow-md z-0'
        }
      `}
      style={{
        ...style,
        willChange: isDragging ? 'transform' : 'auto',
        touchAction: 'none',
      }}
      onPointerDown={(e) => onPointerDown(index, e)}
    >
      {/* Skeleton */}
      {!loaded && !error && <ImageSkeleton />}

      {/* Image — lazy loaded with thumbnail transform */}
      <img
        src={thumbUrl(url, 400)}
        alt={`Imagen ${index + 1}`}
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        className={`
          w-full h-full object-cover pointer-events-none
          transition-opacity duration-300
          ${loaded ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-1">
          <ImageIcon className="w-6 h-6 text-gray-300" />
          <span className="font-montserrat text-[10px] text-gray-400">Error</span>
        </div>
      )}

      {/* Hover overlay gradient */}
      <div className={`
        absolute inset-0 pointer-events-none
        bg-gradient-to-t from-black/50 via-transparent to-black/20
        transition-opacity duration-200
        ${isDragging ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'}
      `} />

      {/* Grip handle — top left */}
      <div className={`
        absolute top-2 left-2 w-8 h-8
        bg-white/90 backdrop-blur-md text-gray-600
        rounded-lg flex items-center justify-center
        shadow-sm border border-white/50
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-100 scale-110 bg-brand-gold/90 text-brand-navy' : 'opacity-0 group-hover:opacity-100'}
      `}>
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Index badge — bottom right */}
      <div className={`
        absolute bottom-2 right-2 min-w-[1.75rem] h-7
        bg-black/60 backdrop-blur-md text-white text-xs
        font-montserrat font-bold
        rounded-lg flex items-center justify-center px-2
        transition-all duration-200
        ${isDragging ? 'opacity-0' : ''}
      `}>
        {index + 1}
      </div>

      {/* Delete button — top right */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(url); }}
        className={`
          absolute top-2 right-2 w-8 h-8
          bg-red-500/90 backdrop-blur-md text-white
          rounded-lg flex items-center justify-center
          shadow-sm
          transition-all duration-200 hover:bg-red-600 hover:scale-110
          ${isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
        `}
      >
        <X className="w-4 h-4" />
      </button>

      {/* "Principal" badge — first image */}
      {isFirst && (
        <div className={`
          absolute bottom-2 left-2 flex items-center gap-1
          px-2.5 py-1 bg-brand-gold/95 backdrop-blur-sm
          text-brand-navy text-[11px] font-montserrat font-bold
          rounded-lg shadow-sm
          transition-all duration-200
          ${isDragging ? 'opacity-0' : ''}
        `}>
          <Star className="w-3 h-3" />
          Principal
        </div>
      )}
    </div>
  );
}

// ─── Drop placeholder ────────────────────────────────────────────────

function DropPlaceholder() {
  return (
    <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-brand-gold/40 bg-brand-gold/5 flex items-center justify-center transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center">
        <GripVertical className="w-4 h-4 text-brand-gold/60" />
      </div>
    </div>
  );
}

// ─── Main Grid Component ─────────────────────────────────────────────

export function SortableImageGrid({ images, onReorder, onDelete }: SortableImageGridProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRaf = useRef<number>(0);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const isDragging = dragIdx !== null;

  // We store rects captured at drag-start and only re-read them on scroll.
  // IMPORTANT: We capture the *initial* layout (before any visual reorder)
  // and use original-index-based centers, which never change even when CSS
  // transitions move cards visually. This avoids the feedback loop.
  const originCenters = useRef<Map<number, { cx: number; cy: number }>>(new Map());
  const originSize = useRef<{ w: number; h: number }>({ w: 200, h: 150 });
  const scrollOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Capture card centers at drag start (before visual reorder kicks in)
  const captureOrigins = useCallback(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>('[data-grid-idx]');
    originCenters.current.clear();
    cards.forEach((card) => {
      const idx = Number(card.dataset.gridIdx);
      const r = card.getBoundingClientRect();
      originCenters.current.set(idx, {
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
      });
      originSize.current = { w: r.width, h: r.height };
    });
    scrollStart.current = { x: window.scrollX, y: window.scrollY };
    scrollOffset.current = { x: 0, y: 0 };
  }, []);

  // Find the closest card center to the pointer (stable, no feedback loop)
  const findClosest = useCallback((px: number, py: number): number | null => {
    let best: number | null = null;
    let bestDist = Infinity;
    const sx = scrollOffset.current.x;
    const sy = scrollOffset.current.y;
    for (const [idx, c] of originCenters.current) {
      // Adjust centers by how much the page has scrolled since drag start
      const dx = px - (c.cx - sx);
      const dy = py - (c.cy - sy);
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    }
    return best;
  }, []);

  // ─── Pointer handlers ───────────────────────────────────────────

  const handlePointerDown = useCallback((index: number, e: React.PointerEvent) => {
    // Only primary button
    if (e.button !== 0) return;
    // Don't interfere with delete button
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    captureOrigins();
    const c = originCenters.current.get(index);
    const sz = originSize.current;
    if (c) {
      setOffset({
        x: e.clientX - (c.cx - sz.w / 2),
        y: e.clientY - (c.cy - sz.h / 2),
      });
    }
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setDragIdx(index);
    setOverIdx(index);
    setPointer({ x: e.clientX, y: e.clientY });
  }, [captureOrigins]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragIdx === null) return;
    e.preventDefault();
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPointer({ x: e.clientX, y: e.clientY });
    const over = findClosest(e.clientX, e.clientY);
    if (over !== null) setOverIdx(over);
  }, [dragIdx, findClosest]);

  const handlePointerUp = useCallback(() => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const newImages = [...images];
      const [moved] = newImages.splice(dragIdx, 1);
      newImages.splice(overIdx, 0, moved);
      onReorder(newImages);
    }
    setDragIdx(null);
    setOverIdx(null);
    setPointer(null);
  }, [dragIdx, overIdx, images, onReorder]);

  // Track scroll offset so originCenters stay accurate without re-reading DOM
  useEffect(() => {
    if (dragIdx === null) return;
    const onScroll = () => {
      scrollOffset.current = {
        x: window.scrollX - scrollStart.current.x,
        y: window.scrollY - scrollStart.current.y,
      };
      const p = lastPointer.current;
      if (p) {
        const over = findClosest(p.x, p.y);
        if (over !== null) setOverIdx(over);
      }
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [dragIdx, findClosest]);

  // Auto-scroll when pointer is near top/bottom edge of the viewport
  useEffect(() => {
    if (dragIdx === null) { lastPointer.current = null; return; }
    const EDGE = 80;       // px from top/bottom to start scrolling
    const MAX_SPEED = 18;  // px per frame

    const tick = () => {
      const p = lastPointer.current;
      if (p) {
        const distTop = p.y;
        const distBot = window.innerHeight - p.y;
        let speed = 0;
        if (distTop < EDGE) speed = -MAX_SPEED * (1 - distTop / EDGE);
        else if (distBot < EDGE) speed = MAX_SPEED * (1 - distBot / EDGE);
        if (speed !== 0) window.scrollBy(0, speed);
      }
      autoScrollRaf.current = requestAnimationFrame(tick);
    };
    autoScrollRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(autoScrollRaf.current);
  }, [dragIdx]);

  // Cleanup on unmount
  useEffect(() => {
    const handleGlobalUp = () => {
      if (dragIdx !== null) {
        handlePointerUp();
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [dragIdx, handlePointerUp]);

  // Compute the visual order (what the grid would look like if we dropped now)
  const visualOrder = (() => {
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) {
      return images.map((_, i) => i);
    }
    const order = images.map((_, i) => i).filter(i => i !== dragIdx);
    order.splice(overIdx > dragIdx ? overIdx : overIdx, 0, dragIdx);
    return order;
  })();

  // Calculate drag overlay position
  const dragOverlayStyle: React.CSSProperties | undefined =
    isDragging && pointer
      ? {
          position: 'fixed',
          left: pointer.x - offset.x,
          top: pointer.y - offset.y,
          width: originSize.current.w,
          height: originSize.current.h,
          pointerEvents: 'none',
          zIndex: 9999,
        }
      : undefined;

  return (
    <div className="space-y-3">
      <p className="font-montserrat text-xs text-gray-400 flex items-center gap-1.5">
        <GripVertical className="w-3.5 h-3.5" />
        Arrastra para reordenar · La primera imagen será la portada
      </p>

      <div
        ref={containerRef}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: isDragging ? 'none' : 'auto' }}
      >
        {visualOrder.map((originalIdx, visualPos) => {
          const url = images[originalIdx];
          const isTheDraggedItem = originalIdx === dragIdx;

          // The display index after potential reorder
          const displayIdx = visualPos;

          if (isTheDraggedItem && isDragging) {
            // Leave a placeholder in the grid
            return (
              <div key={`placeholder-${originalIdx}`} data-grid-idx={originalIdx}>
                <DropPlaceholder />
              </div>
            );
          }

          return (
            <div
              key={url + originalIdx}
              data-grid-idx={originalIdx}
              className="transition-all duration-300 ease-out"
            >
              <ImageCard
                url={url}
                index={displayIdx}
                isFirst={displayIdx === 0}
                onDelete={onDelete}
                onPointerDown={handlePointerDown}
                isDragging={false}
              />
            </div>
          );
        })}
      </div>

      {/* Floating drag overlay */}
      {isDragging && pointer && dragIdx !== null && (
        <div style={dragOverlayStyle}>
          <ImageCard
            url={images[dragIdx]}
            index={overIdx ?? dragIdx}
            isFirst={(overIdx ?? dragIdx) === 0}
            onDelete={() => {}}
            onPointerDown={() => {}}
            isDragging={true}
          />
        </div>
      )}
    </div>
  );
}
