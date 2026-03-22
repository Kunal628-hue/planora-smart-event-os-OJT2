import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, createTimeline, stagger } from "animejs";
import useCursorGlow from "../../hooks/useCursorGlow";
import useMagnetic from "../../hooks/useMagnetic";

// ── Canvas Particle System ──
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 60;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.4 + 0.05,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -(Math.random() * 0.3 + 0.1),
      hue: Math.random() > 0.5 ? 250 : 200 + Math.random() * 50,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

// ── Dashboard Preview Mock ──
function HeroDashboardMock() {
  const pathRef = useRef(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const len = 1000;
    animate(pathRef.current, {
      strokeDashoffset: [len, 0],
      duration: 2000,
      delay: 1400,
      easing: "easeOutCubic",
    });
  }, []);

  const chartPoints = [
    [0, 75], [20, 55], [40, 65], [60, 35], [80, 45], [100, 20], [120, 30],
    [140, 10], [160, 22], [180, 5], [200, 15], [220, 0],
  ];
  const svgPath = `M ${chartPoints.map(([x, y]) => `${x},${y}`).join(" L ")}`;
  const areaPath = `M 0,75 L ${chartPoints.map(([x, y]) => `${x},${y}`).join(" L ")} L 220,75 Z`;

  return (
    <div
      style={{
        background: "rgba(13,16,28,0.95)",
        border: "1px solid rgba(139,92,246,0.25)",
        borderRadius: "1.5rem",
        padding: "1.75rem",
        backdropFilter: "blur(24px)",
        boxShadow:
          "0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
        maxWidth: "520px",
        width: "100%",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.7)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Event Dashboard</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>Tech Summit 2026</div>
        </div>
        <div style={{
          padding: "0.28rem 0.8rem",
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: "2rem",
          color: "#4ade80",
          fontSize: "0.72rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
          On Track
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          { label: "Guests", value: "842", color: "#a78bfa", icon: "👥" },
          { label: "Budget Used", value: "78%", color: "#60a5fa", icon: "💰" },
          { label: "Tasks Done", value: "23/31", color: "#34d399", icon: "✅" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "0.875rem",
            padding: "0.9rem 0.75rem",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(148,163,184,0.6)", marginTop: "0.2rem", fontWeight: 500, letterSpacing: "0.04em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "1rem",
        padding: "1rem",
        marginBottom: "1rem",
      }}>
        <div style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.5)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Registrations Over Time
        </div>
        <svg viewBox="0 0 220 80" style={{ width: "100%", height: "70px", overflow: "visible" }}>
          <defs>
            <linearGradient id="chartGradHero" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#chartGradHero)" />
          <path
            ref={pathRef}
            d={svgPath}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
            }}
          />
        </svg>
      </div>

      {/* Progress Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ width: "74%", height: "100%", background: "linear-gradient(90deg, #8b5cf6, #60a5fa)", borderRadius: "3px" }} />
        </div>
        <span style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.6)", fontWeight: 600, flexShrink: 0 }}>74% Overall Health</span>
      </div>

      <div style={{
        position: "absolute", top: -50, right: -50, width: 160, height: 160,
        background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
        pointerEvents: "none", borderRadius: "50%",
      }} />
    </div>
  );
}

export default function Hero() {
  const glowPos = useCursorGlow();
  const primaryBtnRef = useMagnetic(0.35);
  const ghostBtnRef = useMagnetic(0.25);

  const badgeRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const mockupRef = useRef(null);
  const sectionRef = useRef(null);

  // Parallax on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (sectionRef.current) {
        const blobs = sectionRef.current.querySelectorAll(".parallax-blob");
        blobs.forEach((b, i) => {
          const speed = i % 2 === 0 ? 0.15 : 0.25;
          b.style.transform = `translateY(${scrollY * speed}px)`;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Entrance animation using Anime.js v4 createTimeline
  useEffect(() => {
    const tl = createTimeline({ easing: "easeOutExpo", autoplay: true, defaults: { duration: 700 } });

    tl.add(badgeRef.current, { opacity: [0, 1], translateY: [20, 0], delay: 200 })
      .add(headlineRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 900 }, "-=400")
      .add(subRef.current, { opacity: [0, 1], translateY: [20, 0] }, "-=500")
      .add(ctaRef.current, { opacity: [0, 1], translateY: [16, 0], duration: 600 }, "-=400")
      .add(statsRef.current, { opacity: [0, 1], translateY: [12, 0], duration: 500 }, "-=300")
      .add(mockupRef.current, { opacity: [0, 1], translateX: [40, 0], duration: 1000, easing: "easeOutCubic" }, "-=800");
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "6rem",
        paddingBottom: "5rem",
      }}
    >
      {/* Cursor glow */}
      <div style={{
        position: "fixed",
        left: glowPos.x - 200,
        top: glowPos.y - 200,
        width: 400,
        height: 400,
        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)",
        pointerEvents: "none",
        zIndex: 0,
        filter: "blur(12px)",
      }} />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Background glows */}
      <div className="parallax-blob" style={{
        position: "absolute", width: 800, height: 800, top: "-20%", left: "-15%",
        background: "radial-gradient(ellipse, rgba(99,102,241,0.13) 0%, transparent 65%)",
        filter: "blur(80px)", pointerEvents: "none", zIndex: 0, borderRadius: "50%",
      }} />
      <div className="parallax-blob" style={{
        position: "absolute", width: 600, height: 600, bottom: "-10%", right: "-10%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)",
        filter: "blur(80px)", pointerEvents: "none", zIndex: 0, borderRadius: "50%",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        pointerEvents: "none", zIndex: 0,
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
      }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "0 5rem" }}>
        <style>{`
          .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
          @media (max-width: 960px) {
            .hero-grid { grid-template-columns: 1fr; gap: 3.5rem; text-align: center; }
            .hero-cta-group { justify-content: center !important; }
          }
          @keyframes ping-hero { 75%,100% { transform: scale(2); opacity: 0; } }
          .ping-ring { position: absolute; inset: 0; border-radius: 50%; animation: ping-hero 1.8s cubic-bezier(0,0,0.2,1) infinite; }
        `}</style>

        <div className="hero-grid">
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            {/* Badge */}
            <div ref={badgeRef} style={{
              opacity: 0,
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "2rem", padding: "0.4rem 1.1rem 0.4rem 0.7rem", marginBottom: "1.75rem",
            }}>
              <span style={{ position: "relative", display: "flex", width: 8, height: 8 }}>
                <span className="ping-ring" style={{ background: "rgba(139,92,246,0.5)" }} />
                <span style={{ width: 8, height: 8, background: "#a78bfa", borderRadius: "50%", position: "relative" }} />
              </span>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#c4b5fd", letterSpacing: "0.03em" }}>
                Introducing Planora — The Smart Event OS
              </span>
            </div>

            {/* Headline */}
            <h1 ref={headlineRef} style={{
              opacity: 0,
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              fontWeight: 900, lineHeight: 1.25, marginBottom: "2rem",
              color: "#fff", letterSpacing: "-0.035em",
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}>
              The Operating System<br />
              for{" "}
              <span style={{
                background: "linear-gradient(135deg, #c4b5fd 0%, #818cf8 40%, #60a5fa 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                All Your Events
              </span>
            </h1>

            {/* Subheadline */}
            <p ref={subRef} style={{
              opacity: 0,
              fontSize: "0.95rem",
              color: "rgba(148,163,184,0.8)", lineHeight: 1.8,
              marginBottom: "3rem", maxWidth: "480px",
            }}>
              Planora centralizes planning, budgeting, volunteer coordination, and execution into one intelligent dashboard.
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="hero-cta-group" style={{
              opacity: 0,
              display: "flex", gap: "1.25rem", flexWrap: "wrap",
              marginBottom: "3.5rem", alignItems: "center",
            }}>
              <Link
                to="/signup"
                ref={primaryBtnRef}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.9rem 2.25rem",
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #4338ca 100%)",
                  color: "#fff", borderRadius: "0.875rem", fontWeight: 700, fontSize: "0.975rem",
                  textDecoration: "none",
                  boxShadow: "0 10px 30px -8px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  willChange: "transform",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 20px 40px -8px rgba(124,58,237,0.65), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 10px 30px -8px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"; }}
              >
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>

              <a
                href="#product"
                ref={ghostBtnRef}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.9rem 1.9rem",
                  background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.8)",
                  borderRadius: "0.875rem", fontWeight: 600, fontSize: "0.975rem",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  willChange: "transform",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                View Demo
              </a>
            </div>

            {/* Stats */}
            <div ref={statsRef} style={{ opacity: 0, display: "flex", gap: "3rem", flexWrap: "wrap" }}>
              {[
                { value: "10k+", label: "Events Managed" },
                { value: "98%", label: "Satisfaction Rate" },
                { value: "40%", label: "Time Saved" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>{s.value}</span>
                  <span style={{ fontSize: "0.72rem", color: "rgba(148,163,184,0.5)", fontWeight: 500, letterSpacing: "0.04em" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Mockup */}
          <div ref={mockupRef} style={{ opacity: 0, perspective: "1200px" }}>
            <div
              style={{ transform: "rotateY(-6deg) rotateX(3deg)", transformStyle: "preserve-3d", transition: "transform 0.6s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "rotateY(-2deg) rotateX(1deg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "rotateY(-6deg) rotateX(3deg)"; }}
            >
              <HeroDashboardMock />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
