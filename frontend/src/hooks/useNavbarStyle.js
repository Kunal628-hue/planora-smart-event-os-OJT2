import { useEffect, useRef, useState } from "react";

/**
 * useNavbarStyle
 *
 * Provides the current navbar styling state based on scroll position
 * and which section is active.
 *
 * Returns: { scrolled, transparent, bg, borderColor, shadowOpacity }
 */
export default function useNavbarStyle(isTransparentSection = true) {
  const [style, setStyle] = useState({
    scrolled: false,
    bg: "rgba(11,13,20,0.0)",
    borderColor: "transparent",
    shadow: "none",
  });

  const scrollYRef = useRef(0);
  const rafRef = useRef(null);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    let currentOpacity = 0;
    const LERP = 0.08;

    const update = () => {
      const scrollY = scrollYRef.current;
      const scrolled = scrollY > 40;

      // Target opacity: transparent at top of hero, opaque on scroll
      const targetOpacity = scrolled ? 0.88 : 0;
      currentOpacity += (targetOpacity - currentOpacity) * LERP;

      const borderOpacity = scrolled ? Math.min(currentOpacity * 0.08, 0.08) : 0;
      const shadowOpacity = scrolled ? Math.min(currentOpacity * 0.5, 0.5) : 0;

      setStyle({
        scrolled,
        bg: `rgba(11,13,20,${currentOpacity.toFixed(3)})`,
        borderColor: `rgba(255,255,255,${borderOpacity.toFixed(3)})`,
        shadow: shadowOpacity > 0.05
          ? `0 8px 32px -8px rgba(0,0,0,${shadowOpacity.toFixed(2)})`
          : "none",
      });

      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return style;
}
