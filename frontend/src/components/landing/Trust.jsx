import { useEffect, useRef } from "react";
import { animate } from "animejs";

const ORGS = [
    "ISTE Chapter",
    "Google DSC",
    "IEEE Student Branch",
    "E-Cell",
    "NSS Unit",
    "Coding Club",
    "Cultural Committee",
    "Sports Board",
    "Robotics Club",
    "Entrepreneurship Cell",
    "MUN Committee",
    "Drama Society",
];

/* Duplicate for seamless loop */
const ALL = [...ORGS, ...ORGS];

export default function Trust() {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        animate(ref.current, {
            opacity: [0, 1],
            translateY: [16, 0],
            duration: 800,
            easing: "outExpo",
            delay: 400,
        });
    }, []);

    return (
        <section
            ref={ref}
            className="section-pad-sm"
            style={{ borderTop: "1px solid var(--border-subtle)", opacity: 0, overflow: "hidden" }}
        >
            <p style={{
                textAlign: "center",
                fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--text-muted)",
                marginBottom: "2.5rem",
            }}>
                Powering student-led events across campuses
            </p>

            {/* Auto-scrolling marquee */}
            <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)" }}>
                <div className="marquee-track" style={{ gap: "0.85rem" }}>
                    {ALL.map((org, i) => (
                        <span
                            key={i}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                padding: "0.45rem 1.1rem",
                                borderRadius: "2rem",
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-subtle)",
                                fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)",
                                transition: "var(--transition)", cursor: "default", flexShrink: 0,
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(59,130,246,0.12)";
                                e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)";
                                e.currentTarget.style.color = "#93c5fd";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "var(--bg-elevated)";
                                e.currentTarget.style.borderColor = "var(--border-subtle)";
                                e.currentTarget.style.color = "var(--text-secondary)";
                            }}
                        >
                            <span style={{
                                width: 5, height: 5, borderRadius: "50%",
                                background: i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#34d399" : "#2563eb",
                                display: "inline-block", flexShrink: 0,
                            }} />
                            {org}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
