import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function FinalCTA() {
  const containerRef = useRef(null);

  useEffect(() => {
    // ScrollTrigger removed because this component is inside a manually translated GSAP timeline.
  }, []);

  return (
    <section ref={containerRef} style={{
      background: "transparent",
      color: "#FFFFFF",
      padding: "8rem 0 12rem",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      overflow: "hidden"
    }}>
      {/* Subtle top radial gradient glow */}
      <div style={{
        position: "absolute",
        top: "-50%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        height: "100%",
        background: "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0,0,0,0) 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "0 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        position: "relative",
        zIndex: 1
      }}>
        
        <h2 className="flammini-heading" style={{
          color: "#fff",
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          margin: 0
        }}>
          Ready to modernize your events?
        </h2>
          
        <p style={{
          color: "#9ca3af",
          fontSize: "1.1rem",
          lineHeight: 1.6,
          maxWidth: 550,
          margin: "0 0 2rem 0"
        }}>
          Join 10,000+ organizers who are saving time, cutting costs, and delivering unforgettable experiences with Planora today.
        </p>

        <div>
          <Link to="/signup" style={{
            background: "#fff",
            color: "#000",
            padding: "1rem 2rem",
            borderRadius: "999px",
            fontSize: "1rem",
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "transform 0.2s, background 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.background = "#f0f0f0"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#fff"; }}
          >
            Get Started for Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
