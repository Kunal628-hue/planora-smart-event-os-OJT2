import { useEffect, useRef } from "react";
import { animate } from "animejs";

/**
 * useMagnetic
 * Elements slightly follow the cursor on hover and return elastically.
 */
export default function useMagnetic(intensity = 0.4) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const deltaX = (clientX - centerX) * intensity;
      const deltaY = (clientY - centerY) * intensity;

      animate(el, {
        translateX: deltaX,
        translateY: deltaY,
        duration: 400,
        easing: "easeOutCubic",
      });
    };

    const handleMouseLeave = () => {
      animate(el, {
        translateX: 0,
        translateY: 0,
        duration: 900,
        easing: "easeOutExpo",
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [intensity]);

  return ref;
}
