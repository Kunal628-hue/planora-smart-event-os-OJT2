import { useState, useEffect, useRef } from "react";

/**
 * useCursorGlow
 * Tracks mouse position with smooth interpolation for glow effects.
 * Uses refs to avoid re-creating the RAF loop on each mouse move.
 */
export default function useCursorGlow() {
  const [glowPos, setGlowPos] = useState({ x: -999, y: -999 });
  const mouseRef = useRef({ x: -999, y: -999 });
  const currentRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let raf;
    const smooth = () => {
      const lerpFactor = 0.1;
      currentRef.current = {
        x: currentRef.current.x + (mouseRef.current.x - currentRef.current.x) * lerpFactor,
        y: currentRef.current.y + (mouseRef.current.y - currentRef.current.y) * lerpFactor,
      };
      setGlowPos({ x: currentRef.current.x, y: currentRef.current.y });
      raf = requestAnimationFrame(smooth);
    };
    raf = requestAnimationFrame(smooth);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []); // empty deps — stable RAF loop

  return glowPos;
}
