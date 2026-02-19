import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
    { icon: "🏠", label: "Overview", id: "overview" },
    { icon: "🎟️", label: "Events", id: "events" },
    { icon: "👥", label: "Guests", id: "guests" },
    { icon: "🤝", label: "Vendors", id: "vendors" },
    { icon: "📈", label: "Analytics", id: "analytics" },
    { icon: "⚙️", label: "Settings", id: "settings" },
];

const RECENT_EVENTS = [
    { name: "Tech Summit 2026", date: "Mar 15, 2026", tickets: 1240, revenue: "$62,400", status: "Live" },
    { name: "Design Week NYC", date: "Apr 2, 2026", tickets: 480, revenue: "$19,200", status: "Planning" },
    { name: "SaaS Connect", date: "May 10, 2026", tickets: 920, revenue: "$46,000", status: "Planning" },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState("overview");

    const handleLogout = () => {
        localStorage.removeItem("planora_token");
        navigate("/login");
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.5rem 1.5rem" }}>
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: "9px",
                            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            color: "#fff",
                            boxShadow: "0 0 16px rgba(139,92,246,0.35)",
                        }}
                    >
                        P
                    </div>
                    <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>Planora</span>
                </div>

                {/* Nav */}
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-link${activeNav === item.id ? " active" : ""}`}
                        onClick={() => setActiveNav(item.id)}
                        style={{ border: "none", background: "transparent", textAlign: "left", width: "100%", cursor: "pointer" }}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}

                {/* Bottom logout */}
                <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                    <button
                        onClick={handleLogout}
                        className="sidebar-link"
                        style={{ border: "none", background: "transparent", width: "100%", cursor: "pointer", color: "#ef4444" }}
                    >
                        <span>🚪</span>
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="dashboard-main">
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Event Overview</h1>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            Welcome back — here's how your events are performing.
                        </p>
                    </div>
                    <button className="btn-primary" style={{ fontSize: "0.875rem", padding: "0.6rem 1.4rem" }}>
                        + New Event
                    </button>
                </div>

                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
                    {[
                        { label: "Total Revenue", value: "$128,400", icon: "💰", change: "+18.4% vs last month" },
                        { label: "Tickets Sold", value: "3,841", icon: "🎟️", change: "+9.2% vs last month" },
                        { label: "Active Events", value: "7", icon: "📅", change: "2 going live soon" },
                        { label: "Guest Satisfaction", value: "4.8★", icon: "⭐", change: "Based on 1,204 reviews" },
                    ].map((s) => (
                        <div key={s.label} className="stat-card">
                            <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                            <span className="value">{s.value}</span>
                            <span className="label">{s.label}</span>
                            <span style={{ fontSize: "0.75rem", color: "#10b981", marginTop: "0.25rem" }}>{s.change}</span>
                        </div>
                    ))}
                </div>

                {/* Recent Events Table */}
                <div
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            padding: "1.25rem 1.5rem",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Recent Events</h2>
                        <span style={{ fontSize: "0.8rem", color: "#a78bfa", cursor: "pointer" }}>View all →</span>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                {["Event Name", "Date", "Tickets Sold", "Revenue", "Status"].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "0.75rem 1.5rem",
                                            textAlign: "left",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {RECENT_EVENTS.map((ev, i) => (
                                <tr
                                    key={ev.name}
                                    style={{
                                        borderBottom: i < RECENT_EVENTS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.04)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <td style={{ padding: "1rem 1.5rem", fontWeight: 600, fontSize: "0.875rem" }}>{ev.name}</td>
                                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{ev.date}</td>
                                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem" }}>{ev.tickets.toLocaleString()}</td>
                                    <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: 600 }}>{ev.revenue}</td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span
                                            style={{
                                                padding: "0.25rem 0.75rem",
                                                borderRadius: "2rem",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                background: ev.status === "Live" ? "rgba(16,185,129,0.12)" : "rgba(139,92,246,0.12)",
                                                color: ev.status === "Live" ? "#10b981" : "#a78bfa",
                                                border: ev.status === "Live" ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(139,92,246,0.25)",
                                            }}
                                        >
                                            {ev.status === "Live" && "● "}{ev.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
