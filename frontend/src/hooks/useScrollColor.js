import { useEffect, useRef, useState } from "react";

/**
 * Section color themes for the scroll system
 */
export const SECTION_THEMES = [
  {
    id: "hero",
    bg: "#0B0D14",
    glowColor: "139,92,246",   // purple
    glowOpacity: 0.18,
    navTransparent: true,
  },
  {
    id: "trust",
    bg: "#0d0f1c",
    glowColor: "99,102,241",   // indigo
    glowOpacity: 0.12,
    navTransparent: false,
  },
  {
    id: "problem",
    bg: "#0F1220",
    glowColor: "99,102,241",   // indigo-purple
    glowOpacity: 0.1,
    navTransparent: false,
  },
  {
    id: "features",
    bg: "#11162A",
    glowColor: "96,165,250",   // blue
    glowOpacity: 0.12,
    navTransparent: false,
  },
  {
    id: "product",
    bg: "#0d1120",
    glowColor: "139,92,246",   // purple
    glowOpacity: 0.14,
    navTransparent: false,
  },
  {
    id: "how-it-works",
    bg: "#0B0D14",
    glowColor: "96,165,250",   // blue
    glowOpacity: 0.1,
    navTransparent: false,
  },
  {
    id: "cta",
    bg: "#100B1E",
    glowColor: "124,58,237",   // violet
    glowOpacity: 0.2,
    navTransparent: false,
  },
];

/**
 * Linearly interpolates between two hex colors
 */
function lerpHex(hexA, hexB, t) {
  const parse = (h) => {
    const v = h.replace("#", "");
    return [
      parseInt(v.slice(0, 2), 16),
      parseInt(v.slice(2, 4), 16),
      parseInt(v.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

function lerpRgb(a, b, t) {
  const pa = a.split(",").map(Number);
  const pb = b.split(",").map(Number);
  return pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",");
}

/**
 * useScrollColor
 *
 * Observes which section is currently in view and provides
 * interpolated bg/glow theme values updated on RAF.
 *
 * Returns: { sectionIndex, bg, glowColor, glowOpacity, navTransparent }
 */
export default function useScrollColor() {
  const [theme, setTheme] = useState({
    sectionIndex: 0,
    bg: SECTION_THEMES[0].bg,
    glowColor: SECTION_THEMES[0].glowColor,
    glowOpacity: SECTION_THEMES[0].glowOpacity,
    navTransparent: true,
  });

  const currentSectionRef = useRef(0);
  const nextSectionRef = useRef(0);
  const progressRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const sectionEls = SECTION_THEMES.map(({ id }) =>
      document.getElementById(id)
    ).filter(Boolean);

    if (sectionEls.length === 0) return;

    // IntersectionObserver to track which section is entering / leaving
    const ratios = new Array(sectionEls.length).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = sectionEls.indexOf(entry.target);
          if (idx === -1) return;
          ratios[idx] = entry.intersectionRatio;
        });

        // Find the most-visible section
        let maxRatio = 0;
        let maxIdx = currentSectionRef.current;
        ratios.forEach((r, i) => {
          if (r > maxRatio) {
            maxRatio = r;
            maxIdx = i;
          }
        });
        currentSectionRef.current = maxIdx;
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );

    sectionEls.forEach((el) => observer.observe(el));

    // RAF loop for smooth color interpolation
    let currentBg = SECTION_THEMES[0].bg;
    let currentGlow = SECTION_THEMES[0].glowColor;
    let currentOpacity = SECTION_THEMES[0].glowOpacity;
    const LERP = 0.06; // smoothing factor

    const update = () => {
      const targetIdx = currentSectionRef.current;
      const target = SECTION_THEMES[targetIdx] || SECTION_THEMES[0];

      currentBg = lerpHex(currentBg, target.bg, LERP);
      currentGlow = lerpRgb(currentGlow, target.glowColor, LERP);
      currentOpacity = currentOpacity + (target.glowOpacity - currentOpacity) * LERP;

      setTheme({
        sectionIndex: targetIdx,
        bg: currentBg,
        glowColor: currentGlow,
        glowOpacity: currentOpacity,
        navTransparent: target.navTransparent,
      });

      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return theme;
}
