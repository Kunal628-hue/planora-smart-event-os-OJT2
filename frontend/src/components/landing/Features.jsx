import { useState } from "react";
import useReveal from "../../hooks/useReveal";

const FEATURES = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
        ),
        title: "Smart Event Planning",
        desc: "Design structured workflows with milestone tracking, task dependencies, and approval pipelines. Replace scattered reminders with a single source of operational truth.",
        accent: "#3b82f6",
        tags: ["Gantt Timelines", "Milestone Tracking", "Automated Workflows"],
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
        ),
        title: "Budget & Sponsorship Intelligence",
        desc: "Monitor every transaction in real time. Track allocations, sponsorship inflow, and utilization rates — with automated alerts when projections shift.",
        accent: "#2563eb",
        tags: ["Live Budget Dashboard", "Sponsor Tracking", "Financial Reports"],
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
        ),
        title: "Volunteer & Committee Coordination",
        desc: "Assign roles, manage shifts, and track execution across departments with complete visibility.",
        accent: "#22d3ee",
        tags: ["Role Assignment", "Attendance Monitoring", "Team Performance Tracking"],
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        title: "Real-Time Execution Dashboard",
        desc: "Measure registrations, check-ins, task completion rates, and overall event health — live.",
        accent: "#34d399",
        tags: ["Live Metrics", "Smart Alerts", "Performance Analytics"],
    },
];

function FeatureCard({ feature, index }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className={`glass-card shimmer-hover reveal delay-${index + 1}`}
            style={{ padding: "2rem", cursor: "default" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Icon with animated glow ring */}
            <div style={{ position: "relative", width: 56, height: 56, marginBottom: "1.4rem" }}>
                {hovered && (
                    <div style={{
                        position: "absolute", inset: -6, borderRadius: "50%",
                        border: `1px solid ${feature.accent}50`,
                        animation: "spin-slow 4s linear infinite",
                    }} />
                )}
                <div style={{
                    width: 56, height: 56, borderRadius: "14px",
                    background: `${feature.accent}12`,
                    border: `1px solid ${hovered ? feature.accent + "50" : feature.accent + "20"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: feature.accent,
                    transition: "all 0.3s ease",
                    boxShadow: hovered ? `0 0 24px ${feature.accent}30` : "none",
                }}>
                    {feature.icon}
                </div>
            </div>

            <h3 style={{
                fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.6rem",
                color: "var(--text-primary)", letterSpacing: "-0.01em",
            }}>
                {feature.title}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.72, marginBottom: "1.25rem" }}>
                {feature.desc}
            </p>

            {/* Animated tags */}
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginTop: "auto" }}>
                {feature.tags.map((tag, i) => (
                    <span
                        key={tag}
                        style={{
                            fontSize: "0.7rem", fontWeight: 600,
                            padding: "0.2rem 0.6rem", borderRadius: "2rem",
                            background: hovered ? `${feature.accent}16` : "rgba(255,255,255,0.04)",
                            border: `1px solid ${hovered ? feature.accent + "35" : "rgba(255,255,255,0.06)"}`,
                            color: hovered ? feature.accent : "var(--text-muted)",
                            transition: `all 0.25s ease ${i * 40}ms`,
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Features() {
    const ref = useReveal();

    return (
        <section
            id="features"
            className="section-pad"
            ref={ref}
            style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}
        >
            <div className="page-container">
                <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 4rem" }}>
                    <p className="overline reveal" style={{ marginBottom: "1rem" }}>Built for Every Layer of Event Operations</p>
                    <h2 className="reveal delay-1" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.6rem)", marginBottom: "1rem" }}>
                        From strategy to execution — Planora orchestrates the full event lifecycle with precision.
                    </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
                    {FEATURES.map((f, i) => (
                        <FeatureCard key={f.title} feature={f} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
