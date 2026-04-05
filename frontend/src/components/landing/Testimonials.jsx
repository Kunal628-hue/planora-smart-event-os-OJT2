import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PROBLEMS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#F87171" }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Scattered Spreadsheets",
    desc: "Plans, budgets, guest lists — saved across 10 different files shared over WhatsApp. One wrong edit breaks everything.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#FBBF24" }}>
        <path d="M6 3h12" /><path d="M6 8h12" /><path d="M6 13l6.5-6.5" /><path d="M11.5 13H18" /><path d="M6 13c0 4.5 4.5 7.5 7.5 7.5" />
      </svg>
    ),
    title: "Budget Black Holes",
    desc: "Nobody knows how much has been spent until the invoice arrives. By then, it's too late to course-correct.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#60A5FA" }}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Volunteer Chaos",
    desc: "Chasing team members across platforms. No visibility into who's doing what or whether it's getting done.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#A78BFA" }}>
        <path d="M21 12A9 9 0 0 1 3 12M21 12a9 9 0 0 0-9-9v9l-6.3-6.3" />
      </svg>
    ),
    title: "Zero Insights",
    desc: "After every event, you have no data. No idea what worked, what didn't, or how to improve next time.",
  },
];

export default function Testimonials() {
  const containerRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the left column while right column scrolls
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: leftColRef.current,
        pinSpacing: false,
      });

      // Parallax effect for masonry columns
      gsap.to(".masonry-col-1", {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(".masonry-col-2", {
        yPercent: -35,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Staggered fade and slide up for the problem cards
      const cards = gsap.utils.toArray(".problem-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="problem" style={{
      background: "#030712",
      color: "#F9FAFB",
      padding: "10rem 0",
      position: "relative",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .problem-card {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .problem-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(255,255,255,0.035) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 40px rgba(59, 130, 246, 0.05);
        }
      `}} />

      {/* Background radial gradient */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "10%",
        width: "800px",
        height: "800px",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 2.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: "6rem",
        position: "relative",
        zIndex: 1,
        alignItems: "start"
      }}>
        
        {/* Left Column (Sticky) */}
        <div ref={leftColRef} style={{ paddingTop: "2rem" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.03)",
            padding: "0.5rem 1.2rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "2rem",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            ✦ Modern Challenges
          </div>
          
          <h2 style={{
            color: "#F9FAFB",
            fontSize: "clamp(2.5rem, 4vw, 3.8rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            marginBottom: "2rem",
            fontFamily: "'Outfit', sans-serif"
          }}>
            Legacy workflows are <span style={{ color: "#EF4444" }}>killing</span> your events.
          </h2>
          
          <p style={{
            fontSize: "1.15rem",
            color: "#94A3B8",
            lineHeight: 1.6,
            maxWidth: 450
          }}>
            Spreadsheets and group chats aren't tools — they're liabilities. Planora replaces chaos with enterprise-grade synchronization.
          </p>
        </div>

        {/* Right Column (Staggered Masonry Cards) */}
        <div ref={rightColRef} style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          paddingBottom: "4rem",
          position: "relative"
        }}>
          {/* Column 1 */}
          <div className="masonry-col-1" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {[PROBLEMS[0], PROBLEMS[2]].map((p, i) => (
              <div key={p.title} className="problem-card" style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "2rem",
                padding: "3rem",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)"
              }}>
                <div style={{
                  marginBottom: "2rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  width: 56, height: 56,
                  borderRadius: "1.25rem",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {p.icon}
                </div>
                <h3 style={{ color: "#F9FAFB", fontSize: "1.4rem", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.02em", fontFamily: "'Outfit', sans-serif" }}>{p.title}</h3>
                <p style={{ fontSize: "1.05rem", color: "#94A3B8", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Column 2 (Offset/Staggered) */}
          <div className="masonry-col-2" style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "5rem" }}>
            {[PROBLEMS[1], PROBLEMS[3]].map((p, i) => (
              <div key={p.title} className="problem-card" style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "2rem",
                padding: "3rem",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)"
              }}>
                <div style={{
                  marginBottom: "2rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  width: 56, height: 56,
                  borderRadius: "1.25rem",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {p.icon}
                </div>
                <h3 style={{ color: "#F9FAFB", fontSize: "1.4rem", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.02em", fontFamily: "'Outfit', sans-serif" }}>{p.title}</h3>
                <p style={{ fontSize: "1.05rem", color: "#94A3B8", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
