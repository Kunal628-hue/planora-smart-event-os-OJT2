import { 
  Zap, 
  Layers, 
  Shield, 
  Check, 
  X, 
  ArrowUpRight 
} from "lucide-react";

const plans = [
  {
    name: "Free Plan",
    price: "Free",
    desc: "Perfect for individuals & hobbyists",
    features: ["Up to 3 events", "Basic task management", "5 team members", "Email support", "Standard templates"],
    notIncluded: ["AI features", "Advanced analytics", "Priority support"],
    icon: <Zap size={24} />
  },
  {
    name: "Pro",
    price: "₹799",
    period: "/month",
    desc: "For growing event teams",
    features: ["Unlimited events", "AI-powered planning", "25 team members", "Advanced analytics & insights", "Unlimited individual data", "Priority support", "Custom integrations"],
    popular: true,
    icon: <Layers size={24} />
  },
  {
    name: "Enterprise",
    price: "₹2,499",
    period: "/month",
    desc: "For large organizations",
    features: ["Everything in Pro", "Optimized for teams", "Unlimited team users", "Enhanced data sharing", "Premium support", "Custom branding", "SLA guarantee"],
    icon: <Shield size={24} />
  }
];

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: "8rem 2.5rem", background: "#F5F5F5" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        
        {/* Badge */}
        <div className="reveal" style={{ marginBottom: "2rem" }}>
          <span style={{ background: "#E5E7EB", color: "#4B5563", padding: "0.5rem 1.25rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Pricing & Plans
          </span>
        </div>

        <h2 className="reveal delay-1" style={{ fontSize: "clamp(2.5rem, 5vw, 3.8rem)", fontWeight: 850, color: "#111827", marginBottom: "1.5rem", lineHeight: 1.1, letterSpacing: "-0.035em", fontFamily: "'Outfit', sans-serif" }}>
          Simple Pricing for Every Workflow.
        </h2>
        
        <p className="reveal delay-1" style={{ fontSize: "1.1rem", color: "#6B7280", marginBottom: "5rem", maxWidth: 600, margin: "0 auto 5rem" }}>
          Start free. Scale as you grow. No hidden fees, ever.
        </p>

        <div className="reveal delay-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
          {plans.map((p, i) => (
            <div 
              key={i} 
              style={{ 
                background: p.popular ? "#1B3A2E" : "#fff", 
                color: p.popular ? "#fff" : "#111827",
                padding: "3.5rem 2.5rem", 
                borderRadius: "2rem", 
                textAlign: "left",
                border: "1px solid rgba(0,0,0,0.05)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              {p.popular && (
                <span style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.1)", padding: "0.4rem 1rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Most Popular
                </span>
              )}

              {/* Icon from Video */}
              <div style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>{p.icon}</div>

              <div style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.5rem", opacity: p.popular ? 0.8 : 0.6 }}>{p.name}</div>
              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900 }}>{p.price}</span>
                {p.period && <span style={{ fontSize: "1.1rem", opacity: 0.6 }}>{p.period}</span>}
              </div>
              
              <div style={{ fontSize: "0.9rem", opacity: 0.7, marginBottom: "2.5rem" }}>{p.desc}</div>

              <div style={{ flex: 1 }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {p.features.map((f, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: 500 }}>
                      <Check size={16} />
                      {f}
                    </li>
                  ))}
                  {p.notIncluded?.map((f, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: 500, opacity: 0.3 }}>
                      <X size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button style={{ 
                marginTop: "3rem", 
                width: "100%", 
                padding: "1.1rem", 
                borderRadius: "999px", 
                border: "none",
                background: p.popular ? "#fff" : "#111827",
                color: p.popular ? "#1B3A2E" : "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: "pointer",
                transition: "opacity 0.2s"
              }} onMouseEnter={e => e.currentTarget.style.opacity = "0.9"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                Get Started <ArrowUpRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
