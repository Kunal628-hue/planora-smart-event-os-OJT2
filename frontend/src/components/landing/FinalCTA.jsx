import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, stagger } from "animejs";
import useReveal from "../../hooks/useReveal";

/* ── Animated particle dots ── */
function FloatingOrbs() {
    const orbs = [
        { w: 160, h: 160, top: "10%", left: "5%", color: "#3b82f6", delay: 0, dur: 7000 },
        { w: 100, h: 100, top: "60%", right: "8%", color: "#2563eb", delay: 1200, dur: 9000 },
        { w: 80, h: 80, top: "30%", right: "20%", color: "#22d3ee", delay: 600, dur: 6000 },
        { w: 120, h: 120, top: "70%", left: "15%", color: "#1d4ed8", delay: 900, dur: 8000 },
    ];
    return (
        <>
            {orbs.map((o, i) => (
                <div
                    key={i}
                    className="glow-blob anim-float"
                    style={{
                        width: o.w, height: o.h,
                        top: o.top, left: o.left, right: o.right,
                        background: `radial-gradient(circle, ${o.color}25, transparent 70%)`,
                        animationDelay: `${o.delay}ms`,
                        animationDuration: `${o.dur}ms`,
                    }}
                />
            ))}
        </>
    );
}

export default function FinalCTA() {
    const ref = useReveal();
    const statsRef = useRef(null);

    useEffect(() => {
        if (!statsRef.current) return;
        const items = statsRef.current.querySelectorAll(".cta-stat");
        if (!items.length) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            animate(Array.from(items), {
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.92, 1],
                duration: 700,
                easing: "outExpo",
                delay: stagger(100),
            });
            observer.disconnect();
        }, { threshold: 0.4 });
        observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            id="cta"
            className="section-pad"
            style={{
                position: "relative",
                overflow: "hidden",
                background: "var(--bg-surface)",
                borderTop: "1px solid var(--border-subtle)",
            }}
        >
            {/* Animated glow orbs */}
            <FloatingOrbs />

            {/* Large radial sweep */}
            <div className="glow-blob" style={{
                width: 700, height: 500,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(ellipse, rgba(37,99,235,0.22) 0%, rgba(59,130,246,0.1) 50%, transparent 70%)",
                animation: "pulse-glow 4s ease-in-out infinite",
            }} />

            <div className="page-container" style={{ position: "relative", zIndex: 2 }} ref={ref}>
                <div
                    className="reveal"
                    style={{
                        background: "linear-gradient(140deg, rgba(59,130,246,0.1), rgba(37,99,235,0.07), rgba(34,211,238,0.05))",
                        border: "1px solid var(--border-accent)",
                        borderRadius: "var(--radius-2xl)",
                        padding: "5.5rem 2rem 4rem",
                        textAlign: "center",
                        maxWidth: 780,
                        margin: "0 auto",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Corner accent */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0,
                        height: 2,
                        background: "linear-gradient(90deg, transparent, #3b82f6, #2563eb, #22d3ee, transparent)",
                        animation: "gradient-shift 3s ease infinite",
                        backgroundSize: "200% auto",
                    }} />

                    <p className="overline" style={{ marginBottom: "1.5rem", letterSpacing: "0.2em", color: "#60a5fa" }}>READY TO ELEVATE YOUR EVENT OPERATIONS?</p>

                    <h2 style={{
                        fontSize: "clamp(2rem, 5vw, 3.5rem)",
                        fontWeight: 900, marginBottom: "1.25rem", lineHeight: 1.1,
                    }}>
                        Operational Clarity {" "}
                        <br />
                        <span className="gradient-text" style={{
                            background: "linear-gradient(130deg, #93c5fd, #3b82f6, #22d3ee)",
                            backgroundSize: "200% auto",
                            animation: "gradient-shift 4s ease infinite",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>
                            Starts Here.
                        </span>
                    </h2>

                    <p style={{
                        fontSize: "1.05rem", color: "var(--text-secondary)",
                        maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.76,
                    }}>
                        Planora replaces fragmented tools with intelligent automation, financial transparency, and real-time execution control — purpose-built for campus leaders.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
                        <Link to="/signup" className="btn btn-primary btn-lg" style={{ boxShadow: "0 0 48px rgba(59,130,246,0.5)", padding: "0.85rem 2.5rem" }}>
                            Start Your Free Trial
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                        <Link to="/demo" className="btn btn-ghost btn-lg" style={{ padding: "0.75rem 2rem" }}>
                            Schedule a Strategy Demo
                        </Link>
                    </div>

                    {/* Value Indicators */}
                    <div ref={statsRef} style={{
                        display: "flex", gap: "2rem", justifyContent: "center",
                        flexWrap: "wrap", paddingTop: "2.5rem",
                        borderTop: "1px solid var(--border-subtle)",
                    }}>
                        {[
                            {
                                label: "Financial Transparency",
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23" />
                                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                    </svg>
                                )
                            },
                            {
                                label: "Intelligent Automation",
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                )
                            },
                            {
                                label: "Real-Time Execution Control",
                                icon: (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="6" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                )
                            },
                        ].map((s, i) => (
                            <div key={i} className="cta-stat" style={{ textAlign: "center", opacity: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span style={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: 38, height: 38, borderRadius: "10px",
                                    background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                                    color: "#3b82f6"
                                }}>{s.icon}</span>
                                <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 500 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        "Built for student organizers, committee leaders, and campus event teams."
                    </p>
                </div>
            </div>
        </section>
    );
}
