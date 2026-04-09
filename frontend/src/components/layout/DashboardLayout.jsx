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
    Sparkles,
    Search,
    RefreshCw,
    Scan,
    Bell,
    Check,
    X
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
    const { user, logout, updateUserProfile } = useAuth();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(() => localStorage.getItem("planora_active_event_id") || "");

    useEffect(() => {
        if (selectedEventId) {
            localStorage.setItem("planora_active_event_id", selectedEventId);
        }
    }, [selectedEventId]);
    const [localLoading, setLocalLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [allVendors, setAllVendors] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isResearching, setIsResearching] = useState(false);
    const [syncTimestamp, setSyncTimestamp] = useState(Date.now());
    const [notifications, setNotifications] = useState([
        { id: 1, title: "AI Strategy Complete", message: "Optimum vendor matrix calculated for your event.", time: "Just now", read: false },
        { id: 2, title: "Budget Warning", message: "Catering costs exceed projection by 12%.", time: "2h ago", read: true }
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const playNotificationSound = () => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(e => console.log("Sound play blocked by browser policy"));
    };

    const addNotification = (title, message) => {
        // Respect Smart Notifications preference
        const isEnabled = localStorage.getItem("planora_pref_smart_notif") !== "false";
        if (!isEnabled) return;

        const newNotif = {
            id: Date.now(),
            title,
            message,
            time: "Just now",
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        playNotificationSound();
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (user) {
            fetchEvents(user.uid);
            fetchAllVendors(user.uid);
            
            // Exposure for manual verification
            window.pushNotification = (title, message) => addNotification(title, message);

            return () => {
                delete window.pushNotification;
            };
        } else {
            setLocalLoading(false);
            navigate("/login");
        }
    }, [user, navigate]);


    const fetchAllVendors = async (uid) => {
        try {
            const res = await fetch(`${API_URL}/vendors?user=${uid}&email=${user.email}`);
            if (res.ok) {
                const data = await res.json();
                setAllVendors(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Error fetching all vendors for search:", err);
        }
    };


    const fetchEvents = async (uid) => {
        try {
            const res = await fetch(`${API_URL}/events?user=${uid}&email=${user.email}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const data = await res.json();
            
            if (Array.isArray(data)) {
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
            } else {
                setEvents([]);
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

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        // Refresh both events and vendors
        await Promise.all([
            fetchEvents(user.uid),
            fetchAllVendors(user.uid)
        ]);
        setSyncTimestamp(Date.now());
        // Simulate a bit of processing for UX
        setTimeout(() => setIsSyncing(false), 800);
    };

    const handleResearch = () => {
        setIsResearching(true);
        // Focus the search bar
        const searchInput = document.getElementById("global-search-input");
        if (searchInput) {
            searchInput.focus();
        }
        // Simulate "Researching" state
        setTimeout(() => setIsResearching(false), 1500);
    };

    const safeEvents = Array.isArray(events) ? events : [];
    const selectedEvent = safeEvents.find(e => (e.id || e._id) === selectedEventId);

    const getSearchResults = () => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        const results = [];

        // 1. Search Nav Items
        NAV_ITEMS.forEach(item => {
            if (item.label.toLowerCase().includes(query)) {
                results.push({
                    type: "page",
                    label: item.label,
                    path: item.path,
                    icon: item.icon
                });
            }
        });

        // 2. Search Events
        safeEvents.forEach(event => {
            if (event.name.toLowerCase().includes(query)) {
                results.push({
                    type: "event",
                    label: event.name,
                    path: `/events/${event.id || event._id}`,
                    icon: <Calendar size={16} />,
                    id: event.id || event._id
                });
            }
        });

        // 3. Search Vendors
        allVendors.forEach(vendor => {
            if (vendor.name.toLowerCase().includes(query) || vendor.service.toLowerCase().includes(query)) {
                results.push({
                    type: "vendor",
                    label: vendor.name,
                    subLabel: vendor.service,
                    path: "/vendors",
                    icon: <Handshake size={16} />
                });
            }
        });

        return results.slice(0, 8); // Limit results
    };

    const searchResults = getSearchResults();

    const handleSearchResultClick = (result) => {
        if (result.type === "event") {
            setSelectedEventId(result.id);
        }
        navigate(result.path);
        setSearchQuery("");
        setShowSearchResults(false);
    };

    return (
        <div className="dashboard-layout">
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
                onClick={() => setIsSidebarOpen(false)}
            />
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
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
                                {safeEvents.length === 0 ? (
                                    <option value="">No events</option>
                                ) : (
                                    safeEvents.map(event => (
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

                <nav className="sidebar-nav" style={{ flex: 1, padding: "0 0.75rem", overflowY: "auto", overflowX: "hidden" }}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
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
                                opacity: location.pathname === item.path ? 1 : 0.6,
                                color: "inherit",
                                transform: location.pathname === item.path ? "scale(1)" : "scale(0.9)",
                                overflow: "hidden",
                                overflowX: "hidden",
                                transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important"
                            }}>
                                {item.icon}
                            </span>
                            <span style={{
                                fontSize: "0.9rem",
                                fontWeight: location.pathname === item.path ? 700 : 500,
                                color: "inherit",
                                letterSpacing: "-0.01em"
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="dashboard-main" style={{ position: "relative", background: "transparent", flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
                <DashboardBackground />
                <header className="top-bar" style={{
                    height: "72px",
                    padding: "0 2.5rem",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(232, 232, 245, 0.5)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                        <button 
                            className="sidebar-toggle-btn"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <LayoutDashboard size={20} />
                        </button>
                        <div className="search-input-wrapper">
                            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                            <input 
                                id="global-search-input"
                                type="text" 
                                placeholder="Search events, vendors, tasks..." 
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setShowSearchResults(true);
                                }}
                                className="search-input"
                                onFocus={e => {
                                    e.target.style.background = "#fff";
                                    e.target.style.borderColor = "var(--accent-primary)";
                                    e.target.style.boxShadow = "0 4px 20px rgba(37, 99, 235, 0.08)";
                                    if (searchQuery.trim()) setShowSearchResults(true);
                                }}
                                onBlur={e => {
                                    // Delay to allow clicking results
                                    setTimeout(() => {
                                        e.target.style.background = "#f8fafc";
                                        e.target.style.borderColor = "#e2e8f0";
                                        e.target.style.boxShadow = "none";
                                        setShowSearchResults(false);
                                    }, 200);
                                }}
                            />

                            {showSearchResults && searchResults.length > 0 && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    left: 0,
                                    right: 0,
                                    background: "#fff",
                                    border: "1px solid #e8e8f5",
                                    borderRadius: "12px",
                                    boxShadow: "0 15px 30px -5px rgba(0,0,0,0.1)",
                                    padding: "8px",
                                    zIndex: 1000,
                                    maxHeight: "350px",
                                    overflowY: "auto"
                                }}>
                                    <div style={{ padding: "8px 12px", fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Search Results
                                    </div>
                                    {searchResults.map((result, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSearchResultClick(result)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                padding: "10px 12px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                transition: "all 0.15s"
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = "#f8fafc";
                                                e.currentTarget.style.transform = "translateX(4px)";
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.transform = "none";
                                            }}
                                        >
                                            <div style={{ color: "#2563eb", opacity: 0.8 }}>
                                                {result.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{result.label}</div>
                                                {result.subLabel && <div style={{ fontSize: "11px", color: "#64748b" }}>{result.subLabel}</div>}
                                            </div>
                                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                                                {result.type}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    left: 0,
                                    right: 0,
                                    background: "#fff",
                                    border: "1px solid #e8e8f5",
                                    borderRadius: "12px",
                                    boxShadow: "0 15px 30px -5px rgba(0,0,0,0.1)",
                                    padding: "24px",
                                    textAlign: "center",
                                    zIndex: 1000
                                }}>
                                    <div style={{ color: "#94a3b8", marginBottom: "8px" }}><Search size={24} style={{ opacity: 0.3 }} /></div>
                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b" }}>No results found for "{searchQuery}"</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        
                        {/* Notification Bell */}
                        <div style={{ position: "relative" }}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    border: "none",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    padding: "8px",
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s",
                                    background: showNotifications ? "#f1f5f9" : "transparent"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                                onMouseLeave={e => { if(!showNotifications) e.currentTarget.style.background = "transparent"}}
                            >
                                <Bell size={20} />
                                {notifications.some(n => !n.read) && (
                                    <span style={{
                                        position: "absolute",
                                        top: "4px",
                                        right: "4px",
                                        width: "10px",
                                        height: "10px",
                                        background: "#ef4444",
                                        borderRadius: "50%",
                                        border: "2px solid #fff",
                                        animation: "pulse 2s infinite"
                                    }}></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 12px)",
                                    right: "-10px",
                                    width: "320px",
                                    background: "#fff",
                                    border: "1px solid #e8e8f5",
                                    borderRadius: "16px",
                                    boxShadow: "0 15px 35px -5px rgba(0,0,0,0.1)",
                                    padding: "1rem",
                                    zIndex: 1000,
                                    animation: "fade-up 0.2s ease-out"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                                        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b", margin: 0 }}>Project Alerts</h3>
                                        <button 
                                            onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                                            style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", border: "none", background: "none", cursor: "pointer" }}
                                        >Mark all read</button>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                                        {notifications.length > 0 ? notifications.map(notif => (
                                            <div key={notif.id} style={{ 
                                                padding: "0.75rem", 
                                                borderRadius: "12px", 
                                                background: notif.read ? "transparent" : "#f0f7ff",
                                                border: "1px solid",
                                                borderColor: notif.read ? "#f1f5f9" : "#dbeafe",
                                                position: "relative"
                                            }}>
                                                <div style={{ fontSize: "12px", fontWeight: 800, color: "#1e293b", marginBottom: "2px" }}>{notif.title}</div>
                                                <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>{notif.message}</div>
                                                <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 700, marginTop: "6px", textTransform: "uppercase" }}>{notif.time}</div>
                                                
                                                <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                                                    {!notif.read && <div style={{ width: "6px", height: "6px", background: "#2563eb", borderRadius: "50%" }}></div>}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                                                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px", opacity: 0.6, display: "flex", alignItems: "center", justifyContent: "center" }}
                                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                                                    >
                                                        <X size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8", fontSize: "12px" }}>No new notifications</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ position: "relative" }}>
                            <div
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                onKeyDown={(e) => e.key === "Enter" && setShowUserMenu(!showUserMenu)}
                                role="button"
                                tabIndex="0"
                                aria-expanded={showUserMenu}
                                aria-haspopup="true"
                                aria-label="User Menu"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.85rem",
                                    cursor: "pointer",
                                    padding: "0.35rem 1rem 0.35rem 0.35rem",
                                    borderRadius: "100px",
                                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                    border: `1px solid ${showUserMenu ? '#2563eb' : 'transparent'}`,
                                    background: showUserMenu ? "#fff" : "rgba(248, 250, 252, 0.6)",
                                    boxShadow: showUserMenu ? "0 10px 25px -5px rgba(37, 99, 235, 0.12)" : "none",
                                    outline: "none"
                                }}
                                onMouseEnter={(e) => {
                                    if (!showUserMenu) {
                                        e.currentTarget.style.background = "#fff";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
                                        e.currentTarget.style.borderColor = "#e2e8f0";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!showUserMenu) {
                                        e.currentTarget.style.background = "rgba(248, 250, 252, 0.6)";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.borderColor = "transparent";
                                    }
                                }}
                            >
                                <div style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    color: "#2563eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    border: "2px solid #fff",
                                    boxShadow: "0 0 0 1px #e2e8f0, 0 2px 4px rgba(0,0,0,0.05)",
                                    transition: "transform 0.3s ease"
                                }}>
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <User size={18} strokeWidth={2.5} />
                                    )}
                                </div>
                                <div className="user-info-text" style={{ textAlign: "left" }}>
                                    <div style={{ 
                                        fontSize: "0.9rem", 
                                        fontWeight: 800, 
                                        color: "#0f172a", 
                                        lineHeight: 1,
                                        letterSpacing: "-0.01em"
                                    }}>
                                        {user?.displayName || user?.email?.split('@')[0] || "Planner"}
                                    </div>
                                </div>
                                <ChevronDown size={14} className="user-info-chevron" style={{ 
                                    opacity: 0.4, 
                                    transform: showUserMenu ? "rotate(180deg)" : "none", 
                                    transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                                    color: "#0f172a"
                                }} />
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
                <div className="dashboard-content">
                    <Outlet context={{
                        user,
                        events,
                        selectedEventId,
                        setSelectedEventId,
                        syncTimestamp,
                        addNotification,
                        updateUserProfile,
                        refreshEvents: () => fetchEvents(user.uid)
                    }} />
                </div>
            </main>
        </div>
    );
}
