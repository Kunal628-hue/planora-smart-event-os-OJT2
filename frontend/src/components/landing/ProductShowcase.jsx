import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import {
    LayoutDashboard,
    Calendar,
    Users,
    DollarSign,
    ClipboardList,
    Ticket,
    CheckCircle2,
    Star
} from "lucide-react";
import useReveal from "../../hooks/useReveal";

/* ── Waveform bars (ambient animation) ── */
function Waveform({ color = "#3b82f6" }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
            {[0.6, 1, 0.75, 0.9, 0.55, 1, 0.7, 0.85, 0.45, 0.95, 0.65, 1, 0.8].map((h, i) => (
                <div
                    key={i}
                    style={{
                        width: 4,
                        borderRadius: 2,
                        background: color,
                        opacity: 0.7,
                        transformOrigin: "bottom",
                        /* eslint-disable-next-line react-hooks/purity */
                        animation: `wave-bar ${0.9 + Math.random() * 0.8}s ease-in-out ${i * 80}ms infinite`,
                        height: `${h * 100}%`,
                    }}
                />
            ))}
        </div>
    );
}

/* ── Animated SVG chart ── */
function AnimatedChart() {
    const pathRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
        const path = pathRef.current;
        if (!path) return;
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            animate(path, { strokeDashoffset: [len, 0], duration: 2000, easing: "outCubic" });

            /* animate the tracking dot along the path */
            if (dotRef.current) {
                animate(dotRef.current, {
                    offsetDistance: ["0%", "100%"],
                    duration: 2000, easing: "outCubic",
                });
            }
            observer.disconnect();
        }, { threshold: 0.4 });
        observer.observe(path);
        return () => observer.disconnect();
    }, []);

    return (
        <div style={{ position: "relative" }}>
            <svg viewBox="0 0 540 130" fill="none" style={{ width: "100%", height: 130, display: "block" }}>
                <defs>
                    <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGrad2" x1="0" y1="0" x2="540" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3b82f6" />
                        <stop offset="0.5" stopColor="#2563eb" />
                        <stop offset="1" stopColor="#22d3ee" />
                    </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((y) => (
                    <line key={y} x1="0" y1={y * 130} x2="540" y2={y * 130} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}
                {/* Area */}
                <path
                    d="M0 108 C60 95 95 65 140 58 C185 51 215 78 265 60 C315 42 340 28 390 18 C440 8 490 30 540 20 L540 130 L0 130 Z"
                    fill="url(#areaGrad2)"
                />
                {/* Animated line */}
                <path
                    ref={pathRef}
                    d="M0 108 C60 95 95 65 140 58 C185 51 215 78 265 60 C315 42 340 28 390 18 C440 8 490 30 540 20"
                    stroke="url(#lineGrad2)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                />
                {/* Dots at data points */}
                {[
                    [0, 108], [140, 58], [265, 60], [390, 18], [540, 20],
                ].map(([x, y], i) => (
                    <circle
                        key={i}
                        cx={x} cy={y} r="4"
                        fill="#8b5cf6"
                        stroke="var(--bg-base)"
                        strokeWidth="2"
                        style={{ opacity: 0, animation: `fade-up 0.4s ease ${1600 + i * 100}ms both` }}
                    />
                ))}
            </svg>
        </div>
    );
}

