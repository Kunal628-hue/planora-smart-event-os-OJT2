import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp } from "lucide-react";
import SpotlightCard from "../ui/SpotlightCard";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Smart Event Planning",
    desc: "Build event timelines, assign milestones, and track progress with an intelligent planning engine.",
    mockup: (
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)", marginTop: "2rem" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.85rem", padding: "1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#F9FAFB" }}>Venue Booking</div>
            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Due in 2 days</div>
          </div>
          <button style={{ background: "#3B82F6", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 700 }}>Open</button>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.85rem", padding: "1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#F9FAFB" }}>Speaker Outreach</div>
            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>On track</div>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Budget & Sponsorship Tracking",
    desc: "Real-time financial visibility with automated categorization and overspend early warnings.",
    mockup: (
      <div style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)", borderRadius: "1.25rem", padding: "2rem", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "2rem", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem" }}>Financial Overview</div>
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "6px" }}>
          Growth Trend: 12% <TrendingUp size={14} color="#60A5FA" />
        </div>
        <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#60A5FA" strokeWidth="10" strokeDasharray="264" strokeDashoffset="145" strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>$52k</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Volunteer Coordination",
    desc: "Organize your team with role assignments and live visibility. No more chasing on WhatsApp.",
    mockup: (
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)", marginTop: "2rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F9FAFB" }}>Team Assignment</div>
          <span style={{ fontSize: "0.85rem", color: "#64748B" }}>Expand</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)", padding: "0.6rem", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.8rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F87171" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#E2E8F0" }}>Mark Manson</span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.8rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.5rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#60A5FA" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>Karen William</span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.8rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#34D399" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#E2E8F0" }}>Niki M.</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-time Execution Dashboard",
    desc: "A mission control for your event — monitor RSVP trends, vendor status, and health scores as they happen.",
    mockup: (
      <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "1.25rem", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)", marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#F9FAFB" }}>Execution Health</h3>
        </div>
        <div style={{ position: "relative", height: 100 }}>
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0,35 Q15,10 35,30 T65,15 T90,5" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            <path d="M0,35 Q15,10 35,30 T65,15 T90,5 L100,40 L0,40 Z" fill="rgba(16,185,129,0.1)" />
            <circle cx="90" cy="5" r="4" fill="#10B981" />
          </svg>
          <div style={{ position: "absolute", right: "5%", top: "-15%", background: "#10B981", color: "#fff", fontSize: "0.75rem", padding: "0.3rem 0.6rem", borderRadius: "6px", fontWeight: 700, boxShadow: "0 4px 12px rgba(16,185,129,0.4)" }}>Optimal</div>
        </div>
      </div>
    )
  }
];

export default function Features() {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );

      // Cards staggered animation
      gsap.fromTo(
        cardsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current[0],
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="features" style={{
      padding: "10rem 0",
      background: "#030712",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-icon {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes blob-morph {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
          67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        }
        .feature-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .feature-card:hover {
          transform: translateY(-8px) scale(1.01) rotate(1deg);
        }
      `}} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
        
        {/* Header matched from original text, layout from video */}
        <div ref={headerRef} style={{ marginBottom: "6rem", textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.03)", color: "#94A3B8",
            padding: "0.5rem 1.2rem", borderRadius: "999px",
            fontSize: "0.8rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "2rem",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            ✦ Platform Power
          </div>
          <h2 style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 800, color: "#F9FAFB",
            lineHeight: 1.05, letterSpacing: "-0.04em",
            maxWidth: 800, margin: "0 auto 2rem",
            fontFamily: "'Outfit', sans-serif"
          }}>
            Engineered for <span style={{ color: "#3B82F6" }}>Precision</span>.<br />Built for Results.
          </h2>
          <p style={{ fontSize: "1.15rem", color: "#94A3B8", lineHeight: 1.6, maxWidth: 650, margin: "0 auto" }}>
            The definitive toolkit for high-stakes event coordination. Scale your operations without losing the personal touch.
          </p>
        </div>

        {/* 2x2 Grid replicating video structure */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "2rem"
        }}>
          {FEATURES.map((f, i) => (
            <SpotlightCard
              key={f.title}
              ref={el => cardsRef.current[i] = el}
              className="feature-card"
              spotlightColor="rgba(59, 130, 246, 0.2)"
              style={{
                padding: "3.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "2.5rem",
                background: "rgba(255,255,255,0.01)",
                borderRadius: "2rem",
                border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div>
                <div style={{
                  width: 60, height: 60, background: "rgba(59, 130, 246, 0.1)", color: "#60A5FA",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  animation: "float-icon 4s ease-in-out infinite, blob-morph 8s ease-in-out infinite alternate"
                }}>
                  {f.icon}
                </div>
              </div>
              
              <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F9FAFB", marginBottom: "1rem", letterSpacing: "-0.02em", fontFamily: "'Outfit', sans-serif" }}>
                {f.title}
              </h3>
              
              <p style={{ fontSize: "1.05rem", color: "#94A3B8", lineHeight: 1.6, marginBottom: "1.5rem", flex: 1 }}>
                {f.desc}
              </p>

              {/* Mockup specific to the feature */}
              <div style={{ flexShrink: 0 }}>
                {f.mockup}
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
