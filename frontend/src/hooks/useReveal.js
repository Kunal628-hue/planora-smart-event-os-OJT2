import { useEffect, useRef } from "react";

/**
 * useReveal
 * Attaches an IntersectionObserver to all .reveal, .reveal-left, .reveal-right, .reveal-scale
 * elements inside the ref container.
 * Adds class "visible" when they scroll into view.
 */
export default function useReveal(threshold = 0.1) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const SELECTORS = ".reveal, .reveal-left, .reveal-right, .reveal-scale";
    const targets = container.querySelectorAll(SELECTORS);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
