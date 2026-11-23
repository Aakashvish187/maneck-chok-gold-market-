import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { MessageCircle, ArrowRight, Play } from 'lucide-react';
import { useStore } from '../lib/store';
import { waLink, generalMessage } from '../lib/whatsapp';
import { Skyline, Arrow, CategorySketch, Tools, Ornament } from '../components/Illustrations';
import ProductCard from '../components/ProductCard';
import { PHOTO_PLACEHOLDERS } from '../data/photoPlaceholders';

export default function Home() {
  const { shop, categories, products, loading } = useStore();
  const visible = products.filter((p) => p.visible);
  const featured = visible.filter((p) => p.featured).slice(0, 6);
  const wa = waLink(shop.whatsapp, generalMessage);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);

  const heroRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 30]);

  return (
    <>
      {/* HERO: Optimized for mobile one-handed viewing so headline, gujarati & buttons are visible in first screen */}
      <section className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10 md:pt-16">
        <div className="grid md:grid-cols-12 gap-6 md:gap-12 items-center">
          <motion.div
            className="md:col-span-7 order-1"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          >
            <p className="label">Est. in Manek Chowk · Ahmedabad</p>
            <h1 className="text-[clamp(1.85rem,5.5vw,4.5rem)] leading-[1.06] mt-2 font-medium">
              Jewellery Worth Admiring. <em className="text-burgundy">Collections Worth Sharing.</em>
            </h1>
            <p lang="gu" className="font-gujarati text-base sm:text-lg md:text-xl mt-3 text-ink/85">
              તમારી દરેક ડિઝાઇન, હવે એક જ લિંકમાં.
            </p>

            <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Link to="/collections" className="btn btn-ink w-full sm:w-auto">
                View Collection <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a href={wa} target="_blank" rel="noreferrer" className="btn btn-line w-full sm:w-auto">
                <MessageCircle size={16} aria-hidden="true" /> Enquire on WhatsApp
              </a>
            </div>

            <div className="mt-3.5 sm:mt-6 flex items-center gap-2">
              <Arrow className="w-12 sm:w-14 -rotate-6" />
              <span className="note">tap here, we reply on WhatsApp</span>
            </div>
          </motion.div>

          <motion.figure
            ref={heroRef}
            className="md:col-span-5 order-2 max-w-[340px] mx-auto md:max-w-none w-full"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: 0.1 }}
          >
            <motion.div
              style={shouldReduceMotion ? {} : { y: heroY }}
              className="relative border border-ink p-2 sm:p-2.5 bg-ivory rotate-[1deg] shadow-sm"
            >
              {shop.heroImage && !heroFailed ? (
                <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                  {/* Micro-placeholder for blur-up */}
                  {PHOTO_PLACEHOLDERS[shop.heroImage] && (
                    <img
                      src={PHOTO_PLACEHOLDERS[shop.heroImage]}
                      alt=""
                      aria-hidden="true"
                      width="24"
                      height="30"
                      className={`absolute inset-0 w-full h-full object-cover [object-position:center_35%] filter blur-sm transition-opacity duration-700 motion-reduce:hidden ${
                        heroLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                      }`}
                    />
                  )}

                  {/* Sharp Hero Image with high fetch priority and responsive srcset */}
                  <img
                    src={shop.heroImage}
                    srcSet="/photos/hero-400.webp 400w, /photos/hero-800.webp 800w, /photos/hero.webp 1000w"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                    alt="Gold necklace from the Shree Jewellers collection"
                    width="400"
                    height="500"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onLoad={() => setHeroLoaded(true)}
                    onError={() => setHeroFailed(true)}
                    className={`w-full h-full object-cover [object-position:center_35%] transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                      heroLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Soft paper-grain overlay - maintains natural gold tone */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .36  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .15 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
                    }}
                    aria-hidden="true"
                  />

                  {/* Hand-drawn thin sketch frame */}
                  <svg
                    className="pointer-events-none absolute inset-0 w-full h-full z-10"
                    viewBox="0 0 100 125"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M 2 2 C 25 1.2, 75 2.8, 98 1.8 C 98.8 25, 97.4 85, 98.2 123 C 75 123.8, 25 122.2, 1.8 123 C 1.2 85, 2.8 25, 2 2 Z"
                      fill="none"
                      stroke="#24211E"
                      strokeWidth="0.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.85"
                    />
                    <path
                      d="M 3.2 3.2 C 28 2.5, 72 3.8, 96.8 3 C 97.5 28, 96.2 82, 96.8 121.8 C 72 122.5, 28 121.2, 3.2 121.8 C 2.5 82, 3.8 28, 3.2 3.2 Z"
                      fill="none"
                      stroke="#855F26"
                      strokeWidth="0.45"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.65"
                    />
                  </svg>
                </div>
              ) : (
                <div className="aspect-[4/5] bg-paper flex flex-col items-center justify-center text-center px-4">
                  <CategorySketch category="necklaces" className="w-3/4" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55 mt-2">Hero photo placeholder</p>
                  <p className="text-xs text-ink/55 mt-1">Add a licensed gold necklace photograph in Admin &gt; Shop info</p>
                </div>
              )}
            </motion.div>
            <figcaption className="note mt-2 text-right text-base sm:text-xl">Fig. 1, a necklace from the collection</figcaption>
          </motion.figure>
        </div>
        <Skyline className="w-full mt-8 md:mt-10 opacity-80" />
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 mt-12 md:mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label">Browse by type</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl mt-1.5 font-serif">Six kinds of gold</h2>
          </div>
          <Link to="/collections" className="text-sm underline underline-offset-4 hover:text-burgundy min-h-[44px] flex items-center">
            All designs
          </Link>
        </div>
        <div className="rule mt-4 sm:mt-6" />
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-px bg-ink/20 border-x border-b border-ink/20">
          {categories.map((c) => {
            const tilePhoto = products.find((p) => p.category === c.id && p.images?.length > 0)?.images?.[0];
            return (
              <li key={c.id} className="bg-ivory relative overflow-hidden group">
                <Link
                  to={`/collections?cat=${c.id}`}
                  className="block p-3 sm:p-5 md:p-7 relative h-full flex flex-col justify-between hover:bg-paper transition-colors focus-visible:outline-burgundy"
                >
                  {tilePhoto && (
                    <div className="relative aspect-[16/10] w-full mb-3 overflow-hidden border border-ink/20 bg-paper">
                      {PHOTO_PLACEHOLDERS[tilePhoto] && (
                        <img
                          src={PHOTO_PLACEHOLDERS[tilePhoto]}
                          alt=""
                          aria-hidden="true"
                          width="24"
                          height="15"
                          className="absolute inset-0 w-full h-full object-cover [object-position:center_35%] filter blur-sm"
                        />
                      )}
                      <img
                        src={tilePhoto.replace(/\.webp$/, '-400.webp')}
                        alt=""
                        loading="lazy"
                        width="400"
                        height="250"
                        className="w-full h-full object-cover [object-position:center_35%] transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
                      />
                      {/* Duotone ink overlay that clears on hover/tap */}
                      <div
                        className="absolute inset-0 bg-ink/65 mix-blend-multiply transition-opacity duration-500 ease-out group-hover:opacity-0 group-active:opacity-0 motion-reduce:opacity-0"
                        aria-hidden="true"
                      />
                      <div
                        className="absolute inset-0 bg-[#855F26]/20 mix-blend-color transition-opacity duration-500 ease-out group-hover:opacity-0 group-active:opacity-0 motion-reduce:opacity-0"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  <div>
                    <CategorySketch
                      category={c.id}
                      className="w-14 sm:w-16 md:w-20 h-auto opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <p className="font-serif text-xl sm:text-2xl mt-2 group-hover:text-burgundy transition-colors">{c.name}</p>
                    <p lang="gu" className="font-gujarati text-xs sm:text-sm text-ink/60">{c.gu}</p>
                    <p className="text-[11px] sm:text-xs text-ink/50 mt-1">
                      {visible.filter((p) => p.category === c.id).length} designs
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* FEATURED: Swipeable carousel on mobile, 3-column grid on desktop */}
      <section className="max-w-6xl mx-auto px-4 mt-12 md:mt-24">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="label">Owner's picks</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl mt-1.5 font-serif">Featured designs</h2>
          </div>
          <span className="note text-sm hidden xs:inline sm:hidden">swipe →</span>
        </div>
        <div className="rule mt-4 sm:mt-6 mb-6 sm:mb-8" />
        {loading ? (
          <p className="text-ink/60">Loading…</p>
        ) : featured.length ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-3 -mx-4 px-4 scrollbar-none md:grid md:grid-cols-3 md:gap-x-4 md:gap-y-10 md:mx-0 md:px-0">
            {featured.map((p, i) => (
              <div key={p.id} className="w-[72vw] max-w-[270px] shrink-0 snap-center md:w-auto md:max-w-none">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink/60">No featured designs yet. The owner can mark favourites in Admin.</p>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 mt-12 md:mt-24">
        <div className="border border-ink/30 p-5 sm:p-8 md:p-12 grid md:grid-cols-12 gap-6 md:gap-8 bg-paper/50">
          <div className="md:col-span-5">
            <p className="label">How enquiries work</p>
            <h2 className="text-2xl sm:text-4xl mt-2 font-serif">Look here. Ask on WhatsApp. Buy in the shop.</h2>
            <p className="note mt-3">No cart. No payment. No sign-up.</p>
            <Tools className="w-56 sm:w-64 mt-4 sm:mt-6 opacity-80" />
          </div>
          <ol className="md:col-span-7 space-y-4 sm:space-y-6">
            {[
              ['Browse', 'Open the shared link and look through designs by category or code.'],
              ['Tap Enquire', 'The design name, code and link are filled into a WhatsApp message for you.'],
              ['Talk to the shop', 'The jeweller replies directly with details. Everything else happens at the counter, as always.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3 sm:gap-4">
                <span className="font-serif text-3xl sm:text-4xl text-brass leading-none w-7 sm:w-8">{i + 1}</span>
                <div>
                  <p className="font-serif text-xl sm:text-2xl">{t}</p>
                  <p className="text-sm text-ink/75 mt-1 leading-relaxed">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-center text-sm mt-6 text-ink/70">
          Seeing this for the first time? Try the{' '}
          <button
            className="underline underline-offset-4 hover:text-burgundy inline-flex items-center gap-1 min-h-[44px] py-1"
            onClick={() => window.dispatchEvent(new Event('open-tour'))}
            aria-label="Open 60-second tour"
          >
            <Play size={12} aria-hidden="true" />
            60-second tour
          </button>
          .
        </p>
      </section>

      {/* SHOP DETAILS */}
      <section className="max-w-6xl mx-auto px-4 mt-12 md:mt-24 text-center">
        <Ornament className="w-36 sm:w-40 mx-auto" />
        <h2 className="text-3xl sm:text-4xl mt-4 font-serif">Visit the shop</h2>
        <p className="mt-2.5 text-sm sm:text-base text-ink/75">{shop.address}</p>
        <p className="text-sm sm:text-base text-ink/75 mt-1">{shop.hours}</p>
        <Link to="/contact" className="btn btn-line mt-5 sm:mt-6">
          Contact details
        </Link>
      </section>
    </>
  );
}
