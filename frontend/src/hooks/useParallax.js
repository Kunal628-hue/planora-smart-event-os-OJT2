import { useEffect, useRef } from "react";

/**
 * useParallax
 *
 * Returns a ref to attach to the element that should move with parallax.
 * The element's transform will be updated directly via RAF (no state) for
 * maximum performance.
 *
 * @param {number} speed - 0 = no movement, 1 = moves at full scroll speed.
 *                         Negative values move opposite to scroll.
 * @param {string} axis  - "Y" (default) or "X"
 */
export default function useParallax(speed = 0.2, axis = "Y") {
  const ref = useRef(null);
  const scrollYRef = useRef(0);
  const currentOffset = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const LERP = 0.08;

    const update = () => {
      if (ref.current) {
        const target = scrollYRef.current * speed;
        currentOffset.current += (target - currentOffset.current) * LERP;
        const val = currentOffset.current.toFixed(2);
        ref.current.style.transform =
          axis === "X"
            ? `translateX(${val}px)`
            : `translateY(${val}px)`;
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed, axis]);

  return ref;
}
