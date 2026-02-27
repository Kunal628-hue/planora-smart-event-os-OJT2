import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, stagger, createTimeline } from "animejs";
import ThreeBackground from "./ThreeBackground";

// ── Particles ──
function Particle({ style }) {
    return (
        <div
            style={{
                position: "absolute",
                borderRadius: "50%",
                pointerEvents: "none",
                ...style,
            }}
        />
    );
}

// ── UI Mockup Component ──
function HeroDashboardMock() {
    return (
        <div className="hero-mockup-card" style={{
            position: "relative",
            background: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            maxWidth: "520px",
            width: "100%",
            margin: "0 auto",
            transition: "all 0.4s ease",
            color: "#1e293b"
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
                <div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.2rem", fontWeight: 500 }}>Event Health</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>Tech Summit 2026</div>
                </div>
                <div style={{
                    padding: "0.3rem 0.8rem", background: "#f0fdf4",
                    borderRadius: "2rem", border: "1px solid #dcfce7",
                    color: "#16a34a", fontSize: "0.75rem", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: "0.3rem"
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }}></span> On Track
                </div>
            </div>

            {/* Main Stats Row - Health Score & Budget */}
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", alignItems: "center" }}>
                {/* Health Score Circle */}
                <div style={{
                    flex: "0 0 auto", width: "130px", height: "130px",
                    position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="82, 100" strokeLinecap="round"
                        />
                    </svg>
                    <div style={{ position: "absolute", textAlign: "center", zIndex: 10 }}>
                        <div style={{ fontSize: "2.3rem", fontWeight: 800, color: "#8b5cf6", lineHeight: 1 }}>82</div>
                        <div style={{ fontSize: "0.6rem", color: "#64748b", marginTop: "0.2rem", fontWeight: 700, letterSpacing: "0.05em" }}>SCORE</div>
                    </div>
                </div>

                {/* Right Column Stats */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Budget Stability */}
                    <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Budget Stability</span>
                            <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700 }}>78%</span>
                        </div>
                        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: "78%", height: "100%", background: "#10b981", borderRadius: "3px" }}></div>
                        </div>
                    </div>

                    {/* Task Completion */}
                    <div style={{ background: "#f8fafc", padding: "0.8rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                            <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Task Completion</span>
                            <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700 }}>75%</span>
                        </div>
                        <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: "75%", height: "100%", background: "#f59e0b", borderRadius: "3px" }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Alert Banner */}
            <div style={{
                background: "#fff1f2", border: "1px solid #fecaca",
                borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem",
            }}>
                <div style={{
                    width: "28px", height: "28px", borderRadius: "8px", background: "#fee2e2",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444",
                    flexShrink: 0
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                </div>
                <div>
                    <div style={{ fontSize: "0.85rem", color: "#991b1b", fontWeight: 700 }}>Financial Risk Detected</div>
                    <div style={{ fontSize: "0.7rem", color: "#b91c1c", lineHeight: 1.4 }}>Catering budget exceeds projection by 10%.</div>
                </div>
            </div>
        </div>
    );
}

