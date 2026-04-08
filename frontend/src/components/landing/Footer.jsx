import { useState } from "react";
import { Link } from "react-router-dom";
import ClickSpark from "../ui/ClickSpark";

const FOOTER_LINKS = {
  "How it Work": ["Features", "Pricing", "Integrations", "Demo"],
  Social: ["LinkedIn", "Facebook", "GitHub", "Dribbble"],
  Legal: ["Terms", "Privacy", "Cookies", "Licenses"],
};

const TRUST_LOGOS = [
  { name: "TechCrunch", opacity: 0.5 },
  { name: "Forbes", opacity: 0.4 },
  { name: "Wired", opacity: 0.5 },
  { name: "The Verge", opacity: 0.45 },
  { name: "Fortune", opacity: 0.4 }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1200);
  };

  return (
    <footer style={{ background: "#0a0a0a", fontFamily: "'Inter', sans-serif", color: "white" }}>
      <style dangerouslySetInnerHTML={{__html: `
        .footer-input::placeholder { color: rgba(255, 255, 255, 0.4); opacity: 1; }
        @keyframes fade-in { 
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      {/* 1. Newsletter Section (Dark Background) */}
      <div style={{ padding: "8rem 2.5rem 6rem", textAlign: "center", position: "relative", background: "#0a0a0a" }}>
        <h2 style={{ 
          fontSize: "clamp(2.5rem, 5vw, 3.5rem)", 
          fontWeight: 800, 
          color: "white", 
          marginBottom: "1rem",
          letterSpacing: "-0.03em",
          fontFamily: "'Outfit', sans-serif"
        }}>
          Subscribe to our newsletter
        </h2>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "rgba(255, 255, 255, 0.6)", 
          marginBottom: "2.5rem",
          maxWidth: "600px",
          margin: "0 auto 2.5rem"
        }}>
          Get the latest event management tips and platform updates delivered to your inbox.
        </p>

        {status === "success" ? (
          <div style={{ 
            maxWidth: "480px", margin: "0 auto 2.5rem", padding: "1.5rem", 
            background: "rgba(16, 185, 129, 0.1)", borderRadius: "1rem", border: "1px solid rgba(16, 185, 129, 0.2)",
            color: "#10B981", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
            animation: "fade-in 0.5s ease"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Thanks for subscribing! Check your inbox soon.
          </div>
        ) : (
          <form style={{ 
            display: "flex", 
            gap: "0.75rem", 
            maxWidth: "480px", 
            margin: "0 auto 2.5rem",
            padding: "0.5rem",
            background: "#171717",
            borderRadius: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }} onSubmit={handleSubmit}>
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "1rem" }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input 
                type="email" 
                required
                className="footer-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                style={{
                  border: "none",
                  outline: "none",
                  padding: "0.75rem 1rem",
                  fontSize: "0.95rem",
                  width: "100%",
                  background: "transparent",
                  color: "white"
                }}
              />
            </div>
            <button 
              disabled={status === "loading"}
              style={{
                background: "#ff5a1f",
                color: "#fff",
                border: "none",
                padding: "0.8rem 1.5rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                minWidth: "120px"
              }}
            >
              {status === "loading" ? "Joining..." : "Get started"}
            </button>
          </form>
        )}
      </div>

      {/* 2. Overlapping CTA Card Section */}
      <div style={{ background: "#030712", position: "relative", padding: "0 2.5rem 6rem" }}>
        
        {/* Floating Card */}
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "linear-gradient(135deg, #0f172a 0%, #030712 100%)",
          borderRadius: "2.5rem",
          padding: "5rem 4rem",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          top: "-4rem",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          overflow: "hidden"
        }}>
          {/* Content */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: "500px" }}>
            <div style={{
              background: "rgba(59,130,246,0.1)", color: "#60A5FA",
              padding: "0.4rem 1rem", borderRadius: "99px",
              fontSize: "0.75rem", fontWeight: 700, display: "inline-block",
              marginBottom: "1.5rem", border: "1px solid rgba(59,130,246,0.2)"
            }}>
              Limited Offer: 3 Months Free
            </div>
            <h3 style={{ 
              fontSize: "clamp(2rem, 4vw, 3rem)", 
              fontWeight: 800, 
              color: "#fff", 
              marginBottom: "1rem", 
              lineHeight: 1.1,
              fontFamily: "'Outfit', sans-serif"
            }}>
              Ready to <span style={{ color: "#ff5a1f" }}>Elevate</span> Your Events?
            </h3>
            <p style={{ fontSize: "1.1rem", color: "#94A3B8", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              Join the next generation of event architects. Scalable, intelligent, and designed for high-performance teams.
            </p>
            <Link to="/signup" style={{
              background: "#fff",
              color: "#030712",
              padding: "1rem 2.5rem",
              borderRadius: "0.75rem",
              fontWeight: 800,
              textDecoration: "none",
              display: "inline-block",
              transition: "transform 0.2s ease",
              boxShadow: "0 10px 30px rgba(255,255,255,0.1)"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              Create Your Account Now
            </Link>
          </div>

          {/* Globe/Map Decorative Element */}
          <div style={{ 
            position: "absolute", 
            right: "-10%", 
            top: "50%", 
            transform: "translateY(-50%)", 
            width: "600px", 
            height: "600px", 
            opacity: 0.4,
            pointerEvents: "none"
          }}>
             <svg width="600" height="600" viewBox="0 0 800 800" fill="none">
              <circle cx="400" cy="400" r="300" stroke="rgba(59,130,246,0.2)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="400" cy="400" r="250" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
              {/* Animated dots */}
              {[...Array(60)].map((_, i) => (
                <circle 
                  key={i} 
                  cx={400 + Math.cos(i) * (150 + Math.random() * 150)} 
                  cy={400 + Math.sin(i * 1.5) * (150 + Math.random() * 150)} 
                  r={Math.random() * 2} 
                  fill={Math.random() > 0.5 ? "#3B82F6" : "#fff"} 
                  opacity={0.2 + Math.random() * 0.6}
                >
                  <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${2 + Math.random() * 3}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>
          </div>
        </div>

        {/* 3. Links Section */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 4rem" }}>
          
          {/* Trust Logos */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "0 0 6rem",
            flexWrap: "wrap",
            gap: "2rem"
          }}>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>As seen in</p>
            {TRUST_LOGOS.map(logo => (
              <span key={logo.name} style={{ 
                fontSize: "1.2rem", fontWeight: 900, color: "#fff", opacity: logo.opacity, 
                letterSpacing: "-0.05em", fontFamily: "'Outfit', sans-serif" 
              }}>
                {logo.name}
              </span>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "4rem", marginBottom: "6rem" }}>
            {/* Brand/Contact */}
            <div>
              <Link to="/" style={{ display: "block", marginBottom: "2rem" }}>
                <img 
                  src="/logo-new.svg" 
                  alt="Planora" 
                  style={{ 
                    height: "2.4rem", 
                    width: "auto", 
                    filter: "invert(72%) sepia(99%) saturate(400%) hue-rotate(5deg) brightness(105%) contrast(105%)" 
                  }} 
                />
              </Link>
              <p style={{ fontSize: "0.95rem", color: "#64748B", lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: "280px" }}>
                Effortlessly manage tasks, set reminders, and stay organized – all in one intuitive platform.
              </p>
              
              <div style={{ display: "flex", gap: "1.2rem", marginBottom: "2.5rem" }}>
                {['twitter', 'linkedin', 'github', 'instagram'].map(platform => (
                  <Link key={platform} to="#" style={{ color: "#94A3B8", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#3B82F6"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: "0.8rem", textTransform: "capitalize" }}>{platform[0]}</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#475569", marginBottom: "0.5rem", fontWeight: 700 }}>Phone number</p>
                  <p style={{ fontSize: "0.9rem", color: "#94A3B8" }}>+1 (555) 000-0000</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#475569", marginBottom: "0.5rem", fontWeight: 700 }}>Email</p>
                  <p style={{ fontSize: "0.9rem", color: "#94A3B8" }}>hello@planora.ai</p>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem" }}>{heading}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {links.map(link => (
                    <li key={link}>
                      <Link to="#" style={{ fontSize: "0.9rem", color: "#94A3B8", textDecoration: "none", transition: "color 0.2s ease" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div style={{ 
            borderTop: "1px solid rgba(255,255,255,0.05)", 
            paddingTop: "2.5rem", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <p style={{ fontSize: "0.9rem", color: "#475569" }}>
                © {currentYear} Planora Technologies.
              </p>
              <div style={{ 
                display: "flex", alignItems: "center", gap: "0.5rem", 
                background: "rgba(34,197,94,0.05)", padding: "0.3rem 0.8rem", borderRadius: "99px",
                border: "1px solid rgba(34,197,94,0.1)"
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }}></div>
                <span style={{ fontSize: "0.75rem", color: "#22C55E", fontWeight: 600 }}>All Systems Operational</span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <Link to="#" style={{ fontSize: "0.9rem", color: "#475569", textDecoration: "none" }}>Privacy Policy</Link>
              <Link to="#" style={{ fontSize: "0.9rem", color: "#475569", textDecoration: "none" }}>Terms of Service</Link>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <span style={{ fontSize: "1.1rem" }}>🌐</span>
                <span style={{ fontSize: "0.9rem", color: "#475569" }}>English (US)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
