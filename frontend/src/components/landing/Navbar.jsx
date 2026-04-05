import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import GooeyNav from "../ui/GooeyNav";

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
        .lp-login-link {
          padding: 0.45rem 1.1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          border-radius: 0.6rem;
          transition: color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .lp-login-link:hover {
          color: #111827;
          background: rgba(17,24,39,0.06);
        }
        .lp-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.3rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #fff;
          background: #111827;
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
          height: 70,
          display: "flex",
          alignItems: "center",
          opacity: 0, // GSAP takes over
          backdropFilter: scrolled ? "blur(24px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(160%)" : "none",
          background: scrolled
            ? "rgba(3, 7, 18, 0.75)"
            : "transparent",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
          transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 2rem",
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
              style={{
                height: "2.2rem",
                width: "auto",
                display: "block",
                filter: "invert(72%) sepia(99%) saturate(400%) hue-rotate(5deg) brightness(105%) contrast(105%)"
              }}
            />
          </Link>

          {/* Center nav */}
          <nav style={{ display: "flex", alignItems: "center" }}>
            <GooeyNav items={NAV_LINKS} scrolled={scrolled} />
          </nav>

          {/* Right CTA */}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Link to="/login" style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              color: "#fff",
              padding: "0.6rem 1.4rem",
              borderRadius: "999px",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)"; }}
            >
              Login
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
