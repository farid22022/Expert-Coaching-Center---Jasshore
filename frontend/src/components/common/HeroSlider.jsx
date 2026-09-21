import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";


const DEFAULT_SLIDES = [
  { src: "./../../../public/slide1.jpeg", alt: "Students in the classroom" },
  { src: "/slide2.jpeg", alt: "Campus view" },
  { src: "/slide3.jpeg", alt: "Coaching session in progress" },
];

export default function HeroSlider({ slides = DEFAULT_SLIDES, interval = 5500, className = "" }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const goTo = useCallback(
    (next) => {
      setDirection(next > index || (index === slides.length - 1 && next === 0) ? 1 : -1);
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [index, slides.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    timerRef.current = setTimeout(next, interval);
    return () => clearTimeout(timerRef.current);
  }, [index, paused, next, interval, slides.length]);

  if (!slides.length) return null;

  const variants = {
    enter: (dir) => ({ opacity: 0, scale: prefersReducedMotion ? 1 : 1.06 }),
    center: { opacity: 1, scale: 1 },
    exit: (dir) => ({ opacity: 0, scale: prefersReducedMotion ? 1 : 1.02 }),
  };

  return (
    <div
      className={`group absolute inset-0 overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Campus and classroom highlights"
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={slides[index].src}
          src={slides[index].src}
          alt={slides[index].alt || ""}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: prefersReducedMotion ? 0.4 : 1.1, ease: "easeInOut" },
            scale: { duration: prefersReducedMotion ? 0.4 : 6, ease: "linear" },
          }}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </AnimatePresence>

      {/* Readability scrim */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-950/92 via-emerald-950/75 to-slate-950/60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/80 opacity-0 backdrop-blur transition hover:bg-white/20 hover:text-white group-hover:opacity-100 focus-visible:opacity-100 sm:block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/80 opacity-0 backdrop-blur transition hover:bg-white/20 hover:text-white group-hover:opacity-100 focus-visible:opacity-100 sm:block"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-amber-400" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}