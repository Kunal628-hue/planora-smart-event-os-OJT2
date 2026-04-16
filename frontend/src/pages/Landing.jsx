import { Suspense, lazy } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";

const Features = lazy(() => import("../components/landing/Features"));
const Testimonials = lazy(() => import("../components/landing/Testimonials"));
const Connect = lazy(() => import("../components/landing/Connect"));
const FinalCTA = lazy(() => import("../components/landing/FinalCTA"));
import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  "How it Work": ["Features", "Pricing", "Integrations", "Demo"],
  Social: ["LinkedIn", "Facebook", "GitHub", "Dribbble"],
  Legal: ["Terms", "Privacy", "Cookies", "Licenses"],
};

export default function Landing() {

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#FFFFFF", overflowX: "hidden" }}>
      <Navbar />
      <Hero />
      <Suspense fallback={null}>
        <Features />
        <Testimonials />
        <Connect />
        <FinalCTA />
      </Suspense>

      {/* Footer matching reference video style (simple dark or light, video shows light footer at end) */}
      <footer style={{ background: "#050505", paddingTop: "4rem", paddingBottom: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
            <div>
              <Link to="/" style={{ display: "block", marginBottom: "1.5rem" }}>
                <img src="/logo-new.svg" alt="Planora" style={{ height: "2.2rem", width: "auto" }} />
              </Link>
              <p style={{ fontSize: "0.85rem", color: "#9CA3AF", lineHeight: 1.7, maxWidth: 260 }}>
                Effortlessly manage tasks, set reminders, and stay organized – all in one intuitive platform.
              </p>
            </div>
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "1.2rem" }}>
                  {heading}
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.8rem", padding: 0, margin: 0 }}>
                  {links.map((l) => (
                    <li key={l}>
                      <span style={{ fontSize: "0.85rem", color: "#9CA3AF", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={e => e.currentTarget.style.color = "#9CA3AF"}
                      >{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "0.8rem", color: "#4B5563" }}>© {new Date().getFullYear()} Planora Technologies.</p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#9CA3AF", cursor: "pointer" }}>Privacy Policy</span>
              <span style={{ fontSize: "0.8rem", color: "#9CA3AF", cursor: "pointer" }}>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
