import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Dark rounded card scales in on scroll
      gsap.fromTo(
        cardRef.current,
        { scale: 0.9, opacity: 0, y: 50 },
        {
          scale: 1, opacity: 1, y: 0,
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "center center",
            scrub: 1,  // Scrub for smooth scaling tied to scroll
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} style={{ background: "#050505", padding: "6rem 2.5rem 8rem", fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes mesh-drift {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-45%, -55%) scale(1.15); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes button-shine {
          0% { transform: translateX(-150%) skewX(-20deg); }
          15%, 100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes draw-arrow {
          to { stroke-dashoffset: 0; }
        }
        .cta-btn-primary {
          position: relative;
          overflow: hidden;
        }
        .cta-btn-primary::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 60%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent);
          transform: translateX(-150%) skewX(-20deg);
          animation: button-shine 5s infinite;
        }
      `}} />
        <div 
        ref={cardRef}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "2rem",
          padding: "6rem 2rem",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden",
          backdropFilter: "blur(20px)"
        }}
      >
        {/* Subtle background glow mimicking video's deep layout */}
        <div style={{
          position: "absolute",
          top: "0%", left: "50%", transform: "translate(-50%, -50%)",
          width: "80%", height: "80%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(236,72,153,0.05) 40%, transparent 70%)",
          pointerEvents: "none",
          borderRadius: "50%",
          animation: "mesh-drift 15s ease-in-out infinite"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{
            color: "#fff",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem"
          }}>
            Ready to modernize your events?
          </h2>
          
          <p style={{
            fontSize: "1.1rem",
            color: "#9CA3AF",
            maxWidth: 600,
            margin: "0 auto 3rem",
            lineHeight: 1.6
          }}>
            Join 10,000+ organizers who are saving time, cutting costs, and delivering unforgettable experiences with Planora today.
          </p>
          
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            
            <div style={{ position: "relative" }}>

              <Link to="/signup" className="cta-btn-primary" style={{
                background: "#fff", color: "#111827",
                border: "none", padding: "0.9rem 2rem",
                borderRadius: "999px", fontSize: "0.95rem", fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                textDecoration: "none"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(255,255,255,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Get Started for Free ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
