import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
      <div style={{ background: "#F9FAFB", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #E5E7EB", marginTop: "2rem" }}>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>Venue Booking</div>
            <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>Due in 2 days</div>
          </div>
          <button style={{ background: "#111827", color: "#fff", border: "none", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 600 }}>See More</button>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>Speaker Outreach</div>
            <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>On track</div>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>✓</div>
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
      <div style={{ background: "#1B3A2E", borderRadius: "1rem", padding: "2rem", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.2rem" }}>Total Budget</div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", marginBottom: "1rem" }}>45% spent</div>
        <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="8" strokeDasharray="251" strokeDashoffset="138" strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>45%</div>
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
      <div style={{ background: "#F9FAFB", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #E5E7EB", marginTop: "2rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>Assign task to</div>
          <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>v</span>
        </div>
        <div style={{ background: "#fff", borderRadius: "0.5rem", border: "1px solid #E5E7EB", padding: "0.5rem", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f87171" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Mark Manson</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem", background: "#f3f4f6", borderRadius: "0.25rem" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#60a5fa" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Karen William</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#34d399" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Niki M.</span>
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
      <div style={{ background: "#F9FAFB", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #E5E7EB", marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>Live Health Score</h3>
        </div>
        <div style={{ position: "relative", height: 80 }}>
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0,40 Q15,30 30,35 T60,20 T90,5 T100,5" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0,40 Q15,30 30,35 T60,20 T90,5 T100,5 L100,40 L0,40 Z" fill="rgba(16,185,129,0.1)" />
            <circle cx="90" cy="5" r="3" fill="#fff" stroke="#10B981" strokeWidth="2" />
          </svg>
          <div style={{ position: "absolute", right: "2%", top: "-10%", background: "#10B981", color: "#fff", fontSize: "0.6rem", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600, boxShadow: "0 2px 4px rgba(16,185,129,0.3)" }}>Excellent</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", fontSize: "0.75rem", color: "#6B7280" }}>
          <span>10:00 AM</span>
          <span>12:00 PM</span>
          <span>Now</span>
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
      padding: "8rem 0",
      background: "#FAFAFA",
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
        <div ref={headerRef} style={{ marginBottom: "5rem" }}>
          <div style={{
            display: "inline-block",
            background: "#E5E7EB", color: "#374151",
            padding: "0.4rem 1rem", borderRadius: "999px",
            fontSize: "0.75rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.05em",
            marginBottom: "1.5rem"
          }}>
            ✦ Features
          </div>
          <h2 style={{
            fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
            fontWeight: 800, color: "#111827",
            lineHeight: 1.1, letterSpacing: "-0.03em",
            maxWidth: 800, marginBottom: "1.5rem"
          }}>
            Everything you need to run a flawless event.
          </h2>
          <p style={{ fontSize: "1.05rem", color: "#6B7280", lineHeight: 1.6, maxWidth: 600 }}>
            Planora is purpose-built for event organizers — combining the depth of enterprise tools with the speed you need on the ground.
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
              spotlightColor="rgba(37, 99, 235, 0.15)"
              style={{
                padding: "3rem",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.05)"
              }}
            >
              <div>
                <div style={{
                  width: 56, height: 56, background: "rgba(37, 99, 235, 0.08)", color: "#2563EB",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem",
                  animation: "float-icon 4s ease-in-out infinite, blob-morph 8s ease-in-out infinite alternate"
                }}>
                  {f.icon}
                </div>
              </div>
              
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                {f.title}
              </h3>
              
              <p style={{ fontSize: "0.95rem", color: "#6B7280", lineHeight: 1.6, marginBottom: "1.5rem", flex: 1 }}>
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
