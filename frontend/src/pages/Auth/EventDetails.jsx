import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
    ChevronLeft,
    Settings,
    Trash2,
    AlertTriangle,
    LayoutList,
    DollarSign,
    Handshake,
    Zap,
    AlertCircle,
    TrendingUp,
    Target,
    Activity,
    MapPin,
    Calendar,
    ArrowRight
} from "lucide-react";
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
            const [eventRes, healthRes, riskRes] = await Promise.all([
                fetch(`${API_URL}/events/${eventId}`),
                fetch(`${API_URL}/ai/health/${eventId}`),
                fetch(`${API_URL}/ai/risk/${eventId}`)
            ]);

            if (!eventRes.ok) throw new Error("Event not found");

            const eventData = await eventRes.json();
            const health = await healthRes.json();
            const riskData = await riskRes.json();

            if (eventData.userId !== user.uid && eventData.user !== user.uid) {
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

    useEffect(() => {
        if (!loading && event) {
            animate('.stagger-detail', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                easing: 'easeOutExpo',
                duration: 800
            });

            if (healthData) {
                animate('.health-ring-path', {
                    strokeDashoffset: [282.7, 282.7 * (1 - (healthData?.score || 0) / 100)],
                    easing: 'easeInOutSine',
                    duration: 1500,
                    delay: 500
                });
            }
        }
    }, [loading, !!event]);

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
                    type: editData.type,
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
            }
        }
    };

    const getHealthColor = (score) => {
        if (score >= 80) return "var(--accent-success)";
        if (score >= 50) return "var(--accent-warning)";
        return "var(--accent-danger)";
    };

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh", gap: "1.25rem" }}>
                <div style={{ width: "50px", height: "50px", border: "5px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hydrating Event State...</p>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="stagger-in" style={{ paddingBottom: "5rem" }}>
            {/* Header Area */}
            <div className="stagger-detail" style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "3rem" }}>
                <button onClick={() => navigate("/events")} className="btn-icon" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft size={24} strokeWidth={3} />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em" }}>{event.name}</h1>
                        <span className="category-badge" style={{ background: "var(--accent-soft)", color: "var(--accent-primary)", fontSize: "0.8rem", padding: "0.5rem 1rem" }}>{event.type}</span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>Predictive logistical intelligence active.</p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={() => setShowEditModal(true)} className="btn btn-ghost" style={{ borderRadius: "14px", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Settings size={18} /> Adjust Config
                    </button>
                    <button onClick={handleDelete} className="btn" style={{ borderRadius: "14px", fontWeight: 800, color: "var(--accent-danger)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Trash2 size={18} /> Terminate
                    </button>
                </div>
            </div>

            {/* AI Risk Vectoring */}
            {risks.length > 0 && (
                <div className="stagger-detail" style={{ marginBottom: "3rem" }}>
                    {risks.map((risk, idx) => (
                        <div key={idx} className="glass-panel" style={{
                            padding: "1.5rem 2rem",
                            background: risk.type === "CRITICAL" ? "rgba(239, 68, 68, 0.05)" : "rgba(245, 158, 11, 0.05)",
                            borderLeft: `6px solid ${risk.type === "CRITICAL" ? "var(--accent-danger)" : "var(--accent-warning)"}`,
                            borderRadius: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "1.5rem",
                            marginBottom: "1rem"
                        }}>
                            <div style={{ color: risk.type === "CRITICAL" ? "var(--accent-danger)" : "var(--accent-warning)" }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--text-primary)" }}>{risk.category}: {risk.message}</h4>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>Operational suggestion: {risk.suggestion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="dashboard-grid stagger-detail">
                {/* Visual Health Diagnostic */}
                <div className="glass-panel" style={{ gridColumn: "span 8", padding: "3rem", borderRadius: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em" }}>Operational Pulse</h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Diagnostic integrity based on {event.type} heuristics.</p>
                        </div>
                        {healthData && (
                            <div className="category-badge" style={{
                                background: `${getHealthColor(healthData.score)}20`,
                                color: getHealthColor(healthData.score),
                                fontSize: "0.9rem",
                                fontWeight: 900,
                                padding: "0.6rem 1.25rem"
                            }}>
                                {healthData.score >= 80 ? "Mission Ready" : healthData.score >= 50 ? "Stable Context" : "Critical Divergence"}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                            <svg width="220" height="220" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                                <circle
                                    className="health-ring-path"
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    stroke={getHealthColor(healthData?.score || 0)}
                                    strokeWidth="8"
                                    strokeDasharray="282.7"
                                    strokeDashoffset={282.7 * (1 - (healthData?.score || 0) / 100)}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                />
                                <text x="50" y="52" textAnchor="middle" style={{ fontSize: "20px", fontWeight: 900, fill: "var(--text-primary)" }}>
                                    {healthData?.score || 0}
                                </text>
                                <text x="50" y="65" textAnchor="middle" style={{ fontSize: "6px", fontWeight: 800, fill: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                                    Health
                                </text>
                            </svg>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {healthData && [
                                { label: "Logistics Tracking", value: healthData.metrics.taskCompletion, icon: <LayoutList size={20} /> },
                                { label: "Financial Stability", value: Math.max(0, 100 - (healthData.metrics.budgetUsage > 100 ? (healthData.metrics.budgetUsage - 100) : 0)), icon: <DollarSign size={20} /> },
                                { label: "Provider Synergy", value: healthData.metrics.vendorConfirmation, icon: <Handshake size={20} /> },
                                { label: "Interaction Velocity", value: healthData.metrics.rsvpRate, icon: <Zap size={20} /> },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 800, marginBottom: "0.75rem" }}>
                                        <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <span style={{ opacity: 0.8, color: "var(--accent-primary)" }}>{item.icon}</span> {item.label}
                                        </span>
                                        <span style={{ color: "var(--text-primary)" }}>{item.value}%</span>
                                    </div>
                                    <div className="progress-bar" style={{ height: "10px", background: "var(--bg-elevated)", borderRadius: "100px" }}>
                                        <div className="progress-fill" style={{ width: `${item.value}%`, background: getHealthColor(item.value), height: "100%", borderRadius: "100px" }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Event Parametrics */}
                <div className="glass-panel" style={{ gridColumn: "span 4", padding: "2.5rem", borderRadius: "32px", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 900, marginBottom: "2rem", letterSpacing: "-0.01em" }}>Parametric Data</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", flex: 1 }}>
                        <div style={{ padding: "1.5rem", background: "var(--bg-elevated)", borderRadius: "20px" }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Date</label>
                            <div style={{ marginTop: "0.5rem", fontWeight: 800, color: "var(--text-primary)", fontSize: "1.15rem" }}>
                                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        <div style={{ padding: "1.5rem", background: "var(--bg-elevated)", borderRadius: "20px" }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Coordinates</label>
                            <div style={{ marginTop: "0.5rem", fontWeight: 800, color: "var(--text-primary)", fontSize: "1.15rem" }}>{event.location}</div>
                        </div>
                        <div style={{ padding: "2rem", background: "var(--accent-soft)", borderRadius: "24px", border: "1.5px solid var(--border-accent)" }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Target Budget Allocation</label>
                            <div style={{ marginTop: "0.75rem", fontWeight: 950, color: "var(--accent-primary)", fontSize: "2.25rem", letterSpacing: "-0.04em" }}>₹{parseInt(event.budget).toLocaleString()}</div>
                        </div>
                    </div>
                    <button onClick={() => navigate("/vendors")} className="btn btn-primary" style={{ width: "100%", marginTop: "2.5rem", borderRadius: "16px", padding: "1.1rem", fontWeight: 900 }}>Financial Controller ➔</button>
                </div>

                {/* Analytical Mini-Summary */}
                <div className="glass-panel" style={{ gridColumn: "span 12", padding: "2rem", borderRadius: "24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
                    {[
                        { label: "Overdue Vectors", value: healthData?.metrics.overdueTasks || 0, color: "var(--accent-danger)", icon: <AlertCircle size={22} /> },
                        { label: "Attendee Velocity", value: `${healthData?.metrics.rsvpRate || 0}%`, color: "var(--accent-primary)", icon: <TrendingUp size={22} /> },
                        { label: "Synergy Readiness", value: `${healthData?.metrics.vendorConfirmation || 0}%`, color: "var(--accent-success)", icon: <Activity size={22} /> },
                        { label: "Current State", value: event.status, color: "var(--accent-primary)", icon: <Target size={22} /> }
                    ].map(st => (
                        <div key={st.label} style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: st.color }}>{st.icon}</div>
                            <div>
                                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>{st.label}</div>
                                <div style={{ fontSize: "1.25rem", fontWeight: 900, color: st.color }}>{st.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Config Adjustment Modal */}
            {showEditModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(12px)" }}>
                    <div className="glass-panel" style={{ width: "100%", maxWidth: "550px", padding: "3rem", borderRadius: "32px" }}>
                        <h2 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "2.5rem", letterSpacing: "-0.03em" }}>Adjust System Context</h2>
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase" }}>Project Identity</label>
                                <input className="auth-input" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} required style={{ borderRadius: "14px" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase" }}>Target Date</label>
                                    <input type="date" className="auth-input" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} required style={{ borderRadius: "14px" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase" }}>Logic Type</label>
                                    <select className="auth-input" value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })} style={{ borderRadius: "14px", fontWeight: 700 }}>
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
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase" }}>Coordinates</label>
                                <input className="auth-input" value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} required style={{ borderRadius: "14px" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase" }}>Budget Allocation (₹)</label>
                                <input type="number" className="auth-input" value={editData.budget} onChange={e => setEditData({ ...editData, budget: e.target.value })} required style={{ borderRadius: "14px" }} />
                            </div>
                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1.5rem" }}>
                                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-ghost" style={{ flex: 1, borderRadius: "14px" }}>Abort</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: "14px", fontWeight: 900 }} disabled={updateLoading}>
                                    {updateLoading ? "Synchronizing..." : "Apply Transformations"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AiAssistant eventId={eventId} />
        </div>
    );
}
