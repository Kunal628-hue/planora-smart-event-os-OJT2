import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

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

    const [loading, setLoading] = useState(false);

    const handleToggleStatus = async (eventId, currentStatus) => {
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
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Events</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Manage and track all your upcoming events.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary hover-lift"
                    style={{
                        background: "var(--accent-primary)",
                        padding: "0.6rem 1.25rem",
                        borderRadius: "50px",
                        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                        gap: "0.6rem",
                        fontSize: "0.9rem",
                        fontWeight: 700
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Create New Event
                </button>
            </div>

            <div className="dashboard-grid">
                {fetchLoading ? (
                    <div style={{ gridColumn: "span 12", display: "flex", justifyContent: "center", padding: "5rem" }}>
                        <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="card" style={{ gridColumn: "span 12", textAlign: "center", padding: "5rem 2rem", background: "#fff", border: "1px dashed var(--border-medium)" }}>
                        <div style={{ width: 80, height: 80, background: "var(--accent-soft)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--accent-primary)", transform: "rotate(-5deg)" }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        </div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "0.75rem", color: "var(--text-primary)" }}>Your event list is empty</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", maxWidth: "400px", margin: "0 auto 2.5rem", lineHeight: 1.6 }}>Start planning your next big occasion with Planora. Create an event to track budgets, vendors, and guests.</p>
                        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-lg" style={{ background: "var(--accent-primary)", height: "48px" }}>Create Your First Event</button>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="card hover-lift" style={{ gridColumn: "span 4", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "radial-gradient(circle at top right, var(--accent-light) 0%, transparent 70%)", opacity: 0.1, pointerEvents: "none" }}></div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.75rem", borderRadius: "8px", background: "var(--accent-soft)", color: "var(--accent-primary)", fontSize: "0.7rem", fontWeight: 800 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
                                    {event.type}
                                </div>
                                <div style={{ color: event.status === "Planned" ? "#16a34a" : "#ca8a04", fontSize: "0.75rem", fontWeight: 800, background: event.status === "Planned" ? "#f0fdf4" : "#fefce8", padding: "0.3rem 0.6rem", borderRadius: "6px" }}>
                                    {event.status}
                                </div>
                            </div>

                            <h3 style={{ fontSize: "1.15rem", fontWeight: 850, marginBottom: "1rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{event.name}</h3>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.75rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                    <div style={{ color: "var(--accent-primary)", opacity: 0.8 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{event.date}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                    <div style={{ color: "var(--accent-primary)", opacity: 0.8 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{event.location}</span>
                                </div>
                                <div style={{ marginTop: "0.25rem", padding: "0.75rem", background: "var(--bg-base)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Budget:</span>
                                    <span style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 850 }}>₹{parseInt(event.budget).toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button
                                    onClick={() => navigate(`/events/${event.id}`)}
                                    className="btn btn-ghost"
                                    style={{ flex: 1, borderRadius: "10px", fontSize: "0.875rem", fontWeight: 750, height: "42px", transition: "all 0.2s" }}
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(event.id, event.status)}
                                    className="btn"
                                    style={{
                                        width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                                        background: event.status === "Completed" ? "#22c55e" : "var(--bg-elevated)",
                                        color: event.status === "Completed" ? "#fff" : "var(--text-muted)",
                                        border: event.status === "Completed" ? "none" : "1px solid var(--border-subtle)",
                                        transition: "all 0.2s"
                                    }}
                                    title={event.status === "Completed" ? "Mark as Planned" : "Mark as Done"}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Create New Event</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", color: "var(--text-muted)" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Event Name</label>
                                <input
                                    className="auth-input"
                                    placeholder="e.g. Kunal's Birthday Bash"
                                    value={newEvent.name}
                                    onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Date</label>
                                    <input
                                        type="date"
                                        className="auth-input"
                                        value={newEvent.date}
                                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Type</label>
                                    <select
                                        className="auth-input"
                                        value={newEvent.type}
                                        onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                    >
                                        <option>Wedding</option>
                                        <option>Birthday</option>
                                        <option>Corporate</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Location</label>
                                <input
                                    className="auth-input"
                                    placeholder="e.g. Grand Hyatt, Mumbai"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Budget (INR)</label>
                                <input
                                    type="number"
                                    className="auth-input"
                                    placeholder="e.g. 500000"
                                    value={newEvent.budget}
                                    onChange={e => setNewEvent({ ...newEvent, budget: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    background: "var(--accent-primary)",
                                    marginTop: "1rem",
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem"
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                                        Creating...
                                    </>
                                ) : "Create Event"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