export default function Hero() {
    const leftColRef = useRef(null);
    const rightColWrapperRef = useRef(null);
    const particleRefs = useRef([]);

    useEffect(() => {
        /* ── Entrance timeline ── */
        const tl = createTimeline({ easing: "outExpo", autoplay: true });

        // Left Column Elements
        const leftElements = Array.from(leftColRef.current.children);

        tl.add(leftElements, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            delay: stagger(100),
            easing: "outQuad"
        })
            // Right Column
            .add(rightColWrapperRef.current, {
                opacity: [0, 1],
                translateX: [30, 0],
                rotateY: [-5, -5], // Start and end at -5deg for perspective
                rotateX: [2, 2],
                scale: [0.95, 1],
                duration: 900,
                easing: "outExpo"
            }, "-=600");

        /* ── Floating particles ── */
        particleRefs.current.forEach((el) => {
            if (!el) return;
            const delay = Math.random() * 3000;
            const dur = 4500 + Math.random() * 5500;
            animate(el, {
                translateY: [0, -(30 + Math.random() * 60)],
                opacity: [0, 0.6, 0],
                scale: [0.4, 1 + Math.random() * 0.6, 0.2],
                duration: dur,
                delay,
                easing: "inOutSine",
                loop: true,
            });
        });
    }, []);

    /* particle config */
    const particles = [
        { top: "15%", left: "10%", w: 4, h: 4, c: "#3b82f6" },
        { top: "25%", left: "20%", w: 6, h: 6, c: "#2563eb" },
        { top: "85%", left: "5%", w: 3, h: 3, c: "#60a5fa" },
        { top: "65%", left: "30%", w: 5, h: 5, c: "#3b82f6" },
        { top: "10%", right: "15%", w: 4, h: 4, c: "#22d3ee" },
        { top: "40%", right: "5%", w: 6, h: 6, c: "#3b82f6" },
        { top: "80%", right: "25%", w: 3, h: 3, c: "#2563eb" },
        { top: "90%", left: "50%", w: 4, h: 4, c: "#60a5fa" },
    ];

    return (
        <section
            id="hero"
            style={{
                position: "relative",
                overflow: "hidden",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                paddingTop: "6rem",
                paddingBottom: "4rem",
            }}
        >
            <ThreeBackground />

            {/* ── Background Glows ── */}
            <div className="glow-blob anim-float-slow" style={{
                width: 700, height: 700, top: "-15%", left: "-10%",
                background: "radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)",
                filter: "blur(60px)", pointerEvents: "none"
            }} />
            <div className="glow-blob anim-float" style={{
                width: 500, height: 500, bottom: "0%", right: "-5%",
                background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
                filter: "blur(60px)", pointerEvents: "none"
            }} />

            {/* Rendered visible particles */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
                {particles.map((p, i) => (
                    <div
                        key={i}
                        ref={el => particleRefs.current[i] = el}
                        style={{
                            position: "absolute",
                            top: p.top, left: p.left, right: p.right,
                            width: p.w, height: p.h, borderRadius: "50%",
                            background: p.c, boxShadow: `0 0 ${p.w * 2}px ${p.c}`,
                            opacity: 0, pointerEvents: "none",
                        }}
                    />
                ))}
            </div>

            <div className="page-container" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
                <style>{`
                    .hero-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 4rem;
                        align-items: center;
                    }
                    @media (max-width: 960px) {
                        .hero-grid { grid-template-columns: 1fr; gap: 3.5rem; text-align: center; }
                        .hero-content { display: flex; flex-direction: column; align-items: center; }
                        .hero-content ul { align-items: center; }
                        .hero-content .cta-group { justify-content: center; width: 100%; }
                        .hero-content .position-line { margin: 0 auto; text-align: center; }
                        .hero-mockup-wrapper { transform: none !important; margin-top: 1rem; }
                    }
                `}</style>

                <div className="hero-grid">
                    {/* ── Left Column: Content ── */}
                    <div ref={leftColRef} className="hero-content" style={{ textAlign: "left" }}>

                        {/* Eyebrow / Badge */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "0.6rem",
                            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                            borderRadius: "2rem", padding: "0.4rem 1rem", marginBottom: "1.5rem",
                        }}>
                            <span style={{ position: "relative", display: "flex", width: 8, height: 8 }}>
                                <span className="ping-ring" style={{ background: "#3b82f6" }}></span>
                                <span style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%" }}></span>
                            </span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#93c5fd", letterSpacing: "0.03em" }}>
                                Introducing Planora — The Smart Campus Event OS
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 style={{
                            fontSize: "clamp(2.5rem, 4.5vw, 3.8rem)",
                            fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem",
                            color: "white", letterSpacing: "-0.02em"
                        }}>
                            Run Campus Events With <br />
                            <span className="gradient-text">Intelligence</span>. Not Assumptions.
                        </h1>

                        {/* Subtext */}
                        <p style={{
                            fontSize: "clamp(1rem, 1.25vw, 1.15rem)",
                            color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "2rem",
                            maxWidth: "540px"
                        }}>
                            Planora is a unified event operations platform built for student-led organizations. Plan smarter, track finances in real time, coordinate teams effortlessly, and execute with total clarity — all from a single intelligent control center.
                        </p>

                        {/* Bullet Points */}
                        <ul style={{
                            display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "2.5rem",
                            padding: 0, listStyle: "none"
                        }}>
                            {[
                                "Real-Time Financial Visibility",
                                "Structured Task & Timeline Automation",
                                "Predictive Risk & Performance Monitoring"
                            ].map((item, i) => (
                                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                                    <div style={{
                                        width: "22px", height: "22px", borderRadius: "50%", background: "rgba(34, 197, 94, 0.15)",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        {/* CTAs */}
                        <div className="cta-group" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
                            <Link to="/signup" className="btn btn-primary btn-lg" style={{ padding: "0.75rem 2rem" }}>
                                Start Now
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                            <a href="#product" className="btn btn-ghost btn-lg" style={{ padding: "0.75rem 1.8rem", fontSize: "1rem" }}>
                                Book a Live Demo
                            </a>
                        </div>

                        {/* Positioning Line */}
                        <p className="position-line" style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", borderLeft: "3px solid rgba(59,130,246,0.3)", paddingLeft: "1rem" }}>
                            "Built for professional planners, event businesses, and high-scale event teams."
                        </p>
                    </div>

                    {/* ── Right Column: Mockup ── */}
                    <div className="hero-mockup-wrapper" ref={rightColWrapperRef} style={{ perspective: "1000px" }}>
                        <div style={{ transform: "rotateY(-5deg) rotateX(2deg)", transformStyle: "preserve-3d" }}>
                            <HeroDashboardMock />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
