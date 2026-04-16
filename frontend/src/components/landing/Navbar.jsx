import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#problem" },
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Entry animation — slide down from top
    gsap.fromTo(
      "#planora-navbar",
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.7, delay: 0.1, ease: "power3.out" }
    );

    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        .lp-nav-link {
          padding: 0.45rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #D1D5DB;
          border-radius: 0.5rem;
          transition: color 0.2s, background 0.2s;
          text-decoration: none;
          letter-spacing: -0.01em;
        }
        .lp-nav-link:hover {
          color: #FFFFFF;
          background: rgba(255,255,255,0.06);
        }
        .lp-login-link {
          padding: 0.45rem 1.1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #D1D5DB;
          border-radius: 0.6rem;
          transition: color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .lp-login-link:hover {
          color: #FFFFFF;
          background: rgba(255,255,255,0.06);
        }
        .lp-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.3rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #000;
          background: #fff;
          border-radius: 999px;
          text-decoration: none;
          border: none;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          letter-spacing: -0.01em;
        }
        .lp-cta-btn:hover {
          background: #1f2937;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
      `}</style>
      <header
        id="planora-navbar"
        style={{
          position: "fixed",
          inset: "0 0 auto 0",
          zIndex: 999,
          height: 66,
          display: "flex",
          alignItems: "center",
          opacity: 0, // GSAP takes over
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          background: scrolled
            ? "rgba(10,10,10,0.85)"
            : "transparent",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,0.4)" : "none",
          transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 2.5rem",
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
              style={{ height: "2.4rem", width: "auto", display: "block" }}
            />
          </Link>

          {/* Center nav */}
          <nav style={{ display: "flex", gap: "0.1rem", alignItems: "center" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="lp-nav-link">
                {label}
              </a>
            ))}
          </nav>

          {/* Right CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <Link to="/login" className="lp-login-link">
              Log in
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
