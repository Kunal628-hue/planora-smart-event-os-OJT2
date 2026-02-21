import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Product", href: "#product" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <header className={`planora-nav${scrolled ? " scrolled" : ""}`}>
            <div
                className="page-container"
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "2rem",
                }}
            >
                {/* Logo */}
                <Link
                    to="/"
                    style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}
                >
                    <img
                        src="/LOGO.jpeg"
                        alt="Planora Logo"
                        style={{
                            height: "2.5rem",
                            width: "auto",
                            display: "block",
                        }}
                    />
                </Link>

                {/* Center nav links */}
                <nav
                    style={{
                        display: "flex",
                        gap: "0.25rem",
                        alignItems: "center",
                    }}
                >
                    {NAV_LINKS.map(({ label, href }) => (
                        <a
                            key={label}
                            href={href}
                            style={{
                                padding: "0.45rem 0.9rem",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                color: "var(--text-secondary)",
                                borderRadius: "var(--radius-sm)",
                                transition: "color 0.2s ease, background 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--text-primary)";
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "var(--text-secondary)";
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                {/* Right CTAs */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <Link to="/login" className="btn btn-ghost btn-sm">
                        Log in
                    </Link>
                    <Link to="/signup" className="btn btn-primary btn-sm">
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}
