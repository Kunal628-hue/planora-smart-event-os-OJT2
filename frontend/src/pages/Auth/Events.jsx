import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { animate, stagger } from "animejs";
import { Plus, Calendar, MapPin, ChevronRight, Loader2, X, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Events() {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: "",
        date: "",
        location: "",
        type: "Wedding",
        budget: ""
    });

    const fetchEvents = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/events?user=${user.uid}`);
            const data = await response.json();
            setEvents(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);

    useEffect(() => {
        if (!fetchLoading && events.length > 0) {
            animate('.event-card', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(60),
                easing: 'cubicBezier(.22, 1, .36, 1)',
                duration: 600
            });
        }
    }, [fetchLoading, events.length]);

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
            status: "Planned"
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
                setNewEvent({ name: "", date: "", location: "", type: "Wedding", budget: "" });
                fetchEvents();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || "Failed to create event"}`);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Connection error. Is the backend running?");
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

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>Event Portfolio</h1>
                    <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Manage and track your operational event streams.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    style={{ borderRadius: "8px", padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "14px", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}
                >
                    Initialize Event
                </button>
            </div>

            <div className="portfolio-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem"
            }}>
                {fetchLoading ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "5rem" }}>
                        <Loader2 className="animate-spin" size={32} color="#2563eb" style={{ margin: "0 auto" }} />
                    </div>
                ) : events.length === 0 ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "5rem", background: "#fff", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
                        <p style={{ color: "#64748b" }}>Your portfolio is empty. Initialize your first event to get started.</p>
                    </div>
                ) : (
                    events.map(event => {
                        const statusColor = getStatusColor(event.status);
                        // Mocking utilization for UI beauty (spent/total)
                        const spent = Math.floor(Math.random() * (event.budget * 0.8));
                        const remaining = event.budget - spent;
                        const utilization = (spent / event.budget) * 100;

                        return (
                            <div
                                key={event.id || event._id}
                                onClick={() => navigate(`/events/${event.id || event._id}`)}
                                style={{
                                    background: "#fff",
                                    height: "170px",
                                    maxHeight: "180px",
                                    borderLeft: `4px solid ${statusColor}`,
                                    borderRadius: "8px",
                                    padding: "16px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.01em" }}>{event.name}</h3>
                                        <div style={{ fontSize: "10px", fontWeight: 800, color: statusColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>{event.status}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontSize: "12px", fontWeight: 500 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Calendar size={12} />
                                            {event.date}
                                        </div>
                                        <span style={{ color: "#e2e8f0" }}>|</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <MapPin size={12} />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderTop: "1px solid #f8fafc", paddingTop: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "6px" }}>
                                        <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Utilisation</div>
                                        <div style={{ fontSize: "11px", color: "#1e293b", fontWeight: 700 }}>₹{remaining.toLocaleString()} remaining</div>
                                    </div>
                                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                                        <div style={{
                                            width: `${utilization}%`,
                                            height: "100%",
                                            background: utilization > 90 ? "#ef4444" : statusColor,
                                            borderRadius: "10px",
                                            transition: "width 1s ease"
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(12px)" }}>
                    <div className="glass-panel-dark modal-reveal" style={{ width: "100%", maxWidth: "550px", padding: "3rem", borderRadius: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "var(--accent-soft)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Plus size={28} strokeWidth={3} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "1.75rem", fontWeight: 950, letterSpacing: "-0.04em", margin: 0, color: "#fff" }}>Initialize Context</h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600, margin: 0, marginTop: "0.25rem" }}>Establish a new operational event stream.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="hover-lift" style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-subtle)", color: "var(--text-primary)", width: "36px", height: "36px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={18} strokeWidth={3} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Event Title</label>
                                <div style={{ position: "relative" }}>
                                    <Sparkles size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8 }} />
                                    <input
                                        className="auth-input"
                                        placeholder="e.g. Neo-Tech Conference 2026"
                                        value={newEvent.name}
                                        onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                                        required
                                        style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 3.25rem", fontWeight: 600, fontSize: "1rem" }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Date</label>
                                    <div style={{ position: "relative" }}>
                                        <Calendar size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8, pointerEvents: "none" }} />
                                        <input
                                            type="date"
                                            className="auth-input"
                                            value={newEvent.date}
                                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                            required
                                            style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 3.25rem", fontWeight: 750, fontSize: "1rem" }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Context Type</label>
                                    <select
                                        className="auth-input"
                                        value={newEvent.type}
                                        onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                        style={{ borderRadius: "14px", padding: "1.1rem", fontWeight: 750, fontSize: "1rem" }}
                                    >
                                        <option>Wedding</option>
                                        <option>Conference</option>
                                        <option>College Fest</option>
                                        <option>Birthday</option>
                                        <option>Corporate</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Geographical Location</label>
                                <div style={{ position: "relative" }}>
                                    <MapPin size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8 }} />
                                    <input
                                        className="auth-input"
                                        placeholder="e.g. Jio World Convention Centre"
                                        value={newEvent.location}
                                        onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                        required
                                        style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 3.25rem", fontWeight: 600, fontSize: "1rem" }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project Budget Allocation (₹)</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", fontWeight: 900, opacity: 0.8 }}>₹</span>
                                    <input
                                        type="number"
                                        className="auth-input"
                                        placeholder="e.g. 500000"
                                        value={newEvent.budget}
                                        onChange={e => setNewEvent({ ...newEvent, budget: e.target.value })}
                                        required
                                        style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 2.8rem", fontWeight: 850, fontSize: "1.1rem" }}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "1.25rem",
                                    marginTop: "1rem",
                                    borderRadius: "16px",
                                    fontWeight: 900,
                                    letterSpacing: "0.02em",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.75rem"
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{ width: "22px", height: "22px", border: "3px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                                        Processing Matrix...
                                    </>
                                ) : (
                                    <>
                                        Initialize Project
                                        <ChevronRight size={20} />
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
