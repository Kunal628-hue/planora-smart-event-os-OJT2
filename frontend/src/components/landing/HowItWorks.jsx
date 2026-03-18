import useReveal from "../../hooks/useReveal";

const STEPS = [
  {
    number: "01",
    color: "#a78bfa",
    colorRgb: "167,139,250",
    title: "Create Your Event",
    desc: "Set up your event in minutes. Add dates, venue, team members, and initial budgets. Planora structures everything automatically.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    desc: "Assign roles, set tasks, and track who's doing what in real time. Automated nudges keep everyone accountable.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    desc: "Watch your event health score update live as tasks complete, RSVPs come in, and budgets are managed.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      id="how-it-works"
      style={{
        padding: "7rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        top: "20%",
        right: "-5%",
        background: "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ maxWidth: 600, margin: "0 auto 5rem", textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#60a5fa",
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.2)",
            borderRadius: "2rem",
            padding: "0.3rem 1rem",
            marginBottom: "1.25rem",
          }}>
            How It Works
          </div>
          <h2 style={{
            fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            marginBottom: "1rem",
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}>
            From idea to execution in four steps.
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.7 }}>
            Planora guides you through every phase — so nothing slips through the cracks.
          </p>
        </div>

        {/* Steps */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          position: "relative",
        }}>
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`reveal delay-${i + 1}`}
              style={{ position: "relative" }}
            >
              {/* Connector line (not last) */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: "absolute",
                  top: "2.5rem",
                  right: "-0.75rem",
                  width: "1.5rem",
                  height: "1px",
                  background: `linear-gradient(90deg, rgba(${step.colorRgb}, 0.4), rgba(${STEPS[i + 1].colorRgb}, 0.4))`,
                  zIndex: 2,
                  display: "none", // hide on small, show on large via inline
                }} />
              )}

              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "1.25rem",
                padding: "2rem",
                height: "100%",
                transition: "border-color 0.35s ease, transform 0.35s ease, background 0.35s ease",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `rgba(${step.colorRgb}, 0.3)`;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.background = `rgba(${step.colorRgb}, 0.03)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
              >
                {/* Step number */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1.5rem",
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: "0.875rem",
                    background: `rgba(${step.colorRgb}, 0.1)`,
                    border: `1px solid rgba(${step.colorRgb}, 0.2)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.color,
                  }}>
                    {step.icon}
                  </div>
                  <span style={{
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    color: `rgba(${step.colorRgb}, 0.12)`,
                    lineHeight: 1,
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    letterSpacing: "-0.04em",
                  }}>
                    {step.number}
                  </span>
                </div>

                <h3 style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "0.7rem",
                  lineHeight: 1.3,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: "0.875rem",
                  color: "rgba(148,163,184,0.65)",
                  lineHeight: 1.7,
                }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
