import useReveal from "../../hooks/useReveal";

const PROBLEMS = [
  {
    emoji: "📋",
    title: "Scattered Spreadsheets",
    desc: "Plans, budgets, guest lists — saved across 10 different files shared over WhatsApp. One wrong edit breaks everything.",
  },
  {
    emoji: "💸",
    title: "Budget Black Holes",
    desc: "Nobody knows how much has been spent until the invoice arrives. By then, it's too late to course-correct.",
  },
  {
    emoji: "🤯",
    title: "Volunteer Chaos",
    desc: "Chasing team members across platforms. No visibility into who's doing what or whether it's getting done.",
  },
  {
    emoji: "📊",
    title: "Zero Insights",
    desc: "After every event, you have no data. No idea what worked, what didn't, or how to improve next time.",
  },
];

export default function Problem() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      id="problem"
      style={{
        padding: "7rem 0",
        position: "relative",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem", position: "relative", zIndex: 1 }}>

        {/* Section header */}
        <div className="reveal" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 4rem" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#DC2626",
            background: "rgba(220,38,38,0.07)",
            border: "1.5px solid rgba(220,38,38,0.15)",
            borderRadius: "999px",
            padding: "0.3rem 1rem",
            marginBottom: "1.25rem",
          }}>
            Why Planora?
          </div>
          <h2 style={{
            fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
            fontWeight: 900,
            color: "#111827",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "1rem",
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}>
            Your Workflow,<br />
            Reimagined with AI
          </h2>
          <p style={{ fontSize: "1rem", color: "#6B7280", lineHeight: 1.7 }}>
            Organizers deserve better tools. Here's what they deal with every single time.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.25rem",
        }}>
          {PROBLEMS.map((p, i) => (
            <div
              key={p.title}
              className={`reveal delay-${i + 1}`}
              style={{
                background: "#F9FAFB",
                border: "1.5px solid rgba(0,0,0,0.07)",
                borderRadius: "1.25rem",
                padding: "2rem",
                transition: "border-color 0.3s, background 0.3s, transform 0.3s, box-shadow 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)";
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
                e.currentTarget.style.background = "#F9FAFB";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 52, height: 52,
                borderRadius: "0.875rem",
                background: "rgba(220,38,38,0.06)",
                border: "1.5px solid rgba(220,38,38,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem", marginBottom: "1.25rem",
              }}>
                {p.emoji}
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", marginBottom: "0.6rem", lineHeight: 1.3 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.7 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="reveal" style={{ textAlign: "center", marginTop: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ height: 1, width: 60, background: "rgba(0,0,0,0.1)" }} />
            <span style={{ fontSize: "0.875rem", color: "#9CA3AF", fontWeight: 500 }}>There's a better way</span>
            <div style={{ height: 1, width: 60, background: "rgba(0,0,0,0.1)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
