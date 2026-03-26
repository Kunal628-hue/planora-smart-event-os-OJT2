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
    Search
} from "lucide-react";

const AiAssistant = lazy(() => import("../../components/AiAssistant"));

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, events, selectedEventId } = useOutletContext();
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
    }, [selectedEventId, events]);

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
            "Catering": { bg: "#fff7ed", color: "#c2410c", icon: "🍱" },
            "Decor": { bg: "#faf5ff", color: "#7e22ce", icon: "✨" },
            "AV": { bg: "#eff6ff", color: "#1d4ed8", icon: "🎧" },
            "Venue": { bg: "#f0fdf4", color: "#15803d", icon: "🏛️" },
            "Other": { bg: "#f8fafc", color: "#475569", icon: "📍" }
        };
        return styles[service] || styles["Other"];
    };

    if (loading && events.length === 0) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
                <RefreshCw className="animate-spin" size={24} color="#2563eb" />
            </div>
        );
    }

    if (events.length === 0 && !loading) {
        return (
            <div style={{ textAlign: "center", padding: "10rem 2rem", background: "#fff", border: "1px solid #f1f5f9", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.04)" }}>
                <Activity size={48} color="#2563eb" style={{ margin: "0 auto 1.5rem" }} />
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>Initialize your workspace.</h1>
                <p style={{ color: "#64748b", marginBottom: "2rem" }}>Connect your first event to see real-time insights.</p>
                <button className="btn btn-primary px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/20" onClick={() => window.location.href = '/events'}>Get Started</button>
            </div>
        );
    }

    const selectedEvent = events.find(e => (e.id || e._id) === selectedEventId);
    const daysRemaining = getDaysToEvent(selectedEvent?.date);

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a",
            padding: "2.5rem"
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
                        Resolve Now →
                    </button>
                </div>
            )}

            {/* Premium 3-Column KPI Strip */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1.5rem",
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
                    }}>
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
            <div style={{
                display: "grid",
                gridTemplateColumns: "2.1fr 0.9fr",
                gap: "2rem",
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

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            {timeline.slice(0, 5).map((step, idx) => {
                                const currentPhaseIdx = timeline.findIndex(s => daysRemaining <= s.daysBefore);
                                const isActive = idx === (currentPhaseIdx === -1 ? timeline.length - 1 : currentPhaseIdx);
                                const isPast = idx < (currentPhaseIdx === -1 ? timeline.length - 1 : currentPhaseIdx);

                                return (
                                    <div key={idx} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "100px" }}>
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
                </div>

                {/* Dynamic Budget Summary */}
                <div style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    padding: "2.8rem 2rem",
                    borderRadius: "24px",
                    color: "#fff",
                    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>Budget Summary</div>
                        <div style={{ marginBottom: "2rem" }}>
                            <div style={{ fontSize: "32px", fontWeight: 800, color: "#fff" }}>₹{Math.round((healthData?.metrics?.budgetUsage / 100 || 0) * selectedEvent?.budget).toLocaleString()}</div>
                            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Current Spend / ₹{selectedEvent?.budget?.toLocaleString()} Cap</div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, marginBottom: "0.5rem" }}>
                            <span>UTILISATION</span>
                            <span style={{ color: getBudgetColor(healthData?.metrics?.budgetUsage || 0) }}>{healthData?.metrics?.budgetUsage || 0}%</span>
                        </div>
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{
                                width: `${Math.min(100, healthData?.metrics?.budgetUsage || 0)}%`,
                                height: "100%",
                                background: getBudgetColor(healthData?.metrics?.budgetUsage || 0),
                                borderRadius: "10px",
                                boxShadow: `0 0 10px ${getBudgetColor(healthData?.metrics?.budgetUsage || 0)}`
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
                                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>{vendor.priceRange?.replace('$', '₹')}</span>
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
                            ×
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                            <div style={{ width: "64px", height: "64px", background: getCategoryStyles(selectedVendorModal.service).bg, borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
                                {getCategoryStyles(selectedVendorModal.service).icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>{selectedVendorModal.name}</h3>
                                <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>{selectedVendorModal.service} Experts</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "16px" }}>
                                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Rating</div>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>⭐ {selectedVendorModal.rating}/5.0</div>
                            </div>
                            <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "16px" }}>
                                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Pricing</div>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{selectedVendorModal.priceRange?.replace('$', '₹')}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: "2rem" }}>
                            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.75rem" }}>Core Specialty</div>
                            <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>Superior quality and reliability in {selectedVendorModal.service} services for small to medium scale events.</p>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button className="btn btn-primary" style={{ flex: 1, padding: "1rem", borderRadius: "12px", fontWeight: 800 }} onClick={() => setSelectedVendorModal(null)}>Book Consultation</button>
                            <button style={{ flex: 1, padding: "1rem", borderRadius: "12px", background: "#f1f5f9", border: "none", color: "#1e293b", fontWeight: 800, cursor: "pointer" }}>Save for later</button>
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
