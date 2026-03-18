import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, createTimeline } from "animejs";
import useMagnetic from "../../hooks/useMagnetic";

export default function FinalCTA() {
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const subRef = useRef(null);
  const btnGroupRef = useRef(null);
  const animated = useRef(false);
  const primaryRef = useMagnetic(0.35);
  const ghostRef = useMagnetic(0.25);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const tl = createTimeline({ easing: "easeOutExpo", autoplay: true });
          tl.add(headRef.current, { opacity: [0, 1], translateY: [30, 0], duration: 800 })
            .add(subRef.current, { opacity: [0, 1], translateY: [20, 0], duration: 700 }, "-=500")
            .add(btnGroupRef.current, { opacity: [0, 1], translateY: [16, 0], duration: 600 }, "-=400");
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Pulse animation on button
  const pulseRef = useRef(null);
  useEffect(() => {
    if (!pulseRef.current) return;
    animate(pulseRef.current, {
      scale: [1, 1.18, 1],
      opacity: [0.6, 0, 0.6],
      duration: 2800,
      loop: true,
      easing: "easeInOutSine",
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      style={{
        padding: "8rem 0",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Large glow blobs */}
      <div style={{
        position: "absolute",
        width: 700,
        height: 700,
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(79,70,229,0.08) 40%, transparent 65%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute",
        width: 400,
        height: 400,
        top: "30%",
        left: "20%",
        background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)",
        filter: "blur(60px)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />
      <div style={{
        position: "absolute",
        width: 350,
        height: 350,
        bottom: "20%",
        right: "15%",
        background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)",
        filter: "blur(60px)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />

      {/* Grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        pointerEvents: "none",
        maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)",
      }} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          background: "rgba(124,58,237,0.1)",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: "2rem",
          padding: "0.35rem 1.1rem 0.35rem 0.7rem",
          marginBottom: "2.5rem",
        }}>
          <span style={{ fontSize: "0.85rem" }}>✦</span>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#c4b5fd", letterSpacing: "0.03em" }}>
            Free for student clubs — always
          </span>
        </div>

        <h2
          ref={headRef}
          style={{
            fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            opacity: 0,
          }}
        >
          Ready to run your campus<br />
          events with{" "}
          <span style={{
            background: "linear-gradient(135deg, #c4b5fd 0%, #818cf8 45%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            intelligence?
          </span>
        </h2>

        <p
          ref={subRef}
          style={{
            fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
            color: "rgba(148,163,184,0.75)",
            lineHeight: 1.75,
            marginBottom: "3rem",
            maxWidth: 520,
            margin: "0 auto 3rem",
            opacity: 0,
          }}
        >
          Join hundreds of student organizations already using Planora to run smarter, faster, better events.
        </p>

        <div
          ref={btnGroupRef}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
            opacity: 0,
          }}
        >
          {/* Primary CTA with pulse */}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <div ref={pulseRef} style={{
              position: "absolute",
              inset: -4,
              borderRadius: "1.1rem",
              background: "rgba(124,58,237,0.4)",
              pointerEvents: "none",
            }} />
            <Link
              to="/signup"
              ref={primaryRef}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "1rem 2.5rem",
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #4338ca 100%)",
                color: "#fff",
                borderRadius: "0.9rem",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 12px 35px -8px rgba(124,58,237,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
                position: "relative",
                zIndex: 1,
                willChange: "transform",
              }}
            >
              Get Started Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          <a
            href="#features"
            ref={ghostRef}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "1rem 2rem",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.75)",
              borderRadius: "0.9rem",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              transition: "background 0.3s, border-color 0.3s",
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
            See all features
          </a>
        </div>

        {/* Small trust note */}
        <p style={{ marginTop: "2.5rem", fontSize: "0.8rem", color: "rgba(148,163,184,0.35)", fontWeight: 500 }}>
          No credit card required · Free for student organizations · Cancel anytime
        </p>
      </div>
    </section>
  );
}
