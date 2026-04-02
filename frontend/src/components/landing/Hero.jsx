import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DarkVeil from "../ui/DarkVeil";

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
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.8)" },
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
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)" },
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
      paddingTop: "9rem",
      paddingBottom: "4rem",
      background: "#FAFAFA",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
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
        backgroundImage: "linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        opacity: 0.4,
        pointerEvents: "none"
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 2rem" }}>
        
        {/* Main Text Area */}
        <div style={{ textAlign: "center", position: "relative", marginBottom: "4rem" }}>
          
          {/* Floating Pill 1 (Left) */}
          <div ref={pill1Ref} style={{ position: "absolute", top: "15%", left: "8%", zIndex: 10, animation: "float-slow 4s ease-in-out infinite", transform: "rotate(-3deg)" }}>
            <div style={{
              background: "#312E81", color: "#fff",
              padding: "0.6rem 1.4rem", borderRadius: "999px",
              fontSize: "0.85rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "0.5rem",
              boxShadow: "0 10px 25px -5px rgba(49,46,129,0.4)",
            }}>
              AI Powered
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.22 8.88a2 2 0 0 0 1.42 1.42L25.5 15.5l-8.88 2.22a2 2 0 0 0-1.42 1.42L13 28l-2.22-8.88a2 2 0 0 0-1.42-1.42L.5 15.5l8.88-2.22a2 2 0 0 0 1.42-1.42L13 3z"/></svg>
            </div>
          </div>

          {/* Floating Pill 2 (Right) */}
          <div ref={pill2Ref} style={{ position: "absolute", top: "-10%", right: "10%", zIndex: 10, animation: "float-fast 3.5s ease-in-out infinite 0.5s", transform: "rotate(4deg)" }}>
            <div style={{
              background: "#7F1D1D", color: "#fff",
              padding: "0.6rem 1.4rem", borderRadius: "999px",
              fontSize: "0.85rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "0.5rem",
              boxShadow: "0 10px 25px -5px rgba(127,29,29,0.4)",
            }}>
              Team Sync
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.22 8.88a2 2 0 0 0 1.42 1.42L25.5 15.5l-8.88 2.22a2 2 0 0 0-1.42 1.42L13 28l-2.22-8.88a2 2 0 0 0-1.42-1.42L.5 15.5l8.88-2.22a2 2 0 0 0 1.42-1.42L13 3z"/></svg>
            </div>
          </div>

          {/* Title Box Outline effect */}
          <h1 ref={titleRef} style={{
            fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.15,
            letterSpacing: "-0.04em",
            maxWidth: 800,
            margin: "0 auto 1.5rem",
            position: "relative",
            display: "inline-block"
          }}>
            Take Control of Your<br />Events with{" "}
            <span style={{ 
              position: "relative", display: "inline-block",
              padding: "0.2rem 0.5rem", zIndex: 1
            }}>
              <span className="scroll-color-shift" style={{
                display: "inline-block",
                background: "linear-gradient(-45deg, #2563EB, #7C3AED, #DB2777, #2563EB)",
                backgroundSize: "300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradient-text 4s ease infinite, text-pulse 2s ease-in-out infinite"
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
            fontSize: "1.05rem",
            color: "#6B7280",
            maxWidth: 500,
            margin: "0 auto 2.5rem",
            lineHeight: 1.6
          }}>
            Planora centralizes planning, budgeting, volunteer coordination, and execution into one intelligent dashboard.
          </p>

          <div ref={ctaRef}>
            <Link to="/signup" style={{
              background: "#111827",
              color: "#fff",
              border: "none",
              padding: "0.8rem 1.8rem",
              borderRadius: "999px",
              fontSize: "0.95rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              cursor: "pointer",
              transition: "transform 0.2s, background 0.2s",
              textDecoration: "none"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#1F2937"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#111827"; }}
            >
              Try Planora Today ↗
            </Link>
          </div>
        </div>

        {/* 3-Column Dashboard Mockup */}
        <div ref={dashboardRef} style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
          borderRadius: "2rem",
          padding: "2.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          position: "relative"
        }}>
          {/* Top Left: Task Today */}
          <div>
            <div className="dash-widget" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>Task Today</h3>
            </div>
            
            <div className="dash-widget" style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111827" }}>Creating Company Profile</div>
              <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "1rem" }}>UI/UX Designer</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                <span style={{ color: "#6B7280" }}>Progress</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>90%</span>
              </div>
              <div style={{ height: 6, background: "#E5E7EB", borderRadius: "999px", overflow: "hidden", marginBottom: "1.5rem" }}>
                <div className="dash-progress" style={{ height: "100%", width: "0%", background: "#111827", borderRadius: "999px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>Deadline</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#111827" }}>30 Nov 2024 - 11:30AM</div>
                </div>
                <button style={{ background: "#111827", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600 }}>See More</button>
              </div>
            </div>

            {/* Statistics Graph */}
            <div className="dash-widget" style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "1rem", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>Statistics</h3>
                <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>This week ∨</span>
              </div>
              <div style={{ position: "relative", height: 80 }}>
                {/* Mock Graph using SVG path */}
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0,40 Q10,10 20,30 T40,20 T60,35 T80,10 T100,5" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0,40 Q10,10 20,30 T40,20 T60,35 T80,10 T100,5 L100,40 L0,40 Z" fill="rgba(17,24,39,0.05)" />
                  <circle cx="80" cy="10" r="2" fill="#fff" stroke="#111827" strokeWidth="1" />
                </svg>
                <div style={{ position: "absolute", right: "15%", top: 0, background: "#111827", color: "#fff", fontSize: "0.6rem", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>6 Task</div>
              </div>
            </div>
          </div>

          {/* Top Right: Calendar & Recent Activity */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Recent Activity */}
            <div className="dash-widget" style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "1rem", padding: "1.25rem", flex: 1 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>Recent Activity</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { n: "Mark", t: "leave some comments on Konsep Ilustrasi", d: "Nov 12" },
                  { n: "Niki", t: "change project info on Project Homepage", d: "Nov 11" },
                  { n: "Karen", t: "leave some comments on Konsep Ilustrasi", d: "Oct 28" }
                ].map((act, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#E5E7EB", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem" }}>✓</div>
                    <div>
                      <div style={{ fontSize: "0.8rem", color: "#4B5563", lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{act.n}</span> {act.t}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: "0.2rem" }}>{act.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress Dark Card */}
            <div className="dash-widget" style={{ background: "#1B3A2E", borderRadius: "1rem", padding: "1.5rem", color: "#fff", display: "flex",flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.2rem" }}>Weekly Progress</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginBottom: "1rem" }}>10 task in progress</div>
              
              <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle className="dash-circle" cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="8" strokeDasharray="251" strokeDashoffset="251" strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>45%</div>
                </div>
              </div>
            </div>

          </div>

          {/* Overlapping Calendar Card (Humanized with organic rotation) */}
          <div className="dash-widget" style={{
            position: "absolute", top: "25%", left: "40%",
            background: "#fff", borderRadius: "1rem", padding: "1.5rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.05)",
            zIndex: 10, width: 280,
            animation: "float-desk 8s ease-in-out infinite 0.3s"
          }}>
            <div style={{ textAlign: "center", fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem", color: "#111827" }}>Nov 2024</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", textAlign: "center", marginBottom: "1rem" }}>
              {["S","M","T","W","T","F","S"].map(d => <div key={d} style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{d}</div>)}
              {["10","11","12","13","14","15","16"].map((d, i) => (
                <div key={d} style={{
                  fontSize: "0.8rem", fontWeight: d === "14" ? 700 : 500,
                  color: d === "14" ? "#fff" : "#111827",
                  background: d === "14" ? "#1B3A2E" : "transparent",
                  width: 24, height: 24, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
                }}>{d}</div>
              ))}
            </div>
            
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111827", marginBottom: "0.8rem" }}>Upcoming Task</div>
            <div style={{ background: "#F3F4F6", borderRadius: "0.5rem", padding: "0.6rem 0.8rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>Finishing X Client</div>
              <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>⏱ 3 Days Left</div>
            </div>
            <div style={{ background: "#F3F4F6", borderRadius: "0.5rem", padding: "0.6rem 0.8rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>Finishing X Client</div>
              <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>⏱ 3 Days Left</div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
