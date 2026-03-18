import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
    LayoutDashboard,
    Calendar,
    Handshake,
    Users,
    Wallet,
    ListTodo,
    BarChart3,
    Users2,
    Settings as SettingsIcon,
    LogOut,
    Search,
    Bell,
    CheckCircle2,
    AlertCircle,
    Cpu,
    User,
    ChevronRight,
    Sparkles
} from "lucide-react";
import DashboardBackground from "./DashboardBackground";

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "events", label: "Events", path: "/events", icon: <Calendar size={20} /> },
    { id: "vendors", label: "Vendors", path: "/vendors", icon: <Handshake size={20} /> },
    { id: "guests", label: "Guests", path: "/guests", icon: <Users size={20} /> },
    { id: "budget", label: "Budget", path: "/budget", icon: <Wallet size={20} /> },
    { id: "tasks", label: "Tasks / Timeline", path: "/tasks", icon: <ListTodo size={20} /> },
    { id: "analytics", label: "Analytics", path: "/analytics", icon: <BarChart3 size={20} /> },
    { id: "team", label: "Team", path: "/team", icon: <Users2 size={20} /> },
    { id: "settings", label: "Settings", path: "/settings", icon: <SettingsIcon size={20} /> },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setLoading(false);
                navigate("/login");
            } else {
                fetchEvents(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchEvents = async (uid) => {
        try {
            const res = await fetch(`${API_URL}/events?user=${uid}`);
            const data = await res.json();
            setEvents(data);

            // Sync with URL first if possible
            const match = location.pathname.match(/\/events\/([^/]+)/);
            if (match && match[1]) {
                setSelectedEventId(match[1]);
            } else if (data.length > 0) {
                // Otherwise keep existing selection or pick first
                setSelectedEventId(prev => {
                    const exists = data.find(e => (e.id || e._id) === prev);
                    return exists ? prev : (data[0].id || data[0]._id);
                });
            }
        } catch (err) {
            console.error("Layout fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Effect to sync dropdown selection with URL changes
    useEffect(() => {
        const match = location.pathname.match(/\/events\/([^/]+)/);
        if (match && match[1] && match[1] !== selectedEventId) {
            setSelectedEventId(match[1]);
        }
    }, [location.pathname]);

    // Function to handle dropdown change with navigation sync
    const handleEventChange = (newId) => {
        setSelectedEventId(newId);
        // If we are on event details, navigate to the new one
        if (location.pathname.startsWith('/events/') && location.pathname !== '/events') {
            navigate(`/events/${newId}`);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg-base)", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.1em", fontSize: "0.8rem", textTransform: "uppercase" }}>Initializing Core...</p>
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

    const selectedEvent = events.find(e => (e.id || e._id) === selectedEventId);

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div style={{ padding: "1.5rem 1.5rem 2.5rem" }}>
                    <Link to="/dashboard" style={{ display: "block" }}>
                        <img
                            src="/logo-new.svg"
                            alt="Planora Logo"
                            style={{
                                height: "3.2rem",
                                width: "auto",
                                display: "block"
                            }}
                        />
                    </Link>
                </div>

                <nav style={{ flex: 1, padding: "0 1rem", overflowY: "auto" }}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`sidebar-item${location.pathname === item.path ? " active" : ""}`}
                            style={{
                                marginBottom: "0.5rem",
                                padding: "0.85rem 1.25rem",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                textDecoration: "none",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <span style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: location.pathname === item.path ? 1 : 0.6,
                                color: "inherit"
                            }}>
                                {item.icon}
                            </span>
                            <span style={{
                                fontSize: "0.95rem",
                                fontWeight: location.pathname === item.path ? 700 : 500,
                                color: "inherit"
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <button
                        onClick={handleLogout}
                        className="sidebar-item"
                        style={{
                            width: "100%",
                            padding: "0.85rem 1.25rem",
                            color: "rgba(255, 77, 77, 0.9)",
                            background: "rgba(255, 77, 77, 0.08)",
                            border: "1px solid rgba(255, 77, 77, 0.15)",
                            borderRadius: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            fontWeight: 700,
                            transition: "all 0.2s ease"
                        }}
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="dashboard-main" style={{ position: "relative" }}>
                <DashboardBackground />
                <header className="top-bar" style={{
                    height: "85px",
                    padding: "0 2.5rem",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    backdropFilter: "blur(20px)",
                    background: "rgba(255, 255, 255, 0.85)",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "2rem", flex: 1 }}>
                        {/* Global Event Selector */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            background: "var(--bg-elevated)",
                            padding: "0.5rem 1rem",
                            borderRadius: "16px",
                            border: "1px solid var(--border-subtle)",
                            minWidth: "280px"
                        }}>
                            <Calendar size={18} color="var(--accent-primary)" strokeWidth={2.5} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Active Project</div>
                                <select
                                    value={selectedEventId}
                                    onChange={(e) => handleEventChange(e.target.value)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "0.95rem",
                                        fontWeight: 850,
                                        color: "var(--text-primary)",
                                        width: "100%",
                                        cursor: "pointer",
                                        outline: "none"
                                    }}
                                >
                                    {events.length === 0 ? (
                                        <option value="">No events found</option>
                                    ) : (
                                        events.map(event => (
                                            <option key={event.id || event._id} value={event.id || event._id}>
                                                {event.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="search-input-wrapper" style={{ flex: 1, position: "relative", maxWidth: "400px" }}>
                            <Search style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", opacity: 0.5 }} size={16} />
                            <input
                                className="search-input"
                                placeholder="Search workspace..."
                                style={{
                                    height: "44px",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: "14px",
                                    width: "100%",
                                    paddingLeft: "3rem",
                                    background: "var(--bg-elevated)",
                                    fontSize: "0.9rem",
                                    fontWeight: 500
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "12px",
                                    transition: "all 0.2s",
                                    border: "1.5px solid var(--border-subtle)",
                                    background: showNotifications ? "var(--bg-elevated)" : "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--text-primary)"
                                }}
                                className="hover-lift"
                            >
                                <Bell size={20} />
                                <span style={{ position: "absolute", top: "10px", right: "10px", width: "8px", height: "8px", background: "var(--accent-primary)", borderRadius: "50%", border: "2px solid #fff" }}></span>
                            </button>

                            {showNotifications && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 1rem)",
                                    right: 0,
                                    width: "380px",
                                    background: "#fff",
                                    borderRadius: "24px",
                                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                                    border: "1.5px solid var(--border-subtle)",
                                    zIndex: 1000,
                                    overflow: "hidden",
                                    animation: "fade-up 0.2s ease-out"
                                }}>
                                    <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1.5px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
                                        <h4 style={{ fontWeight: 900, fontSize: "1.1rem", margin: 0 }}>Intelligence Feed</h4>
                                        <button style={{ background: "none", border: "none", fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 800, cursor: "pointer", textTransform: "uppercase" }}>Mark All</button>
                                    </div>
                                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                        {[
                                            { id: 1, title: "RSVP Confirmed", msg: "Kunal Singhi confirmed for Wedding", time: "2m ago", icon: <CheckCircle2 size={18} />, color: "#10b981" },
                                            { id: 2, title: "Budget Variance", msg: "Logistics spending is 8% above target", time: "1h ago", icon: <AlertCircle size={18} />, color: "#f59e0b" },
                                            { id: 3, title: "Neural Matrix Sync", msg: "Event timeline optimized for latency", time: "3h ago", icon: <Cpu size={18} />, color: "#3b82f6" },
                                        ].map((n, i) => (
                                            <div key={n.id} style={{ padding: "1.25rem 1.75rem", borderBottom: i === 2 ? "none" : "1px solid var(--border-subtle)", cursor: "pointer" }} className="hover-dim">
                                                <div style={{ display: "flex", gap: "1.25rem" }}>
                                                    <div style={{
                                                        width: "44px",
                                                        height: "44px",
                                                        borderRadius: "12px",
                                                        background: `${n.color}12`,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: n.color,
                                                        flexShrink: 0
                                                    }}>{n.icon}</div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                                            <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>{n.title}</span>
                                                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700 }}>{n.time}</span>
                                                        </div>
                                                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5, fontWeight: 500, margin: 0 }}>{n.msg}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button style={{ width: "100%", padding: "1.25rem", textAlign: "center", border: "none", borderTop: "1.5px solid var(--border-subtle)", fontSize: "0.9rem", fontWeight: 800, color: "var(--accent-primary)", cursor: "pointer", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                        Full Engine Logs <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            cursor: "pointer",
                            padding: "0.5rem",
                            paddingRight: "1rem",
                            borderRadius: "16px",
                            transition: "all 0.2s",
                            background: "var(--accent-soft)",
                            border: "1.5px solid transparent"
                        }} className="hover-lift">
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: "12px",
                                background: "var(--accent-primary)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 900,
                                fontSize: "1.1rem",
                                overflow: "hidden",
                                border: "2px solid #fff",
                                boxShadow: "0 8px 16px -4px rgba(var(--accent-primary-rgb), 0.3)"
                            }}>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <User size={24} />
                                )}
                            </div>
                            <div style={{ textAlign: "left" }}>
                                <div style={{ fontSize: "0.95rem", fontWeight: 850, color: "var(--text-primary)", lineHeight: 1 }}>{user?.displayName?.split(' ')[0] || "Planner"}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--accent-primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>Core Engine</div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="dashboard-content" style={{ padding: "3rem" }}>
                    <Outlet context={{
                        user,
                        events,
                        selectedEventId,
                        setSelectedEventId,
                        refreshEvents: () => fetchEvents(user.uid)
                    }} />
                </div>
            </main>
        </div>
    );
}
