export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Create Your Event",
      desc: "Set up your event in minutes. Add dates, venue, team members, and initial budgets.",
      iconBg: "rgba(255, 255, 255, 0.05)",
      iconColor: "#ffffff",
      icon: <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    },
    {
      num: "02",
      title: "Coordinate Your Team",
      desc: "Assign roles, set tasks, and track who's doing what in real time. Automated nudges included.",
      iconBg: "rgba(255, 255, 255, 0.05)",
      iconColor: "#ffffff",
      icon: <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    },
    {
      num: "03",
      title: "Monitor in Real-Time",
      desc: "Watch your event health score update live as tasks complete, RSVPs arrive, and budgets change.",
      iconBg: "rgba(255, 255, 255, 0.05)",
      iconColor: "#ffffff",
      icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    },
    {
      num: "04",
      title: "Execute & Analyze",
      desc: "Run the event with full visibility. Post-event, get automated insights to improve your next one.",
      iconBg: "rgba(255, 255, 255, 0.05)",
      iconColor: "#ffffff",
      icon: <path d="M12 20V10" />
    }
  ];

  return (
    <section id="how-it-works" style={{
      padding: "8rem 0",
      background: "transparent"
    }}>
      <div className="how-it-works-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem" }}>
        
        {/* Left Column */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "4px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px",
            fontSize: "0.75rem", fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em",
            marginBottom: "2rem"
          }}>
            ✦ How it works
          </div>
          <h2 className="flammini-heading" style={{
            fontSize: "clamp(2.5rem, 4vw, 4rem)",
            color: "#fff",
            margin: "0 0 1.5rem 0",
            lineHeight: 1.1,
            letterSpacing: "-0.02em"
          }}>
            From idea to execution in four steps.
          </h2>
          <p style={{ fontSize: "1.1rem", color: "#888", lineHeight: 1.6, maxWidth: 400 }}>
            Planora guides you through every phase — so nothing slips through the cracks. Built to integrate seamlessly.
          </p>
        </div>

        {/* Right Column - Grid */}
        <div className="how-it-works-steps">
          {steps.map((step, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "1.5rem",
              padding: "2rem",
              position: "relative",
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "0.75rem",
                  background: step.iconBg, color: step.iconColor,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {step.icon}
                  </svg>
                </div>
                <div style={{
                  fontSize: "1.5rem", fontWeight: 700,
                  color: "rgba(255,255,255,0.1)"
                }}>
                  {step.num}
                </div>
              </div>
              <h3 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>{step.title}</h3>
              <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
