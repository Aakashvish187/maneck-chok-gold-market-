import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

const STEP_SECONDS = 12; // 5 steps x 12s = 60 seconds
const STEPS = [
  {
    title: '1. One link for every design',
    body: 'The owner shares a single link with buyers. No app to install and no sign-up for customers.',
    to: '/',
  },
  {
    title: '2. Browse the collection',
    body: 'Six categories, search and filters. Switch between Retailer (photo grid) and Wholesaler (quick list) views.',
    to: '/collections',
  },
  {
    title: '3. Open a design',
    body: 'Every design has a unique code, photo and details. Prices stay hidden unless the owner chooses to show them.',
    to: '/collections',
  },
  {
    title: '4. Enquire on WhatsApp',
    body: 'One tap opens WhatsApp with the design name, code and link already typed. The customer enquires; nothing is bought online.',
    to: '/collections',
  },
  {
    title: '5. Owner updates it',
    body: 'In the admin preview the owner adds designs, uploads photos, hides items and features favourites. Demo password: demo1234.',
    to: '/admin',
  },
];

export default function Walkthrough({ onClose }) {
  const [i, setI] = useState(0);
  const [sec, setSec] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const touchStartYRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (sec >= STEP_SECONDS) {
      if (i < STEPS.length - 1) {
        setI(i + 1);
        setSec(0);
      }
    }
  }, [sec, i]);

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  // Touch gesture to swipe down bottom sheet
  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartYRef.current === null) return;
    const dy = e.touches[0].clientY - touchStartYRef.current;
    if (dy > 0) {
      setTranslateY(dy);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 80) {
      onClose();
    } else {
      setTranslateY(0);
    }
    touchStartYRef.current = null;
  };

  const go = (n) => {
    setI(n);
    setSec(0);
  };
  const s = STEPS[i];
  const pct = ((i * STEP_SECONDS + Math.min(sec, STEP_SECONDS)) / (STEPS.length * STEP_SECONDS)) * 100;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="60-second demo walkthrough"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{ transform: `translateY(${translateY}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-ivory border-t sm:border border-ink w-full sm:max-w-md p-6 rounded-t-2xl sm:rounded-none relative shadow-2xl transition-transform pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1 bg-ink/20 rounded-full mx-auto mb-3 sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink/70 hover:text-ink active:scale-95"
          aria-label="Close walkthrough"
        >
          <X size={20} />
        </button>

        <p className="label">Demo walkthrough · about 60 seconds</p>
        <h2 className="text-2xl mt-2 font-serif">{s.title}</h2>
        <p className="mt-3 text-ink/80 leading-relaxed min-h-[5rem] text-sm">{s.body}</p>

        {/* Progress bar */}
        <div className="h-1 bg-ink/15 mt-4 relative overflow-hidden rounded-full">
          <div className="absolute left-0 top-0 bottom-0 bg-burgundy transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex items-center justify-between mt-6 pt-2">
          <button
            className="btn btn-line !py-2.5 !px-3.5 min-h-[44px] min-w-[44px]"
            disabled={i === 0}
            onClick={() => go(i - 1)}
            aria-label="Previous step"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            className="text-sm underline underline-offset-4 hover:text-burgundy min-h-[44px] px-2 flex items-center font-medium"
            onClick={() => {
              nav(s.to);
              onClose();
            }}
          >
            Show me this
          </button>

          {i < STEPS.length - 1 ? (
            <button
              className="btn btn-ink !py-2.5 !px-4 min-h-[44px] min-w-[44px]"
              onClick={() => go(i + 1)}
              aria-label="Next step"
            >
              <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-ink !py-2.5 !px-5 min-h-[44px]" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
