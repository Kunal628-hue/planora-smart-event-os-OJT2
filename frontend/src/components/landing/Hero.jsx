import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simple fade up for the entire hero content
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.5, delay: 0.2, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="hero" style={{
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      background: "transparent",
      overflow: "hidden",
      color: "#FFFFFF",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>

      {/* Background SVG Lines */}
      <svg className="hero-bg-svg" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        <line x1="18%" y1="28%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="82%" y1="22%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="12%" y1="85%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1="88%" y1="85%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </svg>

      {/* Floating Badges */}
      <div className="hero-badge-1" style={{ position: "absolute", top: "25%", left: "15%", display: "flex", alignItems: "center", gap: "10px", zIndex: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 4, height: 4, background: "#fff", borderRadius: "50%" }} />
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>Guest List</div>
          <div style={{ color: "#666", fontSize: "0.7rem" }}>20,945 loaded</div>
        </div>
      </div>

      <div className="hero-badge-2" style={{ position: "absolute", top: "18%", right: "15%", display: "flex", alignItems: "center", gap: "10px", zIndex: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>Automation</div>
          <div style={{ color: "#666", fontSize: "0.7rem" }}>Live</div>
        </div>
      </div>

      <div className="hero-badge-3" style={{ position: "absolute", bottom: "15%", left: "10%", display: "flex", alignItems: "center", gap: "10px", zIndex: 10 }}>
        <div>
          <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>Vendors</div>
          <div style={{ color: "#666", fontSize: "0.7rem" }}>16 Connected</div>
        </div>
      </div>

      <div className="hero-badge-4" style={{ position: "absolute", bottom: "12%", right: "12%", display: "flex", alignItems: "center", gap: "10px", zIndex: 10 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 4, height: 4, background: "#f59e0b", borderRadius: "50%" }} />
        </div>
        <div>
          <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>Budget</div>
          <div style={{ color: "#666", fontSize: "0.7rem" }}>Synchronized</div>
        </div>
      </div>

      {/* Main Center Content */}
      <div ref={contentRef} style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", pointerEvents: "none" }}>
        
        {/* Top Chip */}
        <div style={{ 
          display: "inline-flex", alignItems: "center", gap: "8px", 
          padding: "6px 16px", background: "rgba(255,255,255,0.03)", 
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "999px", 
          fontSize: "0.8rem", color: "#ccc", marginBottom: "2.5rem" 
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
          Planora OS 2.0 Live
        </div>

        {/* Main Heading */}
        <h1 className="flammini-heading" style={{
          fontSize: "clamp(3rem, 7vw, 6.5rem)",
          color: "#fff",
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          fontWeight: 700
        }}>
          One-source for Event<br />
          <span style={{ color: "#fff", display: "inline-block" }}>
            Intelligence
          </span>
        </h1>

        {/* Subheadline */}
        <p style={{ 
          color: "#888", 
          fontSize: "1.15rem", 
          maxWidth: "600px", 
          lineHeight: 1.6, 
          marginTop: "2.5rem",
          fontWeight: 400
        }}>
          Dive into automated event ecosystems, where innovative synchronization meets enterprise-grade execution.
        </p>

      </div>
    </section>
  );
}
