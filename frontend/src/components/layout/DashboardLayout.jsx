import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
    Bell,
    Check,
    X,
    Info,
    AlertTriangle,
    CheckCircle2,
    Trash2,
    CheckCheck,
    Ticket,
    Folder,
    CalendarDays,
    UserCircle2,
    FileText,
    Image as ImageIcon,
    Menu,
    Plus,
    LayoutGrid,
    Globe,
    MapPin,
    ChevronRight,
    Loader2,
    Wand2,
    Upload
} from "lucide-react";
import DashboardBackground from "./DashboardBackground";
import GlobalSearch from "./GlobalSearch";
import { validateDateRange, getMinEndDate } from "../../utils/validation";

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
    const { user, logout, deleteAccount, updateUserProfile } = useAuth();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(() => localStorage.getItem("planora_active_event_id") || "");

    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const handleDeleteAccountConfirm = async () => {
        setIsDeletingAccount(true);
        try {
            await deleteAccount();
            navigate("/login");
        } catch (err) {
            console.error("Delete account error:", err);
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteAccountModal(false);
        }
    };

    useEffect(() => {
        if (selectedEventId) {
            localStorage.setItem("planora_active_event_id", selectedEventId);
        }
    }, [selectedEventId]);
    const [localLoading, setLocalLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [allVendors, setAllVendors] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isResearching, setIsResearching] = useState(false);
    const [syncTimestamp, setSyncTimestamp] = useState(Date.now());
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem("planora_notifications");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Filter out legacy fake hardcoded notifications & trivial spam
                const real = parsed.filter(n => 
                    typeof n.id !== "number" || n.id > 1000
                ).filter(n => 
                    n.title !== "New ticket" && 
                    n.title !== "New folder" && 
                    n.title !== "Marfeel" && 
                    n.title !== "New file" && 
                    n.title !== "2FA Settings Updated" && 
                    n.title !== "Backup Codes Copied"
                );
                return real;
            } catch (e) {}
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem("planora_notifications", JSON.stringify(notifications));
    }, [notifications]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
    
    // Quick Event Creation Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [polishingDesc, setPolishingDesc] = useState(false);
    const [generatingBanner, setGeneratingBanner] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const [newEventData, setNewEventData] = useState({
        name: "",
        date: "",
        startDate: "",
        endDate: "",
        location: "",
        type: "Wedding",
        budget: "",
        city: "",
        country: "",
        description: "",
        banner: ""
    });

    const handlePolishDescription = async () => {
        setPolishingDesc(true);
        try {
            const response = await fetch(`${API_URL}/ai/polish-description`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newEventData.name,
                    type: newEventData.type,
                    location: newEventData.location,
                    city: newEventData.city,
                    country: newEventData.country,
                    date: newEventData.startDate || newEventData.date,
                    shortDescription: newEventData.description
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.polishedDescription) {
                    setNewEventData(prev => ({ ...prev, description: data.polishedDescription }));
                }
            } else {
                const errData = await response.json();
                alert(errData.message || "Failed to polish description.");
            }
        } catch (err) {
            console.error("Polish description error:", err);
            alert("AI server unreachable.");
        } finally {
            setPolishingDesc(false);
        }
    };

    const handleGenerateBanner = async () => {
        setGeneratingBanner(true);
        try {
            const response = await fetch(`${API_URL}/ai/generate-banner`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newEventData.name,
                    type: newEventData.type,
                    location: newEventData.location,
                    city: newEventData.city,
                    description: newEventData.description
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.bannerUrl) {
                    setNewEventData(prev => ({ ...prev, banner: data.bannerUrl }));
                }
            } else {
                const errData = await response.json();
                alert(errData.message || "Failed to generate event banner.");
            }
        } catch (err) {
            console.error("Banner generation error:", err);
            alert("AI Banner service unreachable.");
        } finally {
            setGeneratingBanner(false);
        }
    };

    const handleSelfUploadBanner = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("Banner image size must be under 5MB.");
            return;
        }

        setUploadingBanner(true);
        try {
            const formData = new FormData();
            formData.append("banner", file);
            const response = await fetch(`${API_URL}/upload/banner`, {
                method: "POST",
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                if (data.url) {
                    setNewEventData(prev => ({ ...prev, banner: data.url }));
                }
            } else {
                const errData = await response.json();
                alert(errData.message || "Failed to upload banner image.");
            }
        } catch (err) {
            console.error("Banner upload error:", err);
            alert("Banner upload service unreachable.");
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleQuickCreateEvent = async (e) => {
        e.preventDefault();
        if (!user) return navigate("/login");

        const startDateVal = newEventData.startDate || newEventData.date;
        if (startDateVal && newEventData.endDate) {
            const dateCheck = validateDateRange(startDateVal, newEventData.endDate);
            if (!dateCheck.valid) {
                alert(dateCheck.message);
                return;
            }
        }

        const payload = {
            name: newEventData.name || "New Event",
            date: startDateVal || "",
            startDate: startDateVal || "",
            endDate: newEventData.endDate || "",
            location: newEventData.location || "Main Venue",
            type: newEventData.type || "Other",
            budget: parseInt(newEventData.budget) || 0,
            userId: user.uid,
            status: "Planned",
            city: newEventData.city || "",
            country: newEventData.country || "",
            description: newEventData.description || "",
            banner: newEventData.banner || ""
        };

        setCreateLoading(true);
        try {
            const res = await fetch(`${API_URL}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const created = await res.json();
                const newId = created._id || created.id;
                setShowCreateModal(false);
                setNewEventData({ name: "", date: "", startDate: "", endDate: "", location: "", type: "Wedding", budget: "", city: "", country: "", description: "", banner: "" });
                await fetchEvents(user.uid);
                if (newId) handleEventChange(newId);
                addNotification("Event Created", `'${payload.name}' has been initialized.`);
            } else {
                const errData = await res.json();
                alert(errData.message || "Failed to initialize event.");
            }
        } catch (err) {
            console.error("Error creating event:", err);
        } finally {
            setCreateLoading(false);
        }
    };

    const addNotification = (title, message, type = "system") => {
        // Respect Smart Notifications preference
        const isEnabled = localStorage.getItem("planora_pref_smart_notif") !== "false";
        if (!isEnabled) return;

        setNotifications(prev => {
            // Prevent duplicate notification spam
            if (prev.some(n => n.title === title && n.message === message)) {
                return prev;
            }
            const newNotif = {
                id: Date.now(),
                title,
                message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false,
                type
            };
            return [newNotif, ...prev];
        });

        // Optional: Play subtle sound
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.2;
            audio.play().catch(() => {});
        } catch (e) {}
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
            const res = await fetch(`${API_URL}/vendors`, {
                headers: { "x-user-id": uid, "x-user-email": user?.email || "" }
            });
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
            const res = await fetch(`${API_URL}/events`, {
                headers: { "x-user-id": uid, "x-user-email": user?.email || "" }
            });
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

    const safeEvents = Array.isArray(events) ? events : [];
    const selectedEvent = safeEvents.find(e => (e.id || e._id) === selectedEventId);

    // --- Core Permission Intelligence ---
    // Calculate permissions for the current user in the active event context
    const [currentRole, setCurrentRole] = useState("Viewer");
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if (!selectedEventId || !user) return;

        const resolvePermissions = async () => {
            try {
                // Fetch the event specifically to get its latest metadata including owner
                const eventRes = await fetch(`${API_URL}/events/${selectedEventId}`, {
                    headers: { "x-user-id": user.uid, "x-user-email": user?.email || "" }
                });
                const event = eventRes.ok ? await eventRes.json() : safeEvents.find(e => String(e.id || e._id) === String(selectedEventId));

                // 1. Ownership Check (UID + Email fallback)
                const isSystemAdmin = user?.email && import.meta.env.VITE_ADMIN_EMAIL === user.email;
                const isUIDOwner = event?.user && String(event.user) === String(user.uid);

                // Secondary check: If the owner's identity is stored as an email in a special field (if it exists)
                // or if we can match any 'Event Lead' record with this email.
                setIsOwner(isUIDOwner || isSystemAdmin);

                if (isUIDOwner || isSystemAdmin) {
                    setCurrentRole("Event Lead");
                    console.log(`[Permission Intelligence] Admin/Owner Access Granted to ${user.email}`);
                    return;
                }

                // 2. Collaborator Check
                const res = await fetch(`${API_URL}/collaborators?user=${user.uid}&email=${user.email}&eventId=${selectedEventId}`);
                if (res.ok) {
                    const data = await res.json();

                    // Look for ANY record matching this user that has elevated permissions
                    const collabList = Array.isArray(data) ? data : (data.collaborators || []);
                    const myCollab = collabList.find(c =>
                        String(c.userId) === String(user.uid) ||
                        c.email.toLowerCase() === user.email.toLowerCase()
                    );

                    const role = myCollab?.role || "Viewer";
                    console.log(`[Permission Intelligence] Collaborator Role Resolved: ${role} for ${user.email}`);
                    setCurrentRole(role);
                }
            } catch (err) {
                console.error("Permission resolution error:", err);
                setCurrentRole("Viewer");
            }
        };

        resolvePermissions();
    }, [selectedEventId, user, safeEvents]);

    const hasFullAccess = isOwner || currentRole === "Event Lead";
    const hasEditorAccess = hasFullAccess || currentRole === "Editor";

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

                {/* Event Selector - Custom Dropdown */}
                <div style={{ padding: "0 1rem 1.5rem" }}>
                    <div 
                        onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                        style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "14px",
                            padding: "0.75rem 1rem",
                            cursor: "pointer",
                            position: "relative",
                            userSelect: "none"
                        }}
                    >
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Active Event</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                            <div style={{ fontSize: "16px", color: "#fff", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {selectedEvent ? selectedEvent.name : "Select Event"}
                            </div>
                            <ChevronDown size={14} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
                        </div>
                        
                        {isEventDropdownOpen && (
                            <>
                                {/* Invisible overlay to close dropdown */}
                                <div 
                                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                                    onClick={(e) => { e.stopPropagation(); setIsEventDropdownOpen(false); }} 
                                />
                                {/* Dropdown Menu */}
                                <div 
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        position: "absolute",
                                        top: "calc(100% + 8px)",
                                        left: 0,
                                        right: 0,
                                        background: "#18181b",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                                        zIndex: 100,
                                        overflow: "hidden",
                                        animation: "fade-up 0.2s ease-out"
                                    }}
                                >
                                    {safeEvents.length === 0 ? (
                                        <div style={{ padding: "12px", color: "rgba(255,255,255,0.4)", fontSize: "13px", textAlign: "center" }}>No events found</div>
                                    ) : (
                                        safeEvents.map(event => {
                                            const evId = event.id || event._id;
                                            const isSelected = String(evId) === String(selectedEventId);
                                            return (
                                                <div 
                                                    key={evId} 
                                                    onClick={() => {
                                                        handleEventChange(evId);
                                                        setIsEventDropdownOpen(false);
                                                    }}
                                                    style={{
                                                        padding: "12px 16px",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        cursor: "pointer",
                                                        transition: "all 0.2s",
                                                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                        background: isSelected ? "rgba(249, 115, 22, 0.14)" : "transparent",
                                                        borderLeft: isSelected ? "4px solid #f97316" : "4px solid transparent"
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (!isSelected) e.currentTarget.style.background = "transparent";
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", marginRight: "8px" }}>
                                                        {isSelected && <Check size={14} color="#f97316" strokeWidth={3} style={{ flexShrink: 0 }} />}
                                                        <span style={{ 
                                                            fontSize: "14px", 
                                                            fontWeight: isSelected ? 800 : 500, 
                                                            color: isSelected ? "#fff" : "rgba(255,255,255,0.8)", 
                                                            whiteSpace: "nowrap", 
                                                            overflow: "hidden", 
                                                            textOverflow: "ellipsis" 
                                                        }}>
                                                            {event.name}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        width: "28px",
                                                        height: "28px",
                                                        borderRadius: "50%",
                                                        background: isSelected ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "rgba(249, 115, 22, 0.15)",
                                                        color: isSelected ? "#000" : "#f97316",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "12px",
                                                        fontWeight: 900,
                                                        flexShrink: 0,
                                                        boxShadow: isSelected ? "0 0 10px rgba(249, 115, 22, 0.5)" : "none"
                                                    }}>
                                                        {event.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* + Add New Event Button */}
                                    <div 
                                        onClick={() => {
                                            setIsEventDropdownOpen(false);
                                            setShowCreateModal(true);
                                        }}
                                        style={{
                                            padding: "12px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            background: "rgba(249, 115, 22, 0.08)",
                                            borderTop: "1px solid rgba(255,255,255,0.1)",
                                            color: "#f97316",
                                            fontWeight: 800,
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(249, 115, 22, 0.2)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "rgba(249, 115, 22, 0.08)"}
                                    >
                                        <Plus size={16} strokeWidth={3} />
                                        <span>+ Add New Event</span>
                                    </div>
                                </div>
                            </>
                        )}
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
                                marginBottom: "1px",
                                padding: "0.5rem 0.85rem",
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
                                fontSize: "0.95rem",
                                fontWeight: location.pathname === item.path ? 800 : 600,
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
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(9, 9, 11, 0.8)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0, paddingRight: "0.5rem" }}>
                        <button
                            className="sidebar-toggle-btn"
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ flexShrink: 0 }}
                        >
                            <Menu size={20} />
                        </button>
                        <GlobalSearch user={user} onEventSelect={handleEventChange} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>

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
                                    background: showNotifications ? "rgba(255,255,255,0.05)" : "transparent"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                onMouseLeave={e => { if (!showNotifications) e.currentTarget.style.background = "transparent" }}
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
                                <div className="notification-dropdown-panel">
                                    <div style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center", 
                                        padding: "14px 16px", 
                                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                                        flexWrap: "wrap",
                                        gap: "8px"
                                    }}>
                                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f4f4f5", margin: 0 }}>Notifications</h3>
                                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                            <button
                                                onClick={markAllAsRead}
                                                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "#a1a1aa", border: "none", background: "none", cursor: "pointer", transition: "color 0.2s" }}
                                                onMouseEnter={e => e.currentTarget.style.color = "#f4f4f5"}
                                                onMouseLeave={e => e.currentTarget.style.color = "#a1a1aa"}
                                            >
                                                <CheckCheck size={16} />
                                                Mark all as read
                                            </button>
                                            <button
                                                onClick={clearAllNotifications}
                                                style={{ color: "#a1a1aa", border: "none", background: "none", cursor: "pointer", transition: "color 0.2s", padding: 0 }}
                                                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                                                onMouseLeave={e => e.currentTarget.style.color = "#a1a1aa"}
                                                title="Clear all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="custom-scrollbar" style={{ display: "flex", flexDirection: "column", maxHeight: "450px", overflowY: "auto" }}>
                                        {notifications.length > 0 ? notifications.map(notif => {
                                            let Icon = Sparkles;
                                            let bgColor = "rgba(249, 115, 22, 0.1)"; 
                                            let fgColor = "#f97316"; 
                                            let avatarColor = "#3b82f6";
                            
                                            if (notif.type === "system" || notif.type === "ticket") { Icon = Ticket; bgColor = "rgba(59, 130, 246, 0.15)"; fgColor = "#3b82f6"; avatarColor = "#f59e0b"; }
                                            else if (notif.type === "folder") { Icon = Folder; bgColor = "rgba(59, 130, 246, 0.15)"; fgColor = "#3b82f6"; avatarColor = "#10b981"; }
                                            else if (notif.type === "event") { Icon = CalendarDays; bgColor = "rgba(59, 130, 246, 0.15)"; fgColor = "#3b82f6"; avatarColor = "#8b5cf6"; }
                                            else if (notif.type === "lead") { Icon = UserCircle2; bgColor = "rgba(59, 130, 246, 0.15)"; fgColor = "#3b82f6"; avatarColor = "#f43f5e"; }
                                            else if (notif.type === "success") { Icon = CheckCircle2; bgColor = "rgba(16, 185, 129, 0.15)"; fgColor = "#10b981"; avatarColor = "#14b8a6"; }
                                            else if (notif.type === "warning") { Icon = FileText; bgColor = "rgba(239, 68, 68, 0.15)"; fgColor = "#ef4444"; avatarColor = "#eab308"; }
                                            else if (notif.type === "ai") { Icon = Sparkles; bgColor = "rgba(249, 115, 22, 0.15)"; fgColor = "#f97316"; avatarColor = "#8b5cf6"; }
                                            
                                            // The action text should be primary color if it starts with dash, or if success it's green.
                                            const actionColor = notif.type === "success" ? "#10b981" : "#3b82f6";
                                            // For Planora, maybe action text is better blue like the screenshot, or orange?
                                            // Let's use blue for links, orange for AI, green for success to match screenshot variety.
                                            
                                            return (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => {
                                                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                                    }}
                                                    style={{
                                                        padding: "16px 20px",
                                                        background: notif.read ? "transparent" : "rgba(255, 255, 255, 0.02)",
                                                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                                                        display: "flex",
                                                        gap: "16px",
                                                        cursor: "pointer",
                                                        transition: "background 0.2s"
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                                                    onMouseLeave={e => e.currentTarget.style.background = notif.read ? "transparent" : "rgba(255, 255, 255, 0.02)"}
                                                >
                                                    <div style={{ position: "relative", width: "42px", height: "42px", flexShrink: 0 }}>
                                                        <div style={{ 
                                                            width: "100%", 
                                                            height: "100%", 
                                                            borderRadius: "10px", 
                                                            background: bgColor, 
                                                            color: fgColor,
                                                            display: "flex", 
                                                            alignItems: "center", 
                                                            justifyContent: "center"
                                                        }}>
                                                            <Icon size={22} strokeWidth={1.5} />
                                                        </div>
                                                        <div style={{
                                                            position: "absolute",
                                                            bottom: "-4px",
                                                            right: "-4px",
                                                            width: "18px",
                                                            height: "18px",
                                                            borderRadius: "50%",
                                                            background: avatarColor,
                                                            border: "2px solid #18181b",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "#fff",
                                                        }}>
                                                            <User size={10} strokeWidth={2.5} />
                                                        </div>
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: "15px", fontWeight: 400, color: "#f4f4f5", marginBottom: "2px" }}>
                                                            {notif.title}
                                                        </div>
                                                        <div style={{ fontSize: "14px", color: actionColor, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {notif.message}
                                                        </div>
                                                        {notif.meta && (
                                                            <div style={{ fontSize: "13px", color: "#a1a1aa", display: "flex", gap: "6px", alignItems: "center" }}>
                                                                {notif.meta}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                                                        <div style={{ fontSize: "13px", color: "#a1a1aa" }}>
                                                            {notif.time}
                                                        </div>
                                                        {!notif.read && (
                                                            <div style={{ width: "8px", height: "8px", background: "#3b82f6", borderRadius: "50%" }}></div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div style={{ padding: "3rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a1a1aa" }}>
                                                    <Bell size={20} style={{ opacity: 0.3 }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#f4f4f5" }}>Silent Horizon</div>
                                                    <p style={{ fontSize: "13px", color: "#a1a1aa", margin: "4px 0 0 0" }}>No unread signals in the current sector.</p>
                                                </div>
                                            </div>
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
                                    border: `1px solid ${showUserMenu ? '#f97316' : 'transparent'}`,
                                    background: showUserMenu ? "var(--bg-elevated)" : "rgba(255, 255, 255, 0.02)",
                                    boxShadow: showUserMenu ? "0 10px 25px -5px rgba(249, 115, 22, 0.12)" : "none",
                                    outline: "none"
                                }}
                                onMouseEnter={(e) => {
                                    if (!showUserMenu) {
                                        e.currentTarget.style.background = "var(--bg-elevated)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                        e.currentTarget.style.borderColor = "var(--border-subtle)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!showUserMenu) {
                                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.borderColor = "transparent";
                                    }
                                }}
                            >
                                <div style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: "50%",
                                    background: "var(--bg-surface)",
                                    color: "#f97316",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    border: "2px solid var(--border-subtle)",
                                    boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
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
                                        color: "var(--text-primary)",
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
                                    color: "var(--text-primary)"
                                }} />
                            </div>

                            {showUserMenu && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    right: 0,
                                    width: "200px",
                                    background: "#181720",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: "14px",
                                    boxShadow: "0 15px 35px -5px rgba(0,0,0,0.5)",
                                    padding: "6px",
                                    zIndex: 1000,
                                    animation: "fade-up 0.2s ease-out",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px"
                                }}>
                                    <button
                                        onClick={() => { setShowUserMenu(false); navigate("/settings"); }}
                                        style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: "10px",
                                            padding: "0.6rem 0.85rem", borderRadius: "8px", color: "var(--text-primary)",
                                            fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: "transparent",
                                            border: "none", textAlign: "left", transition: "all 0.2s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <SettingsIcon size={14} />
                                        Account Settings
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: "10px",
                                            padding: "0.6rem 0.85rem", borderRadius: "8px", color: "#f59e0b",
                                            fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: "transparent",
                                            border: "none", textAlign: "left", transition: "all 0.2s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(245, 158, 11, 0.08)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>

                                    <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />

                                    <button
                                        onClick={() => { setShowUserMenu(false); setShowDeleteAccountModal(true); }}
                                        style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: "10px",
                                            padding: "0.6rem 0.85rem", borderRadius: "8px", color: "#ef4444",
                                            fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", background: "rgba(239, 68, 68, 0.08)",
                                            border: "1px solid rgba(239, 68, 68, 0.2)", textAlign: "left", transition: "all 0.2s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
                                    >
                                        <Trash2 size={14} />
                                        Delete Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Delete Account Modal */}
                {showDeleteAccountModal && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(12px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        zIndex: 10000, padding: "1rem"
                    }}>
                        <div style={{ width: "100%", maxWidth: "440px", background: "#121118", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "20px", padding: "1.75rem", boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.25)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.25rem" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Trash2 size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "17px", fontWeight: 900, margin: 0, color: "#fff" }}>Delete Account Permanently</h3>
                                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>Irreversible Security Action</p>
                                </div>
                            </div>

                            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                                Are you sure you want to delete your account? All your events, budgets, guest lists, and credentials will be permanently erased.
                            </p>

                            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                                <button 
                                    onClick={() => setShowDeleteAccountModal(false)}
                                    style={{ padding: "0.75rem 1.25rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteAccountConfirm}
                                    disabled={isDeletingAccount}
                                    style={{ padding: "0.75rem 1.25rem", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 800, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    {isDeletingAccount ? <Loader2 size={16} className="animate-spin" /> : "Permanently Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="dashboard-content">
                    <Outlet context={{
                        user,
                        events,
                        selectedEventId,
                        setSelectedEventId,
                        syncTimestamp,
                        addNotification,
                        updateUserProfile,
                        hasFullAccess,
                        hasEditorAccess,
                        refreshEvents: () => fetchEvents(user.uid)
                    }} />
                </div>
            </main>

            {/* Global Quick Create Event Modal via Portal */}
            {showCreateModal && createPortal(
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.85)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    zIndex: 999999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem"
                }}>
                    <div style={{
                        background: "#121118",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "20px",
                        width: "95%",
                        maxWidth: "680px",
                        padding: "1.5rem 1.75rem",
                        boxShadow: "0 25px 60px -15px rgba(0,0,0,0.95)",
                        position: "relative",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        animation: "fade-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}>
                        {/* Header */}
                        <div style={{ flexShrink: 0, marginBottom: "1rem", paddingRight: "2rem", display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Sparkles size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: "1.3rem", fontWeight: 900, letterSpacing: "-0.02em", margin: 0, color: "#fff" }}>
                                    Initialize Event
                                </h2>
                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 500, margin: 0 }}>
                                    Define operational parameters for the new event stream.
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowCreateModal(false)}
                            style={{ 
                                position: "absolute",
                                top: "1.25rem",
                                right: "1.25rem",
                                background: "rgba(255,255,255,0.05)", 
                                border: "1px solid rgba(255,255,255,0.1)", 
                                color: "rgba(255,255,255,0.7)", 
                                width: "30px", 
                                height: "30px", 
                                borderRadius: "50%", 
                                cursor: "pointer", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                zIndex: 10
                            }}
                        >
                            <X size={15} strokeWidth={2.5} />
                        </button>

                        {/* Compact Grid Form Body */}
                        <form onSubmit={handleQuickCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {/* EVENT TITLE */}
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>EVENT TITLE</label>
                                <div style={{ position: "relative" }}>
                                    <LayoutGrid size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Annual Tech Summit 2026" 
                                        value={newEventData.name} 
                                        onChange={e => setNewEventData({ ...newEventData, name: e.target.value })} 
                                        required 
                                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                    />
                                </div>
                            </div>

                            {/* START DATE & END DATE */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>START DATE *</label>
                                    <div style={{ position: "relative" }}>
                                        <Calendar size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                        <input 
                                            type="date" 
                                            value={newEventData.startDate || newEventData.date} 
                                            onChange={e => {
                                                const s = e.target.value;
                                                setNewEventData(prev => ({
                                                    ...prev,
                                                    date: s,
                                                    startDate: s,
                                                    endDate: prev.endDate && prev.endDate < s ? s : prev.endDate
                                                }));
                                            }} 
                                            required 
                                            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>END DATE (OPTIONAL)</label>
                                    <div style={{ position: "relative" }}>
                                        <Calendar size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                        <input 
                                            type="date" 
                                            min={getMinEndDate(newEventData.startDate || newEventData.date)}
                                            value={newEventData.endDate} 
                                            onChange={e => setNewEventData({ ...newEventData, endDate: e.target.value })} 
                                            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CATEGORY & BUDGET (Side by Side) */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>CATEGORY</label>
                                    <select 
                                        value={newEventData.type} 
                                        onChange={e => setNewEventData({ ...newEventData, type: e.target.value })}
                                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                    >
                                        <option value="Wedding">Wedding</option>
                                        <option value="Hackathon">Hackathon</option>
                                        <option value="Tech Fest">Tech Fest</option>
                                        <option value="Conference">Conference</option>
                                        <option value="Corporate">Corporate</option>
                                        <option value="Birthday">Birthday</option>
                                        <option value="College Fest">College Fest</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>BUDGET (₹)</label>
                                    <div style={{ position: "relative" }}>
                                        <Wallet size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                        <input 
                                            type="number" 
                                            placeholder="500000" 
                                            value={newEventData.budget} 
                                            onChange={e => setNewEventData({ ...newEventData, budget: e.target.value })} 
                                            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* COUNTRY & CITY */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>COUNTRY</label>
                                    <div style={{ position: "relative" }}>
                                        <Globe size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                        <input 
                                            type="text" 
                                            placeholder="India, USA..." 
                                            value={newEventData.country} 
                                            onChange={e => setNewEventData({ ...newEventData, country: e.target.value })} 
                                            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>CITY</label>
                                    <div style={{ position: "relative" }}>
                                        <MapPin size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                        <input 
                                            type="text" 
                                            placeholder="Mumbai, New York..." 
                                            value={newEventData.city} 
                                            onChange={e => setNewEventData({ ...newEventData, city: e.target.value })} 
                                            style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* VENUE LOCATION */}
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>VENUE LOCATION</label>
                                <div style={{ position: "relative" }}>
                                    <MapPin size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
                                    <input 
                                        type="text" 
                                        placeholder="Hotel, Convention Center, or Address..." 
                                        value={newEventData.location} 
                                        onChange={e => setNewEventData({ ...newEventData, location: e.target.value })} 
                                        style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                    />
                                </div>
                            </div>

                            {/* DESCRIPTION WITH AI POLISH */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>EVENT DESCRIPTION</label>
                                    <button
                                        type="button"
                                        onClick={handlePolishDescription}
                                        disabled={polishingDesc}
                                        style={{
                                            background: "rgba(249, 115, 22, 0.2)",
                                            border: "1px solid rgba(249, 115, 22, 0.4)",
                                            color: "#f97316",
                                            padding: "3px 8px",
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px"
                                        }}
                                    >
                                        {polishingDesc ? (
                                            <>
                                                <Loader2 size={11} className="animate-spin" />
                                                Polishing...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={11} />
                                                Polish with AI
                                            </>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    rows={2}
                                    placeholder="Write a brief overview or click 'Polish with AI' to generate a full detailed description..."
                                    value={newEventData.description}
                                    onChange={e => setNewEventData({ ...newEventData, description: e.target.value })}
                                    style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "12px", fontWeight: 500, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                                />
                            </div>

                            {/* BANNER GENERATOR & SELF UPLOAD */}
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>EVENT BANNER</label>
                                {newEventData.banner && (
                                    <div style={{ position: "relative", marginBottom: "0.5rem", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(249, 115, 22, 0.3)" }}>
                                        <img 
                                            src={newEventData.banner.startsWith("/") ? `${API_URL}${newEventData.banner}` : newEventData.banner} 
                                            alt="Banner Preview" 
                                            style={{ width: "100%", height: "90px", objectFit: "cover", display: "block" }} 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewEventData({ ...newEventData, banner: "" })}
                                            style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", width: "20px", height: "20px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                            <X size={11} />
                                        </button>
                                    </div>
                                )}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    <button
                                        type="button"
                                        onClick={handleGenerateBanner}
                                        disabled={generatingBanner}
                                        style={{ background: "rgba(249, 115, 22, 0.15)", border: "1px dashed rgba(249, 115, 22, 0.4)", color: "#f97316", padding: "0.6rem 0.4rem", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
                                    >
                                        {generatingBanner ? (
                                            <>
                                                <Loader2 size={12} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={12} />
                                                Generate Banner (Gemini)
                                            </>
                                        )}
                                    </button>
                                    <label style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", padding: "0.6rem 0.4rem", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                                        {uploadingBanner ? (
                                            <>
                                                <Loader2 size={12} className="animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={12} />
                                                Self Upload Banner
                                            </>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleSelfUploadBanner} style={{ display: "none" }} disabled={uploadingBanner} />
                                    </label>
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button 
                                type="submit" 
                                disabled={createLoading}
                                style={{ 
                                    width: "100%", 
                                    padding: "0.85rem", 
                                    marginTop: "0.5rem", 
                                    borderRadius: "12px", 
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                                    color: "#ffffff", 
                                    fontWeight: 800, 
                                    fontSize: "0.9rem", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    gap: "0.5rem", 
                                    boxShadow: "0 8px 20px rgba(249, 115, 22, 0.4)", 
                                    transition: "all 0.2s" 
                                }}
                            >
                                {createLoading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        <span>Initialize Event Stream</span>
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
