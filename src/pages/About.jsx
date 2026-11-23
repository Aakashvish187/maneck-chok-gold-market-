import { useState } from 'react';
import { useStore } from '../lib/store';
import { JaliWindow, Tools, Skyline, Ornament } from '../components/Illustrations';
import { PHOTO_PLACEHOLDERS } from '../data/photoPlaceholders';

export default function About() {
  const { shop } = useStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10 md:pt-14 pb-12">
      <p className="label">About the shop</p>
      <h1 className="text-3xl sm:text-5xl md:text-6xl mt-1.5 font-serif">{shop.name}</h1>
      <div className="rule mt-4 sm:mt-8" />

      <div className="grid md:grid-cols-12 gap-8 md:gap-10 mt-6 sm:mt-10 items-start">
        <div className="md:col-span-7">
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-ink/90">{shop.about}</p>
          <p className="note mt-4 sm:mt-6 text-base sm:text-xl">The owner edits this text in Admin &gt; Shop info.</p>

          <h2 className="text-2xl sm:text-3xl mt-10 sm:mt-14 font-serif">The craft</h2>
          <p className="mt-3 text-sm sm:text-base text-ink/80 leading-relaxed">
            Gold jewellery is shaped by hand: melting, drawing wire, hammering, carving, setting and polishing. This
            catalogue is built to show that work clearly and let the shop speak for itself when you enquire.
          </p>
          <ol className="mt-5 sm:mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-4 text-xs sm:text-sm">
            {['Design and sketch', 'Casting and forming', 'Carving and filigree', 'Setting and polish'].map((s, i) => (
              <li key={s} className="flex gap-3 border-t border-ink/20 pt-3 items-center">
                <span className="font-serif text-xl sm:text-2xl text-brass leading-none w-5">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <Tools className="w-56 sm:w-72 mt-8 sm:mt-10 opacity-80" />
        </div>

        <aside className="md:col-span-5 space-y-6 sm:space-y-8 mt-4 md:mt-0">
          {/* Pasted print frame */}
          <figure className="relative bg-[#FCF8EE] p-3 sm:p-4 pb-5 border border-ink/30 shadow-md shadow-ink/10 rotate-[-1.5deg] motion-reduce:rotate-0 transition-transform max-w-[420px] mx-auto md:max-w-none">
            {/* Subtle paper tape strip holding the print */}
            <div
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-paper/90 border border-ink/20 rotate-[-1deg] opacity-80 shadow-xs"
              aria-hidden="true"
            />

            <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper border border-ink/15">
              {shop.shopImage && !imgFailed ? (
                <>
                  {PHOTO_PLACEHOLDERS[shop.shopImage] && (
                    <img
                      src={PHOTO_PLACEHOLDERS[shop.shopImage]}
                      alt=""
                      aria-hidden="true"
                      width="24"
                      height="18"
                      className={`absolute inset-0 w-full h-full object-cover [object-position:center_35%] filter blur-sm transition-opacity duration-500 motion-reduce:hidden ${
                        imgLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                      }`}
                    />
                  )}
                  <img
                    src={shop.shopImage}
                    srcSet="/photos/about-400.webp 400w, /photos/about-800.webp 800w, /photos/about.webp 1000w"
                    sizes="(max-width: 640px) 100vw, 500px"
                    alt="The workbench and artisans at Shree Jewellers, Manek Chowk"
                    width="400"
                    height="300"
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgFailed(true)}
                    className={`w-full h-full object-cover [object-position:center_35%] transition-opacity duration-500 ease-out motion-reduce:transition-none ${
                      imgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-paper flex items-center justify-center text-center text-xs uppercase tracking-[0.18em] text-ink/50 px-6">
                  Optional shop photograph placeholder
                </div>
              )}
            </div>

            {/* Handwritten caption */}
            <figcaption className="font-hand text-burgundy text-xl sm:text-2xl md:text-3xl text-center mt-3 tracking-wide">
              at the workbench · Manek Chowk, Ahmedabad
            </figcaption>
          </figure>

          <div className="flex items-end gap-5 justify-center md:justify-start">
            <JaliWindow className="w-24 sm:w-28" />
            <p className="note pb-3 text-base sm:text-xl">a jali window, old city</p>
          </div>
        </aside>
      </div>

      <div className="mt-12 sm:mt-16">
        <Skyline className="w-full opacity-70" />
      </div>
      <Ornament className="w-36 sm:w-40 mx-auto mt-6" />
      <p className="text-center text-xs text-ink/55 mt-4 max-w-md mx-auto leading-relaxed">
        This is a demo profile. No history, awards, certifications or reviews are claimed. Add only what the owner can
        stand behind.
      </p>
    </div>
  );
}
