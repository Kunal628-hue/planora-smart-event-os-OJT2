import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import AiAssistant from "../../components/AiAssistant";

const API_URL = import.meta.env.VITE_API_URL;

export default function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState(null);
    const [risks, setRisks] = useState([]);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        date: "",
        location: "",
        type: "Wedding",
        budget: ""
    });

    const fetchEventData = async () => {
        if (!eventId || !user) return;
        try {
            // Fetch Event, Health, and Risks in parallel
            const [eventRes, healthRes, riskRes] = await Promise.all([
                fetch(`${API_URL}/events/${eventId}`),
                fetch(`${API_URL}/ai/health/${eventId}`),
                fetch(`${API_URL}/ai/risk/${eventId}`)
            ]);

            if (!eventRes.ok) throw new Error("Event not found");

            const eventData = await eventRes.json();
            const health = await healthRes.json();
            const riskData = await riskRes.json();

            // Security check
            if (eventData.userId !== user.uid && eventData.user !== user.uid) {
                console.error("Unauthorized access");
                navigate("/events");
                return;
            }

            setEvent(eventData);
            setHealthData(health);
            setRisks(riskData);
            setEditData({
                name: eventData.name,
                date: eventData.date,
                location: eventData.location,
                type: eventData.type,
                budget: eventData.budget
            });
        } catch (err) {
            console.error("Fetch error:", err);
            navigate("/events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventData();
    }, [eventId, user]);

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
                    type: editData.type, // Fixed: use type instead of description
                    budget: parseInt(editData.budget) || 0
                })
            });

            if (response.ok) {
                setShowEditModal(false);
                fetchEventData();
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

    const getHealthColor = (score) => {
        if (score >= 80) return "#10b981";
        if (score >= 50) return "#f59e0b";
        return "#ef4444";
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <div style={{ width: "50px", height: "50px", border: "5px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div style={{ paddingBottom: "5rem" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
                <button onClick={() => navigate("/events")} className="btn-icon" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <h1 style={{ fontSize: "2rem", fontWeight: 850, letterSpacing: "-0.02em" }}>{event.name}</h1>
                        <span style={{ padding: "0.4rem 0.8rem", borderRadius: "2rem", background: "var(--accent-soft)", color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: 800 }}>{event.type}</span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.3rem" }}>Predictive intelligence is active for this event.</p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => setShowEditModal(true)} className="btn btn-ghost" style={{ borderRadius: "12px", fontWeight: 700 }}>Edit Details</button>
                    <button onClick={handleDelete} className="btn" style={{ borderRadius: "12px", fontWeight: 700, color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}>Delete</button>
                </div>
            </div>

            {/* AI Risk Alerts */}
            {risks.length > 0 && (
                <div style={{ marginBottom: "2.5rem" }}>
                    {risks.map((risk, idx) => (
                        <div key={idx} style={{
                            padding: "1.25rem 1.5rem",
                            background: risk.type === "CRITICAL" ? "#fef2f2" : "#fffbeb",
                            borderLeft: `6px solid ${risk.type === "CRITICAL" ? "#ef4444" : "#f59e0b"}`,
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "1.25rem",
                            marginBottom: "1rem",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            <div style={{ color: risk.type === "CRITICAL" ? "#ef4444" : "#f59e0b" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            </div>
                            <div>
                                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1f2937" }}>{risk.category}: {risk.message}</h4>
                                <p style={{ fontSize: "0.85rem", color: "#4b5563", marginTop: "0.15rem" }}>Recommendation: {risk.suggestion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="dashboard-grid">
                {/* Event Health Hub */}
                <div className="card hover-lift" style={{ gridColumn: "span 8", padding: "2.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 850 }}>Intelligence Health Report</h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Real-time readiness assessment based on {event.type} metrics.</p>
                        </div>
                        {healthData && (
                            <div style={{
                                padding: "0.5rem 1rem",
                                borderRadius: "2rem",
                                background: `${getHealthColor(healthData.score)}15`,
                                color: getHealthColor(healthData.score),
                                fontSize: "0.85rem",
                                fontWeight: 800
                            }}>
                                {healthData.score >= 80 ? "Fully Ready" : healthData.score >= 50 ? "Approaching Ready" : "Attention Required"}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="health-gauge" style={{
                                width: 200,
                                height: 200,
                                borderWidth: "16px",
                                borderTopColor: getHealthColor(healthData?.score || 0),
                                boxShadow: `0 0 30px ${getHealthColor(healthData?.score || 0)}15`
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "4rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{healthData?.score || 0}</div>
                                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-muted)", marginTop: "0.5rem", textTransform: "uppercase" }}>Health</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {healthData && [
                                { label: "Task List", value: healthData.metrics.taskCompletion, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
                                { label: "Budget Stability", value: Math.max(0, 100 - (healthData.metrics.budgetUsage > 100 ? (healthData.metrics.budgetUsage - 100) : 0)), icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
                                { label: "Vendor Bookings", value: healthData.metrics.vendorConfirmation, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
                                { label: "Guest RSVPs", value: healthData.metrics.rsvpRate, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                                        <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.6rem" }}>{item.icon} {item.label}</span>
                                        <span style={{ color: "var(--text-primary)" }}>{item.value}%</span>
                                    </div>
                                    <div className="progress-bar" style={{ height: "8px", background: "var(--bg-elevated)" }}>
                                        <div className="progress-fill" style={{ width: `${item.value}%`, background: getHealthColor(item.value), height: "100%" }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Event Metadata */}
                <div className="card hover-lift" style={{ gridColumn: "span 4", padding: "2rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "1.5rem" }}>Core Information</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                        <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Scheduled Date</label>
                            <div style={{ marginTop: "0.5rem", fontWeight: 700, color: "var(--text-primary)", fontSize: "1.1rem" }}>
                                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Location</label>
                            <div style={{ marginTop: "0.5rem", fontWeight: 700, color: "var(--text-primary)", fontSize: "1.1rem" }}>{event.location}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Target Budget</label>
                            <div style={{ marginTop: "0.5rem", fontWeight: 900, color: "var(--accent-primary)", fontSize: "1.75rem", letterSpacing: "-0.02em" }}>₹{parseInt(event.budget).toLocaleString()}</div>
                        </div>
                    </div>
                    <button onClick={() => navigate("/vendors")} className="btn btn-primary" style={{ width: "100%", marginTop: "2rem", borderRadius: "12px", background: "var(--accent-primary)" }}>Manage Financials</button>
                </div>

                {/* Bottom Stats */}
                <div className="stat-card" style={{ gridColumn: "span 3" }}>
                    <div style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "#ef4444" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>TASKS OVERDUE</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#ef4444" }}>{healthData?.metrics.overdueTasks || 0}</div>
                </div>
                <div className="stat-card" style={{ gridColumn: "span 3" }}>
                    <div style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "var(--accent-primary)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 22h2" /><path d="M12 15v7" /><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" /></svg>
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>RSVP RATE</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 900 }}>{healthData?.metrics.rsvpRate || 0}%</div>
                </div>
                <div className="stat-card" style={{ gridColumn: "span 3" }}>
                    <div style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "var(--accent-primary)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13" /><polyline points="16 8 20 8 23 11 23 16 16 16" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>VENDORS READY</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 900 }}>{healthData?.metrics.vendorConfirmation || 0}%</div>
                </div>
                <div className="stat-card" style={{ gridColumn: "span 3" }}>
                    <div style={{ fontSize: "1.25rem", marginBottom: "0.75rem", color: "#16a34a" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>STATUS</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#16a34a" }}>{event.status}</div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(5px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "2rem" }}>Edit Event Details</h2>
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Event Name</label>
                                <input className="auth-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Date</label>
                                    <input type="date" className="auth-input" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Type</label>
                                    <select className="auth-input" value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })}>
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
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Location</label>
                                <input className="auth-input" value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Budget (INR)</label>
                                <input type="number" className="auth-input" value={editData.budget} onChange={e => setEditData({ ...editData, budget: e.target.value })} required />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: "var(--accent-primary)" }} disabled={updateLoading}>
                                    {updateLoading ? "Saving..." : "Save Changes"}
                                </button>
                                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AiAssistant eventId={eventId} />
        </div>
    );
}
