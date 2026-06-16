export default function Marquee() {
  const BADGES = [
    { text: "Concerts & Music Festivals", color: "#d946ef", icon: <path d="M9 18V5l12-2v13" /> },
    { text: "Corporate Launches", color: "#0ea5e9", icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> },
    { text: "Luxury Weddings & Galas", color: "#f97316", icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
    { text: "TEDx & Conferences", color: "#dc2626", icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /> },
  ];

  // Duplicate to ensure seamless loop
  const row1 = [...BADGES, ...BADGES, ...BADGES];
  const row2 = [...BADGES.reverse(), ...BADGES, ...BADGES];

  return (
    <section style={{ padding: "4rem 0", overflow: "hidden", background: "transparent" }}>
      <div style={{
        textAlign: "center",
        fontSize: "0.75rem",
        fontWeight: 700,
        color: "#888",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: "3rem"
      }}>
        Trusted by premium organizations for events of all scales
      </div>

      {/* Row 1 (Scrolls Left) */}
      <div style={{ position: "relative", display: "flex", width: "fit-content", marginBottom: "1.5rem" }}>
        <style>
          {`
            @keyframes scrollLeft {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.33%); }
            }
            .marquee-left {
              display: flex;
              gap: 1.5rem;
              animation: scrollLeft 30s linear infinite;
            }
          `}
        </style>
        <div className="marquee-left">
          {row1.map((b, i) => (
            <Badge key={i} badge={b} />
          ))}
        </div>
      </div>

      {/* Row 2 (Scrolls Right) */}
      <div style={{ position: "relative", display: "flex", width: "fit-content", marginLeft: "-20%" }}>
        <style>
          {`
            @keyframes scrollRight {
              0% { transform: translateX(-33.33%); }
              100% { transform: translateX(0); }
            }
            .marquee-right {
              display: flex;
              gap: 1.5rem;
              animation: scrollRight 30s linear infinite;
            }
          `}
        </style>
        <div className="marquee-right">
          {row2.map((b, i) => (
            <Badge key={i} badge={b} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Badge({ badge }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.75rem 1.25rem",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: "999px",
      whiteSpace: "nowrap"
    }}>
      <div style={{
        width: 24, height: 24,
        background: badge.color,
        borderRadius: "0.4rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff"
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {badge.icon}
        </svg>
      </div>
      <span style={{ color: "#ccc", fontSize: "0.9rem", fontWeight: 500 }}>
        {badge.text}
      </span>
    </div>
  );
}
