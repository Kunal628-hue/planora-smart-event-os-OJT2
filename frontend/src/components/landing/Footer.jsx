import { Link } from "react-router-dom";

export default function Footer() {
  const footerLinks = [
    {
      title: "How it Work",
      links: ["Features", "Pricing", "Integrations", "Demo"]
    },
    {
      title: "Social",
      links: ["LinkedIn", "Facebook", "GitHub", "Dribbble"]
    },
    {
      title: "Legal",
      links: ["Terms", "Privacy", "Cookies", "Licenses"]
    }
  ];

  return (
    <footer style={{
      background: "transparent",
      padding: "5rem 4rem 2rem",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      color: "#fff",
      width: "100%"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: "4rem",
        marginBottom: "4rem"
      }}>
        {/* Brand Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/logo-new.svg" alt="Planora" style={{ height: "45px" }} />
          </div>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
            Effortlessly manage tasks, set reminders, and stay organized – all in one intuitive platform.
          </p>
        </div>

        {/* Link Columns */}
        {footerLinks.map((col, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h4 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
              {col.title}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {col.links.map(link => (
                <a key={link} href="#" style={{
                  color: "#9ca3af",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  transition: "color 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        paddingTop: "2rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#6b7280",
        fontSize: "0.85rem"
      }}>
        <div>© 2026 Planora Technologies.</div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <a href="#" style={{ color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>Privacy Policy</a>
          <a href="#" style={{ color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#6b7280"}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
