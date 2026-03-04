import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        date: "",
        location: "",
        type: "Wedding",
        budget: ""
    });

    const fetchEvent = async () => {
        if (!eventId || !user) return;
        try {
            const response = await fetch(`${API_URL}/events/${eventId}`);
            if (!response.ok) throw new Error("Event not found");
            const data = await response.json();

            // Security check: Only allow if it belongs to current user
            // In a real app, the backend should handle this, but keeping logic consistent
            if (data.user !== user.uid) {
                console.error("Unauthorized access");
                navigate("/events");
                return;
            }

            // Map backend fields to frontend names
            const mappedData = {
                id: data._id,
                name: data.title,
                date: data.date,
                location: data.location,
                type: data.description,
                budget: data.budget,
                status: data.status,
                user: data.user
            };

            setEvent(mappedData);
            setEditData({
                name: mappedData.name,
                date: mappedData.date,
                location: mappedData.location,
                type: mappedData.type,
                budget: mappedData.budget
            });
        } catch (err) {
            console.error("Fetch error:", err);
            navigate("/events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [eventId, user]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            try {
                const response = await fetch(`${API_URL}/events/${eventId}`, {
                    method: "DELETE"
                });
                if (response.ok) {
                    navigate("/events");
                }
            } catch (err) {
                console.error("Error deleting event:", err);
                alert("Failed to delete event.");
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);

        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editData.name,
                    date: editData.date,
                    location: editData.location,
                    description: editData.type,
                    budget: parseInt(editData.budget) || 0
                })
            });

            if (response.ok) {
                setShowEditModal(false);
                fetchEvent();
            } else {
                throw new Error("Failed to update");
            }
        } catch (err) {
            console.error("Error updating event:", err);
            alert("Failed to update event.");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button onClick={() => navigate("/events")} style={{ background: "none", border: "1px solid var(--border-subtle)", padding: "0.5rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{event.name}</h1>
                        <span style={{ padding: "0.3rem 0.7rem", borderRadius: "2rem", background: "var(--accent-soft)", color: "var(--accent-primary)", fontSize: "0.75rem", fontWeight: 700 }}>{event.type}</span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Event ID: {event.id}</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Event Summary Card */}
                <div className="card hover-lift" style={{ gridColumn: "span 8", padding: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Event Overview</h2>
                        <div style={{ padding: "0.4rem 0.8rem", borderRadius: "2rem", background: "#f0fdf4", color: "#16a34a", fontSize: "0.75rem", fontWeight: 800 }}>On Track</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current Status</label>
                                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: 700, color: "#16a34a", fontSize: "1rem" }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16a34a", boxShadow: "0 0 10px rgba(22, 163, 74, 0.4)" }}></div>
                                    {event.status}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Scheduled Date</label>
                                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                    <div style={{ padding: "0.5rem", background: "var(--bg-elevated)", borderRadius: "8px", color: "var(--accent-primary)" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    </div>
                                    <span style={{ fontSize: "1rem" }}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Primary Location</label>
                                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                    <div style={{ padding: "0.5rem", background: "var(--bg-elevated)", borderRadius: "8px", color: "var(--accent-primary)" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                    <span style={{ fontSize: "1rem" }}>{event.location}</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Allocated Budget</label>
                                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "baseline", gap: "0.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                                    <span style={{ fontSize: "1.5rem" }}>₹{parseInt(event.budget).toLocaleString()}</span>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>INR</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="card hover-lift" style={{ gridColumn: "span 4", padding: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1.25rem" }}>Quick Actions</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <button onClick={() => setShowEditModal(true)} className="btn btn-primary" style={{ width: "100%", justifyContent: "flex-start", background: "var(--accent-primary)", padding: "0.75rem 1rem", borderRadius: "12px" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            Edit Event Details
                        </button>
                        <button onClick={() => navigate("/vendors")} className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: "12px", border: "1px solid var(--border-subtle)", padding: "0.75rem 1rem" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
                            Manage Vendors
                        </button>
                        <button onClick={() => navigate("/guests")} className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: "12px", border: "1px solid var(--border-subtle)", padding: "0.75rem 1rem" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            Manage Guests
                        </button>
                        <button onClick={handleDelete} className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.1)", background: "rgba(239, 68, 68, 0.02)", color: "#ef4444", padding: "0.75rem 1rem" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            Delete Event
                        </button>
                    </div>
                </div>

                {/* Additional placeholders */}
                <div className="card hover-lift" style={{ gridColumn: "span 6", padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Guest RSVP Status</h3>
                        <div style={{ color: "var(--accent-primary)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>View All</div>
                    </div>
                    <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", background: "var(--bg-elevated)", borderRadius: "16px", border: "1px dashed var(--border-subtle)" }}>
                        <div style={{ width: 48, height: 48, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="var(--accent-primary)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, lineHeight: 1.5 }}>Guest management features coming soon. Track RSVPs, meals, and more.</p>
                    </div>
                </div>
                <div className="card hover-lift" style={{ gridColumn: "span 6", padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Vendor Checklist</h3>
                        <div style={{ color: "var(--accent-primary)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>View All</div>
                    </div>
                    <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", background: "var(--bg-elevated)", borderRadius: "16px", border: "1px dashed var(--border-subtle)" }}>
                        <div style={{ width: 48, height: 48, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="var(--accent-primary)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, lineHeight: 1.5 }}>Vendor contracts and payment tracking coming soon.</p>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2.5rem", animation: "fade-up 0.3s ease", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: 850, letterSpacing: "-0.02em" }}>Edit Event</h2>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Update your event information below.</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} style={{ background: "var(--bg-elevated)", border: "none", color: "var(--text-muted)", padding: "0.5rem", borderRadius: "10px", cursor: "pointer" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, marginBottom: "0.6rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Event Name</label>
                                <input
                                    className="auth-input"
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    required
                                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", height: "48px" }}
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, marginBottom: "0.6rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Date</label>
                                    <input
                                        type="date"
                                        className="auth-input"
                                        value={editData.date}
                                        onChange={e => setEditData({ ...editData, date: e.target.value })}
                                        required
                                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", height: "48px" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, marginBottom: "0.6rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Type</label>
                                    <select
                                        className="auth-input"
                                        value={editData.type}
                                        onChange={e => setEditData({ ...editData, type: e.target.value })}
                                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", height: "48px" }}
                                    >
                                        <option>Wedding</option>
                                        <option>Birthday</option>
                                        <option>Corporate</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, marginBottom: "0.6rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Location</label>
                                <input
                                    className="auth-input"
                                    value={editData.location}
                                    onChange={e => setEditData({ ...editData, location: e.target.value })}
                                    required
                                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", height: "48px" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, marginBottom: "0.6rem", textTransform: "uppercase", color: "var(--text-muted)" }}>Budget (INR)</label>
                                <input
                                    type="number"
                                    className="auth-input"
                                    value={editData.budget}
                                    onChange={e => setEditData({ ...editData, budget: e.target.value })}
                                    required
                                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", height: "48px" }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={updateLoading}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem",
                                    background: "var(--accent-primary)",
                                    borderRadius: "14px",
                                    fontWeight: 800,
                                    marginTop: "0.5rem",
                                    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.75rem",
                                    color: "#fff"
                                }}
                            >
                                {updateLoading ? (
                                    <>
                                        <div style={{ width: "18px", height: "18px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                                        Updating...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
