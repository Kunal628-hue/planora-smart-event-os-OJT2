import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import { UserPlus, Users, Trash2, Mail, Briefcase, Loader2, X, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Guests() {
    const { user, events, selectedEventId } = useOutletContext();
    const [guests, setGuests] = useState([]);
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
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/guests?user=${user.uid}`);
            const data = await res.json();
            setGuests(data);
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
        if (selectedEventId) {
            setNewGuest(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

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
                setNewGuest({
                    name: "",
                    email: "",
                    category: "Friend",
                    status: "Pending",
                    eventId: selectedEventId
                });
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

    const filteredGuests = guests.filter(g => g.event === selectedEventId);

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
                    style={{ borderRadius: "14px", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                    <UserPlus size={20} strokeWidth={3} />
                    Add Attendee
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 0", gap: "1.5rem" }}>
                    <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
                    <p style={{ fontSize: "0.9rem", fontWeight: 750, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Analyzing RSVPs...</p>
                </div>
            ) : filteredGuests.length === 0 ? (
                <div className="premium-dark-panel modal-reveal" style={{ padding: "6rem 2rem", textAlign: "center", margin: "2rem 0", position: "relative", overflow: "hidden" }}>
                    <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
                        <div className="anim-float" style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.1)" }}>
                            <Users size={40} color="var(--accent-primary)" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 850, color: "#fff" }}>Guest list is currently empty</h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "1rem", maxWidth: "450px", margin: "1rem auto", fontSize: "1.1rem", fontWeight: 500 }}>
                        {events.length === 0 ? "Identify an event context before adding guests. Create an event first." : "Start populating your attendee list to see analytical growth and rsvp velocity."}
                    </p>
                    {events.length > 0 && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: "1.5rem", borderRadius: "12px", padding: "0.8rem 2rem" }}>Invite Your First Guest</button>
                    )}
                </div>
            ) : (
                <div className="dashboard-grid">
                    {filteredGuests.map(guest => (
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
                                        style={{ background: "rgba(239, 68, 68, 0.08)", border: "none", color: "var(--accent-danger)", cursor: "pointer", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                                        className="hover-lift"
                                        title="Remove Attendee"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <h3 style={{ fontWeight: 850, fontSize: "1.2rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{guest.name}</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.4rem", fontWeight: 500 }}>
                                    <Mail size={14} style={{ opacity: 0.6 }} />
                                    {guest.email || "No digital contact"}
                                </div>
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
                    <div className="glass-panel-dark modal-reveal" style={{ width: "100%", maxWidth: "500px", padding: "3rem", borderRadius: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--accent-soft)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Users size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "1.65rem", fontWeight: 950, letterSpacing: "-0.04em", margin: 0 }}>Onboard Guest</h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>Register a new attendee for analysis.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="hover-lift"
                                style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-subtle)", color: "var(--text-primary)", width: "36px", height: "36px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            ><X size={18} strokeWidth={3} /></button>
                        </div>
                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Identity</label>
                                <div style={{ position: "relative" }}>
                                    <UserPlus size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8 }} />
                                    <input className="auth-input" placeholder="e.g. Johnathan Doe" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} required style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 3.25rem", fontWeight: 600 }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Event</label>
                                <div style={{ position: "relative" }}>
                                    <Calendar size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8 }} />
                                    <select
                                        className="auth-input"
                                        value={newGuest.eventId}
                                        onChange={e => setNewGuest({ ...newGuest, eventId: e.target.value })}
                                        required
                                        style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 3.25rem", fontWeight: 750 }}
                                    >
                                        {events.map(event => (
                                            <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Digital Contact</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8 }} />
                                    <input className="auth-input" placeholder="john@domain.com" type="email" value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 3.25rem", fontWeight: 600 }} />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Classification</label>
                                    <select className="auth-input" value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })} style={{ borderRadius: "14px", padding: "1.1rem", fontWeight: 750 }}>
                                        <option>Friend</option>
                                        <option>Family</option>
                                        <option>VIP</option>
                                        <option>Business</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Initial RSVP</label>
                                    <select className="auth-input" value={newGuest.status} onChange={e => setNewGuest({ ...newGuest, status: e.target.value })} style={{ borderRadius: "14px", padding: "1.1rem", fontWeight: 750 }}>
                                        <option>Pending</option>
                                        <option>Confirmed</option>
                                        <option>Declined</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1.25rem" }}>
                                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ flex: 1, borderRadius: "16px", fontWeight: 750, padding: "1.1rem" }}>Cancel</button>
                                <button className="btn btn-primary shadow-glow hover-lift" type="submit" style={{ flex: 2, borderRadius: "16px", fontWeight: 900, padding: "1.1rem" }}>Confirm Onboarding</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
