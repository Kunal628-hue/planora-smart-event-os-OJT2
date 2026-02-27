import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Trust from "../components/landing/Trust";
import Problem from "../components/landing/Problem";
import Features from "../components/landing/Features";
import ProductShowcase from "../components/landing/ProductShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import Security from "../components/landing/Security";
import FinalCTA from "../components/landing/FinalCTA";
import { Link } from "react-router-dom";

const FOOTER_LINKS = {
    Product: ["Features", "How It Works", "Dashboard", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Landing() {
    return (
        <div className="dark-theme" style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
            <Navbar />
            <Hero />
            <Trust />
            <Problem />
            <Features />
            <ProductShowcase />
            <HowItWorks />
            <Security />
            <FinalCTA />

            {/* ── Footer ── */}
            <footer
                style={{
                    background: "var(--bg-surface)",
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "4rem",
                    paddingBottom: "2rem",
                }}
            >
                <div className="page-container">
                    {/* Top row */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr 1fr",
                            gap: "3rem",
                            marginBottom: "3.5rem",
                        }}
                    >
                        {/* Brand */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.1rem" }}>
                                <Link to="/" style={{ display: "block" }}>
                                    <img
                                        src="/LOGO.jpeg"
                                        alt="Planora Logo"
                                        style={{ height: "3rem", width: "auto", display: "block" }}
                                    />
                                </Link>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.72, maxWidth: 320 }}>
                                Planora is a next-generation Campus Event Operating System designed to modernize how student-led organizations plan, execute, and analyze events.
                            </p>
                        </div>

                        {/* Link columns */}
                        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
                            <div key={heading}>
                                <p
                                    style={{
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: "var(--text-muted)",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    {heading}
                                </p>
                                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                                    {links.map((l) => (
                                        <li key={l}>
                                            <span
                                                style={{
                                                    fontSize: "0.875rem",
                                                    color: "var(--text-secondary)",
                                                    cursor: "pointer",
                                                    transition: "color 0.2s",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                                            >
                                                {l}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div
                        style={{
                            borderTop: "1px solid var(--border-subtle)",
                            paddingTop: "1.5rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem",
                        }}
                    >
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            © {new Date().getFullYear()} Planora Technologies. Built for student organizers everywhere.
                        </p>
                        <div style={{ display: "flex", gap: "1.25rem" }}>
                            <Link to="/login" style={{ fontSize: "0.8rem", color: "var(--text-muted)", transition: "color 0.2s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
                                Log In
                            </Link>
                            <Link to="/signup" style={{
                                fontSize: "0.85rem",
                                color: "#60a5fa",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem"
                            }}>
                                Get Started Free
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
