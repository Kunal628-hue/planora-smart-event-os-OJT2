import { useEffect, useRef } from "react";
import useReveal from "../../hooks/useReveal";
import { animate, stagger } from "animejs";

function DashboardPreview() {
  const lineRef = useRef(null);
  const areaRef = useRef(null);
  const containerRef = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;

          // Draw the line
          const path = lineRef.current;
          if (path) {
            animate(path, {
              strokeDashoffset: [2000, 0],
              duration: 2000,
              delay: 300,
              easing: "easeOutCubic",
            });
          }

          // Fade in the area
          if (areaRef.current) {
            animate(areaRef.current, {
              opacity: [0, 1],
              duration: 1500,
              delay: 600,
              easing: "easeOutCubic",
            });
          }

          // Animate the stat numbers
          const stats = containerRef.current?.querySelectorAll(".stat-number");
          if (stats && stats.length) {
            animate(stats, {
              opacity: [0, 1],
              translateY: [10, 0],
              duration: 600,
              delay: stagger(120, { start: 400 }),
              easing: "easeOutCubic",
            });
          }
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const chartW = 380;
  const chartH = 100;
  const data = [82, 60, 74, 45, 85, 50, 92, 65, 78, 55, 88, 70];
  const maxVal = Math.max(...data);
  const points = data.map((v, i) => [
    (i / (data.length - 1)) * chartW,
    chartH - (v / maxVal) * chartH * 0.85 - 5,
  ]);
  const pathD = points.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`)).join(" ");
  const areaD = `M ${points[0][0]},${chartH} L ${pathD.slice(2)} L ${points[points.length - 1][0]},${chartH} Z`;

  return (
    <div
      ref={containerRef}
      style={{
        background: "rgba(13,16,28,0.98)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "1.5rem",
        padding: "2rem",
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <div style={{ fontSize: "0.7rem", color: "rgba(148,163,184,0.5)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
            RSVP Analytics — Oct 2026
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>Registrations Overview</div>
        </div>
        <div style={{
          padding: "0.35rem 0.9rem",
          background: "rgba(167,139,250,0.1)",
          border: "1px solid rgba(167,139,250,0.25)",
          borderRadius: "0.6rem",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#c4b5fd",
        }}>
          This Month ↑ 24%
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total RSVPs", value: "1,284", color: "#a78bfa" },
          { label: "Confirmed", value: "947", color: "#34d399" },
          { label: "Pending VIP", value: "128", color: "#fb923c" },
          { label: "Dropped", value: "209", color: "#f87171" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "0.875rem",
            padding: "1rem 0.875rem",
          }}>
            <div className="stat-number" style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, lineHeight: 1, opacity: 0 }}>{s.value}</div>
            <div style={{ fontSize: "0.68rem", color: "rgba(148,163,184,0.5)", marginTop: "0.3rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "1rem",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: "140px", overflow: "visible" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={chartH - (y / 100) * chartH * 0.85 - 5} x2={chartW} y2={chartH - (y / 100) * chartH * 0.85 - 5}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          {/* Area */}
          <path ref={areaRef} d={areaD} fill="url(#areaGrad)" style={{ opacity: 0 }} />
          {/* Line */}
          <path
            ref={lineRef}
            d={pathD}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 2000,
              strokeDashoffset: 2000,
            }}
          />
          {/* Data points */}
          {points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill="#a78bfa" opacity="0.8" />
          ))}
        </svg>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {[
          { label: "Budget Used", value: "78%", color: "#60a5fa", bar: 78 },
          { label: "Task Completion", value: "91%", color: "#34d399", bar: 91 },
        ].map((b) => (
          <div key={b.label} style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "0.875rem",
            padding: "1rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.6)", fontWeight: 600 }}>{b.label}</span>
              <span style={{ fontSize: "0.75rem", color: b.color, fontWeight: 700 }}>{b.value}</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${b.bar}%`, height: "100%", background: b.color, borderRadius: "3px", boxShadow: `0 0 8px ${b.color}50` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Shine */}
      <div style={{
        position: "absolute",
        top: -60,
        left: -60,
        width: 200,
        height: 200,
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />
    </div>
  );
}

export default function ProductShowcase() {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      id="product"
      style={{
        paddingBottom: "5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div style={{
        position: "absolute",
        width: 700,
        height: 700,
        bottom: "-20%",
        left: "-10%",
        background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)",
        filter: "blur(80px)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ maxWidth: 640, margin: "0 auto 4rem", textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a78bfa",
            background: "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: "2rem",
            padding: "0.3rem 1rem",
            marginBottom: "1.25rem",
          }}>
            Product
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
            Your events. Completely under control.
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(148,163,184,0.7)", lineHeight: 1.7 }}>
            See your registration trends, financial health, and task progress — all in one intelligent dashboard.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="reveal" style={{ maxWidth: 900, margin: "0 auto" }}>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
