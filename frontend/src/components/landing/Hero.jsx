import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, stagger, createTimeline } from "animejs";

/* ── Floating particle ── */
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

export default function Hero() {
    const badgeRef = useRef(null);
    const headlineRef = useRef(null);
    const subRef = useRef(null);
    const ctaRef = useRef(null);
    const metaRef = useRef(null);
    const particleRefs = Array.from({ length: 18 }, () => useRef(null));

    useEffect(() => {
        /* ── Entrance timeline ── */
        const tl = createTimeline({ easing: "outExpo", autoplay: true });

        tl.add(badgeRef.current, { opacity: [0, 1], translateY: [-16, 0], duration: 650 })
            .add(headlineRef.current, { opacity: [0, 1], translateY: [52, 0], duration: 950 }, "-=400")
            .add(subRef.current, { opacity: [0, 1], translateY: [28, 0], duration: 820 }, "-=680")
            .add(Array.from(ctaRef.current.children), {
                opacity: [0, 1], translateY: [20, 0], scale: [0.94, 1],
                duration: 700, delay: stagger(120),
            }, "-=580")
            .add(metaRef.current, { opacity: [0, 0.65], duration: 600 }, "-=380");

        /* ── Floating particles ── */
        particleRefs.forEach((ref) => {
            if (!ref.current) return;
            const delay = Math.random() * 3000;
            const dur = 4500 + Math.random() * 5500;
            animate(ref.current, {
                translateY: [0, -(30 + Math.random() * 60)],
                opacity: [0, 0.7, 0],
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
        { top: "72%", left: "8%", w: 6, h: 6, c: "#8b5cf6" },
        { top: "60%", left: "15%", w: 3, h: 3, c: "#6366f1" },
        { top: "80%", left: "22%", w: 8, h: 8, c: "#a78bfa" },
        { top: "55%", left: "4%", w: 4, h: 4, c: "#06b6d4" },
        { top: "75%", left: "30%", w: 5, h: 5, c: "#8b5cf6" },
        { top: "85%", left: "38%", w: 3, h: 3, c: "#818cf8" },
        { top: "70%", right: "8%", w: 6, h: 6, c: "#8b5cf6" },
        { top: "62%", right: "16%", w: 4, h: 4, c: "#a78bfa" },
        { top: "78%", right: "24%", w: 7, h: 7, c: "#6366f1" },
        { top: "58%", right: "4%", w: 3, h: 3, c: "#06b6d4" },
        { top: "82%", right: "32%", w: 5, h: 5, c: "#8b5cf6" },
        { top: "90%", left: "50%", w: 4, h: 4, c: "#a78bfa" },
        { top: "68%", left: "44%", w: 3, h: 3, c: "#6ee7b7" },
        { top: "76%", left: "60%", w: 6, h: 6, c: "#8b5cf6" },
        { top: "65%", right: "40%", w: 4, h: 4, c: "#6366f1" },
        { top: "88%", left: "18%", w: 5, h: 5, c: "#a78bfa" },
        { top: "53%", right: "28%", w: 3, h: 3, c: "#06b6d4" },
        { top: "93%", right: "12%", w: 5, h: 5, c: "#8b5cf6" },
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
                justifyContent: "center",
                textAlign: "center",
                paddingTop: "7rem",
                paddingBottom: "5rem",
            }}
        >
            {/* ── Animated gradient glow orbs ── */}
            <div className="glow-blob anim-float-slow" style={{
                width: 720, height: 720, top: "-15%", left: "50%", transform: "translateX(-50%)",
                background: "radial-gradient(ellipse, rgba(124,58,237,0.22) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
            }} />
            <div className="glow-blob anim-float" style={{
                width: 380, height: 380, bottom: "5%", right: "-5%",
                background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
                animationDelay: "1.5s",
            }} />
            <div className="glow-blob anim-float-fast" style={{
                width: 280, height: 280, bottom: "22%", left: "-3%",
                background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
                animationDelay: "0.8s",
            }} />

            {/* ── Animated grid ── */}
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(ellipse 85% 75% at 50% 0%, black 20%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 0%, black 20%, transparent 100%)",
                pointerEvents: "none",
            }} />

            {/* ── Floating particles ── */}
            {particles.map((p, i) => (
                <Particle
                    key={i}
                    style={{
                        top: p.top, left: p.left, right: p.right,
                        width: p.w, height: p.h,
                        background: p.c,
                        boxShadow: `0 0 ${p.w * 2}px ${p.c}`,
                        opacity: 0,
                        // @ts-ignore
                        ref: particleRefs[i],
                    }}
                />
            ))}
            {/* Separate DOM refs via inner divs */}
            <div style={{ display: "none" }}>
                {particles.map((_, i) => (
                    <div key={i} ref={particleRefs[i]} style={{
                        position: "absolute",
                        top: particles[i].top, left: particles[i].left, right: particles[i].right,
                        width: particles[i].w, height: particles[i].h,
                        borderRadius: "50%",
                        background: particles[i].c,
                        boxShadow: `0 0 ${particles[i].w * 2}px ${particles[i].c}`,
                        opacity: 0,
                        pointerEvents: "none",
                    }} />
                ))}
            </div>
            {/* Rendered visible particles */}
            {particles.map((p, i) => (
                <div
                    key={`vis-${i}`}
                    style={{
                        position: "absolute",
                        top: p.top, left: p.left, right: p.right,
                        width: p.w, height: p.h, borderRadius: "50%",
                        background: p.c, boxShadow: `0 0 ${p.w * 2}px ${p.c}`,
                        opacity: 0, pointerEvents: "none",
                    }}
                    className="anim-float"
                    data-particle-index={i}
                />
            ))}

            {/* ── Content ── */}
            <div className="page-container" style={{ position: "relative", zIndex: 2, maxWidth: 820 }}>
                {/* Badge */}
                <div ref={badgeRef} style={{
                    display: "inline-flex", alignItems: "center", gap: "0.55rem",
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.28)",
                    borderRadius: "2rem", padding: "0.38rem 1rem", marginBottom: "2rem", opacity: 0,
                }}>
                    {/* Live ping dot */}
                    <span style={{ position: "relative", width: 8, height: 8, display: "inline-flex" }}>
                        <span className="ping-ring" style={{ color: "#a78bfa", width: 8, height: 8 }} />
                        <span style={{
                            position: "relative", zIndex: 1, width: 8, height: 8, borderRadius: "50%",
                            background: "#a78bfa", display: "block", boxShadow: "0 0 8px #a78bfa",
                        }} />
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#c4b5fd", letterSpacing: "0.04em" }}>
                        Now in Public Beta — Built for campus organizers
                    </span>
                </div>

                {/* Headline */}
                <h1 ref={headlineRef} style={{
                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                    fontWeight: 900, lineHeight: 1.08, marginBottom: "1.5rem", opacity: 0,
                }}>
                    The Operating System for{" "}
                    <span className="gradient-text" style={{
                        background: "linear-gradient(130deg, #c4b5fd 0%, #818cf8 40%, #6ee7b7 100%)",
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        animation: "gradient-shift 4s ease infinite",
                    }}>
                        Smart Campus Events
                    </span>
                </h1>

                {/* Subheadline */}
                <p ref={subRef} style={{
                    fontSize: "clamp(1rem, 2.2vw, 1.2rem)",
                    color: "var(--text-secondary)", maxWidth: 640,
                    margin: "0 auto 2.75rem", lineHeight: 1.76, opacity: 0,
                }}>
                    Planora centralizes planning, budgeting, volunteer coordination, and
                    execution into one intelligent dashboard built for colleges and student organizers.
                </p>

                {/* CTAs */}
                <div ref={ctaRef} style={{
                    display: "flex", gap: "1rem", justifyContent: "center",
                    flexWrap: "wrap", marginBottom: "1.75rem",
                }}>
                    <Link to="/signup" className="btn btn-primary btn-lg anim-pulse-glow" style={{ opacity: 0 }}>
                        Get Started Free →
                    </Link>
                    <a href="#product" className="btn btn-ghost btn-lg" style={{ opacity: 0 }}>
                        View Demo ↗
                    </a>
                </div>

                {/* Supporting copy */}
                <p ref={metaRef} style={{ fontSize: "0.82rem", color: "var(--text-muted)", opacity: 0 }}>
                    Built for hackathons, tech fests, student councils, and campus communities.
                </p>
            </div>
        </section>
    );
}
