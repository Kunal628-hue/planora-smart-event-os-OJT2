import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function NetworkAuroraBackground() {
  const containerRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Base glowing orb animation
      gsap.to(".aurora-orb", {
        rotate: 360,
        duration: 40,
        ease: "none",
        repeat: -1,
      });

      // Floating nodes
      gsap.to(".network-node", {
        y: "random(-15, 15)",
        x: "random(-15, 15)",
        duration: "random(4, 7)",
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Scroll Color Shift Effect
      gsap.fromTo(glowRef.current, 
        { filter: "hue-rotate(0deg) saturate(1)", opacity: 0.8 },
        {
          filter: "hue-rotate(180deg) saturate(1.5)",
          opacity: 0.8, // Maintain opacity or adjust if needed
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Downward floating particles/rain
      gsap.utils.toArray(".light-rain").forEach((rain) => {
        gsap.fromTo(rain,
          { y: -100, opacity: 0 },
          { 
            y: "100vh", 
            opacity: 1, 
            duration: "random(3, 8)", 
            ease: "none", 
            repeat: -1, 
            delay: "random(0, 5)" 
          }
        );
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      background: "#050505",
      overflow: "hidden"
    }}>
      {/* Aurora Glow */}
      <div ref={glowRef} style={{
        position: "absolute",
        top: "-20%",
        left: "10%",
        width: "80vw",
        height: "80vh",
        background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(139,92,246,0.06) 30%, rgba(16,185,129,0.03) 50%, rgba(0,0,0,0) 70%)",
        filter: "blur(60px)",
        transformOrigin: "center center",
      }} className="aurora-orb" />

      {/* Network Lines & SVG Drawing */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        {/* Lines connecting some invisible center points to the nodes */}
        <path d="M20,40 Q35,50 50,45" stroke="rgba(255,255,255,0.1)" fill="none" strokeWidth="1" className="network-path"/>
        <line x1="20%" y1="40%" x2="45%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="80%" y1="35%" x2="55%" y2="50%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="15%" y1="70%" x2="40%" y2="60%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="85%" y1="75%" x2="60%" y2="65%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Glow dots on connections */}
        <circle cx="45%" cy="50%" r="2" fill="#fff" opacity="0.3" />
        <circle cx="55%" cy="50%" r="2" fill="#fff" opacity="0.3" />
        <circle cx="40%" cy="60%" r="2" fill="#fff" opacity="0.3" />
        <circle cx="60%" cy="65%" r="2" fill="#fff" opacity="0.3" />
      </svg>

      {/* Node: Cortex */}
      <div className="network-node" style={{ position: "absolute", top: "35%", left: "18%", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 16, height: 16, border: "1px solid rgba(255,255,255,0.4)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
           <div style={{ width: 4, height: 4, background: "#fff", borderRadius: "50%" }} />
        </div>
        <div>
          <div style={{ color: "#E5E7EB", fontSize: "0.8rem", fontWeight: 600 }}>Guest List</div>
          <div style={{ color: "#9CA3AF", fontSize: "0.65rem" }}>20,945 loaded</div>
        </div>
      </div>

      {/* Node: Quant */}
      <div className="network-node" style={{ position: "absolute", top: "30%", right: "18%", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 24, height: 24, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div>
          <div style={{ color: "#E5E7EB", fontSize: "0.8rem", fontWeight: 600 }}>Automation</div>
          <div style={{ color: "#9CA3AF", fontSize: "0.65rem" }}>Live</div>
        </div>
      </div>

      {/* Node: Aelf */}
      <div className="network-node" style={{ position: "absolute", bottom: "30%", left: "12%", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 20, height: 20, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
           <div style={{ width: 8, height: 8, background: "rgba(255,255,255,0.8)", borderRadius: "50%" }} />
        </div>
        <div>
          <div style={{ color: "#E5E7EB", fontSize: "0.8rem", fontWeight: 600 }}>Vendors</div>
          <div style={{ color: "#9CA3AF", fontSize: "0.65rem" }}>16 Connected</div>
        </div>
      </div>

      {/* Node: Meeton */}
      <div className="network-node" style={{ position: "absolute", bottom: "25%", right: "15%", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 20, height: 20, border: "1px dashed rgba(255,255,255,0.5)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}>
           <div style={{ width: 6, height: 6, background: "#A78BFA", borderRadius: "50%" }} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#E5E7EB", fontSize: "0.8rem", fontWeight: 600 }}>Budget</div>
          <div style={{ color: "#9CA3AF", fontSize: "0.65rem" }}>Synchronized</div>
        </div>
      </div>

      {/* Subtle Rain / Light streaks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="light-rain" style={{
          position: "absolute",
          top: 0,
          left: `${15 + i * 15}%`,
          width: "1px",
          height: "80px",
          background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0))",
          opacity: 0,
        }} />
      ))}

      {/* Grid Pattern overlay for texture */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: 0.2
      }} />

    </div>
  );
}
