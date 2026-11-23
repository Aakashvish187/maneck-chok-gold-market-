import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import ProductImage from './ProductImage';
import { useStore } from '../lib/store';

export default function ProductCard({ product, index = 0 }) {
  const { categories, shop } = useStore();
  const shouldReduceMotion = useReducedMotion();
  const cat = categories.find((c) => c.id === product.category);

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-20px' },
        transition: {
          duration: 0.45,
          delay: (index % 4) * 0.06,
          ease: [0.25, 0.1, 0.25, 1],
        },
        whileTap: { scale: 0.98 },
      };

  return (
    <motion.div {...motionProps} className="h-full">
      <Link
        to={`/product/${encodeURIComponent(product.code)}`}
        className="block group h-full focus-visible:outline-burgundy"
      >
        <div className="relative border border-ink/25 p-1.5 sm:p-2 bg-ivory group-hover:border-burgundy transition-colors duration-300 shadow-xs">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper">
            <ProductImage
              product={product}
              className="w-full h-full"
              imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.05] motion-reduce:transform-none motion-reduce:transition-none"
            />

            {/* Thin brass border that draws in on hover */}
            <div
              className="pointer-events-none absolute inset-2 border border-brass/90 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out motion-reduce:transition-none"
              aria-hidden="true"
            />

            {/* Small design-code tag sliding up from the bottom */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out motion-reduce:transform-none"
              aria-hidden="true"
            >
              <span className="inline-block bg-ink/90 text-ivory text-[9px] sm:text-[10px] tracking-widest uppercase px-1.5 sm:px-2 py-0.5 border border-brass/60 font-mono shadow-sm">
                {product.code}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 sm:pt-2.5 flex items-baseline justify-between gap-1.5">
          <h3 className="text-sm sm:text-lg md:text-xl leading-tight font-serif truncate group-hover:text-burgundy transition-colors duration-200">
            {product.name}
          </h3>
          <span className="text-[10px] sm:text-[11px] tracking-wider text-brass shrink-0 font-mono font-medium">
            {product.code}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-ink/65 mt-0.5 truncate">
          {cat?.name}
          {shop.showPrices && product.price ? ` · ₹${Number(product.price).toLocaleString('en-IN')}` : ''}
          {product.is_sample ? ' · Sample' : ''}
        </p>
      </Link>
    </motion.div>
  );
}
