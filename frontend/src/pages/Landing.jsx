import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Trust from "../components/landing/Trust";
import Problem from "../components/landing/Problem";
import Features from "../components/landing/Features";
import ProductShowcase from "../components/landing/ProductShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import FinalCTA from "../components/landing/FinalCTA";
import { Link } from "react-router-dom";
import useScrollColor from "../hooks/useScrollColor";
import useParallax from "../hooks/useParallax";

const FOOTER_LINKS = {
    Product: ["Features", "How It Works", "Dashboard", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Landing() {
    const { bg, glowColor, glowOpacity } = useScrollColor();
    const parallaxGlow1 = useParallax(-0.12);
    const parallaxGlow2 = useParallax(-0.08);

    return (
        <div style={{
            minHeight: "100vh",
            background: bg,
            "--current-bg": bg,
            color: "#fff",
            transition: "background 0.6s cubic-bezier(0.22,1,0.36,1)",
            position: "relative",
            overflowX: "hidden",
        }}>
            {/* ── Global Parallax Glow Layer ── */}
            {/* These orbs float and change color as the section changes */}
            <div
                ref={parallaxGlow1}
                style={{
                    position: "fixed",
                    width: 900,
                    height: 900,
                    top: "10%",
                    left: "-15%",
                    background: `radial-gradient(circle, rgba(${glowColor},${(glowOpacity * 0.8).toFixed(3)}) 0%, transparent 65%)`,
                    filter: "blur(80px)",
                    pointerEvents: "none",
                    zIndex: 0,
                    borderRadius: "50%",
                    willChange: "transform",
                    transition: "background 1.2s ease",
                }}
            />
            <div
                ref={parallaxGlow2}
                style={{
                    position: "fixed",
                    width: 600,
                    height: 600,
                    bottom: "5%",
                    right: "-10%",
                    background: `radial-gradient(circle, rgba(${glowColor},${(glowOpacity * 0.5).toFixed(3)}) 0%, transparent 65%)`,
                    filter: "blur(80px)",
                    pointerEvents: "none",
                    zIndex: 0,
                    borderRadius: "50%",
                    willChange: "transform",
                    transition: "background 1.2s ease",
                }}
            />

            {/* Grid overlay — universal */}
            <div style={{
                position: "fixed",
                inset: 0,
                backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
                pointerEvents: "none",
                zIndex: 0,
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 30%, black 0%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 30%, black 0%, transparent 100%)",
            }} />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 1 }}>
                <Navbar />
                <Hero />
                <Trust />
                <Problem />
                <Features />
                <ProductShowcase />
                <HowItWorks />
                <FinalCTA />

                {/* ── Footer ── */}
                <footer style={{
                    background: "rgba(0,0,0,0.35)",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    paddingTop: "4rem",
                    paddingBottom: "2rem",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                }}>
                    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 5rem" }}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr",
                            gap: "3rem",
                            marginBottom: "3.5rem",
                        }}>
                            {/* Brand */}
                            <div>
                                <div style={{ marginBottom: "1.1rem" }}>
                                    <Link to="/" style={{ display: "block" }}>
                                        <img src="/logo-new.svg" alt="Planora Logo" style={{ height: "3rem", width: "auto", display: "block" }} />
                                    </Link>
                                </div>
                                <p style={{ fontSize: "0.85rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.72, maxWidth: 300 }}>
                                    Planora is a next-generation Event Operating System designed to modernize how organizations plan, execute, and analyze events of all scales.
                                </p>
                                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                                    {["T", "G", "L"].map((s) => (
                                        <div key={s} style={{
                                            width: 34, height: 34, borderRadius: "0.6rem",
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.07)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            cursor: "pointer", color: "rgba(148,163,184,0.5)",
                                            fontSize: "0.75rem", fontWeight: 700,
                                            transition: "all 0.2s",
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "rgba(139,92,246,0.1)";
                                                e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
                                                e.currentTarget.style.color = "#c4b5fd";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                                                e.currentTarget.style.color = "rgba(148,163,184,0.5)";
                                            }}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                                <div key={heading}>
                                    <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(148,163,184,0.35)", marginBottom: "1rem" }}>
                                        {heading}
                                    </p>
                                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                        {links.map((l) => (
                                            <li key={l}>
                                                <span style={{ fontSize: "0.875rem", color: "rgba(148,163,184,0.5)", cursor: "pointer", transition: "color 0.2s" }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(196,181,253,0.9)")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.5)")}
                                                >
                                                    {l}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                            <p style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.3)" }}>
                                © {new Date().getFullYear()} Planora Technologies. Built for event organizers everywhere.
                            </p>
                            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                                <Link to="/login" style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.4)", transition: "color 0.2s", textDecoration: "none" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.7)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(148,163,184,0.4)")}
                                >
                                    Log In
                                </Link>
                                <Link to="/signup" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#c4b5fd", fontWeight: 700, textDecoration: "none" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#c4b5fd")}
                                >
                                    Get Started
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
