import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function Lightbox({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange,
  title = '',
}) {
  const shouldReduceMotion = useReducedMotion();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchStartRef = useRef(null);
  const touchDistanceRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  const hasMultiple = images.length > 1;

  // Reset zoom & pan when image changes or closes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  // Trap focus and handle escape / arrow keys
  useEffect(() => {
    if (!isOpen) return;

    lastActiveElementRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        e.preventDefault();
        onIndexChange((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        e.preventDefault();
        onIndexChange((currentIndex + 1) % images.length);
      } else if (e.key === 'Tab') {
        // Focus trap
        if (!modalRef.current) return;
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while lightbox is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (lastActiveElementRef.current?.focus) {
        lastActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose, currentIndex, hasMultiple, images.length, onIndexChange]);

  // Scroll wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale((prev) => {
      const next = prev - e.deltaY * 0.002;
      return Math.min(Math.max(1, next), 3.5);
    });
  }, []);

  // Mouse pan when zoomed
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers: pinch-to-zoom & swipe navigation
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    } else if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchDistanceRef.current) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / touchDistanceRef.current;
      setScale((prev) => Math.min(Math.max(1, prev * factor), 3.5));
      touchDistanceRef.current = dist;
    } else if (e.touches.length === 1 && scale > 1 && isDragging) {
      // Pan
      setPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e) => {
    touchDistanceRef.current = null;
    setIsDragging(false);

    // Horizontal swipe detection if not zoomed
    if (scale <= 1 && touchStartRef.current && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      if (deltaTime < 350 && Math.abs(deltaX) > 40 && Math.abs(deltaY) < 60 && hasMultiple) {
        if (deltaX < 0) {
          onIndexChange((currentIndex + 1) % images.length);
        } else {
          onIndexChange((currentIndex - 1 + images.length) % images.length);
        }
      }
    }
    touchStartRef.current = null;
  };

  const toggleZoom = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Jewellery image lightbox"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        className="fixed inset-0 z-50 flex flex-col bg-ink/95 text-ivory select-none"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ivory/15 bg-ink/80 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-brass">
              {title || 'Photograph'}
            </span>
            {hasMultiple && (
              <span className="text-xs text-ivory/60 font-mono">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom controls with 44px touch targets */}
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(3.5, s + 0.5))}
              aria-label="Zoom in"
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-ivory/10 active:scale-95 transition-all"
              title="Zoom in"
            >
              <ZoomIn size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                setScale((s) => {
                  const next = Math.max(1, s - 0.5);
                  if (next === 1) setPosition({ x: 0, y: 0 });
                  return next;
                });
              }}
              aria-label="Zoom out"
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-ivory/10 active:scale-95 transition-all"
              title="Zoom out"
            >
              <ZoomOut size={20} />
            </button>
            {scale > 1 && (
              <button
                type="button"
                onClick={() => {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                aria-label="Reset zoom"
                className="px-3 min-h-[44px] flex items-center justify-center text-brass hover:text-ivory hover:bg-ivory/10 active:scale-95 transition-all text-xs gap-1"
                title="Reset zoom"
              >
                <RotateCcw size={16} /> Reset
              </button>
            )}

            {/* Close button with 44px touch target */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close lightbox (Esc)"
              className="p-2.5 ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-ivory/80 hover:text-ivory hover:bg-ivory/10 active:scale-95 transition-all"
              title="Close (Esc)"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Center viewport */}
        <div
          className="relative flex-1 flex items-center justify-center overflow-hidden p-4 touch-none cursor-default"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={toggleZoom}
        >
          {images[currentIndex] && (
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 200ms ease-out',
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              }}
              className="max-w-full max-h-[85vh] flex items-center justify-center"
            >
              <img
                src={images[currentIndex]}
                alt={title ? `${title} enlarged view` : 'Enlarged jewellery photo'}
                className="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl border border-ivory/10"
                draggable={false}
              />
            </div>
          )}

          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center bg-ink/70 hover:bg-ink border border-ivory/20 text-ivory transition-colors z-10 active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => onIndexChange((currentIndex + 1) % images.length)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center bg-ink/70 hover:bg-ink border border-ivory/20 text-ivory transition-colors z-10 active:scale-95"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Bottom bar caption / instructions */}
        <div className="py-2.5 px-4 text-center border-t border-ivory/15 bg-ink/80 text-xs text-ivory/70 flex flex-wrap justify-between items-center gap-2">
          <span>{title}</span>
          <span className="text-brass">
            Scroll or pinch to zoom · Double-click to toggle · Esc to close
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