/* ── Full dashboard ── */
function FullDashboard() {
    const [counts, setCounts] = useState({ revenue: 0, tickets: 0, checkins: 0, satisfaction: 0 });
    const triggered = useRef(false);

    useEffect(() => {
        const el = document.getElementById("product-dashboard");
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || triggered.current) return;
            triggered.current = true;

            const targets = { revenue: 128400, tickets: 3841, checkins: 1204, satisfaction: 98 };
            const duration = 1200;
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - t, 3);
                setCounts({
                    revenue: Math.floor(ease * targets.revenue),
                    tickets: Math.floor(ease * targets.tickets),
                    checkins: Math.floor(ease * targets.checkins),
                    satisfaction: Math.floor(ease * targets.satisfaction),
                });
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div id="product-dashboard" style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)", overflow: "hidden",
            boxShadow: "0 48px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(59,130,246,0.1)",
        }}>
            {/* Chrome */}
            <div style={{
                background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)",
                padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem",
            }}>
                {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                    <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
                ))}
                <div style={{
                    flex: 1, marginLeft: "0.8rem", height: 22, background: "rgba(255,255,255,0.04)",
                    borderRadius: 5, display: "flex", alignItems: "center", paddingLeft: "0.7rem",
                    gap: "0.4rem",
                }}>
                    {/* Live indicator */}
                    <span style={{ position: "relative", width: 7, height: 7, display: "inline-flex" }}>
                        <span className="ping-ring" style={{ color: "#22c55e", width: 7, height: 7 }} />
                        <span style={{ position: "relative", zIndex: 1, width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "block" }} />
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>app.planora.io/dashboard — Live</span>
                </div>
            </div>

            {/* Main layout */}
            <div style={{ display: "flex" }}>
                {/* Sidebar */}
                <div style={{
                    width: 180, background: "var(--bg-card)", borderRight: "1px solid var(--border-subtle)",
                    padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0,
                }}>
                    {["Overview", "Events", "Volunteers", "Budget", "Reports"].map((item, i) => (
                        <div key={item} style={{
                            padding: "0.55rem 0.8rem", borderRadius: "6px",
                            fontSize: "0.75rem", fontWeight: i === 0 ? 700 : 500,
                            color: i === 0 ? "#c4b5fd" : "var(--text-muted)",
                            background: i === 0 ? "rgba(139,92,246,0.14)" : "transparent",
                            cursor: "default", display: "flex", alignItems: "center", gap: "0.5rem",
                        }}>
                            {[
                                <LayoutDashboard size={14} />,
                                <Calendar size={14} />,
                                <Users size={14} />,
                                <DollarSign size={14} />,
                                <ClipboardList size={14} />
                            ][i]} {item}
                        </div>
                    ))}

                    {/* Waveform ambient */}
                    <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
                        <Waveform color="#3b82f6" />
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Stat row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                        {[
                            { label: "Total Revenue", val: `₹${counts.revenue.toLocaleString()}`, icon: <DollarSign size={12} />, color: "#3b82f6" },
                            { label: "Tickets Sold", val: counts.tickets.toLocaleString(), icon: <Ticket size={12} />, color: "#34d399" },
                            { label: "Check-ins", val: counts.checkins.toLocaleString(), icon: <CheckCircle2 size={12} />, color: "#60a5fa" },
                            { label: "Satisfaction", val: `${counts.satisfaction}%`, icon: <Star size={12} />, color: "#f59e0b" },
                        ].map((s) => (
                            <div key={s.label} style={{
                                background: "var(--bg-base)", borderRadius: "8px", padding: "0.85rem",
                                border: "1px solid var(--border-subtle)",
                            }}>
                                <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginBottom: "0.3rem", display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {s.icon} {s.label}
                                </p>
                                <p style={{
                                    fontSize: "1.1rem", fontWeight: 800, color: s.color,
                                    fontFamily: "Outfit, sans-serif", transition: "color 0.3s",
                                }}>
                                    {s.val}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Chart */}
                    <div style={{
                        background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
                        borderRadius: "8px", padding: "1rem",
                    }}>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                            Event registrations — last 12 weeks
                        </p>
                        <AnimatedChart />
                    </div>

                    {/* Table */}
                    <div style={{
                        background: "var(--bg-base)", border: "1px solid var(--border-subtle)",
                        borderRadius: "8px", overflow: "hidden",
                    }}>
                        <div style={{
                            padding: "0.65rem 0.9rem", borderBottom: "1px solid var(--border-subtle)",
                            fontSize: "0.66rem", color: "var(--text-muted)",
                            display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.5rem", fontWeight: 600,
                            textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>
                            <span>Event</span><span>Status</span><span>Team</span>
                        </div>
                        {[
                            { name: "Tech Fest 2026", status: "Live", team: 42 },
                            { name: "Hackathon Sprint", status: "Planning", team: 18 },
                            { name: "Cultural Week", status: "Planning", team: 55 },
                        ].map((ev, i) => (
                            <div key={ev.name} style={{
                                padding: "0.6rem 0.9rem",
                                borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none",
                                fontSize: "0.72rem",
                                display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.5rem",
                                color: "var(--text-secondary)",
                                animation: `fade-up 0.5s ease ${200 + i * 100}ms both`,
                            }}>
                                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{ev.name}</span>
                                <span style={{
                                    color: ev.status === "Live" ? "#34d399" : "#a78bfa", fontWeight: 600,
                                    display: "flex", alignItems: "center", gap: "0.3rem",
                                }}>
                                    {ev.status === "Live" && (
                                        <span style={{ position: "relative", width: 6, height: 6, display: "inline-flex" }}>
                                            <span className="ping-ring" style={{ color: "#34d399", width: 6, height: 6 }} />
                                            <span style={{ position: "relative", zIndex: 1, width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "block" }} />
                                        </span>
                                    )}
                                    {ev.status}
                                </span>
                                <span>{ev.team} ppl</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductShowcase() {
    const ref = useReveal();

    return (
        <section id="product" className="section-pad" ref={ref}
            style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}>
            <div className="page-container">
                <div style={{ textAlign: "center", maxWidth: 650, margin: "0 auto 4rem" }}>
                    <p className="overline reveal" style={{ marginBottom: "1rem" }}>Product Showcase</p>
                    <h2 className="reveal delay-1" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.6rem)", marginBottom: "1rem" }}>
                        One Unified Command Center
                    </h2>
                    <div className="reveal delay-2" style={{ color: "var(--text-secondary)", fontSize: "0.975rem", lineHeight: 1.76 }}>
                        <p style={{ marginBottom: "1rem" }}>
                            From revenue metrics to volunteer performance, Planora consolidates every operational layer into a single, intelligent dashboard designed for clarity and accountability.
                        </p>
                        <p style={{ fontSize: "0.85rem", opacity: 0.8, fontWeight: 500, color: "var(--text-primary)" }}>
                            Built on a modular full-stack architecture with real-time data synchronization, ensuring speed, reliability, and scalability.
                        </p>
                    </div>
                </div>

                <div className="reveal delay-1">
                    <FullDashboard />
                </div>
            </div>
        </section>
    );
}
