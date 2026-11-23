import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Share2, Maximize2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { waLink, productMessage, productUrl } from '../lib/whatsapp';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import Lightbox from '../components/Lightbox';
import { Arrow } from '../components/Illustrations';

export default function Product() {
  const { code } = useParams();
  const { products, categories, shop, loading } = useStore();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const galleryRef = useRef(null);
  const enquireBtnRef = useRef(null);

  // Sticky WhatsApp bar appears when main Enquire button scrolls out of view
  useEffect(() => {
    const el = enquireBtnRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-8 md:pt-12 animate-pulse" role="status" aria-label="Loading design details">
        <div className="h-4 w-24 bg-ink/10 rounded mb-4" />
        <div className="grid md:grid-cols-12 gap-5 md:gap-12 items-start">
          <div className="md:col-span-7">
            <div className="border border-ink/20 p-2 sm:p-2.5 bg-ivory">
              <div className="aspect-[4/5] max-w-[224px] sm:max-w-none w-full mx-auto bg-ink/10" />
            </div>
          </div>
          <div className="md:col-span-5 space-y-4">
            <div className="h-8 w-3/4 bg-ink/10 rounded" />
            <div className="h-4 w-1/3 bg-ink/10 rounded" />
            <div className="h-20 w-full bg-ink/10 rounded" />
            <div className="h-12 w-full bg-ink/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const p = products.find((x) => x.code === decodeURIComponent(code) && x.visible);
  if (!p) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif">Design not found</h1>
        <p className="text-ink/60 mt-2 text-sm">It may have been hidden by the shop owner.</p>
        <Link to="/collections" className="btn btn-ink mt-6">
          Back to collection
        </Link>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === p.category);
  const related = products.filter((x) => x.visible && x.category === p.category && x.id !== p.id).slice(0, 4);
  const specs = Object.entries(p.specs || {}).filter(([, v]) => v);

  const share = async () => {
    const url = productUrl(p.code);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${p.name} · ${shop.name}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      /* user cancelled */
    }
  };

  const images = p.images?.length > 0 ? p.images : [''];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-8 md:pt-12">
      <Link
        to={`/collections${cat ? `?cat=${cat.id}` : ''}`}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-ink/70 hover:text-burgundy min-h-[44px]"
      >
        <ArrowLeft size={16} aria-hidden="true" /> {cat?.name || 'Collection'}
      </Link>

      <div className="grid md:grid-cols-12 gap-5 md:gap-12 mt-2 sm:mt-6 items-start">
        {/* Images Column */}
        <div className="md:col-span-7">
          {/* Main swipeable gallery for mobile / sharp container for desktop */}
          <div className="relative border border-ink/30 p-2 sm:p-2.5 bg-ivory">
            <div
              ref={galleryRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                const newIdx = Math.round(scrollLeft / width);
                if (newIdx !== active && newIdx < images.length) {
                  setActive(newIdx);
                }
              }}
            >
              {images.map((src, i) => (
                <div key={i} className="w-full shrink-0 snap-center">
                  <button
                    type="button"
                    onClick={() => p.images?.length > 0 && setLightboxOpen(true)}
                    aria-label={`Enlarge photo of ${p.name}`}
                    className="block w-full text-left relative cursor-zoom-in focus-visible:outline-burgundy"
                  >
                    <ProductImage
                      product={p}
                      src={src}
                      large
                      priority={i === 0}
                      sizes="(max-width: 640px) 224px, (max-width: 1024px) 50vw, 600px"
                      className="aspect-[4/5] max-w-[224px] sm:max-w-none w-full mx-auto"
                      imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transform-none"
                    />
                    {p.images?.length > 0 && (
                      <span className="absolute bottom-2.5 right-2.5 bg-ink/85 text-ivory text-[10px] uppercase tracking-widest px-2.5 py-1 border border-brass/40 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <Maximize2 size={12} aria-hidden="true" /> Zoom
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile swipe dots indicator */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2 sm:hidden" aria-hidden="true">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active ? 'w-4 bg-burgundy' : 'w-1.5 bg-ink/25'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop thumbnails (Hidden on phones as requested) */}
          {images.length > 1 && (
            <div className="hidden sm:flex gap-2 mt-3" aria-label="Image thumbnails">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === active}
                  className={`w-16 h-20 border p-0.5 transition-colors min-h-[44px] min-w-[44px] ${
                    i === active ? 'border-burgundy' : 'border-ink/25 hover:border-ink/60'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover [object-position:center_35%]" />
                </button>
              ))}
            </div>
          )}

          {/* Fullscreen Lightbox Modal */}
          <Lightbox
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            images={p.images || []}
            currentIndex={active}
            onIndexChange={setActive}
            title={`${p.name} (${p.code})`}
          />
        </div>

        {/* Product Details Column */}
        <div className="md:col-span-5">
          <p className="label text-xs">
            {cat?.name}
            {p.is_sample ? ' · Sample design' : ''}
          </p>
          <h1 className="text-2.5xl sm:text-4xl md:text-5xl mt-1 sm:mt-2 leading-tight font-serif font-medium">
            {p.name}
          </h1>
          <p className="mt-1.5 tracking-[0.2em] text-xs sm:text-sm text-brass font-mono font-medium">
            DESIGN CODE · {p.code}
          </p>

          {shop.showPrices && p.price ? (
            <p className="font-serif text-2xl sm:text-3xl mt-3 font-semibold">
              ₹{Number(p.price).toLocaleString('en-IN')}
            </p>
          ) : null}

          {/* Primary WhatsApp Enquiry Button - visible without scrolling on 360x640 */}
          <div ref={enquireBtnRef} className="mt-4 sm:mt-6">
            <a
              href={waLink(shop.whatsapp, productMessage(p))}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ink w-full !py-3 sm:!py-3.5 text-sm sm:text-base font-semibold shadow-sm min-h-[48px]"
            >
              <MessageCircle size={18} aria-hidden="true" /> Enquire on WhatsApp
            </a>
            <div className="flex items-center gap-2 mt-2">
              <Arrow className="w-8 sm:w-10" flip />
              <span className="note text-sm sm:text-base">opens WhatsApp with this design filled in</span>
            </div>
          </div>

          {/* Share this design button with Web Share API and clipboard fallback */}
          <button
            onClick={share}
            className="btn btn-line w-full mt-3 !py-2.5 text-xs flex items-center justify-center gap-2 min-h-[44px]"
            aria-label="Share this design"
          >
            <Share2 size={15} aria-hidden="true" />
            {copied ? 'Link copied to clipboard!' : 'Share this design'}
          </button>

          {p.description && <p className="mt-4 sm:mt-5 text-sm sm:text-base text-ink/80 leading-relaxed">{p.description}</p>}

          {/* Specs in a clean, readable list */}
          {specs.length > 0 && (
            <dl className="mt-5 sm:mt-6 border-t border-ink/25 text-xs sm:text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-2 py-2.5 sm:py-3 border-b border-ink/15">
                  <dt className="text-ink/60 font-medium">{k}</dt>
                  <dd className="col-span-2 text-ink/90">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {!shop.whatsapp && (
            <p className="text-[11px] text-ink/55 mt-3">
              Demo: no shop number is set, so WhatsApp will ask you to pick a contact. The owner sets the number in
              Admin.
            </p>
          )}
        </div>
      </div>

      {/* Sticky Bottom "Enquire on WhatsApp" bar (appears when main Enquire button is scrolled out of view) */}
      {showStickyBar && (
        <div
          role="region"
          aria-label="Sticky WhatsApp action"
          className="fixed bottom-0 left-0 right-0 z-50 bg-ivory/95 backdrop-blur-md border-t border-ink/25 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-xl flex items-center justify-between gap-3 md:hidden"
        >
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase tracking-widest text-brass font-mono block truncate">
              {p.code}
            </span>
            <p className="font-serif text-base leading-tight truncate text-ink">{p.name}</p>
          </div>
          <a
            href={waLink(shop.whatsapp, productMessage(p))}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ink !py-2.5 !px-4 text-xs font-semibold shrink-0 min-h-[44px]"
          >
            <MessageCircle size={16} aria-hidden="true" /> Enquire
          </a>
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-12 sm:mt-20">
          <h2 className="text-2xl sm:text-3xl font-serif">More {cat?.name}</h2>
          <div className="rule mt-3 sm:mt-4 mb-6 sm:mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-x-4 md:gap-y-10">
            {related.map((r, i) => (
              <ProductCard key={r.id} product={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
