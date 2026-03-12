import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
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

    const fetchInitialData = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/events?user=${user.uid}`);
            const data = await res.json();
            setEvents(data);
            if (data.length > 0) {
                const initialId = data[0].id || data[0]._id;
                setSelectedEventId(initialId);
                fetchAiInsights(initialId, data);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
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

            const health = await healthRes.json();
            const riskData = await riskRes.json();
            const budgetData = await budgetRes.json();

            setHealthData(health);
            setRisks(riskData);
            setBudgetOpts(budgetData);

            // Fetch generic timeline and vendors for the event type
            const event = currentEvents.find(e => (e.id || e._id) === eventId);
            if (event) {
                const [timelineRes, vendorRes] = await Promise.all([
                    fetch(`${API_URL}/ai/timeline?type=${event.type || "Wedding"}`),
                    fetch(`${API_URL}/ai/vendors?type=${event.type || "Wedding"}`)
                ]);
                const timelineData = await timelineRes.json();
                const vendorData = await vendorRes.json();
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

    const getHealthColor = (score) => {
        if (score >= 80) return "#10b981"; // Green
        if (score >= 50) return "#f59e0b"; // Yellow
        return "#ef4444"; // Red
    };

    const getHealthStatus = (score) => {
        if (score >= 80) return "Healthy";
        if (score >= 50) return "Moderate Risk";
        return "Critical";
    };

    if (loading && events.length === 0) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <div style={{ width: "50px", height: "50px", border: "5px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            </div>
        );
    }

    if (events.length === 0 && !loading) {
        return (
            <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 850 }}>Build something amazing.</h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem", fontSize: "1.1rem" }}>Create your first event to see Planora's AI engine in action.</p>
            </div>
        );
    }

    const selectedEvent = events.find(e => (e.id || e._id) === selectedEventId);

    return (
        <div style={{ padding: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>AI Intelligence Dashboard</h1>
                        <span style={{
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px",
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                            fontSize: "0.65rem",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem"
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }}></span>
                            Live Engine
                        </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Real-time predictive insights for <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{selectedEvent?.name}</span></p>
                </div>
                <div>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="auth-input"
                        style={{ width: "250px", fontWeight: 600 }}
                    >
                        {events.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name || e.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Risk Banners */}
            {risks.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    {risks.map((risk, idx) => (
                        <div key={idx} style={{
                            padding: "1rem 1.5rem",
                            borderRadius: "12px",
                            background: risk.type === "CRITICAL" ? "#fef2f2" : "#fffbeb",
                            borderLeft: `5px solid ${risk.type === "CRITICAL" ? "#ef4444" : "#f59e0b"}`,
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            <div style={{ color: risk.type === "CRITICAL" ? "#ef4444" : "#f59e0b" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1f2937" }}>{risk.category}: {risk.message}</h4>
                                <p style={{ fontSize: "0.8rem", color: "#4b5563" }}>Recommendation: {risk.suggestion}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="dashboard-grid">
                {/* Event Health Score */}
                <div className="card hover-lift" style={{ gridColumn: "span 8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Event Health Score</h2>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>AI-driven readiness assessment</p>
                        </div>
                        {healthData && (
                            <div style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "2rem",
                                background: `${getHealthColor(healthData.score)}15`,
                                color: getHealthColor(healthData.score),
                                fontSize: "0.75rem",
                                fontWeight: 800
                            }}>
                                {getHealthStatus(healthData.score)}
                            </div>
                        )}
                    </div>

                    <div className="health-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="health-gauge" style={{
                                width: 160,
                                height: 160,
                                borderWidth: "12px",
                                borderTopColor: getHealthColor(healthData?.score || 0)
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{healthData?.score || 0}</div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginTop: "0.25rem", textTransform: "uppercase" }}>Health</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                            {healthData && [
                                { label: "Task Completion", value: `${healthData.metrics.taskCompletion}%`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
                                { label: "Budget Stability", value: `${Math.max(0, 100 - (healthData.metrics.budgetUsage > 100 ? (healthData.metrics.budgetUsage - 100) : 0))}%`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
                                { label: "Vendor Confirmation", value: `${healthData.metrics.vendorConfirmation}%`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
                                { label: "Guest RSVP Rate", value: `${healthData.metrics.rsvpRate}%`, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg> },
                            ].map(item => (
                                <div key={item.label} className="progress-row">
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600 }}>
                                        <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>{item.icon} {item.label}</span>
                                        <span style={{ color: "var(--text-primary)" }}>{item.value}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: item.value, background: getHealthColor(parseInt(item.value)) }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card hover-lift" style={{ gridColumn: "span 4", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "linear-gradient(135deg, transparent 50%, rgba(59, 130, 246, 0.05) 50%)", zIndex: 0 }}></div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", position: "relative", zIndex: 1 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))" }}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        Budget Optimization
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {budgetOpts.map((opt, i) => (
                            <div key={i} style={{ padding: "0.85rem", borderRadius: "10px", background: "var(--bg-elevated)", fontSize: "0.8rem", border: "1px solid var(--border-subtle)" }}>
                                {opt}
                            </div>
                        ))}
                        {budgetOpts.length === 0 && (
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>No budget alerts. Your spending is well-distributed!</p>
                        )}
                    </div>
                </div>

                {/* Smart Timeline Generator */}
                <div className="card hover-lift" style={{ gridColumn: "span 12" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>AI Recommended Timeline</h3>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Suggested milestones based on {selectedEvent?.type} best practices</p>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem" }}>
                        {timeline.map((step, idx) => (
                            <div key={idx} style={{ textAlign: "center", position: "relative" }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "var(--accent-soft)",
                                    color: "var(--accent-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 0.75rem",
                                    fontWeight: 800,
                                    fontSize: "0.9rem",
                                    border: "2px solid var(--accent-primary)"
                                }}>
                                    {idx + 1}
                                </div>
                                <h5 style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>{step.title}</h5>
                                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600 }}>T-{step.daysBefore} Days</span>
                                {idx < timeline.length - 1 && (
                                    <div style={{ position: "absolute", top: "20px", left: "calc(50% + 25px)", width: "calc(100% - 50px)", height: "2px", background: "var(--border-subtle)", zIndex: 0 }}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats Summary */}
                <div className="stat-card hover-lift" style={{ gridColumn: "span 3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div className="stat-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700 }}>Active</span>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Total Budget</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>₹{parseInt(selectedEvent?.budget || 0).toLocaleString()}</div>
                    </div>
                </div>

                <div className="stat-card hover-lift" style={{ gridColumn: "span 3" }}>
                    <div className="stat-icon" style={{ color: "#ef4444" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Overdue Tasks</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{healthData?.metrics.overdueTasks || 0}</div>
                    </div>
                </div>

                <div className="stat-card hover-lift" style={{ gridColumn: "span 3" }}>
                    <div className="stat-icon" style={{ color: "#f59e0b" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>RSVP Rate</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{healthData?.metrics.rsvpRate || 0}%</div>
                    </div>
                </div>

                <div className="stat-card hover-lift" style={{ gridColumn: "span 3" }}>
                    <div className="stat-icon" style={{ color: "#10b981" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Vendors Booked</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{healthData?.metrics.vendorConfirmation || 0}%</div>
                    </div>
                </div>

                {/* Vendor Recommendations */}
                <div className="card hover-lift" style={{ gridColumn: "span 12" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>AI-Recommended Vendors</h3>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "0.25rem 0.75rem", borderRadius: "20px" }}>Click for details</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                        {vendors.length > 0 ? vendors.map((vendor, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedVendor(vendor)}
                                style={{
                                    padding: "1.25rem",
                                    borderRadius: "16px",
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-subtle)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1.25rem",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                                }}
                                className="vendor-card-hover"
                            >
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    background: "var(--accent-soft)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--accent-primary)"
                                }}>
                                    {vendor.service === "Catering" ? (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 20H4a2 2 0 01-2-2V5a2 2 0 012-2h3.9a2 2 0 011.69.9l.81 1.2a2 2 0 001.67.9H20a2 2 0 012 2v5" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
                                    ) : vendor.service === "Decor" ? (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                    ) : (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                    )}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: "0.95rem", fontWeight: 800 }}>{vendor.name}</h4>
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                        <span>{vendor.service}</span>
                                        <span>•</span>
                                        <span style={{ color: "#f59e0b", fontWeight: 700 }}>★ {vendor.rating}</span>
                                        <span>•</span>
                                        <span style={{ fontWeight: 600 }}>{vendor.priceRange}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p style={{ gridColumn: "span 3", textAlign: "center", color: "var(--text-muted)" }}>No recommendations found for this event type.</p>
                        )}
                    </div>
                </div>

            </div>

            <AiAssistant eventId={selectedEventId} />

            {/* Vendor Detail Modal */}
            {selectedVendor && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                        padding: "1.5rem"
                    }}
                    onClick={() => setSelectedVendor(null)}
                >
                    <div
                        className="card shadow-2xl scale-up"
                        style={{
                            width: "100%",
                            maxWidth: "450px",
                            padding: 0,
                            overflow: "hidden",
                            border: "1px solid var(--border-accent)"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: "2rem",
                            background: "linear-gradient(135deg, var(--accent-primary), #1d4ed8)",
                            color: "#fff",
                            position: "relative"
                        }}>
                            <button
                                onClick={() => setSelectedVendor(null)}
                                style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyItems: "center", cursor: "pointer" }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                                {selectedVendor.service === "Catering" ? "🍽️" : selectedVendor.service === "Decor" ? "✨" : "🤝"}
                            </div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "0.25rem" }}>{selectedVendor.name}</h2>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", opacity: 0.9 }}>
                                <span style={{ fontWeight: 700 }}>{selectedVendor.service}</span>
                                <span>•</span>
                                <span style={{ color: "#fbbf24", fontWeight: 800 }}>★ {selectedVendor.rating} Rating</span>
                            </div>
                        </div>
                        <div style={{ padding: "2rem", background: "var(--bg-base)" }}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                                <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                    {selectedVendor.description}
                                </p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                <div>
                                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Specialty</label>
                                    <div style={{ marginTop: "0.25rem", fontWeight: 700, fontSize: "0.85rem" }}>{selectedVendor.specialty}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Price Range</label>
                                    <div style={{ marginTop: "0.25rem", fontWeight: 700, fontSize: "0.85rem" }}>{selectedVendor.priceRange} Segment</div>
                                </div>
                            </div>
                            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    </div>
                                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{selectedVendor.contact}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    </div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{selectedVendor.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => alert("Vendor inquiry sent! They will contact you shortly.")}
                                className="btn btn-primary"
                                style={{ width: "100%", marginTop: "2rem", borderRadius: "12px", background: "var(--accent-primary)", padding: "1rem" }}
                            >
                                Book Consultation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .vendor-card-hover:hover {
                    transform: translateY(-5px);
                    border-color: var(--accent-primary) !important;
                    box-shadow: 0 12px 20px -10px rgba(59, 130, 246, 0.2) !important;
                }
                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .scale-up {
                    animation: scaleUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
