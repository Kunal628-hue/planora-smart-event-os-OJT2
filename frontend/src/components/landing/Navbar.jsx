import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import useMagnetic from "../../hooks/useMagnetic";
import useNavbarStyle from "../../hooks/useNavbarStyle";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Product", href: "#product" },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const navRef = useRef(null);
  const ctaBtnRef = useMagnetic(0.3);
  const { bg, borderColor, shadow } = useNavbarStyle();

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  return (
    <header
      ref={navRef}
      style={{
        position: "fixed",
        inset: "0 0 auto 0",
        zIndex: 999,
        height: 66,
        display: "flex",
        alignItems: "center",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        background: bg,
        borderBottom: `1px solid ${borderColor}`,
        boxShadow: shadow,
        transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-12px)",
        transitionDelay: mounted ? "0s" : "0s",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "block", flexShrink: 0 }}>
          <img
            src="/logo-new.svg"
            alt="Planora Logo"
            style={{ height: "3rem", width: "auto", display: "block" }}
          />
        </Link>

        {/* Center nav */}
        <nav style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                padding: "0.45rem 0.9rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "rgba(148,163,184,0.85)",
                borderRadius: "0.5rem",
                transition: "color 0.2s ease, background 0.2s ease",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(148,163,184,0.85)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
          <Link
            to="/login"
            style={{
              padding: "0.45rem 1.1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "rgba(148,163,184,0.8)",
              borderRadius: "0.6rem",
              transition: "color 0.2s ease, background 0.2s ease",
              textDecoration: "none",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(148,163,184,0.8)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            ref={ctaBtnRef}
            style={{
              padding: "0.5rem 1.3rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#fff",
              borderRadius: "0.7rem",
              background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              textDecoration: "none",
              boxShadow: "0 4px 15px -4px rgba(124,58,237,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "box-shadow 0.3s ease",
              willChange: "transform",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 25px -4px rgba(124,58,237,0.65)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 15px -4px rgba(124,58,237,0.5)";
            }}
          >
            Get Started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
