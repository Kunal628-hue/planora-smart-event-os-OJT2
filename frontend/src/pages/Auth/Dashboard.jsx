import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import AiAssistant from "../../components/AiAssistant";

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
    const { user } = useOutletContext();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [healthData, setHealthData] = useState(null);
    const [risks, setRisks] = useState([]);
    const [budgetOpts, setBudgetOpts] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInitialData = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/events?user=${user.uid}`);
            if (!res.ok) throw new Error("Failed to connect to AI engine");
            const data = await res.json();
            setEvents(data);
            if (data.length > 0) {
                const initialId = data[0].id || data[0]._id;
                setSelectedEventId(initialId);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchAiInsights = async (eventId, currentEvents) => {
        if (!eventId) return;
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

            const event = currentEvents.find(e => (e.id || e._id) === eventId);
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [user]);

    useEffect(() => {
        if (selectedEventId && events.length > 0) {
            fetchAiInsights(selectedEventId, events);
        }
    }, [selectedEventId]);

    useEffect(() => {
        if (!loading && events.length > 0) {
            animate('.stagger-dash', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(80),
                easing: 'easeOutExpo',
                duration: 800
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
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "70vh", gap: "1.25rem" }}>
                <div style={{ width: "50px", height: "50px", border: "5px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Synchronizing Neural Engine...</p>
            </div>
        );
    }

    if (error && events.length === 0) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "70vh", textAlign: "center", padding: "2rem" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>⚠️</div>
                <h2 style={{ fontSize: "2rem", fontWeight: 900 }}>Database Sync Error</h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "1.1rem" }}>{error}</p>
                <button onClick={fetchInitialData} className="btn btn-primary btn-lg" style={{ marginTop: "2rem" }}>Retry Connection</button>
            </div>
        );
    }

    if (events.length === 0 && !loading) {
        return (
            <div className="glass-panel" style={{ textAlign: "center", padding: "8rem 2rem", borderRadius: "40px", border: "2px dashed var(--border-medium)" }}>
                <div style={{ fontSize: "4.5rem", marginBottom: "2rem", animation: "floatSubtle 4s ease-in-out infinite" }}>✨</div>
                <h1 style={{ fontSize: "3rem", fontWeight: 950, letterSpacing: "-0.04em" }}>Architect your legacy.</h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.2rem", maxWidth: "550px", margin: "1rem auto" }}>
                    Activate Planora's intelligence by creating your first event. Experience real-time risk assessment and fiscal optimization.
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => window.location.href = '/events'} style={{ marginTop: "2.5rem" }}>Initialize Portfolio</button>
            </div>
        );
    }

    const selectedEvent = events.find(e => (e.id || e._id) === selectedEventId);

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "0.5rem" }}>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em" }}>Intelligence <span className="gradient-text">Pulse</span></h1>
                        <div className="category-badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-success)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", animation: "pulse 2s infinite" }}></span>
                            Kernel 6.2 Activated
                        </div>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                        Active context monitoring for <span style={{ color: "var(--accent-primary)", fontWeight: 900 }}>{selectedEvent?.name}</span>
                    </p>
                </div>
                <div style={{ width: "300px" }}>
                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.65rem", letterSpacing: "0.05em" }}>Context Navigation</label>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="auth-input"
                        style={{ fontWeight: 700, borderRadius: "14px", border: "1.5px solid var(--border-subtle)", padding: "0.8rem" }}
                    >
                        {events.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name || e.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Critical Vector Banners */}
            {risks.length > 0 && (
                <div className="stagger-dash" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
                    {risks.map((risk, idx) => (
                        <div key={idx} className="glass-panel pulse-critical" style={{
                            padding: "1.25rem 2rem",
                            borderRadius: "18px",
                            background: risk.type === "CRITICAL" ? "rgba(239, 68, 68, 0.05)" : "rgba(245, 158, 11, 0.05)",
                            borderLeft: `6px solid ${risk.type === "CRITICAL" ? "var(--accent-danger)" : "var(--accent-warning)"}`,
                            display: "flex",
                            alignItems: "center",
                            gap: "1.5rem"
                        }}>
                            <div style={{ color: risk.type === "CRITICAL" ? "var(--accent-danger)" : "var(--accent-warning)" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-primary)" }}>{risk.category}: {risk.message}</h4>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Resolution: <span style={{ fontWeight: 700 }}>{risk.suggestion}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="dashboard-grid">
                {/* Health Diagnostic Ring */}
                <div className="glass-panel stagger-dash" style={{ gridColumn: "span 8", padding: "2.5rem", borderRadius: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 900 }}>Readiness Assessment</h2>
                            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Composite metric based on logistical integrity.</p>
                        </div>
                        {healthData && (
                            <div className="category-badge" style={{
                                background: `${getHealthColor(healthData.score)}15`,
                                color: getHealthColor(healthData.score),
                                fontSize: "0.8rem",
                                fontWeight: 900,
                                border: `1px solid ${getHealthColor(healthData.score)}30`
                            }}>
                                {healthData.score >= 80 ? "Optimized" : healthData.score >= 50 ? "Stable" : "Critical"}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="budget-ring-container" style={{ width: 180, height: 180 }}>
                                <svg className="budget-ring-svg" width="180" height="180" viewBox="0 0 100 100">
                                    <circle className="budget-ring-bg" cx="50" cy="50" r="45" strokeWidth="10" />
                                    <circle className="budget-ring-fill" cx="50" cy="50" r="45" strokeWidth="10"
                                            strokeDasharray="282.7"
                                            strokeDashoffset={282.7 * (1 - (healthData?.score || 0) / 100)}
                                            stroke={getHealthColor(healthData?.score || 0)}
                                    />
                                </svg>
                                <div style={{ position: "absolute", textAlign: "center" }}>
                                    <div style={{ fontSize: "3.5rem", fontWeight: 950, color: "var(--text-primary)", lineHeight: 1 }}>{healthData?.score || 0}</div>
                                    <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginTop: "0.5rem" }}>Pulse</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {healthData && [
                                { label: "Task Flow", value: healthData.metrics.taskCompletion, icon: "🎯" },
                                { label: "Fiscal Buffer", value: Math.max(0, 100 - (healthData.metrics.budgetUsage > 100 ? (healthData.metrics.budgetUsage - 100) : 0)), icon: "📉" },
                                { label: "Partner Synergy", value: healthData.metrics.vendorConfirmation, icon: "💠" },
                                { label: "Response Rate", value: healthData.metrics.rsvpRate, icon: "⚡" },
                            ].map(item => (
                                <div key={item.label}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.6rem" }}>
                                        <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <span style={{ opacity: 0.8 }}>{item.icon}</span> {item.label}
                                        </span>
                                        <span style={{ color: "var(--text-primary)" }}>{item.value}%</span>
                                    </div>
                                    <div className="progress-bar" style={{ height: "10px", background: "var(--bg-elevated)", borderRadius: "100px" }}>
                                        <div className="progress-fill" style={{ width: `${item.value}%`, background: getHealthColor(item.value), borderRadius: "100px" }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Optimization Feed */}
                <div className="glass-panel stagger-dash" style={{ gridColumn: "span 4", padding: "2rem", borderRadius: "32px", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={{ fontSize: "1.5rem", color: "var(--accent-primary)" }}>🧠</span>
                        Fiscal Insights
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                        {budgetOpts.map((opt, i) => (
                            <div key={i} style={{ padding: "1rem", borderRadius: "16px", background: "var(--bg-elevated)", fontSize: "0.85rem", fontWeight: 600, border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                                {opt}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => window.location.href='/budget'} className="btn btn-primary" style={{ marginTop: "2rem", borderRadius: "14px", padding: "1rem", fontWeight: 800 }}>Optimize Ledger ➔</button>
                </div>

                {/* Predictive Timeline */}
                <div className="glass-panel stagger-dash" style={{ gridColumn: "span 12", padding: "2.5rem", borderRadius: "32px" }}>
                    <div style={{ marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 950 }}>Predictive Milestone Flow</h3>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Suggested chronological synchronization for {selectedEvent?.type}.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1.5rem" }}>
                        {timeline.map((step, idx) => (
                            <div key={idx} style={{ textAlign: "center", position: "relative" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "16px",
                                    background: "var(--accent-soft)",
                                    color: "var(--accent-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 1rem",
                                    fontWeight: 900,
                                    fontSize: "1.1rem",
                                    border: "2px solid var(--border-accent)"
                                }}>
                                    {idx + 1}
                                </div>
                                <h5 style={{ fontSize: "0.85rem", fontWeight: 900, marginBottom: "0.3rem" }}>{step.title}</h5>
                                <span className="category-badge" style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                                    T-{step.daysBefore}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vendor Matchmaking Card */}
                <div className="glass-panel stagger-dash" style={{ gridColumn: "span 12", padding: "2.5rem", borderRadius: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                        <div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 950 }}>Neural Vendor Matching</h3>
                            <p style={{ fontSize: "1rem", color: "var(--text-muted)" }}>Top-tier providers compatible with your project parameters.</p>
                        </div>
                        <button onClick={() => window.location.href='/vendors'} className="btn btn-ghost" style={{ fontWeight: 800 }}>Explore Full Catalog</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
                        {vendors.map((vendor, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedVendor(vendor)}
                                className="glass-panel"
                                style={{
                                    padding: "2rem",
                                    borderRadius: "24px",
                                    cursor: "pointer",
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-subtle)"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                    <div style={{ fontSize: "2rem" }}>{vendor.service === "Catering" ? "🍽️" : vendor.service === "Decor" ? "✨" : "🤝"}</div>
                                    <div className="category-badge" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                                        ★ {vendor.rating}
                                    </div>
                                </div>
                                <h4 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "0.5rem" }}>{vendor.name}</h4>
                                <div style={{ display: "flex", gap: "0.6rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                                    <span>{vendor.service}</span>
                                    <span>•</span>
                                    <span style={{ color: "var(--accent-primary)" }}>{vendor.priceRange}</span>
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
                    style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "2rem" }}
                    onClick={() => setSelectedVendor(null)}
                >
                    <div 
                        className="glass-panel scale-up" 
                        style={{ width: "100%", maxWidth: "500px", borderRadius: "32px", padding: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: "3rem", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", color: "#fff", position: "relative" }}>
                            <button onClick={() => setSelectedVendor(null)} style={{ position: "absolute", top: "2rem", right: "2rem", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: "40px", height: "40px", borderRadius: "14px", cursor: "pointer", fontWeight: 900 }}>✕</button>
                            <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>{selectedVendor.service === "Catering" ? "🍽️" : "✨"}</div>
                            <h2 style={{ fontSize: "2rem", fontWeight: 950, letterSpacing: "-0.03em" }}>{selectedVendor.name}</h2>
                        </div>
                        <div style={{ padding: "3rem" }}>
                            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "2rem" }}>{selectedVendor.description}</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>
                                <div>
                                    <label style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase" }}>Specialty</label>
                                    <div style={{ fontSize: "1rem", fontWeight: 800, marginTop: "0.25rem" }}>{selectedVendor.specialty}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--text-muted)", textTransform: "uppercase" }}>Price Tier</label>
                                    <div style={{ fontSize: "1rem", fontWeight: 800, marginTop: "0.25rem" }}>{selectedVendor.priceRange}</div>
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: "100%", borderRadius: "16px", padding: "1.25rem", fontWeight: 900 }}>Initialize Partnership ➔</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
