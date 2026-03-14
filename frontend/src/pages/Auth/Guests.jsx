import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Guests() {
    const { user } = useOutletContext();
    const [guests, setGuests] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGuest, setNewGuest] = useState({
        name: "",
        email: "",
        category: "Friend",
        status: "Pending",
        eventId: ""
    });

    const fetchData = async () => {
        if (!user) return;
        try {
            const [guestsRes, eventsRes] = await Promise.all([
                fetch(`${API_URL}/guests?user=${user.uid}`),
                fetch(`${API_URL}/events?user=${user.uid}`)
            ]);
            const guestsData = await guestsRes.json();
            const eventsData = await eventsRes.json();
            setGuests(guestsData);
            setEvents(eventsData);
            if (eventsData.length > 0) {
                setNewGuest(prev => ({ ...prev, eventId: eventsData[0].id || eventsData[0]._id }));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleCreateGuest = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/guests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newGuest,
                    user: user.uid,
                    event: newGuest.eventId
                })
            });
            if (response.ok) {
                setShowModal(false);
                setNewGuest({ name: "", email: "", category: "Friend", status: "Pending", eventId: events[0]?.id || events[0]?._id || "" });
                fetchData();
            }
        } catch (err) {
            console.error("Failed to add guest:", err);
        }
    };

    const toggleStatus = async (guestId, currentStatus) => {
        const newStatus = currentStatus === "Confirmed" ? "Pending" : "Confirmed";
        try {
            const response = await fetch(`${API_URL}/guests/${guestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setGuests(guests.map(g => g._id === guestId ? { ...g, status: newStatus } : g));
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleDeleteGuest = async (guestId) => {
        if (!window.confirm("Are you sure you want to remove this attendee?")) return;
        try {
            const response = await fetch(`${API_URL}/guests/${guestId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setGuests(guests.filter(g => g._id !== guestId));
            }
        } catch (err) {
            console.error("Failed to delete guest:", err);
        }
    };

    return (
        <div style={{ animation: "fade-up 0.5s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 850, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Guests & Strategic RSVPs</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.25rem" }}>Monitor attendance velocity and catering preferences in real-time.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    disabled={events.length === 0}
                    style={{ borderRadius: "14px", padding: "0.8rem 1.5rem", fontWeight: 700 }}
                >
                    + Add New Attendee
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 0", gap: "1rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Analyzing Attendance State...</p>
                </div>
            ) : guests.length === 0 ? (
                <div style={{ padding: "6rem 2rem", textAlign: "center", background: "#fff", borderRadius: "24px", border: "1.5px dashed var(--border-medium)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎟️</div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>Guest list is currently empty</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", maxWidth: "400px", margin: "0.75rem auto" }}>{events.length === 0 ? "Identify an event context before adding guests." : "Start populating your attendee list to see analytical growth."}</p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {guests.map(guest => (
                        <div key={guest._id} className="card" style={{ gridColumn: "span 4", padding: "1.75rem", border: "1.5px solid var(--border-subtle)", position: "relative" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontWeight: 850, fontSize: "1.15rem", color: "var(--text-primary)" }}>{guest.name}</h3>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem", fontWeight: 500 }}>{guest.email || "No digital contact provided"}</p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
                                    <div
                                        onClick={() => toggleStatus(guest._id, guest.status)}
                                        style={{
                                            padding: "0.35rem 0.75rem",
                                            borderRadius: "100px",
                                            background: guest.status === "Confirmed" ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                                            color: guest.status === "Confirmed" ? "var(--accent-success)" : "var(--text-muted)",
                                            fontSize: "0.65rem",
                                            fontWeight: 900,
                                            cursor: "pointer",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            border: `1px solid ${guest.status === "Confirmed" ? "rgba(16, 185, 129, 0.2)" : "var(--border-subtle)"}`,
                                            userSelect: "none",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {guest.status === "Confirmed" ? "✓ Confirmed" : "○ Pending"}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGuest(guest._id)}
                                        style={{
                                            background: "rgba(239, 68, 68, 0.05)",
                                            border: "1px solid rgba(239, 68, 68, 0.1)",
                                            color: "#ef4444",
                                            cursor: "pointer",
                                            padding: "0.4rem 0.6rem",
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            transition: "all 0.2s"
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
                                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.1)";
                                        }}
                                        title="Delete Guest"
                                    >
                                        Remove 🗑️
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: "1.75rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                                <div style={{
                                    fontSize: "0.7rem",
                                    padding: "0.35rem 0.75rem",
                                    background: "var(--accent-soft)",
                                    color: "var(--accent-primary)",
                                    borderRadius: "100px",
                                    fontWeight: 800,
                                    border: "1px solid var(--border-accent)"
                                }}>{guest.category}</div>
                                <div style={{
                                    fontSize: "0.7rem",
                                    padding: "0.35rem 0.75rem",
                                    background: "var(--bg-elevated)",
                                    color: "var(--text-secondary)",
                                    borderRadius: "100px",
                                    fontWeight: 700,
                                    border: "1px solid var(--border-subtle)"
                                }}>
                                    {events.find(e => (e.id || e._id) === guest.event)?.name || "External Sync"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "2.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", borderRadius: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>Onboard New Guest</h2>
                            <span
                                onClick={() => setShowModal(false)}
                                style={{ cursor: "pointer", color: "var(--text-muted)", fontWeight: 800, fontSize: "1.25rem" }}
                            >✕</span>
                        </div>
                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Full Identity</label>
                                <input className="auth-input" placeholder="e.g. Johnathan Doe" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} required style={{ borderRadius: "12px" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Operational Event</label>
                                <select
                                    className="auth-input"
                                    value={newGuest.eventId}
                                    onChange={e => setNewGuest({ ...newGuest, eventId: e.target.value })}
                                    required
                                    style={{ borderRadius: "12px", fontWeight: 600 }}
                                >
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Digital Contact</label>
                                <input className="auth-input" placeholder="john@domain.com" type="email" value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} style={{ borderRadius: "12px" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Classification</label>
                                    <select className="auth-input" value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })} style={{ borderRadius: "12px", fontWeight: 600 }}>
                                        <option>Friend</option>
                                        <option>Family</option>
                                        <option>VIP</option>
                                        <option>Business</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Initial RSVP</label>
                                    <select className="auth-input" value={newGuest.status} onChange={e => setNewGuest({ ...newGuest, status: e.target.value })} style={{ borderRadius: "12px", fontWeight: 600 }}>
                                        <option>Pending</option>
                                        <option>Confirmed</option>
                                        <option>Declined</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ flex: 1, borderRadius: "12px", fontWeight: 700 }}>Cancel</button>
                                <button className="btn btn-primary" type="submit" style={{ flex: 2, borderRadius: "12px", fontWeight: 800 }}>Confirm Onboarding</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
