import { useEffect, useRef } from "react";
import useReveal from "../../hooks/useReveal";

const TRUST_ITEMS = [
  { name: "Concerts & Music Festivals", icon: "🎵" },
  { name: "Corporate Launches", icon: "🏢" },
  { name: "Luxury Weddings & Galas", icon: "💍" },
  { name: "Trade Fairs & Expos", icon: "🏛️" },
  { name: "Tech Meetups & Seminars", icon: "💻" },
  { name: "TEDx & Conferences", icon: "🎤" },
  { name: "Sports Events", icon: "🏆" },
  { name: "Charity Fundraisers", icon: "❤️" },
];

export default function Trust() {
  const containerRef = useReveal();
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    let raf;
    const speed = 0.6;
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
        padding: "3rem 0",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Fade Left */}
      <div
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "10%",
          background: "linear-gradient(90deg, #fff, transparent)",
          zIndex: 1, pointerEvents: "none",
        }}
      />
      {/* Fade Right */}
      <div
        style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "10%",
          background: "linear-gradient(-90deg, #fff, transparent)",
          zIndex: 1, pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9CA3AF" }}>
            Trusted by organizations for events of all scales
          </p>
        </div>
      </div>

      {/* Marquee */}
      <div style={{ overflow: "hidden" }}>
        <div ref={trackRef} style={{ display: "flex", gap: "1.25rem", width: "max-content" }}>
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.65rem 1.35rem",
                background: "#F9FAFB",
                border: "1.5px solid rgba(0,0,0,0.07)",
                borderRadius: "999px",
                flexShrink: 0,
                color: "#374151",
                fontSize: "0.85rem",
                fontWeight: 600,
                transition: "border-color 0.25s, background 0.25s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(94,90,219,0.3)";
                e.currentTarget.style.background = "rgba(94,90,219,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
                e.currentTarget.style.background = "#F9FAFB";
              }}
            >
              <span>{item.icon}</span>
              <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
