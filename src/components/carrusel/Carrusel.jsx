import { useCallback, useEffect, useRef, useState } from 'react';
import './Carrusel.css';

export default function Carrusel({
  images = [],
  autoPlay = true,
  interval = 4500,
  label = 'Galería de imágenes',
  priority = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  const goTo = useCallback(
    (index) => {
      const total = images.length;
      if (total === 0) return;
      setCurrentIndex(((index % total) + total) % total);
    },
    [images.length]
  );

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isPaused || images.length <= 1) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, images.length, next]);

  if (images.length === 0) return null;

  return (
    <div
      className="carrusel"
      ref={containerRef}
      role="group"
      aria-roledescription="carrusel"
      aria-label={label}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        className="carrusel__track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, index) => {
          const src = typeof img === 'string' ? img : img.src;
          const alt = typeof img === 'string' ? `${label} ${index + 1}` : img.alt || `${label} ${index + 1}`;
          const eager = priority && index === 0;

          return (
            <div
              className="carrusel__slide"
              key={src}
              aria-hidden={index !== currentIndex}
            >
              <img
                src={src}
                alt={alt}
                loading={eager ? 'eager' : 'lazy'}
                decoding={eager ? 'sync' : 'async'}
                fetchPriority={eager ? 'high' : 'auto'}
                width="1280"
                height="720"
              />
            </div>
          );
        })}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="carrusel__arrow carrusel__arrow--prev"
            onClick={prev}
            aria-label="Imagen anterior"
          >
            <span aria-hidden="true">&#8249;</span>
          </button>
          <button
            type="button"
            className="carrusel__arrow carrusel__arrow--next"
            onClick={next}
            aria-label="Imagen siguiente"
          >
            <span aria-hidden="true">&#8250;</span>
          </button>

          <div className="carrusel__dots">
            {images.map((img, index) => (
              <button
                type="button"
                key={typeof img === 'string' ? img : img.src}
                className={`carrusel__dot ${currentIndex === index ? 'is-active' : ''}`}
                onClick={() => goTo(index)}
                aria-label={`Ir a la imagen ${index + 1} de ${images.length}`}
                aria-current={currentIndex === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
