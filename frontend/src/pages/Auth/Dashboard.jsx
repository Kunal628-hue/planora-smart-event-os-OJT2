import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
    const { user } = useOutletContext();
    const [stats, setStats] = useState({
        healthScore: 0,
        metrics: [
            { label: "Budget Stability", value: "0%", color: "#10b981" },
            { label: "Vendor Confirmation", value: "0%", color: "#10b981" },
            { label: "Task Completion", value: "0%", color: "#f59e0b" },
            { label: "RSVP Rate", value: "0%", color: "#10b981" },
        ],
        alerts: [],
        trends: [30, 45, 35, 50, 40, 60],
        financials: [
            { id: "budget", label: "Total Budget", value: "₹0", trend: "0%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
            { id: "cost", label: "Estimated Cost", value: "₹0", trend: "0%", color: "#ef4444", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>, sub: "0% of budget" },
            { id: "paid", label: "Paid Amount", value: "₹0", trend: "0%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>, sub: "0% of cost" },
            { id: "balance", label: "Remaining Balance", value: "₹0", trend: "0%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>, sub: "0% remaining" },
        ]
    });

    const fetchStats = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/events?user=${user.uid}`);
            const events = await response.json();

            if (events.length === 0) {
                setStats(curr => ({ ...curr, healthScore: 0 }));
                return;
            }

            const totalBudget = events.reduce((sum, e) => sum + (parseInt(e.budget) || 0), 0);
            const estCost = totalBudget * 0.92;
            const paidAmt = estCost * 0.65;
            const balance = estCost - paidAmt;

            setStats({
                healthScore: 85,
                metrics: [
                    { label: "Budget Stability", value: "88%", color: "#10b981" },
                    { label: "Vendor Confirmation", value: "45%", color: "#f59e0b" },
                    { label: "Task Completion", value: "30%", color: "#f59e0b" },
                    { label: "RSVP Rate", value: "0%", color: "#ef4444" },
                ],
                alerts: totalBudget > 1000000 ? [
                    { category: "High Budget", amount: `₹${totalBudget.toLocaleString()}`, budget: "₹1,000,000", diff: "Over Cap" }
                ] : [],
                trends: [40, 60, 45, 70, 55, 80],
                financials: [
                    { label: "Total Budget", value: `₹${totalBudget.toLocaleString()}`, trend: "+12%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
                    { label: "Estimated Cost", value: `₹${Math.round(estCost).toLocaleString()}`, trend: "-2%", color: "#ef4444", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>, sub: "92% of budget" },
                    { label: "Paid Amount", value: `₹${Math.round(paidAmt).toLocaleString()}`, trend: "+5%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>, sub: "65% of cost" },
                    { label: "Remaining Balance", value: `₹${Math.round(balance).toLocaleString()}`, trend: "+3%", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>, sub: `${Math.round((balance / estCost) * 100)}% remaining` },
                ]
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);


    return (
        <div style={{ padding: 0 }}>
            <div style={{ marginBottom: "0.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Dashboard</h1>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Welcome back, <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>{user?.displayName || user?.email?.split('@')[0] || "User"}!</span> Here's your event overview.</p>
            </div>

            <div className="dashboard-grid">
                <div className="card hover-lift" style={{ gridColumn: "span 8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Event Health Score</h2>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Overall readiness and risk assessment</p>
                        </div>
                        <div style={{ padding: "0.4rem 0.8rem", borderRadius: "2rem", background: "#f0fdf4", color: "#16a34a", fontSize: "0.75rem", fontWeight: 800 }}>On Track</div>
                    </div>

                    <div className="health-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="health-gauge" style={{ width: 160, height: 160, borderWidth: "12px" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--accent-primary)", lineHeight: 1 }}>{stats.healthScore}</div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginTop: "0.25rem", textTransform: "uppercase" }}>Score</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            {stats.metrics.map(item => (
                                <div key={item.label} className="progress-row">
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600 }}>
                                        <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                                        <span style={{ color: "var(--text-primary)" }}>{item.value}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: item.value, background: item.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="risk-alert hover-lift" style={{ gridColumn: "span 4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <div className="risk-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#991b1b" }}>Financial Risk Detected</h3>
                            <p style={{ fontSize: "0.75rem", color: "#b91c1c" }}>Budget threshold alert</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {stats.alerts.map((alert, idx) => (
                            <div key={idx} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #fee2e2", background: "#fef2f2" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>{alert.category}</span>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b" }}>{alert.diff}</span>
                                </div>
                                <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{alert.amount}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Budget: {alert.budget}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {stats.financials.map((stat, idx) => (
                    <div key={stat.label} className="stat-card hover-lift" style={{ gridColumn: "span 3" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="stat-icon">{stat.icon}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: stat.color, fontSize: "0.75rem", fontWeight: 700, background: `${stat.color}15`, padding: "0.25rem 0.5rem", borderRadius: "10px" }}>
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>{stat.label}</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.25rem 0" }}>{stat.value}</div>
                            {stat.sub && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>{stat.sub}</div>}
                        </div>
                    </div>
                ))}

                <div className="card hover-lift" style={{ gridColumn: "span 4" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.5rem" }}>Expense Distribution</h3>
                    <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", borderRadius: "12px", border: "2px dashed var(--border-subtle)" }}>
                        <div style={{ width: 120, height: 120, border: "20px solid var(--accent-primary)", borderLeftColor: "#10b981", borderBottomColor: "#3b82f6", borderRightColor: "#f59e0b", borderRadius: "50%" }}></div>
                    </div>
                </div>
                <div className="card hover-lift" style={{ gridColumn: "span 4" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.5rem" }}>Planned vs Actual</h3>
                    <div style={{ height: "200px", display: "flex", alignItems: "flex-end", gap: "1rem", padding: "1rem", background: "var(--bg-elevated)", borderRadius: "12px" }}>
                        {stats.trends.map((h, i) => (
                            <div key={i} style={{ flex: 1, display: "flex", gap: "2px" }}>
                                <div style={{ flex: 1, height: `${h}%`, background: "var(--accent-light)", borderRadius: "4px 4px 0 0" }}></div>
                                <div style={{ flex: 1, height: `${h - 15}%`, background: "var(--accent-primary)", borderRadius: "4px 4px 0 0" }}></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card hover-lift" style={{ gridColumn: "span 4" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.5rem" }}>Expense Trend</h3>
                    <div style={{ height: "200px", position: "relative", background: "var(--bg-elevated)", borderRadius: "12px", overflow: "hidden" }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 80 Q 25 70, 50 40 T 100 20" fill="none" stroke="var(--accent-primary)" strokeWidth="4" />
                            <path d="M0 80 Q 25 70, 50 40 T 100 20 V 100 H 0 Z" fill="var(--accent-soft)" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
