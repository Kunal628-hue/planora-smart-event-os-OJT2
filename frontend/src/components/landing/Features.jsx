import { useState } from "react";
import useReveal from "../../hooks/useReveal";

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: "#a78bfa",
    colorRgb: "167,139,250",
    tag: "Planning",
    title: "Smart Event Planning",
    desc: "Build event timelines, assign milestones, and track progress with an intelligent planning engine that surfaces what matters most.",
    points: ["Drag-and-drop timelines", "Automated reminders", "Team milestone tracking"],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: "#34d399",
    colorRgb: "52,211,153",
    tag: "Finance",
    title: "Budget & Sponsorship Tracking",
    desc: "Real-time financial visibility with automatic categorization, sponsor invoicing, and overspend alerts before it's too late.",
    points: ["Live expense tracking", "Sponsor management", "Overspend early warnings"],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "#60a5fa",
    colorRgb: "96,165,250",
    tag: "Teams",
    title: "Volunteer Coordination",
    desc: "Organize your team with role assignments, check-in systems, and live task visibility — no more chasing people on WhatsApp.",
    points: ["Role & task assignment", "Availability tracking", "Real-time check-in"],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    color: "#fb923c",
    colorRgb: "251,146,60",
    tag: "Analytics",
    title: "Real-time Execution Dashboard",
    desc: "A mission control for your event — monitor RSVP trends, task completion, vendor status, and health scores as they happen.",
    points: ["Live event health scoring", "RSVP & guest analytics", "Vendor & logistics view"],
  },
];

export default function Features() {
  const ref = useReveal();
  const [hovered, setHovered] = useState(null);

  return (
    <section
      ref={ref}
      id="features"
      style={{
        padding: "8rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        top: "30%",
        right: "-10%",
        background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ maxWidth: 600, marginBottom: "4rem" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a78bfa",
            background: "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: "2rem",
            padding: "0.3rem 1rem",
            marginBottom: "1.25rem",
          }}>
            Features
          </div>
          <h2 style={{
            fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            marginBottom: "1rem",
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}>
            Everything you need to run a flawless event.
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.7 }}>
            Planora is purpose-built for student organizers — combining the depth of enterprise tools with the speed you need on the ground.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: "1.25rem",
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`reveal delay-${i + 1}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: "relative",
                background: hovered === i ? `rgba(${f.colorRgb}, 0.04)` : "rgba(255,255,255,0.02)",
                border: hovered === i ? `1px solid rgba(${f.colorRgb}, 0.3)` : "1px solid rgba(255,255,255,0.06)",
                borderRadius: "1.25rem",
                padding: "2rem",
                transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                transform: hovered === i ? "translateY(-5px)" : "translateY(0)",
                boxShadow: hovered === i ? `0 20px 60px -16px rgba(${f.colorRgb}, 0.2)` : "none",
                cursor: "default",
                overflow: "hidden",
              }}
            >
              {/* Glow corner */}
              <div style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 140,
                height: 140,
                background: `radial-gradient(circle, rgba(${f.colorRgb}, ${hovered === i ? 0.15 : 0.06}) 0%, transparent 70%)`,
                borderRadius: "50%",
                transition: "opacity 0.35s ease",
                pointerEvents: "none",
              }} />

              {/* Icon */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: "0.875rem",
                background: `rgba(${f.colorRgb}, 0.1)`,
                border: `1px solid rgba(${f.colorRgb}, 0.2)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: f.color,
                marginBottom: "1.25rem",
                transition: "background 0.35s ease, box-shadow 0.35s ease",
                boxShadow: hovered === i ? `0 0 20px rgba(${f.colorRgb}, 0.25)` : "none",
              }}>
                {f.icon}
              </div>

              {/* Tag */}
              <div style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: f.color,
                marginBottom: "0.5rem",
                opacity: 0.8,
              }}>
                {f.tag}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.75rem",
                lineHeight: 1.3,
              }}>
                {f.title}
              </h3>

              {/* Desc */}
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(148,163,184,0.7)",
                lineHeight: 1.7,
                marginBottom: "1.25rem",
              }}>
                {f.desc}
              </p>

              {/* Points */}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {f.points.map((pt) => (
                  <li key={pt} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.82rem", color: "rgba(148,163,184,0.65)" }}>
                    <span style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: f.color,
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${f.color}`,
                    }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
