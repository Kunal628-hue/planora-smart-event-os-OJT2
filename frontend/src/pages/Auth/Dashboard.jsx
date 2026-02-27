import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
    { id: "events", label: "Events", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { id: "vendors", label: "Vendors", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg> },
    { id: "guests", label: "Guests", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { id: "budget", label: "Budget", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
    { id: "tasks", label: "Tasks / Timeline", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg> },
    { id: "analytics", label: "Analytics", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg> },
    { id: "team", label: "Team", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { id: "settings", label: "Settings", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState("dashboard");

    const handleLogout = () => {
        localStorage.removeItem("planora_token");
        navigate("/login");
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div style={{ padding: "0 0.5rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link to="/" style={{ display: "block" }}>
                        <img
                            src="/LOGO.jpeg"
                            alt="Planora Logo"
                            style={{ height: "2.8rem", width: "auto", display: "block" }}
                        />
                    </Link>
                </div>

                <nav style={{ flex: 1 }}>
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item${activeNav === item.id ? " active" : ""}`}
                            onClick={() => setActiveNav(item.id)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="upgrade-card">
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>Upgrade to Pro</div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.4rem 0 1rem" }}>Unlock advanced analytics & unlimited events</p>
                    <button className="btn btn-primary btn-sm" style={{ width: "100%", borderRadius: "10px", fontWeight: 700, background: "#8b5cf6" }}>Upgrade Now</button>
                </div>
            </aside>

            {/* Main */}
            <main className="dashboard-main">
                <header className="top-bar">
                    <div className="search-input-wrapper">
                        <svg style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input className="search-input" placeholder="Search events, vendors, guests..." />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div style={{ position: "relative", cursor: "pointer" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: "9px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>3</div>
                        </div>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#8b5cf6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, cursor: "pointer" }}>S</div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div style={{ marginBottom: "0.5rem" }}>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Dashboard</h1>
                        <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Welcome back, <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>Sarah!</span> Here's your event overview.</p>
                    </div>

                    <div className="dashboard-grid">
                        <div className="card" style={{ gridColumn: "span 8" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                                <div>
                                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Event Health Score</h2>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Overall readiness and risk assessment</p>
                                </div>
                                <div style={{ padding: "0.4rem 0.8rem", borderRadius: "2rem", background: "#f0fdf4", color: "#16a34a", fontSize: "0.75rem", fontWeight: 700 }}>On Track</div>
                            </div>

                            <div className="health-grid">
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <div className="health-gauge">
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--accent-primary)", lineHeight: 1 }}>82</div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginTop: "0.25rem", textTransform: "uppercase" }}>Score</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                    {[
                                        { label: "Budget Stability", value: "78%", color: "#10b981" },
                                        { label: "Vendor Confirmation", value: "92%", color: "#10b981" },
                                        { label: "Task Completion", value: "75%", color: "#f59e0b" },
                                        { label: "RSVP Rate", value: "85%", color: "#10b981" },
                                    ].map(item => (
                                        <div key={item.label} className="progress-row">
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600 }}>
                                                <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                                                <span style={{ color: "var(--text-primary)" }}>{item.value}</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: item.value, background: item.color }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginTop: "2rem", padding: "1rem", borderRadius: "10px", background: "var(--bg-elevated)", fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                Your event is performing well across all key metrics. Keep monitoring vendor confirmations and task completion to maintain this score.
                            </div>
                        </div>

                        <div className="risk-alert" style={{ gridColumn: "span 4" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                <div className="risk-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#991b1b" }}>Financial Risk Detected</h3>
                                    <p style={{ fontSize: "0.75rem", color: "#b91c1c" }}>Budget threshold alert</p>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #fee2e2", background: "#fff" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Catering</span>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b" }}>+10% over</span>
                                    </div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>$13,200</div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Budget: $12,000</div>
                                </div>
                                <div style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #fee2e2", background: "#fff" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Outstanding Payments</span>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444" }}>3 vendors</span>
                                    </div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>$15,500 due</div>
                                </div>
                            </div>
                            <button className="btn btn-ghost" style={{ marginTop: "auto", border: "1px solid #e2e8f0", background: "#fff", width: "100%", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                View Breakdown
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </button>
                        </div>

                        {/* Financial Stats Grid (Second Row from Image 2) */}
                        {[
                            { label: "Total Budget", value: "$45,000", trend: "+8%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
                            { label: "Estimated Cost", value: "$43,500", trend: "-3%", color: "#ef4444", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>, sub: "97% of budget" },
                            { label: "Paid Amount", value: "$28,000", trend: "+12%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>, sub: "64% of cost" },
                            { label: "Remaining Balance", value: "$1,500", trend: "+5%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>, sub: "3% remaining" },
                        ].map((stat, idx) => (
                            <div key={stat.label} className="stat-card" style={{ gridColumn: "span 3" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="stat-icon">{stat.icon}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: stat.color, fontSize: "0.75rem", fontWeight: 700, background: `${stat.color}15`, padding: "0.25rem 0.5rem", borderRadius: "10px" }}>
                                        {stat.trend}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>{stat.label}</div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.25rem 0" }}>{stat.value}</div>
                                    {stat.sub && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.sub}</div>}
                                </div>
                            </div>
                        ))}

                        {/* Chart Placeholders */}
                        <div className="card" style={{ gridColumn: "span 4" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.5rem" }}>Expense Distribution</h3>
                            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", borderRadius: "12px", border: "2px dashed var(--border-subtle)" }}>
                                <div style={{ width: 120, height: 120, border: "20px solid #8b5cf6", borderLeftColor: "#10b981", borderBottomColor: "#3b82f6", borderRightColor: "#f59e0b", borderRadius: "50%" }}></div>
                            </div>
                        </div>
                        <div className="card" style={{ gridColumn: "span 4" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.5rem" }}>Planned vs Actual</h3>
                            <div style={{ height: "200px", display: "flex", alignItems: "flex-end", gap: "1rem", padding: "1rem", background: "var(--bg-elevated)", borderRadius: "12px" }}>
                                {[60, 80, 45, 90, 55, 70].map((h, i) => (
                                    <div key={i} style={{ flex: 1, display: "flex", gap: "2px" }}>
                                        <div style={{ flex: 1, height: `${h}%`, background: "#ddd6fe", borderRadius: "4px 4px 0 0" }}></div>
                                        <div style={{ flex: 1, height: `${h - 15}%`, background: "#8b5cf6", borderRadius: "4px 4px 0 0" }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card" style={{ gridColumn: "span 4" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.5rem" }}>Expense Trend</h3>
                            <div style={{ height: "200px", position: "relative", background: "var(--bg-elevated)", borderRadius: "12px", overflow: "hidden" }}>
                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M0 80 Q 25 70, 50 40 T 100 20" fill="none" stroke="#8b5cf6" strokeWidth="4" />
                                    <path d="M0 80 Q 25 70, 50 40 T 100 20 V 100 H 0 Z" fill="rgba(139, 92, 246, 0.1)" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
