import { useEffect, useRef, useState } from "react";
import useReveal from "../../hooks/useReveal";

/* ── Animated counter hook ── */
function useCounter(target, duration = 1600, start = false) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setVal(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
            else setVal(target);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return val;
}

/* ── Mini stat with animated counter ── */
function AnimatedStat({ label, target, suffix = "", prefix = "", color, triggerCount }) {
    const val = useCounter(target, 1500, triggerCount);
    return (
        <div style={{ textAlign: "center" }}>
            <p className="anim-number-glow" style={{
                fontSize: "2rem", fontWeight: 900, color,
                fontFamily: "Outfit, sans-serif", letterSpacing: "-0.03em", marginBottom: "0.3rem",
            }}>
                {prefix}{val.toLocaleString()}{suffix}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</p>
        </div>
    );
}

/* ── Mini Dashboard Mock ── */
function DashboardMock({ triggerCount }) {
    return (
        <div style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)", overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.08)",
        }}>
            {/* Chrome */}
            <div style={{
                background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)",
                padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem",
            }}>
                {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                    <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
                <div style={{
                    flex: 1, marginLeft: "0.6rem", height: 20, background: "rgba(255,255,255,0.04)",
                    borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: "0.6rem",
                }}>
                    <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>app.planora.io/events</span>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Counters */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.7rem" }}>
                    {[
                        { label: "Events", target: 24, color: "#3b82f6" },
                        { label: "Volunteers", target: 312, color: "#6ee7b7" },
                        { label: "Budget Used", target: 76, suffix: "%", color: "#f59e0b" },
                    ].map((s) => (
                        <div key={s.label} style={{
                            background: "var(--bg-card)", borderRadius: "var(--radius-sm)",
                            padding: "0.85rem", border: "1px solid var(--border-subtle)", textAlign: "center",
                        }}>
                            <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>{s.label}</p>
                            <AnimatedStat target={s.target} suffix={s.suffix || ""} color={s.color} triggerCount={triggerCount} />
                        </div>
                    ))}
                </div>

                {/* Progress bars with animation */}
                {[
                    { label: "Tech Fest 2026", pct: 82, color: "#3b82f6", delay: 0 },
                    { label: "Hackathon Sprint", pct: 58, color: "#2563eb", delay: 150 },
                    { label: "Cultural Week", pct: 34, color: "#22d3ee", delay: 300 },
                ].map((item) => (
                    <div key={item.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{item.pct}%</span>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                                height: "100%", width: triggerCount ? `${item.pct}%` : "0%",
                                background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`,
                                borderRadius: 3,
                                transition: triggerCount ? `width 1.2s cubic-bezier(0.22,1,0.36,1) ${item.delay}ms` : "none",
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Problem() {
    const ref = useReveal();
    const [triggered, setTriggered] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
            { threshold: 0.25 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="problem" className="section-pad" ref={ref}>
            <div className="page-container" ref={sectionRef}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
                    {/* Left */}
                    <div>
                        <p className="overline reveal" style={{ marginBottom: "1.25rem" }}>The Problem</p>
                        <h2 className="reveal delay-1" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.6rem)", marginBottom: "1.5rem" }}>
                            Event operations shouldn't feel chaotic.
                        </h2>
                        <p className="reveal delay-2" style={{
                            fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.78, marginBottom: "2rem",
                        }}>
                            Managing budgets in spreadsheets, coordinating volunteers across scattered platforms,
                            and tracking approvals manually slows execution. Planora eliminates fragmentation
                            by bringing every operational layer into one unified system.
                        </p>
                        <ul className="reveal delay-3" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {[
                                "Structured timelines replace scattered reminders",
                                "Real-time budget visibility for every stakeholder",
                                "Single source of truth for every volunteer",
                            ].map((point, i) => (
                                <li key={point} style={{
                                    display: "flex", alignItems: "flex-start", gap: "0.65rem",
                                    fontSize: "0.9rem", color: "var(--text-secondary)",
                                    animation: triggered ? `fade-up 0.6s ease ${i * 120}ms both` : "none",
                                }}>
                                    <span style={{
                                        marginTop: "0.18rem", width: 18, height: 18, borderRadius: "50%",
                                        background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.4)",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}>
                                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right — Dashboard with animated progress bars and counters */}
                    <div className="reveal delay-2">
                        <DashboardMock triggerCount={triggered} />
                    </div>
                </div>
            </div>
        </section>
    );
}
