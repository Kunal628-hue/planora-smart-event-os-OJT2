import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
    { id: "events", label: "Events", path: "/events", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { id: "vendors", label: "Vendors", path: "/vendors", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg> },
    { id: "guests", label: "Guests", path: "/guests", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { id: "budget", label: "Budget", path: "/budget", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
    { id: "tasks", label: "Tasks / Timeline", path: "/tasks", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg> },
    { id: "analytics", label: "Analytics", path: "/analytics", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg> },
    { id: "team", label: "Team", path: "/team", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { id: "settings", label: "Settings", path: "/settings", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (!currentUser) {
                navigate("/login");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg-base)" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div style={{ padding: "2rem 1.75rem 3.5rem" }}>
                    <Link to="/dashboard" style={{ display: "block", cursor: "pointer" }}>
                        <img
                            src="/logo-new.svg"
                            alt="Planora Logo"
                            style={{
                                width: "100%",
                                height: "auto",
                                display: "block",
                                filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.3))"
                            }}
                        />
                    </Link>
                </div>

                <nav style={{ flex: 1, padding: "0 0.85rem", overflowY: "auto" }}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`sidebar-item${location.pathname === item.path ? " active" : ""}`}
                            style={{
                                marginBottom: "0.4rem",
                                padding: "0.85rem 1.15rem"
                            }}
                        >
                            <span style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "22px",
                                opacity: location.pathname === item.path ? 1 : 0.7
                            }}>
                                {item.icon}
                            </span>
                            <span style={{
                                fontSize: "0.925rem",
                                fontWeight: location.pathname === item.path ? 700 : 500
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: "0 1rem", marginTop: "auto", marginBottom: "1.5rem" }}>
                    <button
                        onClick={handleLogout}
                        className="sidebar-item"
                        style={{
                            width: "100%",
                            padding: "0.8rem 1rem",
                            justifyContent: "center",
                            color: "#ff4d4d",
                            border: "1px solid rgba(255, 77, 77, 0.15)",
                            background: "rgba(255, 77, 77, 0.05)",
                            cursor: "pointer",
                            borderRadius: "12px",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.8rem",
                            fontWeight: 700
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="top-bar" style={{
                    height: "80px",
                    padding: "0 2.5rem",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    backdropFilter: "blur(16px)",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderBottom: "1px solid var(--border-subtle)",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
                }}>
                    <div className="search-input-wrapper" style={{ flex: 1 }}>
                        <svg style={{ position: "absolute", left: "1.15rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.6 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input className="search-input" placeholder="Search insights, events, or vendors..." style={{ height: "46px", border: "1.5px solid var(--border-subtle)", borderRadius: "12px", width: "100%", maxWidth: "500px" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                        <div style={{ position: "relative" }}>
                            <div
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                    padding: "0.7rem",
                                    borderRadius: "12px",
                                    transition: "all 0.2s",
                                    border: "1.5px solid var(--border-subtle)",
                                    background: showNotifications ? "var(--bg-elevated)" : "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                                className="hover-lift"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            </div>

                            {showNotifications && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    marginTop: "1rem",
                                    width: "360px",
                                    background: "#fff",
                                    borderRadius: "20px",
                                    boxShadow: "0 25px 60px -12px rgba(0,0,0,0.18)",
                                    border: "1.5px solid var(--border-subtle)",
                                    zIndex: 1000,
                                    overflow: "hidden",
                                    animation: "fade-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                                }}>
                                    <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1.5px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
                                        <span style={{ fontWeight: 850, fontSize: "1.05rem", color: "var(--text-primary)" }}>Intelligence Feed</span>
                                        <span style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>Clear</span>
                                    </div>
                                    <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                                        {[
                                            { id: 1, title: "RSVP Confirmed", msg: "Kunal Singhi confirmed for Wedding", time: "2m ago", icon: "✨", color: "#10b981" },
                                            { id: 2, title: "Budget Deviation", msg: "Catering is 10% over the optimized path", time: "1h ago", icon: "⚠️", color: "#f59e0b" },
                                            { id: 3, title: "AI Model Update", msg: "Smart Timeline for Conference refreshed", time: "3h ago", icon: "🤖", color: "#3b82f6" },
                                        ].map((n, i) => (
                                            <div key={n.id} style={{ padding: "1.25rem 1.75rem", borderBottom: i === 2 ? "none" : "1px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.2s" }} className="hover-dim">
                                                <div style={{ display: "flex", gap: "1.25rem" }}>
                                                    <div style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        borderRadius: "12px",
                                                        background: `${n.color}15`,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "1.1rem"
                                                    }}>{n.icon}</div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.15rem" }}>
                                                            <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-primary)" }}>{n.title}</span>
                                                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>{n.time}</span>
                                                        </div>
                                                        <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.45, fontWeight: 500 }}>{n.msg}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: "1.25rem", textAlign: "center", borderTop: "1.5px solid var(--border-subtle)", fontSize: "0.85rem", fontWeight: 800, color: "var(--accent-primary)", cursor: "pointer", background: "#fff" }}>
                                        View All Engine Activity
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ height: "32px", width: "1px", background: "var(--border-subtle)" }}></div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.85rem",
                            cursor: "pointer",
                            padding: "0.5rem 0.5rem 0.5rem 1rem",
                            borderRadius: "14px",
                            transition: "all 0.2s",
                            border: "1.5px solid transparent",
                            background: "var(--accent-soft)"
                        }} className="hover-lift">
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>{user?.displayName?.split(' ')[0] || "Planner"}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>Expert Mode</div>
                            </div>
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: "10px",
                                background: "var(--accent-primary)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                overflow: "hidden",
                                boxShadow: "0 8px 16px -4px rgba(30, 64, 175, 0.3)",
                                border: "2px solid #fff"
                            }}>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    (user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                <div className="dashboard-content" style={{ padding: "2.5rem" }}>
                    <Outlet context={{ user }} />
                </div>
            </main>
        </div>
    );
}
