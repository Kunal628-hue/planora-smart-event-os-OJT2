import { useEffect, useRef } from "react";
import useReveal from "../../hooks/useReveal";

const TRUST_ITEMS = [
  {
    name: "IEEE Campus",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    name: "ACM Student Chapter",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: "TEDx Events",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    name: "Google DSC",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    name: "Hackathon Club",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    name: "NSS & NCC",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Trust() {
  const containerRef = useReveal();
  const trackRef = useRef(null);

  // Infinite scroll marquee animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    let raf;
    const speed = 0.5;
    const scroll = () => {
      pos -= speed;
      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(pos) >= halfWidth) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(scroll);
    };
    raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={containerRef}
      style={{
        padding: "3.5rem 0",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(255,255,255,0.015)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Fade Left */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "12%",
        background: "linear-gradient(90deg, var(--current-bg), transparent)",
        zIndex: 1, pointerEvents: "none",
      }} />

      {/* Fade Right */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "12%",
        background: "linear-gradient(-90deg, var(--current-bg), transparent)",
        zIndex: 1, pointerEvents: "none",
      }} />

      <div className="reveal" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(148,163,184,0.4)" }}>
          Trusted by student organizations across campuses
        </p>
      </div>

      {/* Marquee */}
      <div style={{ overflow: "hidden" }}>
        <div ref={trackRef} style={{ display: "flex", gap: "3rem", width: "max-content" }}>
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.8rem 1.6rem",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "0.875rem",
              flexShrink: 0,
              color: "rgba(148,163,184,0.5)",
              transition: "border-color 0.3s, color 0.3s",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(196,181,253,0.85)";
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(148,163,184,0.5)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              {item.icon}
              <span style={{ fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
