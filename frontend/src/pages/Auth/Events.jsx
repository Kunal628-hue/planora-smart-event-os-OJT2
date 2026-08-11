import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { 
    Plus, 
    Calendar, 
    MapPin, 
    Globe, 
    ChevronRight, 
    Loader2, 
    X, 
    Sparkles, 
    LayoutGrid, 
    Wallet, 
    RefreshCw, 
    Activity,
    Search,
    TrendingUp,
    PieChart,
    Table as TableIcon,
    Grid as GridIcon,
    FolderKanban,
    DollarSign,
    SlidersHorizontal,
    ArrowUpRight,
    Wand2,
    Upload,
    Image as ImageIcon
} from "lucide-react";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { validateDateRange, getMinEndDate } from "../../utils/validation";

const API_URL = import.meta.env.VITE_API_URL;

export default function Events() {
    const { user, addNotification } = useOutletContext();
    const { showAlert } = useDialog();
    const navigate = useNavigate();
    
    const [events, setEvents] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
    
    const [polishingDesc, setPolishingDesc] = useState(false);
    const [generatingBanner, setGeneratingBanner] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const [newEvent, setNewEvent] = useState({
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

    const fetchEvents = async () => {
        if (!user) return;
        try {
            setFetchLoading(true);
            const response = await fetch(`${API_URL}/events`, {
                headers: { "x-user-id": user.uid, "x-user-email": user.email || "" }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents([]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);

    const handlePolishDescription = async () => {
        setPolishingDesc(true);
        try {
            const response = await fetch(`${API_URL}/ai/polish-description`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newEvent.name,
                    type: newEvent.type,
                    location: newEvent.location,
                    city: newEvent.city,
                    country: newEvent.country,
                    date: newEvent.startDate || newEvent.date,
                    shortDescription: newEvent.description
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.polishedDescription) {
                    setNewEvent(prev => ({ ...prev, description: data.polishedDescription }));
                }
            } else {
                const errData = await response.json();
                await showAlert("AI Error", errData.message || "Failed to polish description.");
            }
        } catch (err) {
            console.error("Polish description error:", err);
            await showAlert("Connection Error", "AI server unreachable.");
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
                    title: newEvent.name,
                    type: newEvent.type,
                    location: newEvent.location,
                    city: newEvent.city,
                    description: newEvent.description
                })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.bannerUrl) {
                    setNewEvent(prev => ({ ...prev, banner: data.bannerUrl }));
                }
            } else {
                const errData = await response.json();
                await showAlert("Banner AI Error", errData.message || "Failed to generate event banner.");
            }
        } catch (err) {
            console.error("Banner generation error:", err);
            await showAlert("Connection Error", "AI Banner service unreachable.");
        } finally {
            setGeneratingBanner(false);
        }
    };

    const handleSelfUploadBanner = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            await showAlert("File Too Large", "Banner image size must be under 5MB.");
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
                    setNewEvent(prev => ({ ...prev, banner: data.url }));
                }
            } else {
                const errData = await response.json();
                await showAlert("Upload Error", errData.message || "Failed to upload banner image.");
            }
        } catch (err) {
            console.error("Banner upload error:", err);
            await showAlert("Connection Error", "Banner upload service unreachable.");
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!user) return navigate("/login");

        // Validate Date Range
        const startDateVal = newEvent.startDate || newEvent.date;
        if (startDateVal && newEvent.endDate) {
            const dateCheck = validateDateRange(startDateVal, newEvent.endDate);
            if (!dateCheck.valid) {
                await showAlert("Invalid Date Range", dateCheck.message);
                return;
            }
        }

        const eventData = {
            name: newEvent.name || "Unnamed Event",
            date: newEvent.startDate || newEvent.date || "",
            startDate: newEvent.startDate || newEvent.date || "",
            endDate: newEvent.endDate || "",
            location: newEvent.location || "",
            type: newEvent.type || "Other",
            budget: parseInt(newEvent.budget) || 0,
            userId: user.uid,
            status: "Planned",
            city: newEvent.city || "",
            country: newEvent.country || "",
            description: newEvent.description || "",
            banner: newEvent.banner || ""
        };

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                setShowModal(false);
                setNewEvent({ name: "", date: "", location: "", type: "Wedding", budget: "", city: "", country: "", description: "", banner: "" });
                fetchEvents();
                addNotification("Event Created", `'${eventData.name}' has been successfully onboarded.`);
            } else {
                const errorData = await response.json();
                await showAlert("Initialization Error", errorData.message || "Failed to create event. Please verify parameters.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            await showAlert("Connection Error", "External synchronization failed. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    const totalBudget = useMemo(() => events.reduce((sum, e) => sum + (e.budget || 0), 0), [events]);
    const totalSpent = useMemo(() => events.reduce((sum, e) => sum + (e.spent || 0), 0), [events]);
    const avgUtilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : "0.0";

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            if (activeTab === "drafts" && !(event.status === "Draft" || event.status === "Planned")) return false;
            if (activeTab === "archived" && !(event.status === "Archived" || event.status === "Completed")) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = event.name?.toLowerCase().includes(q);
                const matchLocation = (event.location || "").toLowerCase().includes(q) || (event.city || "").toLowerCase().includes(q);
                const matchType = (event.type || "").toLowerCase().includes(q);
                if (!matchName && !matchLocation && !matchType) return false;
            }

            if (categoryFilter !== "All" && event.type !== categoryFilter) return false;

            return true;
        });
    }, [events, activeTab, searchQuery, categoryFilter]);

    const inputStyle = {
        width: "100%",
        padding: "0.7rem 0.85rem 0.7rem 2.5rem",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-medium)",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "var(--text-primary)",
        outline: "none",
        transition: "border-color 0.2s"
    };

    const labelStyle = {
        display: "block",
        fontSize: "10px",
        fontWeight: "700",
        color: "var(--text-secondary)",
        marginBottom: "0.4rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em"
    };

    const categoryColors = {
        "Wedding": "#f97316",
        "Conference": "#3b82f6",
        "Corporate": "#8b5cf6",
        "Birthday": "#ec4899",
        "Tech Summits": "#10b981",
        "Tech Fest": "#06b6d4",
        "Hackathon": "#eab308"
    };

    return (
        <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
            {/* Header Bar */}
            <div className="events-header">
                <div className="events-header-left">
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                            Events
                        </h1>
                    </div>
                    {/* Tab Selection Pills */}
                    <div style={{
                        display: "inline-flex",
                        gap: "4px",
                        background: "rgba(255, 255, 255, 0.03)",
                        padding: "4px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.08)"
                    }}>
                        <button
                            onClick={() => setActiveTab("all")}
                            style={{
                                background: activeTab === "all" ? "var(--accent-primary)" : "transparent",
                                border: "none",
                                color: activeTab === "all" ? "#ffffff" : "var(--text-secondary)",
                                padding: "7px 16px",
                                borderRadius: "9px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: activeTab === "all" ? "0 4px 12px rgba(249, 115, 22, 0.3)" : "none"
                            }}
                        >
                            All Events ({events.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("drafts")}
                            style={{
                                background: activeTab === "drafts" ? "var(--accent-primary)" : "transparent",
                                border: "none",
                                color: activeTab === "drafts" ? "#ffffff" : "var(--text-secondary)",
                                padding: "7px 16px",
                                borderRadius: "9px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: activeTab === "drafts" ? "0 4px 12px rgba(249, 115, 22, 0.3)" : "none"
                            }}
                        >
                            Active & Drafts
                        </button>
                        <button
                            onClick={() => setActiveTab("archived")}
                            style={{
                                background: activeTab === "archived" ? "var(--accent-primary)" : "transparent",
                                border: "none",
                                color: activeTab === "archived" ? "#ffffff" : "var(--text-secondary)",
                                padding: "7px 16px",
                                borderRadius: "9px",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: activeTab === "archived" ? "0 4px 12px rgba(249, 115, 22, 0.3)" : "none"
                            }}
                        >
                            Archived & Completed
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        color: "#ffffff",
                        borderRadius: "10px",
                        padding: "0.6rem 1.35rem",
                        fontWeight: 800,
                        fontSize: "13px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        border: "none",
                        boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    <Plus size={16} strokeWidth={3} />
                    New Event
                </button>
            </div>

            {/* Top Stat Row (3-Column Grid) */}
            <div className="events-stat-grid">
                {/* Stat Card 1 */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Total Spent
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.1)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Wallet size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            ₹{totalSpent.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            Consumed across registered events
                        </div>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Allocated Budget
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <PieChart size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "#f97316", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            ₹{totalBudget.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            Total pool across {events.length} active project{events.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Avg Utilization
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            {avgUtilization}%
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            {parseFloat(avgUtilization) > 85 ? "High expenditure zone" : "Budget utilization within safe parameters"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Hero Section */}
            <div style={{
                background: "linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(18, 18, 20, 0.95) 100%)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "16px",
                padding: "1.75rem 2rem",
                marginBottom: "2rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>
                <div style={{ 
                    position: "absolute", 
                    right: "-40px", 
                    top: "-40px", 
                    width: "220px", 
                    height: "220px", 
                    background: "radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%)",
                    animation: "floatOrb 10s infinite ease-in-out",
                    borderRadius: "50%",
                    pointerEvents: "none"
                }}></div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", animation: "pulseDot 2s infinite" }}></div>
                    <span style={{ fontSize: "10px", color: "#f97316", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                        Operational Overview
                    </span>
                </div>
                
                <h2 style={{ fontSize: "26px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 0.5rem", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                    {events.length} Active Production{events.length !== 1 ? 's' : ''}
                </h2>
                
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, margin: 0, maxWidth: "650px", lineHeight: 1.6 }}>
                    System integrity optimal. All operational streams are currently synchronized. Next deployment phase: "{events[0]?.name || 'Sample Event'}" in active monitoring.
                </p>
            </div>

            {/* Event Directory Section */}
            <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
            }}>
                {/* Directory Controls Header */}
                <div style={{ 
                    padding: "1.25rem 1.5rem", 
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap"
                }}>
                    <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
                            Event Directory
                        </h3>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                            Manage, monitor, and synchronize your event lifecycle.
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        {/* Search Input */}
                        <div style={{ position: "relative", minWidth: "220px" }}>
                            <Search size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.45rem 0.85rem 0.45rem 2.3rem",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                    outline: "none"
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{
                                padding: "0.45rem 0.85rem",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                outline: "none",
                                cursor: "pointer"
                            }}
                        >
                            <option value="All">All Categories</option>
                            <option value="Wedding">Wedding</option>
                            <option value="Conference">Conference</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Tech Summits">Tech Summits</option>
                            <option value="Tech Fest">Tech Fest</option>
                            <option value="Hackathon">Hackathon</option>
                            <option value="Birthday">Birthday</option>
                            <option value="Other">Other</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "2px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <button
                                onClick={() => setViewMode("table")}
                                style={{
                                    background: viewMode === "table" ? "var(--bg-elevated)" : "transparent",
                                    border: "none",
                                    color: viewMode === "table" ? "var(--accent-primary)" : "var(--text-muted)",
                                    padding: "5px 8px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center"
                                }}
                                title="Table View"
                            >
                                <TableIcon size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                style={{
                                    background: viewMode === "grid" ? "var(--bg-elevated)" : "transparent",
                                    border: "none",
                                    color: viewMode === "grid" ? "var(--accent-primary)" : "var(--text-muted)",
                                    padding: "5px 8px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center"
                                }}
                                title="Grid View"
                            >
                                <GridIcon size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Directory Content */}
                {fetchLoading ? (
                    <div style={{ padding: "1.5rem" }}>
                        <TableSkeleton rows={5} columns={4} />
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                            <FolderKanban size={24} />
                        </div>
                        <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 0.4rem" }}>
                            No events found
                        </h4>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 1.25rem", maxWidth: "360px", marginInline: "auto" }}>
                            {searchQuery ? `No results matching "${searchQuery}" in ${activeTab}.` : `No event records registered under ${activeTab}.`}
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                background: "var(--accent-primary)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "0.5rem 1rem",
                                fontSize: "12px",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            <Plus size={14} />
                            Create New Event
                        </button>
                    </div>
                ) : viewMode === "table" ? (
                    /* Table View */
                    <div style={{ width: "100%", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                                    <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border-subtle)" }}>
                                        Event Name
                                    </th>
                                    <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border-subtle)" }}>
                                        Date & Location
                                    </th>
                                    <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border-subtle)" }}>
                                        Status
                                    </th>
                                    <th style={{ textAlign: "right", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border-subtle)" }}>
                                        Budget Utilization
                                    </th>
                                    <th style={{ padding: "0.85rem 1.5rem", borderBottom: "1px solid var(--border-subtle)" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.map((event) => {
                                    const spent = event.spent || 0;
                                    const utilization = event.budget > 0 ? (spent / event.budget) * 100 : 0;
                                    const isCompleted = event.status === "Completed";
                                    const dotColor = categoryColors[event.type] || "#f97316";

                                    return (
                                        <tr 
                                            key={event.id || event._id} 
                                            onClick={() => navigate(`/events/${event.id || event._id}`)} 
                                            className="event-row"
                                            style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "all 0.2s" }}
                                        >
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                    <div style={{ width: "36px", height: "36px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${dotColor}44`, flexShrink: 0 }}>
                                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: dotColor }}></div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2px" }}>
                                                            {event.name}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                                                            {event.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 700, marginBottom: "2px" }}>
                                                    {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                                                    {event.city || event.location || "Location TBD"} {event.country ? `, ${event.country}` : ""}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "20px", background: isCompleted ? "rgba(255,255,255,0.04)" : "rgba(16, 185, 129, 0.1)", border: `1px solid ${isCompleted ? "rgba(255,255,255,0.08)" : "rgba(16, 185, 129, 0.2)"}` }}>
                                                    {!isCompleted && (
                                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulseDot 2s infinite" }}></div>
                                                    )}
                                                    <span style={{ 
                                                        fontSize: "10px", 
                                                        fontWeight: 900, 
                                                        color: isCompleted ? "var(--text-muted)" : "#10b981",
                                                        letterSpacing: "0.06em"
                                                    }}>
                                                        {isCompleted ? "COMPLETED" : "ACTIVE"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "160px", marginLeft: "auto" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 800 }}>
                                                        <span style={{ color: "var(--text-primary)" }}>₹{spent.toLocaleString('en-IN')}</span>
                                                        <span style={{ color: "var(--text-muted)" }}>{utilization.toFixed(0)}%</span>
                                                    </div>
                                                    <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                                                        <div style={{ 
                                                            width: `${Math.min(utilization, 100)}%`, 
                                                            height: "100%", 
                                                            background: utilization > 90 ? "#ef4444" : (isCompleted ? "var(--text-muted)" : "linear-gradient(90deg, #f97316, #ea580c)"), 
                                                            borderRadius: "3px", 
                                                            transition: "width 0.5s ease-out" 
                                                        }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                                                    <ChevronRight size={15} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Grid View */
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", padding: "1.5rem" }}>
                        {filteredEvents.map((event) => {
                            const spent = event.spent || 0;
                            const utilization = event.budget > 0 ? (spent / event.budget) * 100 : 0;
                            const isCompleted = event.status === "Completed";
                            const dotColor = categoryColors[event.type] || "#f97316";

                            return (
                                <div
                                    key={event.id || event._id}
                                    onClick={() => navigate(`/events/${event.id || event._id}`)}
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid var(--border-subtle)",
                                        borderRadius: "14px",
                                        overflow: "hidden",
                                        padding: "1.25rem",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}
                                    className="event-card-hover"
                                >
                                    <div>
                                        {event.banner && (
                                            <div style={{ height: "100px", borderRadius: "10px", overflow: "hidden", marginBottom: "0.85rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                <img 
                                                    src={event.banner.startsWith("/") ? `${API_URL}${event.banner}` : event.banner} 
                                                    alt={event.name} 
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                                />
                                            </div>
                                        )}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                            <span style={{ fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", background: `${dotColor}22`, color: dotColor }}>
                                                {event.type}
                                            </span>
                                            <span style={{ fontSize: "10px", fontWeight: 800, color: isCompleted ? "var(--text-muted)" : "#10b981" }}>
                                                {isCompleted ? "COMPLETED" : "ACTIVE"}
                                            </span>
                                        </div>

                                        <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 0.5rem" }}>
                                            {event.name}
                                        </h4>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "1rem" }}>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Calendar size={13} />
                                                {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}
                                            </div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <MapPin size={13} />
                                                {event.city || event.location || "Location TBD"}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.85rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 800, marginBottom: "6px" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>Budget</span>
                                            <span style={{ color: "var(--text-primary)" }}>₹{(event.budget || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                                            <div style={{ width: `${Math.min(utilization, 100)}%`, height: "100%", background: dotColor, borderRadius: "2px" }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                        Showing {filteredEvents.length} of {events.length} events
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "var(--text-muted)", cursor: "pointer" }}>&lt;</button>
                        <button style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-primary)", border: "none", borderRadius: "6px", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: "11px" }}>1</button>
                        <button style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "var(--text-muted)", cursor: "pointer" }}>&gt;</button>
                    </div>
                </div>
            </div>

            {/* Redesigned Modal */}
            {showModal && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0, 0, 0, 0.75)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    zIndex: 1000, 
                    backdropFilter: "blur(12px)" 
                }}>
                    <div className="modal-reveal mobile-full-width" style={{
                        width: "95%",
                        maxWidth: "440px",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-medium)",
                        padding: "2rem",
                        borderRadius: "20px",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                        position: "relative",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                position: "absolute",
                                top: "1.25rem",
                                right: "1.5rem",
                                background: "rgba(255,255,255,0.05)",
                                color: "var(--text-muted)",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid var(--border-subtle)"
                            }}
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>

                        <div style={{ marginBottom: "1.75rem" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.12)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                <Sparkles size={22} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.25rem", color: "var(--text-primary)" }}>
                                Initialize Event
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>
                                Define operational parameters for the new event stream.
                            </p>
                        </div>

                        <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Event Title</label>
                                <div style={{ position: "relative" }}>
                                    <LayoutGrid size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        required
                                        placeholder="e.g. Annual Tech Summit 2026"
                                        value={newEvent.name}
                                        onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Start Date *</label>
                                    <div style={{ position: "relative" }}>
                                        <Calendar size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                        <input
                                            required
                                            type="date"
                                            value={newEvent.startDate || newEvent.date}
                                            onChange={e => {
                                                const newStart = e.target.value;
                                                setNewEvent(prev => ({
                                                    ...prev,
                                                    date: newStart,
                                                    startDate: newStart,
                                                    // If endDate is earlier than newStart, update endDate to match newStart
                                                    endDate: prev.endDate && prev.endDate < newStart ? newStart : prev.endDate
                                                }));
                                            }}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>End Date (Optional)</label>
                                    <div style={{ position: "relative" }}>
                                        <Calendar size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                        <input
                                            type="date"
                                            min={getMinEndDate(newEvent.startDate || newEvent.date)}
                                            value={newEvent.endDate}
                                            onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Category</label>
                                <select
                                    value={newEvent.type}
                                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                    style={{ ...inputStyle, paddingLeft: "0.85rem" }}
                                >
                                    <option>Hackathon</option>
                                    <option>Tech Fest</option>
                                    <option>Tech Event</option>
                                    <option>Conference</option>
                                    <option>Corporate</option>
                                    <option>Tech Summits</option>
                                    <option>Wedding</option>
                                    <option>Birthday</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Country</label>
                                    <div style={{ position: "relative" }}>
                                        <Globe size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                        <input
                                            required
                                            placeholder="India, USA..."
                                            value={newEvent.country}
                                            onChange={e => setNewEvent({ ...newEvent, country: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>City</label>
                                    <div style={{ position: "relative" }}>
                                        <MapPin size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                        <input
                                            required
                                            placeholder="Mumbai, New York..."
                                            value={newEvent.city}
                                            onChange={e => setNewEvent({ ...newEvent, city: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Venue Location</label>
                                <div style={{ position: "relative" }}>
                                    <MapPin size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        required
                                        placeholder="Hotel, Convention Center, or Address..."
                                        value={newEvent.location}
                                        onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Budget (₹)</label>
                                <div style={{ position: "relative" }}>
                                    <Wallet size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input
                                        required
                                        type="number"
                                        placeholder="500000"
                                        value={newEvent.budget}
                                        onChange={e => setNewEvent({ ...newEvent, budget: e.target.value })}
                                        style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                                    />
                                </div>
                            </div>

                            {/* DESCRIPTION WITH AI POLISH */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>EVENT DESCRIPTION</label>
                                    <button
                                        type="button"
                                        onClick={handlePolishDescription}
                                        disabled={polishingDesc}
                                        style={{
                                            background: "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.3) 100%)",
                                            border: "1px solid rgba(249, 115, 22, 0.4)",
                                            color: "#f97316",
                                            padding: "4px 10px",
                                            borderRadius: "8px",
                                            fontSize: "11px",
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            transition: "all 0.2s"
                                        }}
                                        title="Click to polish your short notes into a professional description"
                                    >
                                        {polishingDesc ? (
                                            <>
                                                <Loader2 size={12} className="animate-spin" />
                                                Polishing...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={12} />
                                                Polish with AI
                                            </>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder="Write a brief overview or click 'Polish with AI' to generate a full detailed description..."
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                    style={{
                                        ...inputStyle,
                                        padding: "0.75rem",
                                        resize: "vertical",
                                        minHeight: "75px",
                                        fontFamily: "inherit"
                                    }}
                                />
                            </div>

                            {/* EVENT BANNER GENERATOR & SELF UPLOAD */}
                            <div>
                                <label style={labelStyle}>EVENT BANNER</label>

                                {newEvent.banner && (
                                    <div style={{ position: "relative", marginBottom: "0.75rem", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(249, 115, 22, 0.3)" }}>
                                        <img 
                                            src={newEvent.banner.startsWith("/") ? `${API_URL}${newEvent.banner}` : newEvent.banner} 
                                            alt="Event Banner Preview" 
                                            style={{ width: "100%", height: "110px", objectFit: "cover", display: "block" }} 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewEvent({ ...newEvent, banner: "" })}
                                            style={{
                                                position: "absolute",
                                                top: "6px",
                                                right: "6px",
                                                background: "rgba(0,0,0,0.7)",
                                                border: "none",
                                                color: "#fff",
                                                width: "24px",
                                                height: "24px",
                                                borderRadius: "50%",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                            title="Remove Banner"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                    <button
                                        type="button"
                                        onClick={handleGenerateBanner}
                                        disabled={generatingBanner}
                                        style={{
                                            background: "rgba(249, 115, 22, 0.12)",
                                            border: "1px dashed rgba(249, 115, 22, 0.4)",
                                            color: "#f97316",
                                            padding: "0.65rem 0.5rem",
                                            borderRadius: "10px",
                                            fontSize: "11px",
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        {generatingBanner ? (
                                            <>
                                                <Loader2 size={13} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={13} />
                                                Generate Banner (Gemini)
                                            </>
                                        )}
                                    </button>

                                    <label
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px dashed var(--border-medium)",
                                            color: "var(--text-secondary)",
                                            padding: "0.65rem 0.5rem",
                                            borderRadius: "10px",
                                            fontSize: "11px",
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        {uploadingBanner ? (
                                            <>
                                                <Loader2 size={13} className="animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={13} />
                                                Self Upload Banner
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSelfUploadBanner}
                                            style={{ display: "none" }}
                                            disabled={uploadingBanner}
                                        />
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem",
                                    marginTop: "0.75rem",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                    color: "#ffffff",
                                    fontWeight: 800,
                                    fontSize: "0.95rem",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.6rem",
                                    boxShadow: "0 10px 20px rgba(249, 115, 22, 0.25)",
                                    transition: "opacity 0.2s"
                                }}
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Initialize Event Stream
                                        <ChevronRight size={16} strokeWidth={3} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes floatOrb {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.1); }
                    66% { transform: translate(-20px, 40px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes pulseDot {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .event-row:hover {
                    background: rgba(255, 255, 255, 0.03) !important;
                }
                .event-card-hover:hover {
                    border-color: rgba(249, 115, 22, 0.4) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px -10px rgba(0,0,0,0.3);
                }
                .modal-reveal { animation: modalReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes modalReveal {
                    from { transform: scale(0.95) translateY(12px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
