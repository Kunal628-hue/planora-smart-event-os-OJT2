import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
    Activity,
    AlertTriangle,
    TrendingDown,
    Target,
    ShieldCheck,
    Zap,
    Brain,
    Utensils,
    Sparkles,
    Handshake,
    ChevronRight,
    Calendar,
    ArrowRight,
    Search,
    RefreshCw,
    Star,
    LayoutDashboard,
    AlertCircle
} from "lucide-react";
import AiAssistant from "../../components/AiAssistant";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
    const { user, events, selectedEventId } = useOutletContext();
    const [healthData, setHealthData] = useState(null);
    const [risks, setRisks] = useState([]);
    const [budgetOpts, setBudgetOpts] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
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

    useEffect(() => {
        if (!loading && events.length > 0) {
            animate('.stagger-dash', {
                translateY: [15, 0],
                opacity: [0, 1],
                delay: stagger(60),
                easing: 'cubicBezier(.22, 1, .36, 1)',
                duration: 600
            });
        }
    }, [loading, events.length]);

    const getHealthColor = (score) => {
        if (score >= 80) return "var(--accent-success)";
        if (score >= 50) return "var(--accent-warning)";
        return "var(--accent-danger)";
    };

    if (loading && events.length === 0) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "70vh", gap: "1.5rem" }}>
                <RefreshCw className="animate-spin" size={48} color="var(--accent-primary)" />
                <p style={{ color: "var(--text-muted)", fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>Synchronizing Neural Core...</p>
            </div>
        );
    }

    if (error && events.length === 0) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "70vh", textAlign: "center", padding: "2rem" }}>
                <div style={{ padding: "2rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "32px", marginBottom: "2rem" }}>
                    <AlertCircle size={64} color="var(--accent-danger)" />
                </div>
                <h2 style={{ fontSize: "2.25rem", fontWeight: 900, letterSpacing: "-0.03em" }}>Intelligence Offline</h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", fontSize: "1.1rem", maxWidth: "400px" }}>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary btn-lg" style={{ marginTop: "2.5rem", borderRadius: "14px" }}>Re-establish Connection</button>
            </div>
        );
    }

    if (events.length === 0 && !loading) {
        return (
            <div className="glass-panel" style={{ textAlign: "center", padding: "10rem 2rem", borderRadius: "40px", border: "2px dashed var(--border-medium)", background: "var(--bg-elevated)", position: "relative", overflow: "hidden" }}>
                <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "center" }}>
                    <div className="anim-float" style={{ width: "100px", height: "100px", borderRadius: "30px", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-lg)" }}>
                        <LayoutDashboard size={48} color="var(--accent-primary)" />
                    </div>
                </div>
                <h1 style={{ fontSize: "3.5rem", fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1 }}>Architect your vision.</h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "1.5rem", fontSize: "1.25rem", maxWidth: "600px", margin: "1.5rem auto", fontWeight: 500 }}>
                    Activate Planora's proprietary intelligence by initializing your first event. Experience real-time risk mitigation and fiscal optimization.
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => window.location.href = '/events'} style={{ marginTop: "3rem", borderRadius: "16px", padding: "1.1rem 3rem" }}>Initialize Portfolio</button>
            </div>
        );
    }

    const selectedEvent = events.find(e => (e.id || e._id) === selectedEventId);

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "0.75rem" }}>
                        <h1 style={{ fontSize: "3rem", fontWeight: 950, letterSpacing: "-0.05em" }}>Operational <span className="gradient-text">Intelligence</span></h1>
                        <div className="category-badge" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-success)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: 800 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", animation: "pulse 2s infinite" }}></span>
                            CORE ENGINE v6.2
                        </div>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.15rem", fontWeight: 500 }}>
                        Real-time synchronization for <span style={{ color: "var(--accent-primary)", fontWeight: 900 }}>{selectedEvent?.name}</span>
                    </p>
                </div>
            </div>

            {/* Critical Vector Banners */}
            {risks.length > 0 && (
                <div className="stagger-dash" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "3rem" }}>
                    {risks.map((risk, idx) => (
                        <div key={idx} className="glass-panel" style={{
                            padding: "1.5rem 2.5rem",
                            borderRadius: "20px",
                            background: risk.type === "CRITICAL" ? "rgba(239, 68, 68, 0.04)" : "rgba(245, 158, 11, 0.04)",
                            borderLeft: `6px solid ${risk.type === "CRITICAL" ? "var(--accent-danger)" : "var(--accent-warning)"}`,
                            display: "flex",
                            alignItems: "center",
                            gap: "1.75rem",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            <div style={{ color: risk.type === "CRITICAL" ? "var(--accent-danger)" : "var(--accent-warning)" }}>
                                <AlertTriangle size={28} strokeWidth={2.5} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{risk.category}: {risk.message}</h4>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>Resolution: <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{risk.suggestion}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="dashboard-grid">
                {/* Health Diagnostic Ring */}
                <div className="glass-panel stagger-dash" style={{ gridColumn: "span 8", padding: "3rem", borderRadius: "32px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 950, letterSpacing: "-0.03em" }}>Readiness Diagnostic</h2>
                            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.25rem" }}>Aggregated health score based on logistical & fiscal integrity.</p>
                        </div>
                        {healthData && (
                            <div className="category-badge" style={{
                                background: `${getHealthColor(healthData.score)}12`,
                                color: getHealthColor(healthData.score),
                                fontSize: "0.8rem",
                                fontWeight: 900,
                                border: `1.5px solid ${getHealthColor(healthData.score)}25`,
                                padding: "0.5rem 1rem"
                            }}>
                                {healthData.score >= 80 ? "Fully Optimized" : healthData.score >= 50 ? "Stable Condition" : "Critical Variance"}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="budget-ring-container" style={{ width: 220, height: 220, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="220" height="220" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
                                    <circle cx="50" cy="50" r="42" fill="none"
                                        stroke={getHealthColor(healthData?.score || 0)}
                                        strokeWidth="10"
                                        strokeDasharray="263.89"
                                        strokeDashoffset={263.89 * (1 - (healthData?.score || 0) / 100)}
                                        strokeLinecap="round"
                                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22, 1, .36, 1)" }}
                                    />
                                </svg>
                                <div style={{ position: "absolute", textAlign: "center" }}>
                                    <div style={{ fontSize: "4.5rem", fontWeight: 950, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.05em" }}>{healthData?.score || 0}</div>
                                    <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "0.25rem", letterSpacing: "0.1em" }}>Health ID</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                            {healthData && [
                                { label: "Workflow Velocity", value: healthData.metrics.taskCompletion, icon: <Target size={18} /> },
                                { label: "Fiscal Reserve", value: Math.max(0, 100 - (healthData.metrics.budgetUsage > 100 ? (healthData.metrics.budgetUsage - 100) : 0)), icon: <TrendingDown size={18} /> },
                                { label: "Partner Alignment", value: healthData.metrics.vendorConfirmation, icon: <ShieldCheck size={18} /> },
                                { label: "Network Response", value: healthData.metrics.rsvpRate, icon: <Zap size={18} /> },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 800, marginBottom: "0.75rem" }}>
                                        <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <span style={{ opacity: 0.7, color: "var(--accent-primary)" }}>{item.icon}</span> {item.label}
                                        </span>
                                        <span style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{item.value}%</span>
                                    </div>
                                    <div style={{ height: "8px", background: "var(--bg-elevated)", borderRadius: "100px", overflow: "hidden" }}>
                                        <div style={{ width: `${item.value}%`, height: "100%", background: getHealthColor(item.value), borderRadius: "100px", transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Optimization Feed */}
                <div className="glass-panel stagger-dash" style={{ gridColumn: "span 4", padding: "2.5rem", borderRadius: "32px", display: "flex", flexDirection: "column", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                            <Brain size={24} />
                        </div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 950, letterSpacing: "-0.02em" }}>Fiscal Insights</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                        {budgetOpts.map((opt, i) => (
                            <div key={i} style={{ padding: "1.25rem", borderRadius: "18px", background: "var(--bg-elevated)", fontSize: "0.9rem", fontWeight: 600, border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                {opt}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => window.location.href = '/budget'} className="btn btn-primary" style={{ marginTop: "2rem", borderRadius: "16px", padding: "1.1rem", fontWeight: 900, fontSize: "0.9rem" }}>
                        Optimize Ledger <ArrowRight size={18} />
                    </button>
                </div>

                {/* Predictive Timeline */}
                <div className="glass-panel stagger-dash" style={{ gridColumn: "span 12", padding: "3rem", borderRadius: "32px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 950, letterSpacing: "-0.04em" }}>Predictive Milestone Flow</h3>
                        <p style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 500 }}>Algorithmic synchronization for {selectedEvent?.type} execution.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "2rem" }}>
                        {timeline.map((step, idx) => (
                            <div key={idx} style={{ textAlign: "center", position: "relative" }}>
                                <div style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "18px",
                                    background: "var(--bg-surface)",
                                    color: "var(--accent-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 1.25rem",
                                    fontWeight: 900,
                                    fontSize: "1.25rem",
                                    border: "2px solid var(--accent-soft)",
                                    boxShadow: "var(--shadow-sm)"
                                }}>
                                    {idx + 1}
                                </div>
                                <h5 style={{ fontSize: "0.95rem", fontWeight: 900, marginBottom: "0.5rem", color: "var(--text-primary)" }}>{step.title}</h5>
                                <div style={{ display: "inline-flex", padding: "0.3rem 0.75rem", background: "var(--bg-elevated)", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                                    T - {step.daysBefore}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vendor Matchmaking Card */}
                <div className="glass-panel stagger-dash" style={{ gridColumn: "span 12", padding: "3rem", borderRadius: "32px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                        <div>
                            <h3 style={{ fontSize: "1.75rem", fontWeight: 950, letterSpacing: "-0.04em" }}>Neural Vendor Matching</h3>
                            <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", fontWeight: 500 }}>Premium-tier providers algorithmically matched to your project parameters.</p>
                        </div>
                        <button onClick={() => window.location.href = '/vendors'} className="btn btn-ghost" style={{ fontWeight: 800, padding: "0.8rem 1.5rem", borderRadius: "12px" }}>Explore Portfolio</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
                        {vendors.map((vendor, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedVendor(vendor)}
                                className="glass-panel hover-lift"
                                style={{
                                    padding: "2.5rem",
                                    borderRadius: "28px",
                                    cursor: "pointer",
                                    background: "var(--bg-surface)",
                                    border: "1px solid var(--border-medium)",
                                    boxShadow: "var(--shadow-sm)"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                                    <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                        {vendor.service === "Catering" ? <Utensils size={28} /> : vendor.service === "Decor" ? <Sparkles size={28} /> : <Handshake size={28} />}
                                    </div>
                                    <div className="category-badge" style={{ background: "rgba(245, 158, 11, 0.08)", color: "#d97706", border: "1.5px solid rgba(245, 158, 11, 0.15)", padding: "0.5rem 0.8rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Star size={14} fill="currentColor" /> {vendor.rating}
                                    </div>
                                </div>
                                <h4 style={{ fontSize: "1.35rem", fontWeight: 900, marginBottom: "0.6rem", letterSpacing: "-0.02em" }}>{vendor.name}</h4>
                                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", alignItems: "center" }}>
                                    <span>{vendor.service} Specialist</span>
                                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border-medium)" }}></span>
                                    <span style={{ color: "var(--accent-primary)", fontWeight: 850 }}>{vendor.priceRange}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AiAssistant eventId={selectedEventId} />

            {/* Match Detail Modal */}
            {selectedVendor && (
                <div
                    style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "2rem" }}
                    onClick={() => setSelectedVendor(null)}
                >
                    <div
                        className="glass-panel"
                        style={{ width: "100%", maxWidth: "540px", borderRadius: "40px", padding: 0, overflow: "hidden", border: "1px solid var(--border-medium)", background: "var(--bg-surface)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: "4rem 3.5rem", background: "linear-gradient(135deg, var(--accent-primary), #1e3a8a)", color: "#fff", position: "relative" }}>
                            <button onClick={() => setSelectedVendor(null)} style={{ position: "absolute", top: "2.5rem", right: "2.5rem", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: "44px", height: "44px", borderRadius: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <RefreshCw size={20} strokeWidth={3} style={{ transform: "rotate(45deg)" }} />
                            </button>
                            <div style={{ width: "70px", height: "70px", borderRadius: "20px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", backdropFilter: "blur(4px)" }}>
                                {selectedVendor.service === "Catering" ? <Utensils size={36} /> : <Sparkles size={36} />}
                            </div>
                            <h2 style={{ fontSize: "2.5rem", fontWeight: 950, letterSpacing: "-0.05em", lineHeight: 1 }}>{selectedVendor.name}</h2>
                        </div>
                        <div style={{ padding: "3.5rem" }}>
                            <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "2.5rem", fontWeight: 500 }}>{selectedVendor.description}</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginBottom: "3rem" }}>
                                <div>
                                    <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Core Specialty</label>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 850, marginTop: "0.5rem", color: "var(--text-primary)" }}>{selectedVendor.specialty}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Fiscal Tier</label>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 850, marginTop: "0.5rem", color: "var(--accent-primary)" }}>{selectedVendor.priceRange}</div>
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: "100%", borderRadius: "20px", padding: "1.4rem", fontWeight: 950, fontSize: "1rem" }}>
                                Initialize Strategic Partnership <ArrowRight size={20} style={{ marginLeft: "0.5rem" }} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
