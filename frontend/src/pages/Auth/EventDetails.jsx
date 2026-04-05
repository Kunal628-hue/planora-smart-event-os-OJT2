import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
    ChevronLeft,
    Settings,
    Trash2,
    AlertTriangle,
    LayoutList,
    IndianRupee,
    Handshake,
    Zap,
    AlertCircle,
    TrendingUp,
    Target,
    Activity,
    MapPin,
    Calendar,
    ArrowRight,
    X
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
        // Data-only effect, animations removed
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
                <div style={{ width: "50px", height: "50px", border: "5px solid var(--accent-primary)", borderRadius: "50%" }}></div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hydrating Event State...</p>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            {/* Header Area */}
            <div className="stagger-detail" style={{ display: "flex", alignItems: "center", gap: "2.5rem", marginBottom: "3.5rem" }}>
                <button
                    onClick={() => navigate("/events")}
                    style={{
                        background: "#fff",
                        border: "1px solid #f1f5f9",
                        width: "56px",
                        height: "56px",
                        borderRadius: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.03)"
                    }}
                >
                    <ChevronLeft size={24} color="#64748b" strokeWidth={2.5} />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: 0 }}>{event.name}</h1>
                        <span style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontSize: "12px",
                            fontWeight: 800,
                            padding: "6px 14px",
                            borderRadius: "100px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>{event.type}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Calendar size={16} />
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <span style={{ width: "4px", height: "4px", background: "#cbd5e1", borderRadius: "50%" }}></span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <MapPin size={16} />
                            {event.location}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={() => setShowEditModal(true)}
                        style={{
                            borderRadius: "14px",
                            padding: "1rem 1.5rem",
                            border: "1px solid #e2e8f0",
                            background: "#fff",
                            color: "#0f172a",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            cursor: "pointer",
                            fontSize: "14px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                        }}>
                        <Settings size={18} color="#64748b" /> Adjust Config
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            borderRadius: "14px",
                            padding: "1rem 1.5rem",
                            background: "#fff1f2",
                            border: "1px solid #fee2e2",
                            color: "#be123c",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}>
                        <Trash2 size={18} /> Terminate
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "2.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    {/* Operational Pulse Diagnostic */}
                    <div style={{
                        background: "#fff",
                        padding: "3rem",
                        borderRadius: "32px",
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.02)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3.5rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>Operational Pulse</h2>
                                <p style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>Live diagnostic benchmark for your {event.type.toLowerCase()} event.</p>
                            </div>
                            {healthData && (
                                <div style={{
                                    background: `${getHealthColor(healthData.score)}15`,
                                    color: getHealthColor(healthData.score),
                                    fontSize: "11px",
                                    fontWeight: 900,
                                    padding: "8px 16px",
                                    borderRadius: "100px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    border: `1px solid ${getHealthColor(healthData.score)}25`
                                }}>
                                    {healthData.score >= 80 ? "Mission Ready" : healthData.score >= 50 ? "Stable Context" : "Critical Divergence"}
                                </div>
                            )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "3.5rem", alignItems: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                                <svg width="240" height="240" viewBox="0 0 100 100">
                                    <defs>
                                        <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor={getHealthColor(healthData?.score || 0)} />
                                            <stop offset="100%" stopColor={getHealthColor(healthData?.score || 0)} stopOpacity="0.8" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="44" fill="none" stroke="#f8fafc" strokeWidth="10" />
                                    <circle
                                        className="health-ring-path"
                                        cx="50" cy="50" r="44"
                                        fill="none"
                                        stroke="url(#healthGradient)"
                                        strokeWidth="10"
                                        strokeDasharray="276.46"
                                        strokeDashoffset={276.46 * (1 - (healthData?.score || 0) / 100)}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                    />
                                    <text x="50" y="52" textAnchor="middle" style={{ fontSize: "22px", fontWeight: 800, fill: "#0f172a", fontFamily: "Outfit" }}>
                                        {healthData?.score || 0}<tspan style={{ fontSize: "11px", opacity: 0.5 }}>%</tspan>
                                    </text>
                                    <text x="50" y="65" textAnchor="middle" style={{ fontSize: "6px", fontWeight: 800, fill: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                                        Score
                                    </text>
                                </svg>
                                <div style={{
                                    position: "absolute",
                                    bottom: "-10px",
                                    background: "#fff",
                                    padding: "6px 14px",
                                    borderRadius: "100px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                    border: "1px solid #f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}>
                                    <div style={{ width: "6px", height: "6px", background: getHealthColor(healthData?.score || 0), borderRadius: "50%" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#1e293b" }}>LIVE AI ENGINE</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                                {healthData && [
                                    { label: "Logistics", value: healthData.metrics.taskCompletion, color: "#2563eb", icon: <LayoutList size={18} /> },
                                    { label: "Stability", value: Math.max(0, 100 - (healthData.metrics.budgetUsage > 100 ? (healthData.metrics.budgetUsage - 100) : 0)), color: "#10b981", icon: <IndianRupee size={18} /> },
                                    { label: "Synergy", value: healthData.metrics.vendorConfirmation, color: "#7e22ce", icon: <Handshake size={18} /> },
                                    { label: "Velocity", value: healthData.metrics.rsvpRate, color: "#f59e0b", icon: <Zap size={18} /> },
                                ].map(item => (
                                    <div key={item.label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 700, marginBottom: "0.75rem" }}>
                                            <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span style={{ color: item.color, background: `${item.color}15`, width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
                                                {item.label}
                                            </span>
                                            <span style={{ color: "#0f172a" }}>{item.value}%</span>
                                        </div>
                                        <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "100px" }}>
                                            <div style={{ width: `${item.value}%`, background: item.color, height: "100%", borderRadius: "100px" }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Risk Analysis */}
                    {risks.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {risks.map((risk, idx) => (
                                <div key={idx} style={{
                                    padding: "2rem",
                                    background: risk.type === "CRITICAL" ? "#fff1f2" : "#fffbeb",
                                    border: `1px solid ${risk.type === "CRITICAL" ? "#fee2e2" : "#fef3c7"}`,
                                    borderRadius: "24px",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "1.25rem",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
                                }}>
                                    <div style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "14px",
                                        background: risk.type === "CRITICAL" ? "#be123c" : "#d97706",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0
                                    }}>
                                        <AlertTriangle size={20} color="#fff" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                            <h4 style={{ fontSize: "16px", fontWeight: 800, color: risk.type === "CRITICAL" ? "#9f1239" : "#92400e", margin: 0 }}>{risk.category} Risk Identified</h4>
                                            <span style={{
                                                fontSize: "10px",
                                                fontWeight: 900,
                                                color: risk.type === "CRITICAL" ? "#be123c" : "#d97706",
                                                background: risk.type === "CRITICAL" ? "#be123c10" : "#d9770610",
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                textTransform: "uppercase"
                                            }}>{risk.type}</span>
                                        </div>
                                        <p style={{ fontSize: "14px", color: risk.type === "CRITICAL" ? "#be123c" : "#92400e", margin: "0 0 1rem", fontWeight: 600 }}>{risk.message}</p>
                                        <div style={{
                                            background: "rgba(255,255,255,0.4)",
                                            padding: "1rem",
                                            borderRadius: "16px",
                                            fontSize: "13px",
                                            color: "#1e293b",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <Target size={14} color="#64748b" />
                                            <span><strong>Smart Vector:</strong> {risk.suggestion}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    {/* Financial Summary */}
                    <div style={{
                        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                        padding: "2.5rem",
                        borderRadius: "32px",
                        color: "#fff",
                        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(255,255,255,0.03)", borderRadius: "50%" }}></div>
                        <h3 style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem" }}>Budget Allocation</h3>
                        <div style={{ marginBottom: "2.5rem" }}>
                            <div style={{ fontSize: "42px", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>₹{parseInt(event.budget).toLocaleString('en-IN')}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 500 }}>
                                <TrendingUp size={14} /> Recommended allocation for {event.type.toLowerCase()} niche.
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/vendors")}
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                padding: "1.1rem",
                                borderRadius: "18px",
                                color: "#fff",
                                fontWeight: 800,
                                cursor: "pointer",
                                backdropFilter: "blur(10px)"
                            }}
                        >Explore Vendor Matrix <ArrowRight size={16} /></button>
                    </div>

                    {/* Operational Vectors Tracking */}
                    <div style={{
                        background: "#fff",
                        padding: "2.5rem",
                        borderRadius: "32px",
                        border: "1px solid #f1f5f9",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem"
                    }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>Analytical Vectors</h3>
                        {[
                            { label: "Critical Delays", value: healthData?.metrics.overdueTasks || 0, color: "#ef4444", icon: <AlertCircle size={18} />, bg: "#fef2f2" },
                            { label: "Guest RSVP Velocity", value: `${healthData?.metrics.rsvpRate || 0}%`, color: "#2563eb", icon: <TrendingUp size={18} />, bg: "#eff6ff" },
                            { label: "Provider Synergy", value: `${healthData?.metrics.vendorConfirmation || 0}%`, color: "#10b981", icon: <Handshake size={18} />, bg: "#f0fdf4" },
                            { label: "Deployment State", value: event.status, color: "#6366f1", icon: <Target size={18} />, bg: "#f5f3ff" }
                        ].map(st => (
                            <div key={st.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem", background: "#f8fafc", borderRadius: "18px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#fff", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: st.color, boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>{st.icon}</div>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>{st.label}</span>
                                </div>
                                <span style={{ fontSize: "14px", fontWeight: 800, color: st.color }}>{st.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Config Adjustment Modal */}
            {showEditModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "#fff", width: "100%", maxWidth: "550px", padding: "3rem", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Adjust Context</h2>
                            <button onClick={() => setShowEditModal(false)} style={{ border: "none", background: "#f1f5f9", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Event Identity</label>
                                <input style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600 }} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Target Date</label>
                                    <input type="date" style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600 }} value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Logic Type</label>
                                    <select style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }} value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })}>
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
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Geographical Coordinates</label>
                                <input style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600 }} value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Budget Allocation (₹)</label>
                                <input type="number" style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "16px", fontWeight: 800 }} value={editData.budget} onChange={e => setEditData({ ...editData, budget: e.target.value })} required />
                            </div>
                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: "1.1rem", borderRadius: "14px", border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer" }}>Abort</button>
                                <button type="submit" style={{ flex: 2, padding: "1.1rem", borderRadius: "14px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)" }} disabled={updateLoading}>
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
