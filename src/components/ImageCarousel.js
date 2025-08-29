import { useEffect, useMemo, useRef, useState } from "react";

export default function ImageCarousel({
  images = [],
  title = "",
  speedSec = 40,
}) {
  // cleans data and limit it to 12.
  const base = useMemo(() => {
    return (images || [])
      .slice(0, 12)
      .map((img) => ({
        src: img?.thumbnail || img?.url,
        alt: img?.title || title || "Band photo",
      }))
      .filter((i) => !!i.src);
  }, [images, title]);

  const loop = useMemo(() => base.concat(base), [base]);

  const [active, setActive] = useState(1);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (base.length <= 1) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) return;

    const stepMs = (speedSec * 1000) / base.length; // timer per img
    let id = setInterval(() => {
      if (!pausedRef.current) {
        setActive((v) => (v % base.length) + 1);
      }
    }, stepMs);

    return () => clearInterval(id);
  }, [base.length, speedSec]);

  if (base.length === 0) return null;
  const hasLoop = base.length > 1;
  const renderList = hasLoop ? loop : base;

  return (
    <section
      className="carousel"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
      aria-label="Band photos carousel">
      <div className="carousel-viewport">
        <ul
          className={`carousel-track ${
            base.length > 1 ? "is-animating" : "is-static"
          }`}>
          {(base.length > 1 ? loop : base).map((img, i) => (
            <li className="carousel-item" key={`${img.src}-${i}`}>
              <img
                className="carousel-img"
                src={img.src}
                alt={img.alt}
                loading="lazy"
                onError={(e) => e.currentTarget.classList.add("img-hidden")}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="carousel-counter" aria-live="off">
        {active}/{base.length}
      </div>
    </section>
  );
}
