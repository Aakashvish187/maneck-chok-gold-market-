import { useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, List, MessageCircle } from 'lucide-react';
import { useStore } from '../lib/store';
import { waLink, productMessage } from '../lib/whatsapp';
import ProductCard from '../components/ProductCard';

export default function Collections() {
  const { products, categories, shop, viewMode, setViewMode, loading } = useStore();
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || 'all';
  const q = params.get('q') || '';
  const activeChipRef = useRef(null);

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    v && v !== 'all' ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };

  // Auto-scroll active category chip into view
  useEffect(() => {
    if (activeChipRef.current) {
      activeChipRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [cat]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.visible &&
        (cat === 'all' || p.category === cat) &&
        (!s || `${p.name} ${p.code} ${p.description}`.toLowerCase().includes(s))
    );
  }, [products, cat, q]);

  const chip = (active) =>
    `min-h-[44px] px-4 py-2.5 text-sm border whitespace-nowrap snap-start transition-all active:scale-95 flex items-center justify-center font-medium ${
      active
        ? 'bg-ink text-ivory border-ink shadow-sm'
        : 'bg-ivory/80 text-ink/80 border-ink/25 hover:border-burgundy hover:text-burgundy'
    }`;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10 md:pt-14">
      <p className="label">The catalogue</p>
      <h1 className="text-3xl sm:text-5xl md:text-6xl mt-1.5 font-serif">Collections</h1>
      <p className="text-ink/75 mt-2 max-w-xl text-sm sm:text-base leading-relaxed">
        Sample designs for demonstration. Tap any design to enquire on WhatsApp. Prices are{' '}
        {shop.showPrices ? 'shown' : 'hidden'} by the owner's choice.
      </p>

      {/* Sticky Filter & Search Bar under header while scrolling */}
      <div className="sticky top-14 sm:top-16 z-20 bg-ivory/95 backdrop-blur-md py-3 -mx-4 px-4 border-b border-ink/15 shadow-xs mt-4">
        {/* Horizontally scrollable category chips with fade edge cues */}
        <div className="relative">
          <div
            className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-1 px-1"
            role="group"
            aria-label="Filter by category"
          >
            <button
              ref={cat === 'all' ? activeChipRef : null}
              className={chip(cat === 'all')}
              aria-pressed={cat === 'all'}
              onClick={() => set('cat', 'all')}
            >
              All ({products.filter((p) => p.visible).length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                ref={cat === c.id ? activeChipRef : null}
                className={chip(cat === c.id)}
                aria-pressed={cat === c.id}
                onClick={() => set('cat', c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search input & Retailer/Wholesaler View Switch */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 sm:items-center sm:justify-between mt-2.5">
          <label className="relative sm:w-80">
            <span className="sr-only">Search by name or design code</span>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50" aria-hidden="true" />
            <input
              className="field pl-9 !py-2.5 text-base sm:text-sm"
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="Search name or code, e.g. SJ-BG-002"
              value={q}
              onChange={(e) => set('q', e.target.value)}
            />
          </label>

          <div className="flex items-center gap-2 text-sm justify-between sm:justify-end" role="group" aria-label="Catalogue view (demo feature)">
            <span className="text-ink/60 text-xs sm:text-sm">
              View <span className="text-brass">(demo)</span>:
            </span>
            <div className="flex gap-1.5">
              <button
                className={`${chip(viewMode === 'retailer')} !min-h-[44px] !py-2 !px-3 inline-flex items-center gap-1.5 text-xs sm:text-sm`}
                aria-pressed={viewMode === 'retailer'}
                onClick={() => setViewMode('retailer')}
              >
                <LayoutGrid size={15} aria-hidden="true" /> Retailer
              </button>
              <button
                className={`${chip(viewMode === 'wholesaler')} !min-h-[44px] !py-2 !px-3 inline-flex items-center gap-1.5 text-xs sm:text-sm`}
                aria-pressed={viewMode === 'wholesaler'}
                onClick={() => setViewMode('wholesaler')}
              >
                <List size={15} aria-hidden="true" /> Wholesaler
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-8" />

      {loading ? (
        <p className="py-12 text-ink/60">Loading designs…</p>
      ) : list.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-3xl">No designs found</p>
          <p className="text-ink/60 mt-2 text-sm">Try another category or search term.</p>
        </div>
      ) : viewMode === 'retailer' ? (
        /* Retailer View: 2-column grid on mobile, 3 on tablet, 4 on desktop */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-x-4 md:gap-y-10">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        /* Wholesaler View */
        <div>
          {/* Mobile Phone: Stacked compact cards (no horizontal scroll) */}
          <div className="space-y-2.5 sm:hidden">
            <p className="note mb-2 text-base">Wholesaler view: compact list by design code</p>
            {list.map((p) => (
              <div
                key={p.id}
                className="border border-ink/20 p-3 bg-ivory hover:border-burgundy transition-colors flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/product/${encodeURIComponent(p.code)}`}
                      className="font-mono text-xs font-semibold text-brass hover:text-burgundy py-0.5"
                    >
                      {p.code}
                    </Link>
                    <span className="text-[10px] text-ink/50 uppercase tracking-wider truncate">
                      {categories.find((c) => c.id === p.category)?.name}
                    </span>
                  </div>
                  <p className="font-serif text-base leading-snug truncate mt-0.5">{p.name}</p>
                </div>
                <div className="text-right shrink-0">
                  {shop.showPrices && p.price ? (
                    <p className="font-serif text-base font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</p>
                  ) : (
                    <a
                      href={waLink(shop.whatsapp, productMessage(p))}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-burgundy font-medium border border-burgundy/30 px-3 py-2 hover:bg-burgundy hover:text-ivory active:scale-95 transition-all min-h-[44px]"
                    >
                      <MessageCircle size={14} aria-hidden="true" /> Ask
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tablet & Desktop: Structured Table */}
          <div className="hidden sm:block overflow-x-auto">
            <p className="note mb-3">Wholesaler view: compact list by design code</p>
            <table className="w-full text-sm text-left border-t border-ink/30">
              <thead className="text-[11px] uppercase tracking-widest text-brass">
                <tr>
                  <th className="py-3 pr-3">Code</th>
                  <th className="pr-3">Design</th>
                  <th className="pr-3 hidden sm:table-cell">Category</th>
                  <th className="pr-3 hidden md:table-cell">Style</th>
                  <th className="text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-t border-ink/15 hover:bg-paper/60">
                    <td className="py-3 pr-3 whitespace-nowrap font-medium">
                      <Link
                        className="hover:text-burgundy underline-offset-4 hover:underline"
                        to={`/product/${encodeURIComponent(p.code)}`}
                      >
                        {p.code}
                      </Link>
                    </td>
                    <td className="pr-3">{p.name}</td>
                    <td className="pr-3 hidden sm:table-cell text-ink/70">
                      {categories.find((c) => c.id === p.category)?.name}
                    </td>
                    <td className="pr-3 hidden md:table-cell text-ink/70">{p.description}</td>
                    <td className="text-right whitespace-nowrap">
                      {shop.showPrices && p.price ? (
                        `₹${Number(p.price).toLocaleString('en-IN')}`
                      ) : (
                        <span className="text-ink/50">Ask on WhatsApp</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
