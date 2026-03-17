import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { animate, stagger } from "animejs";

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
                scale: [0.9, 1],
                opacity: [0, 1],
                delay: stagger(100),
                easing: 'easeOutElastic(1, .8)',
                duration: 1000
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

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                        Event <span className="gradient-text">Portfolio</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                        Architecting experiences and managing logistical complexity.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-lg"
                    style={{ borderRadius: "14px", padding: "1rem 2rem" }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "8px" }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Initialize Event
                </button>
            </div>

            <div className="dashboard-grid">
                {fetchLoading ? (
                    <div style={{ gridColumn: "span 12", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 0", gap: "1.25rem" }}>
                        <div style={{ width: "48px", height: "48px", border: "5px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Retrieving Portfolio...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="glass-panel" style={{ gridColumn: "span 12", textAlign: "center", padding: "6rem 2rem", borderRadius: "32px", border: "2px dashed var(--border-medium)" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>📅</div>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 850 }}>No events registered yet</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", maxWidth: "450px", margin: "0 auto 2.5rem", fontSize: "1.1rem" }}>
                            Your strategic journey starts here. Create your first event to activate Planora's AI logistical engine.
                        </p>
                        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-lg">Begin Planning</button>
                    </div>
                ) : (
                    events.map(event => (
                        <div 
                            key={event.id || event._id} 
                            className="glass-panel event-card" 
                            style={{ gridColumn: "span 4", padding: "0", borderRadius: "28px", cursor: "pointer", overflow: "hidden" }}
                            onClick={() => navigate(`/events/${event.id || event._id}`)}
                        >
                            <div style={{ 
                                height: "8px", 
                                background: event.status === "Completed" ? "var(--accent-success)" : "var(--accent-primary)",
                                opacity: 0.8
                            }}></div>
                            <div style={{ padding: "2rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                    <span className="category-badge" style={{ background: "var(--accent-soft)", color: "var(--accent-primary)" }}>
                                        {event.type}
                                    </span>
                                    <div 
                                        onClick={(e) => handleToggleStatus(e, event.id || event._id, event.status)}
                                        className="category-badge"
                                        style={{ 
                                            background: event.status === "Completed" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                            color: event.status === "Completed" ? "var(--accent-success)" : "var(--accent-primary)",
                                            border: `1px solid ${event.status === "Completed" ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)"}`
                                        }}
                                    >
                                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
                                        {event.status}
                                    </div>
                                </div>

                                <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "1.25rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{event.name}</h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                        </div>
                                        {event.date}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        </div>
                                        {event.location}
                                    </div>
                                </div>

                                <div style={{ padding: "1.25rem", background: "var(--bg-base)", borderRadius: "20px", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Budget Allocation</span>
                                        <span style={{ fontSize: "1.25rem", color: "var(--text-primary)", fontWeight: 900 }}>₹{parseInt(event.budget).toLocaleString()}</span>
                                    </div>
                                    <button className="btn btn-ghost" style={{ width: "40px", height: "40px", borderRadius: "12px", padding: 0 }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(12px)" }}>
                    <div className="glass-panel" style={{ width: "100%", maxWidth: "550px", padding: "3rem", borderRadius: "32px", boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>Initialize Context</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "var(--bg-elevated)", border: "none", color: "var(--text-primary)", width: "36px", height: "36px", borderRadius: "12px", cursor: "pointer", fontWeight: 900 }}>✕</button>
                        </div>
                        <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Event Title</label>
                                <input
                                    className="auth-input"
                                    placeholder="e.g. Neo-Tech Conference 2026"
                                    value={newEvent.name}
                                    onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                                    required
                                    style={{ borderRadius: "14px", padding: "1rem" }}
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Date</label>
                                    <input
                                        type="date"
                                        className="auth-input"
                                        value={newEvent.date}
                                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                        required
                                        style={{ borderRadius: "14px", padding: "1rem" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Context Type</label>
                                    <select
                                        className="auth-input"
                                        value={newEvent.type}
                                        onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                        style={{ borderRadius: "14px", padding: "1rem", fontWeight: 700 }}
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
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Geographical Location</label>
                                <input
                                    className="auth-input"
                                    placeholder="e.g. Jio World Convention Centre"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                    required
                                    style={{ borderRadius: "14px", padding: "1rem" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project Budget Allocation (₹)</label>
                                <input
                                    type="number"
                                    className="auth-input"
                                    placeholder="e.g. 500000"
                                    value={newEvent.budget}
                                    onChange={e => setNewEvent({ ...newEvent, budget: e.target.value })}
                                    required
                                    style={{ borderRadius: "14px", padding: "1rem" }}
                                />
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
                                        <div style={{ width: "20px", height: "20px", border: "3px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                                        Processing...
                                    </>
                                ) : "Initialize Project"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
