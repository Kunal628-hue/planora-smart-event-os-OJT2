import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PROBLEMS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Scattered Spreadsheets",
    desc: "Plans, budgets, guest lists — saved across 10 different files shared over WhatsApp. One wrong edit breaks everything.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#fff" }}>
        <path d="M6 3h12" /><path d="M6 8h12" /><path d="M6 13l6.5-6.5" /><path d="M11.5 13H18" /><path d="M6 13c0 4.5 4.5 7.5 7.5 7.5" />
      </svg>
    ),
    title: "Budget Black Holes",
    desc: "Nobody knows how much has been spent until the invoice arrives. By then, it's too late to course-correct.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#fff" }}>
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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}>
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

  useEffect(() => {
    // ScrollTrigger removed because this component is inside a manually translated GSAP timeline.
  }, []);

  return (
    <section ref={containerRef} id="testimonials" style={{
      background: "transparent",
      color: "#FFFFFF",
      padding: "5rem 0",
      position: "relative"
    }}>
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
            color: "#ffffff",
            fontSize: "1rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "2rem"
          }}>
            ✦ Modern Challenges
          </div>
          
          <h2 className="flammini-heading" style={{
            color: "#fff",
            fontSize: "clamp(3rem, 5vw, 5rem)",
            marginBottom: "2rem",
          }}>
            Legacy workflows are <span className="flammini-accent" style={{ fontStyle: "italic" }}>killing</span> your events.
          </h2>
          
          <p style={{
            fontSize: "1.15rem",
            color: "#9CA3AF",
            lineHeight: 1.6,
            maxWidth: 450
          }}>
            Spreadsheets and group chats aren't tools — they're liabilities. Planora replaces chaos with enterprise-grade synchronization.
          </p>
        </div>

        {/* Right Column (Staggered Masonry Cards) */}
        <div style={{
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
                background: "#0a0a0a",
                border: "1px solid #1f1f1f",
                padding: "3rem",
              }}>
                <div style={{
                  marginBottom: "2rem",
                  width: 56, height: 56,
                  display: "flex", alignItems: "center", justifyContent: "flex-start"
                }}>
                  {p.icon}
                </div>
                <h3 className="flammini-heading" style={{ color: "#fff", fontSize: "1.5rem", marginBottom: "1rem" }}>{p.title}</h3>
                <p style={{ fontSize: "1rem", color: "#9CA3AF", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
          
          {/* Column 2 (Offset/Staggered) */}
          <div className="masonry-col-2" style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "5rem" }}>
            {[PROBLEMS[1], PROBLEMS[3]].map((p, i) => (
              <div key={p.title} className="problem-card" style={{
                background: "#0a0a0a",
                border: "1px solid #1f1f1f",
                padding: "3rem",
              }}>
                <div style={{
                  marginBottom: "2rem",
                  width: 56, height: 56,
                  display: "flex", alignItems: "center", justifyContent: "flex-start"
                }}>
                  {p.icon}
                </div>
                <h3 className="flammini-heading" style={{ color: "#fff", fontSize: "1.5rem", marginBottom: "1rem" }}>{p.title}</h3>
                <p style={{ fontSize: "1rem", color: "#9CA3AF", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
