import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
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
import { LogoLoader } from "../../components/ui/Loader";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import AiAssistant from "../../components/AiAssistant";
import { validateDateRange, getMinEndDate } from "../../utils/validation";

const API_URL = import.meta.env.VITE_API_URL;

export default function EventDetails() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user, syncTimestamp } = useOutletContext();    //all are states
    const { showConfirm, showAlert } = useDialog();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState(null);
    const [risks, setRisks] = useState([]);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        date: "",
        startDate: "",
        endDate: "",
        location: "",
        type: "Wedding",
        budget: ""
    });

    const fetchEventData = async () => {
        if (!eventId || !user) return;
        try {
            const [eventRes, healthRes, riskRes] = await Promise.all([
                fetch(`${API_URL}/events/${eventId}?user=${user.uid}&email=${user.email}`),
                fetch(`${API_URL}/ai/health/${eventId}`),
                fetch(`${API_URL}/ai/risk/${eventId}`)
            ]);

            if (!eventRes.ok) {
                if (eventRes.status === 403) {
                    addNotification("Access Restricted", "You do not have the clearance levels required for this tactical grid.");
                }
                throw new Error("Unauthorized or Event not found");
            }

            const eventData = await eventRes.json();
            const health = await healthRes.json();
            const riskData = await riskRes.json();

            setEvent(eventData);
            setHealthData(health);
            setRisks(riskData);
            setEditData({
                name: eventData.name,
                date: eventData.date,
                startDate: eventData.startDate || eventData.date || "",
                endDate: eventData.endDate || "",
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
    }, [eventId, user, syncTimestamp]);

    useEffect(() => {
        // Data-only effect, animations removed
    }, [loading, !!event]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Date range validation
        const startDateVal = editData.startDate || editData.date;
        if (startDateVal && editData.endDate) {
            const dateCheck = validateDateRange(startDateVal, editData.endDate);
            if (!dateCheck.valid) {
                if (showAlert) {
                    await showAlert("Invalid Date Range", dateCheck.message);
                } else {
                    alert(dateCheck.message);
                }
                return;
            }
        }

        setUpdateLoading(true);

        try {
            const response = await fetch(`${API_URL}/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editData.name,
                    date: editData.startDate || editData.date,
                    startDate: editData.startDate || editData.date,
                    endDate: editData.endDate || "",
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
        const confirmed = await showConfirm("Terminate Operation", "Are you sure you want to permanently delete this event? All associated operational data, vendor contracts, and analytics will be purged immediately.");
        if (confirmed) {
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
            <div style={{ padding: "2.5rem", minHeight: "100vh" }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: "2.5rem", mb: "3.5rem" }}>
                    <Skeleton animation="wave" variant="rounded" width={80} height={50} sx={{ borderRadius: '12px', bgcolor: 'var(--bg-elevated)' }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton animation="wave" height={50} width={300} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: "1rem" }}>
                        <Skeleton animation="wave" variant="rounded" width={50} height={50} sx={{ borderRadius: '12px', bgcolor: 'var(--bg-elevated)' }} />
                        <Skeleton animation="wave" variant="rounded" width={50} height={50} sx={{ borderRadius: '12px', bgcolor: 'var(--bg-elevated)' }} />
                    </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: "2rem" }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: "2rem" }}>
                        <Skeleton animation="wave" variant="rounded" height={250} sx={{ borderRadius: '24px', bgcolor: 'var(--bg-elevated)' }} />
                        <Skeleton animation="wave" variant="rounded" height={300} sx={{ borderRadius: '24px', bgcolor: 'var(--bg-elevated)' }} />
                    </Box>
                    <Skeleton animation="wave" variant="rounded" height={600} sx={{ borderRadius: '24px', bgcolor: 'var(--bg-elevated)' }} />
                </Box>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "transparent",
            minHeight: "100vh",
            color: "var(--text-primary)"
        }}>
            {/* Header Area */}
            <div className="stagger-detail events-header" style={{ marginBottom: "3.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1 }}>
                    <button
                        onClick={() => navigate("/events")}
                        style={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-subtle)",
                            width: "56px",
                            height: "56px",
                            borderRadius: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                            flexShrink: 0
                        }}
                    >
                        <ChevronLeft size={24} color="var(--text-secondary)" strokeWidth={2.5} />
                    </button>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                            <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: 0, color: "var(--text-primary)" }}>{event.name}</h1>
                            <span style={{
                                background: "rgba(255,165,0,0.1)",
                                color: "var(--accent-primary)",
                                fontSize: "12px",
                                fontWeight: 800,
                                padding: "6px 14px",
                                borderRadius: "100px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>{event.type}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "0.75rem", color: "var(--text-secondary)", fontWeight: 500, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Calendar size={16} />
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <span className="mobile-hide" style={{ width: "4px", height: "4px", background: "var(--border-subtle)", borderRadius: "50%" }}></span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <MapPin size={16} />
                                {event.location}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="events-header-buttons" style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={() => setShowEditModal(true)}
                        style={{
                            borderRadius: "14px",
                            padding: "1rem 1.5rem",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-surface)",
                            color: "var(--text-primary)",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            cursor: "pointer",
                            fontSize: "14px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                        }}>
                        <Settings size={18} color="var(--text-secondary)" /> Adjust Config
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            borderRadius: "14px",
                            padding: "1rem 1.5rem",
                            background: "rgba(255,0,0,0.1)",
                            border: "1px solid rgba(255,0,0,0.2)",
                            color: "#ff4444",
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

            <div className="event-details-split-grid" style={{ gap: "2.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    {/* Operational Pulse Diagnostic */}
                    <div style={{
                        background: "var(--bg-surface)",
                        padding: "3rem",
                        borderRadius: "32px",
                        border: "1px solid var(--border-subtle)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3.5rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 0.5rem", color: "var(--text-primary)" }}>Operational Pulse</h2>
                                <p style={{ color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>Live diagnostic benchmark for your {event.type.toLowerCase()} event.</p>
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

                        <div className="operational-pulse-split" style={{ gap: "3.5rem", alignItems: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                                <svg width="240" height="240" viewBox="0 0 100 100">
                                    <defs>
                                        <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor={getHealthColor(healthData?.score || 0)} />
                                            <stop offset="100%" stopColor={getHealthColor(healthData?.score || 0)} stopOpacity="0.8" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="44" fill="none" stroke="var(--bg-base)" strokeWidth="10" />
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
                                    <text x="50" y="52" textAnchor="middle" style={{ fontSize: "22px", fontWeight: 800, fill: "var(--text-primary)", fontFamily: "Outfit" }}>
                                        {healthData?.score || 0}<tspan style={{ fontSize: "11px", opacity: 0.5 }}>%</tspan>
                                    </text>
                                    <text x="50" y="65" textAnchor="middle" style={{ fontSize: "6px", fontWeight: 800, fill: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                                        Score
                                    </text>
                                </svg>
                                <div style={{
                                    position: "absolute",
                                    bottom: "-10px",
                                    background: "var(--bg-elevated)",
                                    padding: "6px 14px",
                                    borderRadius: "100px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                    border: "1px solid var(--border-subtle)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}>
                                    <div style={{ width: "6px", height: "6px", background: getHealthColor(healthData?.score || 0), borderRadius: "50%" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-primary)" }}>LIVE AI ENGINE</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                                {healthData && [
                                    { label: "Logistics", value: healthData.metrics.taskCompletion, color: "#3b82f6", icon: <LayoutList size={18} /> },
                                    { label: "Stability", value: Math.max(0, 100 - (healthData.metrics.budgetUsage > 100 ? (healthData.metrics.budgetUsage - 100) : 0)), color: "#10b981", icon: <IndianRupee size={18} /> },
                                    { label: "Synergy", value: healthData.metrics.vendorConfirmation, color: "#a855f7", icon: <Handshake size={18} /> },
                                    { label: "Velocity", value: healthData.metrics.rsvpRate, color: "#f59e0b", icon: <Zap size={18} /> },
                                ].map(item => (
                                    <div key={item.label}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 700, marginBottom: "0.75rem" }}>
                                            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span style={{ color: item.color, background: `${item.color}25`, width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
                                                {item.label}
                                            </span>
                                            <span style={{ color: "var(--text-primary)" }}>{item.value}%</span>
                                        </div>
                                        <div style={{ height: "6px", background: "var(--bg-elevated)", borderRadius: "100px" }}>
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
                                    background: risk.type === "CRITICAL" ? "rgba(220, 38, 38, 0.1)" : "rgba(217, 119, 6, 0.1)",
                                    border: `1px solid ${risk.type === "CRITICAL" ? "rgba(220, 38, 38, 0.2)" : "rgba(217, 119, 6, 0.2)"}`,
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
                                        background: risk.type === "CRITICAL" ? "#dc2626" : "#d97706",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0
                                    }}>
                                        <AlertTriangle size={20} color="#fff" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                            <h4 style={{ fontSize: "16px", fontWeight: 800, color: risk.type === "CRITICAL" ? "#ef4444" : "#f59e0b", margin: 0 }}>{risk.category} Risk Identified</h4>
                                            <span style={{
                                                fontSize: "10px",
                                                fontWeight: 900,
                                                color: risk.type === "CRITICAL" ? "#ef4444" : "#f59e0b",
                                                background: risk.type === "CRITICAL" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                textTransform: "uppercase"
                                            }}>{risk.type}</span>
                                        </div>
                                        <p style={{ fontSize: "14px", color: risk.type === "CRITICAL" ? "#fca5a5" : "#fcd34d", margin: "0 0 1rem", fontWeight: 600 }}>{risk.message}</p>
                                        <div style={{
                                            background: "rgba(0,0,0,0.2)",
                                            padding: "1rem",
                                            borderRadius: "16px",
                                            fontSize: "13px",
                                            color: "var(--text-secondary)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <Target size={14} color="var(--text-muted)" />
                                            <span><strong style={{ color: "var(--text-primary)" }}>Smart Vector:</strong> {risk.suggestion}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Strategic Shortcuts */}
                    <div style={{
                        background: "var(--bg-surface)",
                        padding: "2.5rem",
                        borderRadius: "32px",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem"
                    }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Strategic Shortcuts</h3>
                        <div className="grid-2-col" style={{ gap: "1rem" }}>
                            <button
                                onClick={() => navigate("/tasks")}
                                style={{ padding: "1.25rem", borderRadius: "18px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(37,99,235,0.15)"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                            >
                                <div style={{ background: "#2563eb", color: "#fff", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}>
                                    <LayoutList size={20} />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>Mission Tasks</span>
                            </button>
                            <button
                                onClick={() => navigate("/guests")}
                                style={{ padding: "1.25rem", borderRadius: "18px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.15)"; e.currentTarget.style.borderColor = "#10b981"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                            >
                                <div style={{ background: "#10b981", color: "#fff", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
                                    <Target size={20} />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>Guest RSVPs</span>
                            </button>
                            <button
                                onClick={() => navigate("/budget")}
                                style={{ padding: "1.25rem", borderRadius: "18px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.15)"; e.currentTarget.style.borderColor = "#f59e0b"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                            >
                                <div style={{ background: "#f59e0b", color: "#fff", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)" }}>
                                    <IndianRupee size={20} />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>Capital Log</span>
                            </button>
                            <button
                                onClick={() => navigate("/analytics")}
                                style={{ padding: "1.25rem", borderRadius: "18px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.15)"; e.currentTarget.style.borderColor = "#a855f7"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                            >
                                <div style={{ background: "#7e22ce", color: "#fff", padding: "10px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(126, 34, 206, 0.2)" }}>
                                    <Activity size={20} />
                                </div>
                                <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>Analytics</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    {/* Financial Summary */}
                    <div style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        padding: "2.5rem",
                        borderRadius: "32px",
                        color: "var(--text-primary)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(255,165,0,0.03)", borderRadius: "50%" }}></div>
                        <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem" }}>Budget Allocation</h3>
                        <div style={{ marginBottom: "2.5rem" }}>
                            <div style={{ fontSize: "42px", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>₹{parseInt(event.budget).toLocaleString('en-IN')}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500 }}>
                                <TrendingUp size={14} color="var(--accent-primary)" /> Recommended allocation for {event.type.toLowerCase()} niche.
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/vendors")}
                            style={{
                                width: "100%",
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-subtle)",
                                padding: "1.1rem",
                                borderRadius: "18px",
                                color: "var(--text-primary)",
                                fontWeight: 800,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.color = "var(--accent-primary)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        >Explore Vendor Matrix <ArrowRight size={16} /></button>
                    </div>

                    {/* Operational Vectors Tracking */}
                    <div style={{
                        background: "var(--bg-surface)",
                        padding: "2.5rem",
                        borderRadius: "32px",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem"
                    }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Analytical Vectors</h3>
                        {[
                            { label: "Critical Delays", value: healthData?.metrics.overdueTasks || 0, color: "#ef4444", icon: <AlertCircle size={18} />, bg: "rgba(239,68,68,0.1)" },
                            { label: "Guest RSVP Velocity", value: `${healthData?.metrics.rsvpRate || 0}%`, color: "#3b82f6", icon: <TrendingUp size={18} />, bg: "rgba(59,130,246,0.1)" },
                            { label: "Provider Synergy", value: `${healthData?.metrics.vendorConfirmation || 0}%`, color: "#10b981", icon: <Handshake size={18} />, bg: "rgba(16,185,129,0.1)" },
                            { label: "Deployment State", value: event.status, color: "#a855f7", icon: <Target size={18} />, bg: "rgba(168,85,247,0.1)" }
                        ].map(st => (
                            <div key={st.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem", background: "var(--bg-elevated)", borderRadius: "18px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: st.bg, border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: st.color, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>{st.icon}</div>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{st.label}</span>
                                </div>
                                <span style={{ fontSize: "14px", fontWeight: 800, color: st.color }}>{st.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Config Adjustment Modal */}
            {showEditModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 99999,
                    backdropFilter: "blur(12px)",
                    padding: "1.5rem",
                    overflowY: "auto"
                }}>
                    <div style={{
                        background: "#121214",
                        width: "100%",
                        maxWidth: "520px",
                        maxHeight: "85vh",
                        overflowY: "auto",
                        padding: "1.75rem 2rem",
                        borderRadius: "24px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.75)",
                        position: "relative",
                        margin: "auto"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <h2 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
                                    Adjust Context
                                </h2>
                                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                                    Update operational details and parameters for this event.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--text-muted)"
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Event Identity *
                                </label>
                                <input
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        background: "rgba(255, 255, 255, 0.03)",
                                        color: "var(--text-primary)",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Start Date *
                                    </label>
                                    <input 
                                        type="date" 
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem 1rem",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            background: "rgba(255, 255, 255, 0.03)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }} 
                                        value={editData.startDate || editData.date} 
                                        onChange={e => {
                                            const newStart = e.target.value;
                                            setEditData(prev => ({
                                                ...prev,
                                                date: newStart,
                                                startDate: newStart,
                                                endDate: prev.endDate && prev.endDate < newStart ? newStart : prev.endDate
                                            }));
                                        }} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        End Date (Optional)
                                    </label>
                                    <input 
                                        type="date" 
                                        min={getMinEndDate(editData.startDate || editData.date)}
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem 1rem",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            background: "rgba(255, 255, 255, 0.03)",
                                            color: "var(--text-primary)",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }} 
                                        value={editData.endDate} 
                                        onChange={e => setEditData({ ...editData, endDate: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Category
                                </label>
                                <select
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        background: "#18181b",
                                        color: "var(--text-primary)",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    value={editData.type}
                                    onChange={e => setEditData({ ...editData, type: e.target.value })}
                                >
                                    <option value="Wedding">Wedding</option>
                                    <option value="Hackathon">Hackathon</option>
                                    <option value="Tech Fest">Tech Fest</option>
                                    <option value="Tech Event">Tech Event</option>
                                    <option value="Conference">Conference</option>
                                    <option value="College Fest">College Fest</option>
                                    <option value="Birthday">Birthday</option>
                                    <option value="Corporate">Corporate</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Geographical Coordinates / Location
                                </label>
                                <input
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        background: "rgba(255, 255, 255, 0.03)",
                                        color: "var(--text-primary)",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    value={editData.location}
                                    onChange={e => setEditData({ ...editData, location: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Budget Allocation (₹)
                                </label>
                                <input
                                    type="number"
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        background: "rgba(255, 255, 255, 0.03)",
                                        color: "var(--text-primary)",
                                        fontSize: "15px",
                                        fontWeight: 800,
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    value={editData.budget}
                                    onChange={e => setEditData({ ...editData, budget: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: "0.85rem",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        background: "transparent",
                                        color: "var(--text-primary)",
                                        fontWeight: 800,
                                        cursor: "pointer"
                                    }}
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 2,
                                        padding: "0.85rem",
                                        borderRadius: "12px",
                                        border: "none",
                                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                        color: "#fff",
                                        fontWeight: 900,
                                        cursor: "pointer",
                                        boxShadow: "0 8px 20px rgba(249, 115, 22, 0.3)"
                                    }}
                                    disabled={updateLoading}
                                >
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
