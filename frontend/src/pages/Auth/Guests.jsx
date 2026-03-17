import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";

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

    useEffect(() => {
        if (!loading && guests.length > 0) {
            animate('.guest-card', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(80),
                easing: 'easeOutExpo',
                duration: 800
            });
        }
    }, [loading, guests.length]);

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
        <div className="stagger-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                        Attendee <span className="gradient-text">Directory</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                        Monitor attendance velocity and catering preferences in real-time.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-lg"
                    disabled={events.length === 0}
                    style={{ borderRadius: "14px", padding: "1rem 2rem" }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "8px" }}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>
                    Add Attendee
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 0", gap: "1.25rem" }}>
                    <div style={{ width: "48px", height: "48px", border: "5px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Analyzing RSVPs...</p>
                </div>
            ) : guests.length === 0 ? (
                <div className="glass-panel" style={{ padding: "6rem 2rem", textAlign: "center", borderRadius: "32px", border: "2px dashed var(--border-medium)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🎟️</div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 850 }}>Guest list is currently empty</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem", maxWidth: "450px", margin: "1rem auto", fontSize: "1.1rem" }}>
                        {events.length === 0 ? "Identify an event context before adding guests. Create an event first." : "Start populating your attendee list to see analytical growth and rsvp velocity."}
                    </p>
                    {events.length > 0 && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: "1rem" }}>Invite Your First Guest</button>
                    )}
                </div>
            ) : (
                <div className="dashboard-grid">
                    {guests.map(guest => (
                        <div key={guest._id} className="glass-panel guest-card" style={{ gridColumn: "span 4", padding: "1.75rem", borderRadius: "24px", position: "relative", display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    background: "var(--accent-soft)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.25rem",
                                    color: "var(--accent-primary)",
                                    fontWeight: 900,
                                    border: "2px solid var(--border-accent)"
                                }}>
                                    {guest.name.charAt(0)}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
                                    <div
                                        onClick={() => toggleStatus(guest._id, guest.status)}
                                        className="category-badge"
                                        style={{
                                            background: guest.status === "Confirmed" ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                                            color: guest.status === "Confirmed" ? "var(--accent-success)" : "var(--text-muted)",
                                            cursor: "pointer",
                                            border: `1px solid ${guest.status === "Confirmed" ? "rgba(16, 185, 129, 0.2)" : "var(--border-subtle)"}`,
                                        }}
                                    >
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></span>
                                        {guest.status}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGuest(guest._id)}
                                        style={{ background: "none", border: "none", color: "var(--accent-danger)", cursor: "pointer", opacity: 0.6, fontSize: "0.75rem", fontWeight: 700 }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <h3 style={{ fontWeight: 850, fontSize: "1.2rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{guest.name}</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem", fontWeight: 500 }}>{guest.email || "No digital contact"}</p>
                            </div>

                            <div style={{ marginTop: "auto", display: "flex", gap: "0.6rem", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                                <span className="category-badge" style={{ background: "var(--bg-elevated)", color: "var(--accent-primary)", fontSize: "0.7rem" }}>
                                    {guest.category}
                                </span>
                                <span className="category-badge" style={{ background: "var(--bg-card)", color: "var(--text-muted)", fontSize: "0.7rem", border: "1px solid var(--border-subtle)" }}>
                                    {events.find(e => (e.id || e._id) === guest.event)?.name || "External Context"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(12px)" }}>
                    <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "3rem", borderRadius: "32px", boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>Onboard Guest</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "var(--bg-elevated)", border: "none", color: "var(--text-primary)", width: "36px", height: "36px", borderRadius: "12px", cursor: "pointer", fontWeight: 900 }}
                            >✕</button>
                        </div>
                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Identity</label>
                                <input className="auth-input" placeholder="e.g. Johnathan Doe" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} required style={{ borderRadius: "14px", padding: "1rem" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Event</label>
                                <select
                                    className="auth-input"
                                    value={newGuest.eventId}
                                    onChange={e => setNewGuest({ ...newGuest, eventId: e.target.value })}
                                    required
                                    style={{ borderRadius: "14px", padding: "1rem", fontWeight: 700 }}
                                >
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Digital Contact</label>
                                <input className="auth-input" placeholder="john@domain.com" type="email" value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} style={{ borderRadius: "14px", padding: "1rem" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Classification</label>
                                    <select className="auth-input" value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })} style={{ borderRadius: "14px", padding: "1rem", fontWeight: 700 }}>
                                        <option>Friend</option>
                                        <option>Family</option>
                                        <option>VIP</option>
                                        <option>Business</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Initial RSVP</label>
                                    <select className="auth-input" value={newGuest.status} onChange={e => setNewGuest({ ...newGuest, status: e.target.value })} style={{ borderRadius: "14px", padding: "1rem", fontWeight: 700 }}>
                                        <option>Pending</option>
                                        <option>Confirmed</option>
                                        <option>Declined</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1.25rem" }}>
                                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ flex: 1, borderRadius: "14px", fontWeight: 700 }}>Cancel</button>
                                <button className="btn btn-primary" type="submit" style={{ flex: 2, borderRadius: "14px", fontWeight: 900 }}>Confirm Onboarding</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
