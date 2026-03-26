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
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
      background: "#0A0A0A",
      color: "#fff",
      padding: "8rem 0",
      position: "relative",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .problem-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .problem-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.2), 0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(96,165,250,0.1);
          border-color: rgba(255,255,255,0.15);
        }
      `}} />

      {/* Background radial gradient to mimic video's subtle lighting */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "10%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 2.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: "4rem",
        position: "relative",
        zIndex: 1,
        alignItems: "start"
      }}>
        
        {/* Left Column (Sticky) */}
        <div ref={leftColRef} style={{ paddingTop: "2rem" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.1)",
            padding: "0.4rem 1rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#E5E7EB",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "1.5rem"
          }}>
            ✦ The Problem
          </div>
          
          <h2 style={{
            color: "#fff",
            fontSize: "clamp(2.2rem, 3.5vw, 3.2rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem"
          }}>
            Event planning is still running on spreadsheets and group chats.
          </h2>
          
          <p style={{
            fontSize: "1.05rem",
            color: "#9CA3AF",
            lineHeight: 1.6,
            maxWidth: 400
          }}>
            Organizers deserve better tools. Here's what they deal with every single time before switching to Planora.
          </p>
        </div>

        {/* Right Column (Staggered Masonry Cards) */}
        <div ref={rightColRef} style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          paddingBottom: "4rem",
          position: "relative"
        }}>
          {/* Column 1 */}
          <div className="masonry-col-1" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[PROBLEMS[0], PROBLEMS[2]].map((p, i) => (
              <div key={p.title} className="problem-card" style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "1.5rem",
                padding: "2.5rem",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)"
              }}>
                <div style={{
                  marginBottom: "1.8rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  width: 52, height: 52,
                  borderRadius: "1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 10px rgba(0,0,0,0.2)"
                }}>
                  {p.icon}
                </div>
                <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.8rem", letterSpacing: "-0.01em" }}>{p.title}</h3>
                <p style={{ fontSize: "0.95rem", color: "#A1A1AA", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Column 2 (Offset/Staggered) */}
          <div className="masonry-col-2" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "4rem" }}>
            {[PROBLEMS[1], PROBLEMS[3]].map((p, i) => (
              <div key={p.title} className="problem-card" style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "1.5rem",
                padding: "2.5rem",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.4)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)"
              }}>
                <div style={{
                  marginBottom: "1.8rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  width: 52, height: 52,
                  borderRadius: "1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 10px rgba(0,0,0,0.2)"
                }}>
                  {p.icon}
                </div>
                <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.8rem", letterSpacing: "-0.01em" }}>{p.title}</h3>
                <p style={{ fontSize: "0.95rem", color: "#A1A1AA", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
