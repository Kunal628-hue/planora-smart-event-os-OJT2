import { useEffect, useRef } from "react";
import useReveal from "../../hooks/useReveal";

const TRUST_ITEMS = [
  {
    name: "Concerts & Music Festivals",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    name: "Corporate Launches",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    name: "Luxury Weddings & Galas",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    name: "Trade Fairs & Expos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: "Tech Meetups & Seminars",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    name: "TEDx & Conferences",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="5 3 19 12 5 21 5 3" />
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

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 5rem", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "left", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(148,163,184,0.4)" }}>
            Trusted by organizations for events of all scales
          </p>
        </div>
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
