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
                setNewGuest(prev => ({ ...prev, eventId: eventsData[0].id }));
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
                setNewGuest({ name: "", email: "", category: "Friend", status: "Pending", eventId: events[0]?.id || "" });
                fetchData();
            }
        } catch (err) {
            console.error("Failed to add guest:", err);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Guests & RSVPs</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Track attendance and meal preferences.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    disabled={events.length === 0}
                    style={{ background: "var(--accent-primary)", borderRadius: "50px" }}
                >
                    Add Guest
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : guests.length === 0 ? (
                <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>Guest list empty</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>{events.length === 0 ? "Create an event first to add guests." : "Start by adding your first attendee."}</p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {guests.map(guest => (
                        <div key={guest._id} className="card hover-lift" style={{ gridColumn: "span 4", padding: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <h3 style={{ fontWeight: 850, fontSize: "1.1rem" }}>{guest.name}</h3>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{guest.email || "No email provided"}</p>
                                </div>
                                <div style={{
                                    padding: "0.3rem 0.6rem",
                                    borderRadius: "6px",
                                    background: guest.status === "Confirmed" ? "#f0fdf4" : guest.status === "Declined" ? "#fef2f2" : "var(--bg-elevated)",
                                    color: guest.status === "Confirmed" ? "#16a34a" : guest.status === "Declined" ? "#ef4444" : "var(--text-muted)",
                                    fontSize: "0.7rem",
                                    fontWeight: 800
                                }}>
                                    {guest.status}
                                </div>
                            </div>

                            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", background: "var(--accent-soft)", color: "var(--accent-primary)", borderRadius: "6px", fontWeight: 700 }}>{guest.category}</span>
                                <span style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", background: "var(--bg-elevated)", borderRadius: "6px", fontWeight: 600 }}>
                                    {events.find(e => e.id === guest.event)?.name || "External"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "1.5rem" }}>Add New Guest</h2>
                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Guest Name</label>
                                <input className="auth-input" placeholder="e.g. John Doe" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} required />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Event</label>
                                <select
                                    className="auth-input"
                                    value={newGuest.eventId}
                                    onChange={e => setNewGuest({ ...newGuest, eventId: e.target.value })}
                                    required
                                >
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Email Address</label>
                                <input className="auth-input" placeholder="john@example.com" type="email" value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Category</label>
                                    <select className="auth-input" value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })}>
                                        <option>Friend</option>
                                        <option>Family</option>
                                        <option>VIP</option>
                                        <option>Vendor</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Status</label>
                                    <select className="auth-input" value={newGuest.status} onChange={e => setNewGuest({ ...newGuest, status: e.target.value })}>
                                        <option>Pending</option>
                                        <option>Confirmed</option>
                                        <option>Declined</option>
                                    </select>
                                </div>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: "1rem", background: "var(--accent-primary)" }}>Add Guest</button>
                            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ width: "100%" }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
