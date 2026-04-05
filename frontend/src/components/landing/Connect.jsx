import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ElectricBorder from "../ui/ElectricBorder";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: "01",
    color: "#a78bfa",
    colorRgb: "167,139,250",
    title: "Create Your Event",
    desc: "Set up your event in minutes. Add dates, venue, team members, and initial budgets.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    number: "02",
    color: "#60a5fa",
    colorRgb: "96,165,250",
    title: "Coordinate Your Team",
    desc: "Assign roles, set tasks, and track who's doing what in real time. Automated nudges included.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    number: "03",
    color: "#34d399",
    colorRgb: "52,211,153",
    title: "Monitor in Real-Time",
    desc: "Watch your event health score update live as tasks complete, RSVPs arrive, and budgets change.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    number: "04",
    color: "#fb923c",
    colorRgb: "251,146,60",
    title: "Execute & Analyze",
    desc: "Run the event with full visibility. Post-event, get automated insights to improve your next one.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const TRUST_ITEMS = [
  {
    name: "TEDx & Conferences",
    shadowColor: "#FF2A2A",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="url(#tedx-grad)" />
        <path d="M10 12h12v2H10zM12 16h8v2h-8zM14 20h4v2h-4z" fill="#fff" />
        <path d="M7 12L12 22M25 12L20 22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id="tedx-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF2A2A" />
            <stop offset="1" stopColor="#990000" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Concerts & Music Festivals",
    shadowColor: "#9333EA",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="url(#music-grad)" />
        <path d="M12 21a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm10 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#fff" />
        <path d="M15 24V9l10-2v15M15 15l10-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="music-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9333EA" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Corporate Launches",
    shadowColor: "#3B82F6",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="url(#corp-grad)" />
        <path d="M16 6l8 11H8l8-11z" fill="#fff" />
        <path d="M16 17v7M12 24h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="14" r="2" fill="#3B82F6" />
        <defs>
          <linearGradient id="corp-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Luxury Weddings & Galas",
    shadowColor: "#F59E0B",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="url(#luxury-grad)" />
        <path d="M8 14c0-4 3-7 8-7s8 3 8 7c0 5-8 10-8 10s-8-5-8-10z" fill="#fff" />
        <path d="M12 11l4 3 4-3" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="luxury-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

function StepCard({ step }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="step-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: "relative", height: "100%" }}
    >
      <ElectricBorder
        color={step.color}
        speed={1.5}
        chaos={0.15}
        borderRadius={24}
        isActive={isHovered}
        style={{ height: "100%" }}
      >
        <div style={{
          background: "rgba(255,255,255,0.015)",
          backdropFilter: "blur(10px)",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          border: isHovered ? `1px solid ${step.color}40` : "1px solid rgba(255,255,255,0.05)",
          boxShadow: isHovered ? `0 20px 40px rgba(${step.colorRgb}, 0.15)` : "0 10px 30px rgba(0,0,0,0.2)",
          position: "relative",
          height: "100%",
          transition: "all 0.3s ease",
          transform: isHovered ? "translateY(-6px)" : "translateY(0)"
        }}>
          <div style={{
            fontSize: "3rem",
            fontWeight: 900,
            color: `rgba(${step.colorRgb}, ${isHovered ? 0.25 : 0.1})`,
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            lineHeight: 1,
            transition: "all 0.3s ease",
            fontFamily: "'Outfit', sans-serif"
          }}>
            {step.number}
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: "1.25rem",
            background: `rgba(${step.colorRgb}, 0.1)`, 
            color: step.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "2rem",
            border: `1px solid rgba(${step.colorRgb}, 0.2)`
          }}>
            {step.icon}
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>{step.title}</h3>
          <p style={{ fontSize: "0.95rem", color: "#94A3B8", lineHeight: 1.6 }}>{step.desc}</p>
        </div>
      </ElectricBorder>
    </div>
  );
}

export default function Connect() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Bouncing scale-in staggered animation for grid cards mirroring video's app icons
      const cards = gsap.utils.toArray(".step-card");
      gsap.fromTo(cards, 
        { scale: 0.8, opacity: 0, y: 30 },
        {
          scale: 1, opacity: 1, y: 0, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: cards[0],
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="testimonials" style={{ background: "#030712", padding: "10rem 0 0", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Upper Grid Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", marginBottom: "8rem" }}>
        
        {/* Left Side: Headlines mapped from HowItWorks */}
        <div>
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.03)", color: "#94A3B8",
            padding: "0.5rem 1.2rem", borderRadius: "999px",
            fontSize: "0.8rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "2rem",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            ✦ Workflow Design
          </div>
          <h2 style={{
            fontSize: "clamp(2.5rem, 4vw, 3.8rem)",
            fontWeight: 800, color: "#F9FAFB",
            lineHeight: 1.05, letterSpacing: "-0.04em",
            marginBottom: "2rem",
            fontFamily: "'Outfit', sans-serif"
          }}>
            From idea to impact in <span style={{ color: "#3B82F6" }}>four</span> smooth steps.
          </h2>
          <p style={{ fontSize: "1.15rem", color: "#94A3B8", lineHeight: 1.6, maxWidth: 450 }}>
            Planora architecture scales with your ambition. Built to ensure every detail is accounted for, from inception to analysis.
          </p>
        </div>

        {/* Right Side: 2x2 Grid of Step Cards mirroring video's app integration icons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {STEPS.map((step, i) => (
            <StepCard key={i} step={step} />
          ))}
        </div>
      </div>

      {/* Marquee Section mapped from Trust */}
      <div style={{ padding: "8rem 0", background: "rgba(255,255,255,0.01)", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            gap: 2rem;
            padding-left: 2rem;
            will-change: transform;
          }
          .marquee-left {
            animation: scroll-left 40s linear infinite;
          }
          .marquee-right {
            animation: scroll-right 45s linear infinite;
          }
          .marquee-container:hover .marquee-track {
            animation-play-state: paused;
          }
          .trust-badge {
            display: flex;
            align-items: center;
            gap: 1.2rem;
            padding: 1rem 1.8rem 1rem 1rem;
            border-radius: 100px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            color: #E2E8F0;
            flex-shrink: 0;
            cursor: default;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
          }
          .trust-badge:hover {
            transform: translateY(-5px) scale(1.05);
            background: rgba(255,255,255,0.05);
            border-color: rgba(59, 130, 246, 0.3);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            color: #fff;
          }
        `}} />

        {/* Fade Edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "20%", background: "linear-gradient(90deg, #030712 10%, transparent)", zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "20%", background: "linear-gradient(-90deg, #030712 10%, transparent)", zIndex: 10, pointerEvents: "none" }} />

        <div style={{ textAlign: "center", marginBottom: "4rem", zIndex: 1, position: "relative" }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4B5563" }}>
            The standard for elite event management
          </p>
        </div>

        <div className="marquee-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Row 1: Scrolling Left */}
          <div className="marquee-track marquee-left">
            {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <div key={`row1-${i}`} className="trust-badge">
                {item.icon}
                <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Row 2: Scrolling Right (Reversed array) */}
          <div className="marquee-track marquee-right">
            {[...TRUST_ITEMS].reverse().concat([...TRUST_ITEMS].reverse(), [...TRUST_ITEMS].reverse()).map((item, i) => (
              <div key={`row2-${i}`} className="trust-badge">
                {item.icon}
                <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>{item.name}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
