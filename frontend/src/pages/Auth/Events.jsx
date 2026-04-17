import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { Plus, Calendar, MapPin, Globe, ChevronRight, Loader2, X, Sparkles, LayoutGrid, Package, Wallet } from "lucide-react";

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

    const fetchEvents = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/events?user=${user.uid}&email=${user.email}`);
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
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "650",
        color: "#0f172a",
        outline: "none"
    };

    const labelStyle = {
        display: "block",
        fontSize: "10px",
        fontWeight: "850",
        color: "#94a3b8",
        marginBottom: "0.4rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em"
    };

    return (
        <div className="responsive-container" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3rem", gap: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "280px" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 850, color: "#0f172a", marginBottom: "0.25rem", letterSpacing: "-0.03em" }}>Event Portfolio</h1>
                    <p style={{ color: "#64748b", fontSize: "1rem", fontWeight: 500 }}>Manage and coordinate your high-impact operational streams.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    style={{ borderRadius: "14px", padding: "0.85rem 1.75rem", fontWeight: 800, fontSize: "14px", whiteSpace: "nowrap" }}
                >
                    <Plus size={18} strokeWidth={3} />
                    <span>Initialize Event</span>
                </button>
            </div>

            <div className="portfolio-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "1.5rem"
            }}>
                {fetchLoading ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "8rem" }}>
                        <Loader2 size={40} color="#2563eb" style={{ margin: "0 auto" }} />
                    </div>
                ) : events.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "6rem", background: "#fff", border: "2px dashed #e2e8f0", borderRadius: "32px" }}>
                        <div style={{ width: "64px", height: "64px", background: "#f8fafc", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "#94a3b8" }}>
                            <Package size={32} />
                        </div>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>Portfolio Empty</h2>
                        <p style={{ color: "#64748b", fontWeight: 500 }}>Initialize your first planning stream to activate management tools.</p>
                    </div>
                ) : (
                    events.map(event => {
                        const statusColor = getStatusColor(event.status);
                        const spent = event.spent || 0;
                        const remaining = event.budget - spent;
                        const utilization = event.budget > 0 ? (spent / event.budget) * 100 : 0;

                        return (
                            <div
                                key={event.id || event._id}
                                className="event-card"
                                onClick={() => navigate(`/events/${event.id || event._id}`)}
                                style={{
                                    background: "#fff",
                                    borderRadius: "24px",
                                    padding: "1.5rem",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                                    border: "1px solid #f1f5f9",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1.5rem"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem", letterSpacing: "-0.01em" }}>{event.name}</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={13} /> {event.date}</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={13} /> {event.location}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleToggleStatus(e, event.id || event._id, event.status)}
                                        style={{
                                            padding: "4px 10px",
                                            borderRadius: "8px",
                                            background: `${statusColor}10`,
                                            color: statusColor,
                                            fontSize: "10px",
                                            fontWeight: 900,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            border: `1px solid ${statusColor}20`,
                                            cursor: "pointer"
                                        }}
                                        title={`Click to mark as ${event.status === "Completed" ? "Planned" : "Completed"}`}
                                    >
                                        {event.status}
                                    </button>
                                </div>

                                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Capital Utilization</div>
                                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>₹{remaining.toLocaleString('en-IN')} left</div>
                                    </div>
                                    <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                                        <div style={{
                                            width: `${utilization}%`,
                                            height: "100%",
                                            background: utilization > 90 ? "#ef4444" : statusColor,
                                            borderRadius: "10px"
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Redesigned Modal - Compressed Scale */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="modal-reveal mobile-full-width" style={{
                        width: "95%",
                        maxWidth: "400px",
                        background: "#ffffff",
                        padding: "1.75rem",
                        borderRadius: "24px",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
                        position: "relative",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                position: "absolute",
                                top: "1.25rem",
                                right: "1.25rem",
                                background: "#f8fafc",
                                color: "#94a3b8",
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>

                        <div style={{ marginBottom: "1.75rem" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                <Sparkles size={20} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontSize: "1.45rem", fontWeight: 850, letterSpacing: "-0.03em", margin: "0 0 0.15rem", color: "#0f172a" }}>Initialize Context</h2>
                            <p style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 550, margin: 0 }}>Define operational parameters for the new stream.</p>
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
                                        <option>Wedding</option>
                                        <option>Conference</option>
                                        <option>Corporate</option>
                                        <option>Birthday</option>
                                        <option>Tech Summits</option>
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
                                    <Wallet size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
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
                                    background: "#2563eb",
                                    color: "#fff",
                                    fontWeight: 850,
                                    fontSize: "0.9rem",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.6rem",
                                    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.15)"
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
        </div>
    );
}
