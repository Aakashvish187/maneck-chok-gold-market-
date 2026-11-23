import { useEffect, useState, lazy, Suspense } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home as HomeIcon, LayoutGrid, MessageCircle, Phone, Play, X, Download } from 'lucide-react';
import { useStore } from '../lib/store';
import { waLink, generalMessage } from '../lib/whatsapp';
import { Ornament } from './Illustrations';

// Code-split Walkthrough modal
const Walkthrough = lazy(() => import('./Walkthrough'));

const links = [
  ['/', 'Home'],
  ['/collections', 'Collections'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
];

export default function Layout() {
  const [tour, setTour] = useState(false);
  const [showPwaHint, setShowPwaHint] = useState(false);
  const { shop, isDemo } = useStore();
  const { pathname } = useLocation();

  useEffect(() => {
    const openTour = () => setTour(true);
    window.addEventListener('open-tour', openTour);
    return () => window.removeEventListener('open-tour', openTour);
  }, []);

  // Check second visit for PWA Add to Home Screen banner
  useEffect(() => {
    try {
      const visits = parseInt(localStorage.getItem('sj_visit_count') || '1', 10);
      const dismissed = localStorage.getItem('sj_pwa_dismissed') === 'true';
      if (visits >= 2 && !dismissed) {
        setShowPwaHint(true);
      }
    } catch {}
  }, []);

  const dismissPwaHint = () => {
    setShowPwaHint(false);
    try {
      localStorage.setItem('sj_pwa_dismissed', 'true');
    } catch {}
  };

  const navCls = ({ isActive }) =>
    `min-h-[44px] px-3 py-2 text-sm tracking-wide inline-flex items-center transition-colors ${
      isActive ? 'text-burgundy border-b-2 border-burgundy font-medium' : 'text-ink/80 hover:text-burgundy'
    }`;

  // WhatsApp link
  const wa = waLink(shop.whatsapp, generalMessage);
  const showFloatingWa = pathname === '/' || pathname === '/collections';

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col pb-20 md:pb-0">
      {/* Demo strip */}
      <div className="bg-ink text-ivory text-[11px] tracking-[0.14em] uppercase">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 min-h-[36px]">
          <span className="truncate">Demo by LacsoHub · Sample designs only</span>
          <button
            onClick={() => setTour(true)}
            className="inline-flex items-center gap-1.5 text-brass hover:text-ivory shrink-0 min-h-[36px] py-1 px-2"
            aria-label="Start 60-second tour"
          >
            <Play size={12} aria-hidden="true" /> 60-sec tour
          </button>
        </div>
      </div>

      {/* Header: compact on mobile with shop name, no hamburger needed because of bottom thumb bar */}
      <header className="border-b border-ink/20 sticky top-0 z-30 bg-ivory/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="leading-none py-1">
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wide block">{shop.name}</span>
            <span className="block text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-brass mt-0.5">
              {shop.tagline}
            </span>
          </Link>

          {/* Desktop navbar */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Desktop navigation">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={navCls}>
                {label}
              </NavLink>
            ))}
            <a href={wa} target="_blank" rel="noreferrer" className="btn btn-ink !py-2.5 !px-4">
              <MessageCircle size={16} aria-hidden="true" /> WhatsApp
            </a>
          </nav>

          {/* Mobile top quick link to WhatsApp */}
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-burgundy font-medium border border-burgundy/30 min-h-[44px] min-w-[44px]"
            aria-label="Enquire on WhatsApp"
          >
            <MessageCircle size={15} aria-hidden="true" /> WhatsApp
          </a>
        </div>
      </header>

      {/* PWA Add to Home Screen Banner (shown on 2nd visit) */}
      {showPwaHint && (
        <aside
          role="region"
          aria-label="Add to home screen notice"
          className="bg-paper border-b border-ink/20 px-4 py-2.5 text-xs flex items-center justify-between gap-3 text-ink/80 z-20"
        >
          <div className="flex items-center gap-2">
            <Download size={14} className="text-burgundy shrink-0" aria-hidden="true" />
            <span>Add Shree Jewellers to your phone home screen for quick catalogue access.</span>
          </div>
          <button
            onClick={dismissPwaHint}
            className="p-1.5 text-ink/60 hover:text-ink min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1" key={pathname}>
        <Outlet />
      </main>

      {/* Floating WhatsApp button on Home & Collections (small, ergonomic, not covering content) */}
      {showFloatingWa && (
        <aside
          aria-label="Quick WhatsApp contact"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-8 right-3.5 md:right-8 z-30"
        >
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with jeweller on WhatsApp"
            className="flex items-center gap-2 bg-[#25D366] text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all text-xs font-medium min-h-[44px] border border-white/20"
          >
            <MessageCircle size={18} fill="currentColor" aria-hidden="true" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </aside>
      )}

      {/* Footer */}
      <footer className="border-t border-ink/20 mt-16 md:mt-20 bg-ivory">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="font-serif text-2xl">{shop.name}</p>
            <p className="text-sm text-ink/75 mt-2 leading-relaxed">{shop.address}</p>
          </div>
          <nav className="space-y-1" aria-label="Footer quick links">
            <p className="label mb-2">Explore</p>
            {links.map(([to, label]) => (
              <Link key={to} to={to} className="block py-2 text-sm hover:text-burgundy min-h-[44px] flex items-center">
                {label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="block py-2 text-sm text-brass hover:text-burgundy min-h-[44px] flex items-center"
            >
              Admin preview (demo)
            </Link>
          </nav>
          <div className="space-y-2 text-sm">
            <p className="label">Enquiries</p>
            <p className="text-ink/75 leading-relaxed">
              Browse, pick a design and message us on WhatsApp. No online cart, no sign-up.
            </p>
            <p className="text-xs text-ink/55 pt-2">All designs shown are demo samples.</p>
          </div>
        </div>
        <Ornament className="w-40 mx-auto opacity-70" />
        <p className="text-center text-xs text-ink/60 py-6 px-4">
          {isDemo ? 'Local demo mode. ' : ''}Demo catalogue by LacsoHub. Designs shown are samples, not real stock.
        </p>
      </footer>

      {/* Thumb-Zone Fixed Bottom Navigation (Mobile Only, 44px+ touch targets) */}
      <nav
        aria-label="Mobile thumb navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-ink/20 pb-[env(safe-area-inset-bottom,0px)] md:hidden shadow-lg"
      >
        <div className="grid grid-cols-4 h-14 items-center">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full min-h-[48px] py-1 text-[11px] transition-colors ${
                isActive ? 'text-burgundy font-semibold' : 'text-ink/70 hover:text-ink'
              }`
            }
          >
            <HomeIcon size={19} aria-hidden="true" />
            <span className="mt-0.5">Home</span>
          </NavLink>

          <NavLink
            to="/collections"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full min-h-[48px] py-1 text-[11px] transition-colors ${
                isActive ? 'text-burgundy font-semibold' : 'text-ink/70 hover:text-ink'
              }`
            }
          >
            <LayoutGrid size={19} aria-hidden="true" />
            <span className="mt-0.5">Designs</span>
          </NavLink>

          {/* Highlighted WhatsApp Tab in Thumb Center */}
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="flex flex-col items-center justify-center h-full min-h-[48px] py-1 text-[11px] text-ivory bg-burgundy hover:bg-burgundy/90 active:scale-95 transition-all shadow-inner"
          >
            <MessageCircle size={20} aria-hidden="true" />
            <span className="mt-0.5 font-medium">WhatsApp</span>
          </a>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full min-h-[48px] py-1 text-[11px] transition-colors ${
                isActive ? 'text-burgundy font-semibold' : 'text-ink/70 hover:text-ink'
              }`
            }
          >
            <Phone size={19} aria-hidden="true" />
            <span className="mt-0.5">Contact</span>
          </NavLink>
        </div>
      </nav>

      {/* 60-second Walkthrough */}
      {tour && (
        <Suspense fallback={null}>
          <Walkthrough onClose={() => setTour(false)} />
        </Suspense>
      )}
    </div>
  );
}
