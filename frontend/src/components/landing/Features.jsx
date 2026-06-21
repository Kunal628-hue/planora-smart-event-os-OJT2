import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Smart Event Planning",
    desc: "Build event timelines, assign milestones, and track progress with an intelligent planning engine.",
    mockup: (
      <div style={{ background: "#0a0a0a", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #1f1f1f", marginTop: "2rem" }}>
        <div style={{ background: "#000", border: "1px solid #1f1f1f", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>Venue Booking</div>
            <div style={{ fontSize: "0.7rem", color: "#666" }}>Due in 2 days</div>
          </div>
          <button style={{ background: "#ffffff", color: "#000", border: "none", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 700 }}>See More</button>
        </div>
        <div style={{ background: "#000", border: "1px solid #1f1f1f", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff" }}>Speaker Outreach</div>
            <div style={{ fontSize: "0.7rem", color: "#666" }}>On track</div>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#000" }}>✓</div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Budget Tracking",
    desc: "Real-time financial visibility with automated categorization and overspend early warnings.",
    mockup: (
      <div style={{ background: "#0a0a0a", borderRadius: "1rem", padding: "2rem", border: "1px solid #1f1f1f", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.2rem" }}>Total Budget</div>
        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "1rem" }}>45% spent</div>
        <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1f1f1f" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff" strokeWidth="8" strokeDasharray="251" strokeDashoffset="138" strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#ffffff" }}>45%</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Volunteer Coordination",
    desc: "Organize your team with role assignments and live visibility. No more chasing on WhatsApp.",
    mockup: (
      <div style={{ background: "#0a0a0a", borderRadius: "1rem", padding: "1.5rem", border: "1px solid #1f1f1f", marginTop: "2rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>Assign task to</div>
          <span style={{ fontSize: "0.8rem", color: "#666" }}>v</span>
        </div>
        <div style={{ background: "#000", borderRadius: "0.5rem", border: "1px solid #1f1f1f", padding: "0.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem", borderBottom: "1px solid #1f1f1f" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f87171" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#666" }}>Mark Manson</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem", background: "#ffffff", borderRadius: "0.25rem" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#000" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#000" }}>Karen William</span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#34d399" }} />
            <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#666" }}>Niki M.</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Execution Dashboard",
    desc: "A mission control for your event — monitor RSVP trends, vendor status, and health scores.",
    mockup: (
      <div style={{ background: "#0a0a0a", borderRadius: "1rem", padding: "1.25rem", border: "1px solid #1f1f1f", marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>Live Health Score</h3>
        </div>
        <div style={{ position: "relative", height: 80 }}>
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0,40 Q15,30 30,35 T60,20 T90,5 T100,5" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M0,40 Q15,30 30,35 T60,20 T90,5 T100,5 L100,40 L0,40 Z" fill="rgba(189,255,0,0.1)" />
            <circle cx="90" cy="5" r="4" fill="#000" stroke="#ffffff" strokeWidth="2" />
          </svg>
          <div style={{ position: "absolute", right: "2%", top: "-10%", background: "#ffffff", color: "#000", fontSize: "0.6rem", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>Excellent</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", fontSize: "0.75rem", color: "#666" }}>
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
    // ScrollTrigger removed because this component is inside a manually translated GSAP timeline.
    // The native scroll never reaches here, so opacity: 0 would hide it forever.
  }, []);

  return (
    <section ref={containerRef} id="features" style={{
      padding: "5rem 0",
      background: "transparent"
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem" }}>
        
        {/* Massive Header */}
        <div ref={headerRef} style={{ marginBottom: "6rem", textAlign: "left" }}>
          <div style={{
            display: "inline-block",
            color: "#ffffff",
            fontSize: "1rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "1rem"
          }}>
            ✦ Features
          </div>
          <h2 className="flammini-heading" style={{
            fontSize: "clamp(3rem, 6vw, 5rem)",
            color: "#fff",
            maxWidth: 800, marginBottom: "1.5rem"
          }}>
            Flawless Event Execution.
          </h2>
        </div>

        {/* Vertical List mimicking Flammini "Featured Projects" */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "4rem"
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              ref={el => cardsRef.current[i] = el}
              className="feature-row"
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  width: 60, height: 60, color: "#ffffff",
                  display: "flex", alignItems: "center", justifyContent: "flex-start", marginBottom: "1rem"
                }}>
                  {f.icon}
                </div>
                <h3 className="flammini-heading" style={{ fontSize: "2rem", color: "#fff", marginBottom: "1rem" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "1rem", color: "#9CA3AF", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>

              {/* Mockup */}
              <div style={{ flex: 1 }}>
                {f.mockup}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
