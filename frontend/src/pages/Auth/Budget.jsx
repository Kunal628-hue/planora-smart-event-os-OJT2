import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";

export default function Budget() {
    const { user } = useOutletContext();
    const [events, setEvents] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        name: "",
        service: "Catering",
        cost: "",
    });

    const fetchData = async () => {
        if (!user) return;
        try {
            const [eventsRes, vendorsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/events?user=${user.uid}`),
                fetch(`${import.meta.env.VITE_API_URL}/vendors?user=${user.uid}`)
            ]);
            const eventsData = await eventsRes.json();
            const vendorsData = await vendorsRes.json();
            setEvents(eventsData);
            setVendors(vendorsData);
            if (eventsData.length > 0 && !selectedEventId) {
                setSelectedEventId(eventsData[0].id || eventsData[0]._id);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const activeEvent = events.find(e => (e.id || e._id) === selectedEventId);
    const eventVendors = vendors.filter(v => v.event === selectedEventId);
    
    const totalAllocated = activeEvent ? activeEvent.budget : 0;
    const totalSpent = eventVendors.reduce((sum, v) => sum + (v.cost || 0), 0);
    const percentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    
    // Group by category
    const categoryStats = [
        { name: "Catering", color: "#6366f1" },
        { name: "Decor", color: "#10b981" },
        { name: "Photography", color: "#f59e0b" },
        { name: "Venue", color: "#ec4899" },
        { name: "Logistics", color: "#94a3b8" },
        { name: "Entertainment", color: "#8b5cf6" }
    ].map(cat => ({
        ...cat,
        spent: eventVendors.filter(v => v.service === cat.name).reduce((sum, v) => sum + (v.cost || 0), 0),
        allocated: totalAllocated / 6 // Mocked allocation for visualization if not explicitly defined
    }));

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newExpense,
                    event: selectedEventId,
                    user: user.uid,
                    status: "Paid"
                })
            });
            if (response.ok) {
                setShowModal(false);
                setNewExpense({ name: "", service: "Catering", cost: "" });
                fetchData();
            }
        } catch (err) {
            console.error("Add expense failed:", err);
        }
    };

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentUsed / 100) * circumference;

    useEffect(() => {
        if (!loading && activeEvent) {
            animate('.budget-ring-fill', {
                strokeDashoffset: [circumference, offset],
                easing: 'cubicBezier(.16, 1, .3, 1)',
                duration: 1500,
                delay: 500
            });

            animate('.stat-value', {
                innerHTML: [0, totalSpent],
                round: 1,
                easing: 'easeOutExpo',
                duration: 2000
            });
        }
    }, [totalSpent, activeEvent, circumference, offset, loading]);

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                        Financial <span className="gradient-text">Studio</span>
                    </h1>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <select 
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="auth-input"
                            style={{ width: "250px", borderRadius: "12px", padding: "0.5rem 1rem", fontWeight: 700 }}
                        >
                            {events.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}
                            {events.length === 0 && <option value="">No events found</option>}
                        </select>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 500 }}>
                            {activeEvent ? `Managing budget for ${activeEvent.name}` : "Initialize an event context to start tracking."}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-lg" 
                    style={{ borderRadius: "14px", padding: "0.85rem 2rem" }}
                    disabled={!selectedEventId}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "8px" }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Log Expense
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Main Overview */}
                <div className="glass-panel" style={{ gridColumn: "span 4", padding: "2.5rem", borderRadius: "32px", position: "relative" }}>
                    {!activeEvent ? (
                        <div style={{ textAlign: "center", padding: "2rem 0" }}>
                            <p style={{ fontWeight: 700, color: "var(--text-muted)" }}>No Active Context</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                                <div className="budget-ring-container">
                                    <svg className="budget-ring-svg" width="160" height="160">
                                        <circle className="budget-ring-bg" cx="80" cy="80" r={radius} />
                                        <circle 
                                            className="budget-ring-fill" 
                                            cx="80" 
                                            cy="80" 
                                            r={radius} 
                                            strokeDasharray={circumference}
                                            strokeDashoffset={circumference}
                                        />
                                    </svg>
                                    <div style={{ position: "absolute", textAlign: "center" }}>
                                        <div style={{ fontSize: "1.75rem", fontWeight: 900 }}>{Math.round(percentUsed)}%</div>
                                        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>Utilized</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                <div style={{ padding: "1.25rem", background: "var(--bg-elevated)", borderRadius: "20px" }}>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700, marginBottom: "0.25rem" }}>Available Balance</div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>₹{(totalAllocated - totalSpent).toLocaleString()}</div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Budget</div>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>₹{totalAllocated.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Total Spent</div>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 800 }} className="stat-value">0</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Categories Breakdown */}
                <div className="glass-panel" style={{ gridColumn: "span 8", padding: "2.5rem", borderRadius: "32px" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 850, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ width: "8px", height: "24px", background: "var(--accent-primary)", borderRadius: "4px" }}></span>
                        Category Distribution
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {categoryStats.filter(c => c.spent > 0).length === 0 ? (
                            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
                                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No categorical allocation detected.</p>
                                <p style={{ fontSize: "0.85rem" }}>Log your first expense to see the breakdown.</p>
                            </div>
                        ) : (
                            categoryStats.map((cat, idx) => {
                                const catPercent = (cat.spent / (totalAllocated / 6 || 1)) * 100;
                                return (
                                    <div key={cat.name} className="reveal visible" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "center" }}>
                                            <div>
                                                <span style={{ fontSize: "0.95rem", fontWeight: 750 }}>{cat.name}</span>
                                                <span style={{ marginLeft: "1rem", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                                    ₹{cat.spent.toLocaleString()} Managed
                                                </span>
                                            </div>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                                                {cat.spent > 0 ? `${Math.round((cat.spent / totalSpent) * 100)}% of total` : ""}
                                            </span>
                                        </div>
                                        <div style={{ height: "10px", background: "var(--bg-elevated)", borderRadius: "10px", overflow: "hidden" }}>
                                            <div 
                                                style={{ 
                                                    height: "100%", 
                                                    width: `${Math.min((cat.spent / totalSpent) * 100, 100)}%`, 
                                                    background: cat.color,
                                                    borderRadius: "10px",
                                                    transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
                                                    boxShadow: `0 0 15px ${cat.color}44`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="glass-panel" style={{ gridColumn: "span 12", padding: "2.5rem", borderRadius: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 850 }}>Transaction Ledger</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Historical spend analysis</p>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        {eventVendors.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>No transactions matching this context.</div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0.75rem" }}>
                                <thead>
                                    <tr style={{ textAlign: "left" }}>
                                        <th style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 750, textTransform: "uppercase" }}>Entity</th>
                                        <th style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 750, textTransform: "uppercase" }}>Service</th>
                                        <th style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 750, textTransform: "uppercase" }}>Status</th>
                                        <th style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 750, textTransform: "uppercase", textAlign: "right" }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventVendors.map((v) => (
                                        <tr key={v._id} className="hover-lift" style={{ background: "var(--bg-elevated)", transition: "all 0.2s ease" }}>
                                            <td style={{ padding: "1.25rem 1rem", borderRadius: "16px 0 0 16px", fontWeight: 700 }}>{v.name}</td>
                                            <td style={{ padding: "1.25rem 1rem" }}>
                                                <span className="category-badge" style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}>
                                                    {v.service}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1.25rem 1rem", color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 600 }}>{v.status}</td>
                                            <td style={{ padding: "1.25rem 1rem", borderRadius: "0 16px 16px 0", textAlign: "right", fontWeight: 800, fontSize: "1.1rem" }}>
                                                ₹{v.cost.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(12px)" }}>
                    <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "3rem", borderRadius: "32px", boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>Log Financial Impact</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "var(--bg-elevated)", border: "none", color: "var(--text-primary)", width: "36px", height: "36px", borderRadius: "12px", cursor: "pointer", fontWeight: 900 }}
                            >✕</button>
                        </div>
                        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Entity Name</label>
                                <input 
                                    className="auth-input" 
                                    placeholder="e.g. Venue Booking" 
                                    value={newExpense.name}
                                    onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                                    required 
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Category</label>
                                    <select 
                                        className="auth-input"
                                        value={newExpense.service}
                                        onChange={e => setNewExpense({ ...newExpense, service: e.target.value })}
                                        required
                                    >
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Logistics</option>
                                        <option>Entertainment</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Cost (₹)</label>
                                    <input 
                                        className="auth-input" 
                                        type="number" 
                                        placeholder="5000" 
                                        value={newExpense.cost}
                                        onChange={e => setNewExpense({ ...newExpense, cost: e.target.value })}
                                        required 
                                    />
                                </div>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ width: "100%", padding: "1rem", borderRadius: "12px", fontWeight: 800, marginTop: "1rem" }}>Update Ledger</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
