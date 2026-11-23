import { useState } from 'react';
import { CategorySketch } from './Illustrations';
import { PHOTO_PLACEHOLDERS } from '../data/photoPlaceholders';

// Shows the real photo with blur-up loading & responsive srcset; otherwise a clearly labelled fallback placeholder.
// We never generate artificial jewellery pictures.
export default function ProductImage({
  product,
  src,
  className = '',
  imgClassName = '',
  large = false,
  priority = false,
  alt = '',
  sizes,
}) {
  const imageSrc = src ?? product?.images?.[0];
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // If there's a valid image source and no load error
  if (imageSrc && !error) {
    const blurThumb =
      PHOTO_PLACEHOLDERS[imageSrc] ||
      (typeof imageSrc === 'string' && imageSrc.endsWith('.webp')
        ? imageSrc.replace(/\.webp$/, '-blur.webp')
        : null);

    const imageAlt =
      alt || (product ? `${product.name}, design code ${product.code}` : 'Jewellery photograph');

    // Build responsive srcset for photos in public/photos
    const isLocalWebp =
      typeof imageSrc === 'string' &&
      imageSrc.startsWith('/photos/') &&
      imageSrc.endsWith('.webp') &&
      !imageSrc.includes('-400') &&
      !imageSrc.includes('-800');

    const srcSet = isLocalWebp
      ? `${imageSrc.replace(/\.webp$/, '-400.webp')} 400w, ${imageSrc.replace(/\.webp$/, '-800.webp')} 800w, ${imageSrc} 1000w`
      : undefined;

    const defaultSizes = large
      ? '(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 800px'
      : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px';

    return (
      <div className={`relative bg-paper overflow-hidden ${className}`}>
        {/* 24px blurred placeholder for instant blur-up */}
        {blurThumb && (
          <img
            src={blurThumb}
            alt=""
            aria-hidden="true"
            width="24"
            height="30"
            className={`absolute inset-0 w-full h-full object-cover [object-position:center_35%] scale-105 filter blur-sm transition-opacity duration-500 motion-reduce:hidden ${
              loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        )}

        {/* Sharp image with responsive srcset, width/height for zero CLS */}
        <img
          src={imageSrc}
          srcSet={srcSet}
          sizes={sizes || defaultSizes}
          alt={imageAlt}
          width={large ? '800' : '400'}
          height={large ? '1000' : '500'}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover [object-position:center_35%] transition-opacity duration-500 ease-out motion-reduce:transition-none ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      </div>
    );
  }

  // Fallback placeholder when no photo exists or photo failed to load
  return (
    <div
      className={`bg-paper flex flex-col items-center justify-center text-center relative ${className}`}
      role="img"
      aria-label={`Photo placeholder for ${product?.name || 'design'}`}
    >
      <CategorySketch category={product?.category || 'necklaces'} className={large ? 'w-2/3 max-w-xs' : 'w-3/5'} />
      <span className="absolute bottom-2 left-0 right-0 text-[10px] uppercase tracking-[0.18em] text-ink/50 px-2">
        Photo placeholder · add real photo in Admin
      </span>
    </div>
  );
}
