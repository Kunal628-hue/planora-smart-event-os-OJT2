import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { Plus, Calendar, MapPin, Globe, ChevronRight, Loader2, X, Sparkles, LayoutGrid, Package, Wallet, RefreshCw, Activity } from "lucide-react";
import Box from '@mui/material/Box';
import MuiSkeleton from '@mui/material/Skeleton';
import { TableSkeleton } from "../../components/ui/Skeleton";

const API_URL = import.meta.env.VITE_API_URL;

export default function Events() {
    const { user, addNotification } = useOutletContext();
    const { showAlert } = useDialog();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: "",
        date: "",
        location: "",
        type: "Wedding",
        budget: "",
        city: "",
        country: ""
    });

    const [timeline, setTimeline] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    const fetchEvents = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/events?user=${user.uid}&email=${user.email}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setEvents(data);
                if (data.length > 0) {
                    fetchTimeline(data[0]);
                }
            } else {
                setEvents([]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchTimeline = async (event) => {
        try {
            const response = await fetch(`${API_URL}/ai/timeline?type=${event.type || "Wedding"}`);
            const data = await response.json();
            setTimeline(data);
        } catch (err) {
            console.error("Timeline fetch error:", err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);


    const [loading, setLoading] = useState(false);

    const handleToggleStatus = async (e, eventId, currentStatus) => {
        e.stopPropagation();
        try {
            const newStatus = currentStatus === "Completed" ? "Planned" : "Completed";
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                fetchEvents();
                addNotification("Status Updated", `Event context transitioned to '${newStatus}'.`);
            }
        } catch (err) {
            console.error("Status update failed:", err);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!user) return navigate("/login");

        const eventData = {
            name: newEvent.name || "Unnamed Event",
            date: newEvent.date || "",
            location: newEvent.location || "",
            type: newEvent.type || "Other",
            budget: parseInt(newEvent.budget) || 0,
            userId: user.uid,
            status: "Planned",
            city: newEvent.city,
            country: newEvent.country
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
                setNewEvent({ name: "", date: "", location: "", type: "Wedding", budget: "", city: "", country: "" });
                fetchEvents();
                addNotification("Event Created", `'${eventData.name}' has been successfully onboarded.`);
            } else {
                const errorData = await response.json();
                await showAlert("Initialization Error", errorData.message || "Failed to create event stream. Please verify your parameters.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            await showAlert("Nexus Connection Error", "External synchronization failed. Is the backend strategic module active?");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Planned": return "#3b82f6"; // Blue
            case "Completed": return "#10b981"; // Green
            case "At Risk": return "#f59e0b"; // Amber
            default: return "#64748b";
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "0.65rem 0.85rem 0.65rem 2.5rem",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "var(--text-primary)",
        outline: "none"
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

    const totalBudget = events.reduce((sum, e) => sum + (e.budget || 0), 0);
    const totalSpent = events.reduce((sum, e) => sum + (e.spent || 0), 0);

    const filteredEvents = events.filter(event => {
        if (activeTab === "drafts") return event.status === "Draft" || event.status === "Planned";
        if (activeTab === "archived") return event.status === "Archived" || event.status === "Completed";
        return true;
    });

    return (
        <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
            {/* Header Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Events</h1>
                    <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <button onClick={() => setActiveTab("all")} style={{ background: activeTab === "all" ? "var(--accent-primary)" : "transparent", border: "none", color: activeTab === "all" ? "#fff" : "var(--text-secondary)", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>All Events</button>
                        <button onClick={() => setActiveTab("drafts")} style={{ background: activeTab === "drafts" ? "var(--accent-primary)" : "transparent", border: "none", color: activeTab === "drafts" ? "#fff" : "var(--text-secondary)", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>Drafts</button>
                        <button onClick={() => setActiveTab("archived")} style={{ background: activeTab === "archived" ? "var(--accent-primary)" : "transparent", border: "none", color: activeTab === "archived" ? "#fff" : "var(--text-secondary)", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>Archived</button>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    style={{ borderRadius: "8px", padding: "0.5rem 1.25rem", fontWeight: 800, fontSize: "12px", height: "36px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Plus size={14} strokeWidth={4} />
                    New Event
                </button>
            </div>

            {/* Top Stat Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "1.25rem" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Total Spent</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)" }}>₹{totalSpent.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "1.25rem" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Allocated Budget</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "#f97316" }}>₹{totalBudget.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "1.25rem" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Avg Utilization</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)" }}>{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%</div>
                </div>
            </div>

            {/* Compact Hero Section */}
            <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "16px",
                padding: "1.75rem 2rem",
                marginBottom: "2rem",
                maxHeight: "200px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
            }}>
                <div style={{ 
                    position: "absolute", 
                    right: "-50px", 
                    top: "-50px", 
                    width: "200px", 
                    height: "200px", 
                    background: "radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)",
                    animation: "floatOrb 10s infinite ease-in-out",
                    borderRadius: "50%",
                    pointerEvents: "none"
                }}></div>
                
                <div style={{ fontSize: "10px", color: "#f97316", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>Operational Overview</div>
                <h2 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 0.5rem", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {events.length} Active Production{events.length !== 1 ? 's' : ''}
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, margin: 0, maxWidth: "600px", lineHeight: 1.5 }}>
                    System integrity optimal. All operational streams are currently synchronized. Next deployment phase: "{events[0]?.name || 'Hackathon'}" in active monitoring.
                </p>
            </div>

            {/* Event Directory Table */}
            <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "16px",
                overflow: "hidden"
            }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Event Directory</h3>
                </div>

                <div style={{ width: "100%", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left", padding: "1rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-subtle)" }}>Event Name</th>
                                <th style={{ textAlign: "left", padding: "1rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-subtle)" }}>Date</th>
                                <th style={{ textAlign: "left", padding: "1rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-subtle)" }}>Status</th>
                                <th style={{ textAlign: "right", padding: "1rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border-subtle)" }}>Budget Utilization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fetchLoading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: "0" }}>
                                        <TableSkeleton rows={5} columns={4} />
                                    </td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>No events found for {activeTab}.</td></tr>
                            ) : (
                                filteredEvents.map((event) => {
                                    const spent = event.spent || 0;
                                    const utilization = event.budget > 0 ? (spent / event.budget) * 100 : 0;
                                    const isCompleted = event.status === "Completed";
                                    
                                    const categoryColors = {
                                        "Wedding": "#f97316",
                                        "Conference": "#3b82f6",
                                        "Corporate": "#8b5cf6",
                                        "Birthday": "#ec4899",
                                        "Tech Summits": "#10b981"
                                    };
                                    const dotColor = categoryColors[event.type] || "#64748b";

                                    return (
                                        <tr 
                                            key={event.id || event._id} 
                                            onClick={() => navigate(`/events/${event.id || event._id}`)} 
                                            className="event-row"
                                            style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", transition: "all 0.2s", position: "relative" }}
                                        >
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                    <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${dotColor}44` }}>
                                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: dotColor }}></div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2px" }}>{event.name}</div>
                                                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>{event.type} • {event.city || event.location}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, marginBottom: "2px" }}>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>{event.country || "Global"}</div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    {!isCompleted && (
                                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulseDot 2s infinite" }}></div>
                                                    )}
                                                    <span style={{ 
                                                        fontSize: "10px", 
                                                        fontWeight: 900, 
                                                        color: isCompleted ? "var(--text-muted)" : "#10b981",
                                                        letterSpacing: "0.05em"
                                                    }}>
                                                        {isCompleted ? "PAST" : "ACTIVE"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "160px", marginLeft: "auto" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 800 }}>
                                                        <span style={{ color: "var(--text-primary)" }}>₹{spent.toLocaleString('en-IN')}</span>
                                                        <span style={{ color: "var(--text-muted)" }}>{utilization.toFixed(0)}%</span>
                                                    </div>
                                                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                                                        <div style={{ width: `${Math.min(utilization, 100)}%`, height: "100%", background: utilization > 90 ? "#ef4444" : (isCompleted ? "var(--text-muted)" : "#f97316"), borderRadius: "2px", transition: "width 0.5s ease-out" }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                                <button style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }} onClick={(e) => e.stopPropagation()}>
                                                    <RefreshCw size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                        Showing 1 to {Math.max(1, filteredEvents.length)} of {filteredEvents.length} events
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-muted)", cursor: "pointer" }}>&lt;</button>
                        <button style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-primary)", fontWeight: 700, cursor: "pointer", fontSize: "11px" }}>1</button>
                        <button style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-primary)", fontWeight: 700, cursor: "pointer", fontSize: "11px" }}>2</button>
                        <button style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-primary)", fontWeight: 700, cursor: "pointer", fontSize: "11px" }}>3</button>
                        <button style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "4px", color: "var(--text-muted)", cursor: "pointer" }}>&gt;</button>
                    </div>
                </div>
            </div>


            {/* Redesigned Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" }}>
                    <div className="modal-reveal mobile-full-width" style={{
                        width: "95%",
                        maxWidth: "400px",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        padding: "2rem",
                        borderRadius: "24px",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
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

                        <div style={{ marginBottom: "2rem" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.1)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                <Sparkles size={20} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 0.25rem", color: "var(--text-primary)" }}>Initialize Context</h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500, margin: 0 }}>Define operational parameters for the new stream.</p>
                        </div>

                        <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Event Title</label>
                                <div style={{ position: "relative" }}>
                                    <LayoutGrid size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        required
                                        placeholder=""
                                        value={newEvent.name}
                                        onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Date</label>
                                    <div style={{ position: "relative" }}>
                                        <Calendar size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input
                                            required
                                            type="date"
                                            value={newEvent.date}
                                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                            style={inputStyle}
                                        />
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
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Country</label>
                                    <div style={{ position: "relative" }}>
                                        <Globe size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input
                                            required
                                            placeholder="USA, India, etc."
                                            value={newEvent.country}
                                            onChange={e => setNewEvent({ ...newEvent, country: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>City</label>
                                    <div style={{ position: "relative" }}>
                                        <MapPin size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input
                                            required
                                            placeholder="New York, Mumbai, etc."
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
                                    <LayoutGrid size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        required
                                        placeholder="Specific Hotel, Hall, or Address..."
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
                                        placeholder="0.00"
                                        value={newEvent.budget}
                                        onChange={e => setNewEvent({ ...newEvent, budget: e.target.value })}
                                        style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem",
                                    marginTop: "1rem",
                                    borderRadius: "12px",
                                    background: "var(--accent-primary)",
                                    color: "#fff",
                                    fontWeight: 800,
                                    fontSize: "0.95rem",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.6rem",
                                    boxShadow: "0 10px 20px rgba(249, 115, 22, 0.15)"
                                }}
                            >
                                {loading ? (
                                    <Loader2 size={18} />
                                ) : (
                                    <>
                                        Initialize Event
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
                    background: rgba(255, 255, 255, 0.02) !important;
                    box-shadow: inset 3px 0 0 0 #f97316;
                }
                .modal-reveal { animation: modalReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes modalReveal {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
