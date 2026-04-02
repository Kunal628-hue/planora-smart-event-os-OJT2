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
            let url = `${API_URL}/guests?user=${user.uid}`;
            if (selectedEventId) url += `&eventId=${selectedEventId}`;
            const res = await fetch(url);
            const data = await res.json();
            setGuests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedEventId]);

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
        const statusCycle = { "Pending": "Confirmed", "Confirmed": "Declined", "Declined": "Pending" };
        const newStatus = statusCycle[currentStatus] || "Pending";
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

    const filteredGuests = selectedEventId
        ? guests.filter(g => (g.event?._id || g.event) === selectedEventId)
        : guests;

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>
                        Attendee <span style={{ color: "#2563eb" }}>Directory</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                        Monitor attendance velocity and catering preferences in real-time.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    disabled={events.length === 0}
                    style={{
                        borderRadius: "16px",
                        padding: "1rem 2rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        fontWeight: 800,
                        fontSize: "15px",
                        cursor: "pointer",
                        boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
                        transition: "all 0.2s ease"
                    }}
                >
                    <UserPlus size={20} strokeWidth={3} />
                    <span>Add Attendee</span>
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10rem 0", gap: "1.5rem" }}>
                    <div style={{ width: "48px", height: "48px", border: "5px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Analyzing RSVPs...</p>
                </div>
            ) : filteredGuests.length === 0 ? (
                <div style={{
                    padding: "8rem 2rem",
                    textAlign: "center",
                    borderRadius: "40px",
                    background: "#fff",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "center" }}>
                        <div style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "32px",
                            background: "#eff6ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#2563eb"
                        }}>
                            <Users size={48} strokeWidth={2.5} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem" }}>Guest list is empty</h2>
                    <p style={{ color: "#64748b", margin: "0 auto 2.5rem", maxWidth: "450px", fontSize: "1.1rem", fontWeight: 500, lineHeight: "1.6" }}>
                        {events.length === 0 ? "Identify an event context before adding guests. Create an event first to begin tracking." : "Start populating your attendee list to see analytical growth and rsvp velocity."}
                    </p>
                    {events.length > 0 && (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                background: "#fff",
                                border: "1.5px solid #e2e8f0",
                                padding: "1rem 2rem",
                                borderRadius: "14px",
                                fontWeight: 800,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >Invite Your First Guest</button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "2rem"
                }}>
                    {filteredGuests.map(guest => (
                        <div key={guest._id} className="guest-card" style={{
                            background: "#fff",
                            padding: "2rem",
                            borderRadius: "32px",
                            border: "1px solid #f1f5f9",
                            position: "relative",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.3s ease"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                <div style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "18px",
                                    background: "#f8fafc",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.4rem",
                                    color: "#2563eb",
                                    fontWeight: 800,
                                    border: "1px solid #f1f5f9"
                                }}>
                                    {guest.name.charAt(0)}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                                    <div
                                        onClick={() => toggleStatus(guest._id, guest.status)}
                                        style={{
                                            background: guest.status === "Confirmed" ? "#f0fdf4" : guest.status === "Declined" ? "#fff1f2" : "#f8fafc",
                                            color: guest.status === "Confirmed" ? "#10b981" : guest.status === "Declined" ? "#ef4444" : "#64748b",
                                            cursor: "pointer",
                                            border: `1px solid ${guest.status === "Confirmed" ? "#10b98120" : guest.status === "Declined" ? "#ef444420" : "#64748b20"}`,
                                            fontWeight: 800,
                                            padding: "6px 14px",
                                            borderRadius: "100px",
                                            fontSize: "11px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em"
                                        }}
                                    >
                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></div>
                                        {guest.status}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGuest(guest._id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#94a3b8",
                                            cursor: "pointer",
                                            padding: "0",
                                            transition: "color 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = "#ef4444"}
                                        onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <h3 style={{ fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>{guest.name}</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
                                    <Mail size={14} style={{ opacity: 0.8 }} />
                                    {guest.email || "No digital contact"}
                                </div>
                            </div>

                            <div style={{ marginTop: "auto", display: "flex", gap: "0.6rem", flexWrap: "wrap", paddingTop: "1.25rem", borderTop: "1px solid #f1f5f9" }}>
                                <span style={{
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    background: "#eff6ff",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    color: "#2563eb",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    {guest.category}
                                </span>
                                <span style={{
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    background: "#f1f5f9",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    {events.find(e => (e.id || e._id) === guest.event)?.name || "External Context"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "#fff", width: "100%", maxWidth: "520px", padding: "3rem", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", animation: "modalIn 0.3s ease-out" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Users size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Onboard Guest</h2>
                                    <p style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 500, margin: "0.25rem 0 0" }}>Register a new attendee for analysis.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "#f1f5f9", border: "none", color: "#64748b", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            ><X size={20} strokeWidth={3} /></button>
                        </div>
                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Identity</label>
                                <input style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600 }} placeholder="e.g. Johnathan Doe" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} required />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Event</label>
                                <select
                                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }}
                                    value={newGuest.eventId}
                                    onChange={e => setNewGuest({ ...newGuest, eventId: e.target.value })}
                                    required
                                >
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Classification</label>
                                    <select style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }} value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })}>
                                        <option>Friend</option>
                                        <option>Family</option>
                                        <option>VIP</option>
                                        <option>Business</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Initial RSVP</label>
                                    <select style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }} value={newGuest.status} onChange={e => setNewGuest({ ...newGuest, status: e.target.value })}>
                                        <option>Pending</option>
                                        <option>Confirmed</option>
                                        <option>Declined</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "1.1rem", borderRadius: "14px", border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" style={{ flex: 1.5, padding: "1.1rem", borderRadius: "14px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)" }}>Confirm Onboarding</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes modalIn {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .guest-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                }
            `}</style>
        </div>
    );
}
