import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
    User,
    ChevronDown,
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
    const { user, logout } = useAuth();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [localLoading, setLocalLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (user) {
            fetchEvents(user.uid);
        } else {
            setLocalLoading(false);
            navigate("/login");
        }
    }, [user, navigate]);


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
            setLocalLoading(false);
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

    if (localLoading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg-base)", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.1em", fontSize: "0.8rem", textTransform: "uppercase" }}>Initializing Core...</p>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    const selectedEvent = events.find(e => (e.id || e._id) === selectedEventId);

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div style={{ padding: "0.75rem 1rem" }}>
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

                {/* Project Selector - Functional Specification */}
                <div style={{ padding: "0 1rem 1.5rem" }}>
                    <div style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        padding: "0.5rem 0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        position: "relative"
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Project</div>
                            <select
                                value={selectedEventId}
                                onChange={(e) => handleEventChange(e.target.value)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "12px",
                                    color: "#fff",
                                    fontWeight: 700,
                                    width: "100%",
                                    cursor: "pointer",
                                    outline: "none",
                                    appearance: "none",
                                    paddingRight: "1.5rem",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {events.length === 0 ? (
                                    <option value="">No events</option>
                                ) : (
                                    events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id} style={{ background: "#1a1a2e", color: "#fff" }}>
                                            {event.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            <ChevronDown
                                size={12}
                                color="rgba(255,255,255,0.4)"
                                style={{ position: "absolute", right: "12px", bottom: "10px", pointerEvents: "none" }}
                            />
                        </div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: "0 0.75rem", overflowY: "auto" }}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`sidebar-item${location.pathname === item.path ? " active" : ""}`}
                            style={{
                                marginBottom: "2px",
                                padding: "0.6rem 0.85rem",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                textDecoration: "none",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <span style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: location.pathname === item.path ? 1 : 0.5,
                                color: "inherit",
                                transform: "scale(0.85)"
                            }}>
                                {item.icon}
                            </span>
                            <span style={{
                                fontSize: "0.85rem",
                                fontWeight: location.pathname === item.path ? 700 : 500,
                                color: "inherit",
                                letterSpacing: "-0.2px"
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>


            </aside>

            <main className="dashboard-main" style={{ position: "relative", background: "#fcfdff" }}>
                <header className="top-bar" style={{
                    height: "58px",
                    padding: "0 2rem",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1 }}>

                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>


                        <div style={{ position: "relative" }}>
                            <div
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    cursor: "pointer",
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "12px",
                                    transition: "all 0.2s",
                                    border: `1px solid ${showUserMenu ? 'var(--accent-primary)' : '#e8e8f5'}`,
                                    background: "#fff",
                                    boxShadow: showUserMenu ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
                                }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background: "#f1f5f9",
                                    color: "#64748b",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    border: "1px solid #e2e8f0"
                                }}>
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{user?.displayName?.split(' ')[0] || "Planner"}</div>
                                    <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.025em" }}>User Account</div>
                                </div>
                                <ChevronDown size={14} style={{ marginLeft: "4px", opacity: 0.5, transform: showUserMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                            </div>

                            {showUserMenu && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    right: 0,
                                    width: "180px",
                                    background: "#fff",
                                    border: "1px solid #e8e8f5",
                                    borderRadius: "12px",
                                    boxShadow: "0 15px 30px -5px rgba(0,0,0,0.1)",
                                    padding: "6px",
                                    zIndex: 1000,
                                    animation: "fade-up 0.2s ease-out"
                                }}>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "0.6rem 0.85rem",
                                            borderRadius: "8px",
                                            color: "#ef4444",
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            background: "rgba(239, 68, 68, 0.05)",
                                            border: "none",
                                            textAlign: "left",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)"}
                                    >
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="dashboard-content" style={{ padding: "40px" }}>
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
