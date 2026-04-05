import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DarkVeil from "../ui/DarkVeil";
import NeuralFlow from "../ui/NeuralFlow";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const dashboardRef = useRef(null);
  const pill1Ref = useRef(null);
  const pill2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.1 }
      )
      .fromTo(
        ".planora-cursor",
        { x: 100, y: 100, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.2"
      )
      .to(
        ".planora-box rect",
        { strokeDashoffset: 0, duration: 0.8, ease: "power3.inOut" },
        "-=0.1"
      )
      .fromTo(
        [subRef.current, ctaRef.current],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
        "-=0.4"
      )
      .fromTo(
        [pill1Ref.current, pill2Ref.current],
        { scale: 0.5, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" },
        "-=0.6"
      )
      .fromTo(
        dashboardRef.current,
        { y: 150, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2 },
        "-=0.8"
      )
      .fromTo(
        ".dash-widget",
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" },
        "-=0.6"
      )
      .to(".dash-progress", { width: "90%", duration: 1.5, ease: "power3.out" }, "-=0.2")
      .to(".dash-circle", { strokeDashoffset: 138, duration: 1.5, ease: "power3.out" }, "-=1.5");

      // Parallax for dashboard
      gsap.to(dashboardRef.current, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Interactive scroll-based color shifting
      gsap.to(".scroll-color-shift", {
        filter: "hue-rotate(360deg)",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="hero" style={{
      position: "relative",
      paddingTop: "10rem",
      paddingBottom: "6rem",
      background: "#030712",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .floating-pill { display: none !important; }
        }
        @keyframes orb-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes gradient-text {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes text-pulse {
          0% { filter: drop-shadow(0 0 20px rgba(219,39,119,0.3)); }
          50% { filter: drop-shadow(0 0 40px rgba(219,39,119,0.6)); }
          100% { filter: drop-shadow(0 0 20px rgba(219,39,119,0.3)); }
        }
        @keyframes draw-scribble {
          to { stroke-dashoffset: 0; }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(-3deg); }
        }
        @keyframes float-fast {
          0% { transform: translateY(0px) rotate(4deg); }
          50% { transform: translateY(-20px) rotate(6deg); }
          100% { transform: translateY(0px) rotate(4deg); }
        }
        @keyframes float-desk {
          0% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(3deg); }
        }
        @keyframes ring-glow {
          0% { filter: drop-shadow(0 0 5px rgba(96,165,250,0.4)); }
          50% { filter: drop-shadow(0 0 15px rgba(96,165,250,0.8)); }
          100% { filter: drop-shadow(0 0 5px rgba(96,165,250,0.4)); }
        }
      `}} />

      {/* DarkVeil Background Animation */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        opacity: 0.15, // Subtle matching effect
        pointerEvents: "none"
      }}>
        <DarkVeil 
          speed={0.15} 
          hueShift={-80} 
          noiseIntensity={0.02} 
          scanlineIntensity={0.05} 
          scanlineFrequency={150}
          warpAmount={0.2}
        />
      </div>

      {/* Glowing Rotating Orb */}
      <div className="scroll-color-shift" style={{
        position: "absolute",
        top: "-10%",
        left: "20%",
        width: "60vw",
        height: "60vw",
        background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, rgba(236,72,153,0.03) 40%, transparent 70%)",
        animation: "orb-spin 20s linear infinite",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Background Grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        opacity: 0.8,
        pointerEvents: "none"
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 2rem" }}>
        
        {/* Main Text Area */}
        <div style={{ textAlign: "center", position: "relative", marginBottom: "4rem" }}>
          
          {/* Top Badge Row */}
          <div style={{ display: "flex", justifyContent: "center", gap: "6rem", marginBottom: "3rem" }}>
            <div ref={pill1Ref} style={{ animation: "float-slow 4s ease-in-out infinite" }}>
              <div style={{
                background: "#312E81", color: "#fff",
                padding: "0.6rem 1.4rem", borderRadius: "999px",
                fontSize: "0.8rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "0.5rem",
                boxShadow: "0 10px 25px -5px rgba(49,46,129,0.4)",
              }}>
                AI Powered
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.22 8.88a2 2 0 0 0 1.42 1.42L25.5 15.5l-8.88 2.22a2 2 0 0 0-1.42 1.42L13 28l-2.22-8.88a2 2 0 0 0-1.42-1.42L.5 15.5l8.88-2.22a2 2 0 0 0 1.42-1.42L13 3z"/></svg>
              </div>
            </div>

            <div ref={pill2Ref} style={{ animation: "float-fast 3.5s ease-in-out infinite 0.5s" }}>
              <div style={{
                background: "#7F1D1D", color: "#fff",
                padding: "0.6rem 1.4rem", borderRadius: "999px",
                fontSize: "0.8rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "0.5rem",
                boxShadow: "0 10px 25px -5px rgba(127,29,29,0.4)",
              }}>
                Team Sync
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.22 8.88a2 2 0 0 0 1.42 1.42L25.5 15.5l-8.88 2.22a2 2 0 0 0-1.42 1.42L13 28l-2.22-8.88a2 2 0 0 0-1.42-1.42L.5 15.5l8.88-2.22a2 2 0 0 0 1.42-1.42L13 3z"/></svg>
              </div>
            </div>
          </div>

          {/* Title Box Outline effect */}
          <h1 ref={titleRef} style={{
            fontSize: "clamp(3rem, 6vw, 4.8rem)",
            fontWeight: 800,
            color: "#F9FAFB",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            maxWidth: 900,
            margin: "0 auto 1.8rem",
            position: "relative",
            display: "inline-block",
            fontFamily: "'Outfit', sans-serif"
          }}>
            Master Every Detail of Your<br />Events with{" "}
            <span style={{ 
              position: "relative", display: "inline-block",
              padding: "0.2rem 0.5rem", zIndex: 1
            }}>
              <span className="scroll-color-shift" style={{
                display: "inline-block",
                background: "linear-gradient(to right, #60A5FA, #A855F7, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradient-text 6s ease infinite"
              }}>
                Planora.
              </span>
              <svg className="planora-box scroll-color-shift" style={{ 
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 
              }} preserveAspectRatio="none">
                <rect width="100%" height="100%" rx="8" fill="rgba(37,99,235,0.06)" stroke="url(#box-gradient)" strokeWidth="3" strokeDasharray="1000" strokeDashoffset="1000" />
                <defs>
                  <linearGradient id="box-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#DB2777" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Hand-drawn scribble underline to humanize it */}
              <svg style={{ position: "absolute", bottom: -10, left: "10%", width: "80%", height: "20px", pointerEvents: "none", zIndex: -1 }} viewBox="0 0 200 20" preserveAspectRatio="none">
                <path d="M5,15 Q50,0 100,10 T195,15" fill="none" stroke="#DB2777" strokeWidth="4" strokeLinecap="round" strokeDasharray="200" strokeDashoffset="200" className="scribble-line scroll-color-shift" style={{ animation: "draw-scribble 1s ease-out forwards 1.5s" }} />
              </svg>
              <svg className="planora-cursor scroll-color-shift" style={{ 
                position: "absolute", bottom: -15, right: -15, color: "#DB2777", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" 
              }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="#fff" /><path d="M13 13l6 6"/>
              </svg>
            </span>
          </h1>

          <p ref={subRef} style={{
            fontSize: "1.15rem",
            color: "#94A3B8",
            maxWidth: 600,
            margin: "0 auto 3rem",
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            The professional operating system for event planners. Centralize planning, budgeting, and coordination in one sleek interface.
          </p>

          <div ref={ctaRef}>
            <Link to="/signup" style={{
              background: "#F9FAFB",
              color: "#030712",
              border: "none",
              padding: "1rem 2.2rem",
              borderRadius: "999px",
              fontSize: "1rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              transition: "transform 0.3s, background 0.3s, box-shadow 0.3s",
              textDecoration: "none",
              boxShadow: "0 10px 40px rgba(255,255,255,0.1)"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 15px 50px rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 40px rgba(255,255,255,0.1)"; }}
            >
              Start Planning Free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </Link>
          </div>
        </div>

        {/* 3-Column Dashboard Mockup - Redesigned as Sleek Glass Panel */}
        <div ref={dashboardRef} style={{
          background: "rgba(17, 24, 39, 0.4)",
          backdropFilter: "blur(40px)",
          borderRadius: "2.5rem",
          padding: "3rem",
          boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "3rem",
          position: "relative"
        }}>
          {/* Top Left: Task Today */}
          <div>
            <div className="dash-widget" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#F9FAFB", letterSpacing: "-0.02em" }}>Active Insights</h3>
            </div>
            
            <div className="dash-widget" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.5rem", padding: "1.5rem", marginBottom: "2rem", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#F3F4F6", marginBottom: "0.25rem" }}>Global Tech Summit 2024</div>
              <div style={{ fontSize: "0.85rem", color: "#94A3B8", marginBottom: "1.5rem" }}>Lead Organizer View</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                <span style={{ color: "#94A3B8" }}>Budget Utilization</span>
                <span style={{ fontWeight: 600, color: "#60A5FA" }}>92%</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden", marginBottom: "2rem" }}>
                <div className="dash-progress" style={{ height: "100%", width: "0%", background: "linear-gradient(90deg, #3B82F6, #60A5FA)", borderRadius: "999px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Milestone</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "#F9FAFB" }}>Venue Contract Signing</div>
                </div>
                <button style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600, transition: "background 0.2s" }}>Manage</button>
              </div>
            </div>

            {/* Statistics Graph */}
            <div className="dash-widget" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.5rem", padding: "1.5rem", backdropFilter: "blur(10px)", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F3F4F6" }}>Neural Engagement</h3>
                <span style={{ fontSize: "0.8rem", color: "#60A5FA", background: "rgba(96,165,250,0.1)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontWeight: 700 }}>Live Analysis</span>
              </div>
              <div style={{ position: "relative", height: 120 }}>
                <NeuralFlow />
              </div>
            </div>
          </div>

          {/* Top Right: Calendar & Recent Activity */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Recent Activity */}
            <div className="dash-widget" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.5rem", padding: "1.5rem", flex: 1, backdropFilter: "blur(10px)" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F3F4F6", marginBottom: "1.5rem" }}>Live Feed</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {[
                  { n: "Alex", t: "uploaded new venue blueprints", d: "Just now" },
                  { n: "Sarah", t: "confirmed 12 new volunteers", d: "2m ago" },
                  { n: "Mike", t: "finalized catering spreadsheet", d: "15m ago" }
                ].map((act, i) => (
                  <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#E2E8F0", lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 600, color: "#fff" }}>{act.n}</span> {act.t}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "0.1rem" }}>{act.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress Dark Card */}
            <div className="dash-widget" style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)", borderRadius: "1.5rem", padding: "1.8rem", color: "#fff", display: "flex", alignItems: "center", gap: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ position: "relative", width: 70, height: 70, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="70" height="70" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", animation: "ring-glow 3s infinite ease-in-out" }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle className="dash-circle" cx="50" cy="50" r="42" fill="none" stroke="#60A5FA" strokeWidth="10" strokeDasharray="264" strokeDashoffset="264" strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>88%</div>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.2rem" }}>Task Velocity</div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Top 5% of peak planners</div>
              </div>
            </div>
          </div>

          {/* Overlapping Calendar Card - Refined as sleek floating widget at bottom-right */}
          <div className="dash-widget" style={{
            position: "absolute", bottom: "-2.5rem", right: "-3rem",
            background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(30px)",
            borderRadius: "1.5rem", padding: "1.8rem",
            boxShadow: "0 40px 80px -10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.12)",
            zIndex: 10, width: 280,
            animation: "float-desk 12s ease-in-out infinite 0.5s"
          }}>
            <div style={{ textAlign: "center", fontSize: "1rem", fontWeight: 700, marginBottom: "1.2rem", color: "#F9FAFB" }}>November 2024</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.6rem", textAlign: "center", marginBottom: "1.5rem" }}>
              {["S","M","T","W","T","F","S"].map(d => <div key={d} style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>{d}</div>)}
              {["10","11","12","13","14","15","16"].map((d, i) => (
                <div key={d} style={{
                  fontSize: "0.85rem", fontWeight: d === "14" ? 800 : 500,
                  color: d === "14" ? "#fff" : "#94A3B8",
                  background: d === "14" ? "#3B82F6" : "transparent",
                  width: 28, height: 28, borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
                  boxShadow: d === "14" ? "0 4px 12px rgba(59, 130, 246, 0.4)" : "none"
                }}>{d}</div>
              ))}
            </div>
            
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#F9FAFB", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FACC15" }}></div>
              Priority Events
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "0.8rem 1rem", marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>Keynote Rehearsal</div>
              <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>14:00 - Main Hall</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "0.8rem 1rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>Vendor Briefing</div>
              <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>16:30 - Zoom</div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
