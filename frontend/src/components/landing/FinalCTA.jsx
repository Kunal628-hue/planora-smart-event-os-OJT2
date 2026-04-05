import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ClickSpark from "../ui/ClickSpark";

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
    <section ref={containerRef} style={{ background: "#030712", padding: "8rem 2.5rem 10rem", fontFamily: "'Inter', sans-serif" }}>
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
        .cta-btn-primary {
          position: relative;
          overflow: hidden;
        }
        .cta-btn-primary::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 60%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(59,130,246,0.3), transparent);
          transform: translateX(-150%) skewX(-20deg);
          animation: button-shine 5s infinite;
        }
      `}} />
      <div 
        ref={cardRef}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "linear-gradient(135deg, #0A0F1D 0%, #030712 100%)",
          borderRadius: "3rem",
          padding: "8rem 2rem",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <ClickSpark
          sparkColor="#60A5FA"
          sparkSize={12}
          sparkRadius={20}
          sparkCount={12}
          duration={500}
        >
          {/* Subtle background glow */}
          <div style={{
            position: "absolute",
            top: "0%", left: "50%", transform: "translate(-50%, -50%)",
            width: "80%", height: "80%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(168,85,247,0.05) 50%, transparent 80%)",
            pointerEvents: "none",
            borderRadius: "50%",
            animation: "mesh-drift 20s ease-in-out infinite"
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{
              color: "#F9FAFB",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              marginBottom: "2.5rem",
              fontFamily: "'Outfit', sans-serif"
            }}>
              Ready to <span style={{ color: "#3B82F6" }}>Elevate</span> Your Events?
            </h2>
            
            <p style={{
              fontSize: "1.25rem",
              color: "#94A3B8",
              maxWidth: 700,
              margin: "0 auto 4rem",
              lineHeight: 1.6
            }}>
              Join the next generation of event architects. Scalable, intelligent, and designed for high-performance teams.
            </p>
            
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
              <Link to="/signup" className="cta-btn-primary" style={{
                background: "#F9FAFB", color: "#030712",
                border: "none", padding: "1.1rem 2.8rem",
                borderRadius: "999px", fontSize: "1.05rem", fontWeight: 800,
                display: "inline-flex", alignItems: "center", gap: "0.75rem",
                cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                textDecoration: "none",
                boxShadow: "0 10px 40px rgba(255,255,255,0.1)"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(255,255,255,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(255,255,255,0.1)"; }}
              >
                Create Your Account Now
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </Link>
            </div>
          </div>
        </ClickSpark>
      </div>
    </section>
  );
}
