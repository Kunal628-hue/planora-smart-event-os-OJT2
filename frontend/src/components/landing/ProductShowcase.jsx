import { useEffect, useRef } from "react";
import { TrendingUp } from "lucide-react";
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

          const path = lineRef.current;
          if (path) {
            animate(path, {
              strokeDashoffset: [2000, 0],
              duration: 2000,
              delay: 300,
              easing: "easeOutCubic",
            });
          }

          if (areaRef.current) {
            animate(areaRef.current, {
              opacity: [0, 1],
              duration: 1500,
              delay: 600,
              easing: "easeOutCubic",
            });
          }

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
        background: "#fff",
        border: "1.5px solid rgba(0,0,0,0.07)",
        borderRadius: "1.5rem",
        padding: "2rem",
        boxShadow: "0 20px 60px -10px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <div style={{ fontSize: "0.65rem", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
            RSVP Analytics — Oct 2026
          </div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#111827" }}>Registrations Overview</div>
        </div>
        <div style={{
          padding: "0.3rem 0.8rem",
          background: "rgba(94,90,219,0.08)",
          border: "1.5px solid rgba(94,90,219,0.2)",
          borderRadius: "999px",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "#5E5ADB",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}>
          <TrendingUp size={14} /> 24% This Month
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        {[
          { label: "Total RSVPs", value: "1,284", color: "#5E5ADB" },
          { label: "Confirmed", value: "947", color: "#059669" },
          { label: "Pending VIP", value: "128", color: "#D97706" },
          { label: "Dropped", value: "209", color: "#DC2626" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#F9FAFB",
            border: "1.5px solid rgba(0,0,0,0.07)",
            borderRadius: "0.875rem",
            padding: "1rem 0.875rem",
          }}>
            <div className="stat-number" style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color, lineHeight: 1, opacity: 0 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: "#9CA3AF", marginTop: "0.3rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: "#F9FAFB",
        border: "1.5px solid rgba(0,0,0,0.06)",
        borderRadius: "1rem",
        padding: "1.5rem",
        marginBottom: "1.25rem",
      }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: "130px", overflow: "visible" }}>
          <defs>
            <linearGradient id="areaGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5E5ADB" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#5E5ADB" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={chartH - (y / 100) * chartH * 0.85 - 5} x2={chartW} y2={chartH - (y / 100) * chartH * 0.85 - 5}
              stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
          ))}
          <path ref={areaRef} d={areaD} fill="url(#areaGradLight)" style={{ opacity: 0 }} />
          <path
            ref={lineRef}
            d={pathD}
            fill="none"
            stroke="#5E5ADB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
          />
          {points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill="#5E5ADB" opacity="0.85" />
          ))}
        </svg>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {[
          { label: "Budget Used", value: "78%", color: "#2563EB", bar: 78 },
          { label: "Task Completion", value: "91%", color: "#059669", bar: 91 },
        ].map((b) => (
          <div key={b.label} style={{
            background: "#F9FAFB",
            border: "1.5px solid rgba(0,0,0,0.07)",
            borderRadius: "0.875rem",
            padding: "1rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600 }}>{b.label}</span>
              <span style={{ fontSize: "0.75rem", color: b.color, fontWeight: 700 }}>{b.value}</span>
            </div>
            <div style={{ height: "5px", background: "rgba(0,0,0,0.07)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${b.bar}%`, height: "100%", background: b.color, borderRadius: "3px" }} />
            </div>
          </div>
        ))}
      </div>
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
        padding: "5rem 0 7rem",
        position: "relative",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 4rem" }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#5E5ADB",
            background: "rgba(94,90,219,0.07)", border: "1.5px solid rgba(94,90,219,0.18)",
            borderRadius: "999px", padding: "0.3rem 1rem", marginBottom: "1.25rem",
          }}>
            Product
          </div>
          <h2 style={{
            fontSize: "clamp(1.9rem, 3.2vw, 2.75rem)", fontWeight: 900,
            color: "#111827", lineHeight: 1.15, letterSpacing: "-0.03em",
            marginBottom: "1rem", fontFamily: "'Outfit', 'Inter', sans-serif",
          }}>
            Your events. Completely under control.
          </h2>
          <p style={{ fontSize: "1rem", color: "#6B7280", lineHeight: 1.7 }}>
            See your registration trends, financial health, and task progress — all in one intelligent dashboard.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="reveal" style={{ maxWidth: 860, margin: "0 auto" }}>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
