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
        padding: "8rem 0",
        position: "relative",
        overflow: "hidden",
        background: "#0B0D14",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)",
        filter: "blur(60px)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 5rem", position: "relative", zIndex: 1 }}>

        {/* Section header */}
        <div className="reveal" style={{ textAlign: "left", maxWidth: 640, marginBottom: "4rem" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#f87171",
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: "2rem",
            padding: "0.3rem 1rem",
            marginBottom: "1.25rem",
          }}>
            The Problem
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            marginBottom: "1rem",
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}>
            Event planning is still running on spreadsheets and group chats.
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.75)", lineHeight: 1.7 }}>
            Organizers deserve better tools. Here's what they deal with every single time.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}>
          {PROBLEMS.map((p, i) => (
            <div
              key={p.title}
              className={`reveal delay-${i + 1}`}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "1.25rem",
                padding: "2rem",
                transition: "border-color 0.3s ease, background 0.3s ease, transform 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(248,113,113,0.25)";
                e.currentTarget.style.background = "rgba(248,113,113,0.03)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: "0.875rem",
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "1.25rem",
              }}>
                {p.emoji}
              </div>
              <h3 style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.6rem",
                lineHeight: 1.3,
              }}>
                {p.title}
              </h3>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(148,163,184,0.7)",
                lineHeight: 1.7,
              }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Separator with solution hint */}
        <div className="reveal" style={{ textAlign: "center", marginTop: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ height: 1, width: 60, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: "0.875rem", color: "rgba(148,163,184,0.4)", fontWeight: 500 }}>
              There's a better way
            </span>
            <div style={{ height: 1, width: 60, background: "rgba(255,255,255,0.08)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
