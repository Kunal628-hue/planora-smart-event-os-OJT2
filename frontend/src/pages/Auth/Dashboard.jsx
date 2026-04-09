import { useState, useEffect, lazy, Suspense } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ArrowRight,
    LayoutDashboard,
    RefreshCw,
    Calendar,
    DollarSign,
    Activity,
    Users,
    ChevronRight,
    Search,
    Sparkles,
    ShieldCheck,
    Utensils,
    Music,
    Building,
    MapPin,
    Star,
    X,
    Check,
    AlertCircle,
    Phone,
    Mail
} from "lucide-react";
import { NeuralLoader } from "../../components/ui/Loader";

const AiAssistant = lazy(() => import("../../components/AiAssistant"));

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, events, selectedEventId, syncTimestamp, addNotification } = useOutletContext();
    const [healthData, setHealthData] = useState(null);
    const [risks, setRisks] = useState([]);
    const [budgetOpts, setBudgetOpts] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchAiInsights = async (eventId) => {
        if (!eventId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [healthRes, riskRes, budgetRes] = await Promise.all([
                fetch(`${API_URL}/ai/health/${eventId}`),
                fetch(`${API_URL}/ai/risk/${eventId}`),
                fetch(`${API_URL}/ai/budget-opt/${eventId}`)
            ]);

            const health = healthRes.ok ? await healthRes.json() : null;
            const riskData = riskRes.ok ? await riskRes.json() : [];
            const budgetData = budgetRes.ok ? await budgetRes.json() : [];

            setHealthData(health);
            setRisks(riskData);
            setBudgetOpts(budgetData);
            
            // Comprehensive Alert Logic
            if (health) {
                if (health.metrics.overdueTasks > 0) {
                    addNotification("Operational Lag", `You have ${health.metrics.overdueTasks} overdue tasks in this event context.`);
                }
                if (health.summary === "Critical" || health.summary === "At Risk") {
                    addNotification("Health Warning", `Event health state is currently '${health.summary}'. Intervention required.`);
                }
            }

            if (riskData.some(r => r.impact === "High")) {
                addNotification("Risk Alert", "High-impact risk factors identified. Review the Intelligence Board.");
            }

            const event = events.find(e => (e.id || e._id) === eventId);
            if (event) {
                const [timelineRes, vendorRes] = await Promise.all([
                    fetch(`${API_URL}/ai/timeline?type=${event.type || "Wedding"}`),
                    fetch(`${API_URL}/ai/vendors?type=${event.type || "Wedding"}`)
                ]);
                const timelineData = timelineRes.ok ? await timelineRes.json() : [];
                const vendorData = vendorRes.ok ? await vendorRes.json() : [];
                setTimeline(timelineData);
                setVendors(vendorData);

                // Budget & Deadline Checks
                const daysLeft = getDaysToEvent(event.date);
                if (daysLeft > 0 && daysLeft <= 7) {
                    addNotification("Approaching Deadline", `${event.name} is only ${daysLeft} days away. Finalize all vendor logistics.`);
                }

                if (budgetData.length > 0) {
                    const totalSpent = budgetData.reduce((sum, b) => sum + (parseInt(b.optimized) || 0), 0);
                    if (totalSpent > (parseInt(event.budget) || 0)) {
                        addNotification("Budget Exceeded", `Total allocation (₹${totalSpent}) exceeds defined budget for this event.`);
                    }
                }
            }

        } catch (err) {
            console.error("AI Insights fetch error:", err);
            setError("Failed to fetch event data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEventId) {
            fetchAiInsights(selectedEventId);
        } else if (events.length === 0) {
            setLoading(false);
        }
    }, [selectedEventId, events, syncTimestamp]);

    const [selectedVendorModal, setSelectedVendorModal] = useState(null);

    const getDaysToEvent = (eventDate) => {
        if (!eventDate) return 0;
        const today = new Date();
        const target = new Date(eventDate);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const getHealthColor = (score) => {
        if (score >= 80) return "#10b981"; // Success Green
        if (score >= 50) return "#f59e0b"; // Warning Orange
        return "#ef4444"; // Danger Red
    };

    const getBudgetColor = (usage) => {
        if (usage <= 80) return "#10b981";
        if (usage <= 100) return "#f59e0b";
        return "#ef4444";
    };

    const handleResolve = () => {
        if (risks.length === 0) return;
        const category = risks[0].category;

        if (category === "Timeline") navigate("/tasks");
        else if (category === "Budget" || category === "Partners") navigate("/vendors");
        else if (category === "Audience" || category === "Guests") navigate("/guests");
        else navigate("/events");
    };

    const getCategoryStyles = (service) => {
        const styles = {
            "Catering": { bg: "#fff7ed", color: "#c2410c", icon: <Utensils size={14} /> },
            "Decor": { bg: "#faf5ff", color: "#7e22ce", icon: <Sparkles size={14} /> },
            "AV": { bg: "#eff6ff", color: "#1d4ed8", icon: <Music size={14} /> },
            "Venue": { bg: "#f0fdf4", color: "#15803d", icon: <Building size={14} /> },
            "Other": { bg: "#f8fafc", color: "#475569", icon: <MapPin size={14} /> }
        };
        return styles[service] || styles["Other"];
    };

    const safeEvents = Array.isArray(events) ? events : [];

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
                <NeuralLoader text="Scanning Neural Pathways..." />
            </div>
        );
    }

    if (safeEvents.length === 0 && !loading) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "6rem 2rem",
                textAlign: "center"
            }}>
                <div style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "32px",
                    padding: "4rem 3rem",
                    maxWidth: "600px",
                    width: "100%",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.05)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{
                        position: "absolute",
                        top: "-50px",
                        left: "-50px",
                        width: "150px",
                        height: "150px",
                        background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
                        borderRadius: "50%",
                        zIndex: 0
                    }}></div>

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            borderRadius: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 2rem",
                            boxShadow: "0 15px 30px rgba(37, 99, 235, 0.25)",
                            transform: "rotate(-5deg)"
                        }}>
                            <Sparkles size={36} color="#fff" />
                        </div>

                        <h1 style={{
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            color: "#1e293b",
                            marginBottom: "1rem",
                            letterSpacing: "-0.04em",
                            lineHeight: 1.1
                        }}>
                            Welcome to <span style={{ color: "#2563eb" }}>Planora OS</span>.
                        </h1>

                        <p style={{
                            fontSize: "1.05rem",
                            color: "#64748b",
                            marginBottom: "2.5rem",
                            maxWidth: "400px",
                            marginInline: "auto",
                            lineHeight: 1.6,
                            fontWeight: 500
                        }}>
                            The next-generation workspace for event managers. Connect your first project to unlock AI-powered insights and real-time automation.
                        </p>

                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                            <button
                                className="btn btn-primary"
                                style={{
                                    padding: "1rem 2.5rem",
                                    borderRadius: "14px",
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)"
                                }}
                                onClick={() => navigate('/events')}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "3rem", display: "flex", gap: "2rem" }}>
                    {[
                        { icon: <ShieldCheck size={18} />, label: "Secure Data" },
                        { icon: <Activity size={18} />, label: "Real-time Sync" },
                        { icon: <LayoutDashboard size={18} />, label: "Smart Layout" }
                    ].map((feat, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
                            <span style={{ color: "#2563eb" }}>{feat.icon}</span>
                            {feat.label}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const selectedEvent = events.find(e => (e.id || e._id) === selectedEventId);
    const daysRemaining = getDaysToEvent(selectedEvent?.date);

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a",
        }}>
            {/* Glossy Top Alert Bar */}
            {risks.length > 0 && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 20px",
                    background: "rgba(255, 241, 242, 0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 228, 230, 0.5)",
                    borderRadius: "12px",
                    marginBottom: "2rem",
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(225, 29, 72, 0.08)",
                    animation: "slideDown 0.5s ease-out"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#be123c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <AlertTriangle size={14} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 700, color: "#9f1239" }}>Action Item</span>
                        <span style={{ color: "#be123c", fontWeight: 500 }}>{risks[0].message}</span>
                    </div>
                    <button
                        onClick={handleResolve}
                        aria-label="Resolve active risk"
                        style={{ color: "#be123c", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", border: "none", background: "none", cursor: "pointer" }}
                    >
                        Resolve Now <ArrowRight size={14} />
                    </button>
                </div>
            )}

            {/* Premium 3-Column KPI Strip */}
            <div className="responsive-grid-3" style={{
                marginBottom: "2.5rem"
            }}>
                {[
                    { label: "Health Score", value: `${healthData?.score || 0}%`, color: getHealthColor(healthData?.score || 0), desc: "Live Project Health" },
                    { label: "Budget Utilisation", value: `${healthData?.metrics?.budgetUsage || 0}%`, color: getBudgetColor(healthData?.metrics?.budgetUsage || 0), desc: "Real-time Spending" },
                    { label: "Days to Event", value: daysRemaining, color: "#2563eb", desc: "Countdown Active" }
                ].map((kpi, i) => (
                    <div key={i} style={{
                        padding: "1.75rem",
                        background: "#fff",
                        border: "1px solid #f1f5f9",
                        borderRadius: "20px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden"
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.05)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.02)";
                    }}
                >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{kpi.label}</div>
                            {i === 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <div style={{ width: "6px", height: "6px", background: kpi.color, borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
                                    <span style={{ fontSize: "10px", fontWeight: 800, color: kpi.color, textTransform: "uppercase" }}>Live</span>
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: "48px", fontWeight: 800, color: kpi.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{kpi.value}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "0.5rem", fontWeight: 500 }}>{kpi.desc}</div>
                    </div>
                ))}
            </div>

            {/* Split Row */}
            <div className="responsive-split" style={{
                marginBottom: "2.5rem"
            }}>
                {/* Milestone Timeline */}
                <div style={{
                    background: "#fff",
                    border: "1px solid #f1f5f9",
                    padding: "2rem",
                    borderRadius: "24px",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.01)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                        <div style={{ fontSize: "14px", color: "#0f172a", fontWeight: 700, letterSpacing: "-0.01em" }}>Milestone Timeline</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, background: "#f8fafc", padding: "4px 10px", borderRadius: "8px" }}>Auto-suggested by AI</div>
                    </div>

                    <div style={{ position: "relative", padding: "0 1.5rem" }}>
                        <div style={{
                            position: "absolute",
                            top: "7px",
                            left: "0",
                            right: "0",
                            height: "2px",
                            background: "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
                            borderRadius: "10px"
                        }}></div>

                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                            {timeline.slice(0, 5).map((step, idx) => {
                                // Find the CURRENT active step (the first one where we have MORE or equal days left than the milestone)
                                const currentPhaseIdx = timeline.findIndex(s => daysRemaining >= s.daysBefore);
                                const isActive = idx === (currentPhaseIdx === -1 ? timeline.length - 1 : currentPhaseIdx);
                                const isPast = idx < (currentPhaseIdx === -1 ? timeline.length - 1 : currentPhaseIdx);

                                return (
                                    <div key={idx} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px", flex: 1 }}>
                                        <div style={{
                                            width: "16px",
                                            height: "16px",
                                            borderRadius: "50%",
                                            background: isActive ? "#2563eb" : (isPast ? "#d1fae5" : "#fff"),
                                            border: `3.5px solid ${isActive ? "#dbeafe" : (isPast ? "#10b981" : "#f1f5f9")}`,
                                            zIndex: 2,
                                            boxShadow: isActive ? "0 4px 10px rgba(37, 99, 235, 0.4)" : "none",
                                            transition: "all 0.3s ease"
                                        }}></div>
                                        <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
                                            <div style={{
                                                fontSize: "12px",
                                                fontWeight: 700,
                                                color: isActive ? "#2563eb" : (isPast ? "#10b981" : "#0f172a"),
                                                marginBottom: "2px"
                                            }}>
                                                {step.title?.split(' ')[0]}
                                            </div>
                                            <div style={{ fontSize: "11px", color: isActive ? "#64748b" : "#b4bbc5", fontWeight: 600 }}>
                                                {isActive ? "ACTIVE" : (isPast ? "DONE" : `${step.daysBefore}d left`)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Milestone Intelligence - Added to fill space and provide value */}
                    <div style={{ 
                        marginTop: "3rem", 
                        padding: "1.5rem", 
                        background: "#f8fafc", 
                        borderRadius: "20px", 
                        border: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1.25rem"
                    }}>
                        <div style={{ 
                            width: "40px", 
                            height: "40px", 
                            borderRadius: "12px", 
                            background: "#fff", 
                            boxShadow: "0 4px 10px rgba(0,0,0,0.03)", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            flexShrink: 0
                        }}>
                            <Sparkles size={18} color="#2563eb" />
                        </div>
                        <div>
                            <div style={{ fontSize: "11px", fontWeight: 850, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Strategic Guidance</div>
                            <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                                Based on your <strong>{selectedEvent?.type}</strong> context, you should focus on finalizing high-impact vendor contracts. 
                                Ensuring RSVP synchronization now will prevent logistics slippage in the later phases.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Budget Summary */}
                <div style={{
                    background: "linear-gradient(165deg, #0f172a 0%, #1e1b4b 100%)",
                    padding: "2.5rem",
                    borderRadius: "32px",
                    color: "#fff",
                    boxShadow: "0 25px 60px -12px rgba(15, 23, 42, 0.35)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                }}>
                    {/* Decorative Background Glow */}
                    <div style={{ position: "absolute", top: "-20%", right: "-20%", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }}></div>
                    
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.15em" }}>Budget Summary</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 8px #10b981" }}></div>
                                <span style={{ fontSize: "9px", fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>Real-time</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: "2.5rem" }}>
                            <div style={{ 
                                fontSize: "42px", 
                                fontWeight: 850, 
                                color: "#fff", 
                                letterSpacing: "-0.03em",
                                textShadow: "0 4px 20px rgba(255,255,255,0.15)",
                                marginBottom: "4px"
                            }}>
                                ₹{(healthData?.metrics?.totalSpent || 0).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                                Allocated / <span style={{ color: "rgba(255,255,255,0.7)" }}>₹{selectedEvent?.budget?.toLocaleString('en-IN')} Cap</span>
                            </div>
                        </div>
                    </div>

                    {/* Spacing Refinement: Operational Intelligence Strip */}
                    <div style={{ margin: "auto 0", position: "relative", zIndex: 1 }}>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "14px", 
                            padding: "1.25rem", 
                            background: "rgba(255, 255, 255, 0.02)", 
                            borderRadius: "24px", 
                            border: "1px solid rgba(255, 255, 255, 0.04)" 
                        }}>
                            <div style={{ 
                                width: "10px", 
                                height: "10px", 
                                background: "#3b82f6", 
                                borderRadius: "50%", 
                                boxShadow: "0 0 12px #3b82f6",
                                animation: "pulse 2s infinite" 
                            }}></div>
                            <div>
                                <div style={{ fontSize: "11px", fontWeight: 850, color: "rgba(255,255,255,0.8)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Financial Velocity</div>
                                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Neural pattern indicates optimal spending state.</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "12px", fontWeight: 850, marginBottom: "0.75rem" }}>
                            <span style={{ color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Market Utilisation</span>
                            <span style={{ 
                                color: getBudgetColor(healthData?.metrics?.budgetUsage || 0),
                                fontSize: "16px",
                                letterSpacing: "-0.02em"
                            }}>{healthData?.metrics?.budgetUsage || 0}%</span>
                        </div>
                        <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "100px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.03)" }}>
                            <div style={{
                                width: `${Math.min(100, healthData?.metrics?.budgetUsage || 0)}%`,
                                height: "100%",
                                background: `linear-gradient(90deg, #10b981 0%, ${getBudgetColor(healthData?.metrics?.budgetUsage || 0)} 100%)`,
                                borderRadius: "100px",
                                boxShadow: `0 0 15px ${getBudgetColor(healthData?.metrics?.budgetUsage || 0)}60`,
                                transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)"
                            }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* High-Fidelity Vendor Strip */}
            <div style={{
                background: "#fff",
                border: "1px solid #f1f5f9",
                padding: "1.25rem 2rem",
                borderRadius: "100px",
                display: "flex",
                alignItems: "center",
                gap: "2.5rem",
                overflowX: "auto",
                boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderRight: "1px solid #f1f5f9", paddingRight: "2rem" }}>
                    <Search size={14} color="#94a3b8" />
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>Smart Matching</span>
                </div>
                <div style={{ display: "flex", gap: "3rem" }}>
                    {vendors.length > 0 ? vendors.map((vendor, i) => {
                        const styles = getCategoryStyles(vendor.service);
                        return (
                            <div
                                key={i}
                                onClick={() => setSelectedVendorModal(vendor)}
                                style={{ display: "flex", alignItems: "center", gap: "0.75rem", whiteSpace: "nowrap", cursor: "pointer", transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                <div style={{
                                    width: "32px",
                                    height: "32px",
                                    background: styles.bg,
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "14px",
                                    boxShadow: `0 2px 8px ${styles.color}10`
                                }}>{styles.icon}</div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}>{vendor.name}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span style={{ fontSize: "10px", color: styles.color, fontWeight: 800, textTransform: "uppercase" }}>{vendor.service}</span>
                                        <span style={{ width: "2px", height: "2px", background: "#cbd5e1", borderRadius: "50%" }}></span>
                                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>{vendor.priceRange}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, fontStyle: "italic" }}>Calculating optimal vendor matrix...</div>
                    )}
                </div>
            </div>

            {/* Vendor Modal */}
            {selectedVendorModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ background: "#fff", width: "100%", maxWidth: "500px", borderRadius: "24px", padding: "2rem", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", position: "relative", animation: "modalIn 0.3s ease-out" }}>
                        <button
                            onClick={() => setSelectedVendorModal(null)}
                            aria-label="Close vendor details"
                            style={{ position: "absolute", top: "1.5rem", right: "1.5rem", border: "none", background: "#f1f5f9", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1.75rem", fontWeight: 850, color: "#0f172a", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>{selectedVendorModal.name}</h3>
                            <p style={{ color: "#2563eb", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{selectedVendorModal.service} Experts</p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Rating</div>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Star size={18} fill="#f59e0b" color="#f59e0b" /> {selectedVendorModal.rating}/5.0
                                </div>
                            </div>
                            <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Pricing</div>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                                    {selectedVendorModal.startingPrice ? (
                                        <span style={{ fontSize: "16px" }}>
                                            Starts at <span style={{ color: "#2563eb" }}>₹{new Intl.NumberFormat("en-IN").format(selectedVendorModal.startingPrice)}</span>
                                        </span>
                                    ) : (
                                        <span style={{ letterSpacing: "4px" }}>{selectedVendorModal.priceRange}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location and Contact Details */}
                        <div style={{ background: "#f8fafc", borderRadius: "20px", padding: "1.5rem", marginBottom: "2rem", border: "1px solid #f1f5f9" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                    <div style={{ padding: "8px", background: "#fff", borderRadius: "10px", color: "#2563eb", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><MapPin size={16} /></div>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Location</div>
                                        <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: 600, lineHeight: "1.4" }}>{selectedVendorModal.location || "Location details upon request"}</div>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                        <div style={{ padding: "8px", background: "#fff", borderRadius: "10px", color: "#2563eb", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><Phone size={16} /></div>
                                        <div>
                                            <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Phone</div>
                                            <div style={{ fontSize: "12px", color: "#1e293b", fontWeight: 600 }}>{selectedVendorModal.contact}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                        <div style={{ padding: "8px", background: "#fff", borderRadius: "10px", color: "#2563eb", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><Mail size={16} /></div>
                                        <div>
                                            <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Email</div>
                                            <div style={{ fontSize: "12px", color: "#1e293b", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>{selectedVendorModal.email || "Corporate mail only"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: "2rem" }}>
                            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.75rem" }}>
                                {selectedVendorModal.specialty ? "Core Specialty" : "Overview"}
                            </div>
                            <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", fontWeight: 500 }}>
                                {selectedVendorModal.description || `Superior quality and reliability in ${selectedVendorModal.service} services for all categories of events.`}
                                {selectedVendorModal.specialty && (
                                    <span style={{ display: "block", marginTop: "0.5rem", color: "#2563eb", fontWeight: 700 }}>
                                        Featured Specialty: {selectedVendorModal.specialty}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Suspense fallback={null}>
                <AiAssistant eventId={selectedEventId} />
            </Suspense>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.9; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.9; }
                }
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes modalIn {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                *::-webkit-scrollbar { height: 4px; }
                *::-webkit-scrollbar-track { background: transparent; }
                *::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
            `}</style>
        </div>
    );
}
