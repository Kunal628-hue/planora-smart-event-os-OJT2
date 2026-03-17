import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
    Plus,
    Wallet,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    CreditCard,
    History,
    X,
    ChevronDown,
    IndianRupee,
    CircleSlash
} from "lucide-react";

export default function Budget() {
    const { user, events, selectedEventId } = useOutletContext();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        name: "",
        service: "Catering",
        cost: "",
    });

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/vendors?user=${user.uid}`);
            const vendorsData = await res.json();
            setVendors(vendorsData);
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
            // Snappier ring animation
            animate('.budget-ring-fill', {
                strokeDashoffset: [circumference, offset],
                easing: 'cubicBezier(.22, 1, .36, 1)',
                duration: 1000,
                delay: 200
            });

            // Fast, optimized counter
            const obj = { val: 0 };
            animate(obj, {
                val: totalSpent,
                round: 1,
                easing: 'easeOutExpo',
                duration: 1200,
                update: () => {
                    const el = document.querySelector('.stat-value');
                    if (el) el.innerHTML = obj.val.toLocaleString();
                }
            });
        }
    }, [totalSpent, activeEvent, circumference, offset, loading]);

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 950, letterSpacing: "-0.04em", marginBottom: "0.75rem" }}>
                        Financial <span className="gradient-text">Studio</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: 600 }}>
                        {activeEvent ? `Optimizing budget for ${activeEvent.name}` : "Initialize an event context to start tracking."}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-lg hover-lift"
                    style={{ borderRadius: "16px", padding: "1rem 2.25rem", boxShadow: "0 10px 20px -5px rgba(var(--accent-primary-rgb), 0.3)", display: "flex", alignItems: "center", gap: "0.75rem" }}
                    disabled={!selectedEventId}
                >
                    <Plus size={22} strokeWidth={2.5} />
                    Log Expense
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Main Overview */}
                <div className="glass-panel" style={{ gridColumn: "span 4", padding: "2.5rem", borderRadius: "32px", position: "relative", border: "1.5px solid var(--border-subtle)" }}>
                    {!activeEvent ? (
                        <div style={{ textAlign: "center", padding: "4rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                                <CircleSlash size={32} />
                            </div>
                            <p style={{ fontWeight: 800, color: "var(--text-muted)", fontSize: "1.1rem" }}>No Active Context</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                                <div className="budget-ring-container">
                                    <svg className="budget-ring-svg" width="180" height="180">
                                        <circle className="budget-ring-bg" cx="90" cy="90" r={radius} />
                                        <circle
                                            className="budget-ring-fill"
                                            cx="90"
                                            cy="90"
                                            r={radius}
                                            strokeDasharray={circumference}
                                            strokeDashoffset={circumference}
                                        />
                                    </svg>
                                    <div style={{ position: "absolute", textAlign: "center" }}>
                                        <div style={{ fontSize: "2rem", fontWeight: 950, letterSpacing: "-0.02em" }}>{Math.round(percentUsed)}%</div>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>Utilized</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div className="hover-lift" style={{ padding: "1.5rem", background: "var(--bg-elevated)", borderRadius: "24px", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 750, marginBottom: "0.25rem" }}>Available Balance</div>
                                        <div style={{ fontSize: "2.25rem", fontWeight: 950, color: "var(--text-primary)", letterSpacing: "-0.04em" }}>₹{(totalAllocated - totalSpent).toLocaleString()}</div>
                                    </div>
                                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(30, 64, 175, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                        <Wallet size={24} />
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ padding: "1.25rem", background: "rgba(16, 185, 129, 0.04)", borderRadius: "20px", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                                        <div style={{ fontSize: "0.7rem", color: "var(--accent-success)", fontWeight: 900, textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Budget</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: 950, color: "var(--text-primary)" }}>₹{totalAllocated.toLocaleString()}</div>
                                    </div>
                                    <div style={{ padding: "1.25rem", background: "rgba(99, 102, 241, 0.04)", borderRadius: "20px", border: "1px solid rgba(99, 102, 241, 0.1)" }}>
                                        <div style={{ fontSize: "0.7rem", color: "var(--accent-primary)", fontWeight: 900, textTransform: "uppercase", marginBottom: "0.25rem", letterSpacing: "0.05em", lineHeight: 1.2 }}>TOTAL<br />SPENT</div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: 950, color: "var(--text-primary)", display: "flex", alignItems: "baseline" }}>
                                            <span style={{ fontSize: "1rem", marginRight: "2px" }}>₹</span>
                                            <span className="stat-value">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Categories Breakdown */}
                <div className="glass-panel" style={{ gridColumn: "span 8", padding: "2.5rem", borderRadius: "32px", border: "1.5px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "0.85rem" }}>
                            <PieChart size={24} color="var(--accent-primary)" strokeWidth={2.5} />
                            Category Distribution
                        </h3>
                        <span className="category-badge" style={{ background: "var(--accent-soft)", color: "var(--accent-primary)", fontWeight: 800 }}>LIVE ANALYSIS</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                        {categoryStats.filter(c => c.spent > 0).length === 0 ? (
                            <div style={{ textAlign: "center", padding: "5rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
                                <History size={48} style={{ opacity: 0.1 }} />
                                <div>
                                    <p style={{ fontSize: "1.1rem", fontWeight: 850, color: "var(--text-primary)" }}>No categorical allocation detected.</p>
                                    <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 500 }}>Log your first expense to see the breakdown.</p>
                                </div>
                            </div>
                        ) : (
                            categoryStats.map((cat, idx) => {
                                const catPercent = (cat.spent / (totalAllocated / 6 || 1)) * 100;
                                return (
                                    <div key={cat.name} className="reveal visible" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", alignItems: "center" }}>
                                            <div>
                                                <span style={{ fontSize: "1rem", fontWeight: 850 }}>{cat.name}</span>
                                                <span style={{ marginLeft: "1rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>
                                                    ₹{cat.spent.toLocaleString()} Managed
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                {cat.spent > 0 && (
                                                    <span style={{ fontSize: "0.85rem", fontWeight: 900, color: cat.color }}>
                                                        {Math.round((cat.spent / totalSpent) * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ height: "12px", background: "var(--bg-elevated)", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${Math.min((cat.spent / totalSpent) * 100, 100)}%`,
                                                    background: cat.color,
                                                    borderRadius: "12px",
                                                    transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                                                    boxShadow: `0 0 20px ${cat.color}33`
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
                <div className="glass-panel" style={{ gridColumn: "span 12", padding: "2.5rem", borderRadius: "32px", border: "1.5px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                <History size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 950, margin: 0 }}>Transaction Ledger</h3>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600, margin: 0 }}>Historical spend analysis across operational vectors</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        {eventVendors.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", background: "var(--bg-elevated)", borderRadius: "24px", border: "1.5px dashed var(--border-subtle)" }}>
                                <CreditCard size={40} style={{ opacity: 0.1, marginBottom: "1rem" }} />
                                <p style={{ fontWeight: 800 }}>No transactions matching this context.</p>
                            </div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0.75rem" }}>
                                <thead>
                                    <tr style={{ textAlign: "left" }}>
                                        <th style={{ padding: "0.5rem 1.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.05em" }}>Entity</th>
                                        <th style={{ padding: "0.5rem 1.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.05em" }}>Service Vector</th>
                                        <th style={{ padding: "0.5rem 1.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                        <th style={{ padding: "0.5rem 1.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Financial Impact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventVendors.map((v) => (
                                        <tr key={v._id} className="hover-lift" style={{ background: "var(--bg-elevated)", transition: "all 0.2s ease", cursor: "pointer" }}>
                                            <td style={{ padding: "1.5rem", borderRadius: "20px 0 0 20px", fontWeight: 850, border: "1.5px solid var(--border-subtle)", borderRight: "none" }}>{v.name}</td>
                                            <td style={{ padding: "1.5rem", borderTop: "1.5px solid var(--border-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                                                <span className="category-badge" style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1.5px solid var(--border-subtle)", padding: "0.4rem 0.85rem", fontWeight: 800 }}>
                                                    {v.service}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1.5rem", borderTop: "1.5px solid var(--border-subtle)", borderBottom: "1.5px solid var(--border-subtle)" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
                                                    <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 750 }}>Settled</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.5rem", borderRadius: "0 20px 20px 0", textAlign: "right", fontWeight: 950, fontSize: "1.25rem", border: "1.5px solid var(--border-subtle)", borderLeft: "none" }}>
                                                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginRight: "4px" }}>₹</span>{v.cost.toLocaleString()}
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
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(16px)" }}>
                    <div className="glass-panel" style={{ width: "90%", maxWidth: "540px", padding: "3.5rem", borderRadius: "32px", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.35)", position: "relative" }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{ position: "absolute", right: "2rem", top: "2rem", background: "var(--bg-elevated)", border: "1.5px solid var(--border-subtle)", color: "var(--text-primary)", width: "40px", height: "40px", borderRadius: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <X size={20} />
                        </button>
                        <div style={{ marginBottom: "2.5rem" }}>
                            <h2 style={{ fontSize: "2rem", fontWeight: 950, letterSpacing: "-0.04em", margin: 0 }}>Log Financial Impact</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "0.5rem", fontWeight: 600 }}>Update the transaction ledger for the current context.</p>
                        </div>
                        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 850, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Entity / Vendor Name</label>
                                <input
                                    className="auth-input"
                                    placeholder="e.g. Grand Ballroom Reservation"
                                    value={newExpense.name}
                                    onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                                    style={{ padding: "1.1rem", borderRadius: "16px", border: "1.5px solid var(--border-subtle)" }}
                                    required
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div style={{ position: "relative" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 850, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
                                    <select
                                        className="auth-input"
                                        value={newExpense.service}
                                        onChange={e => setNewExpense({ ...newExpense, service: e.target.value })}
                                        style={{ padding: "1.1rem", borderRadius: "16px", border: "1.5px solid var(--border-subtle)", appearance: "none" }}
                                        required
                                    >
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Logistics</option>
                                        <option>Entertainment</option>
                                    </select>
                                    <ChevronDown size={18} style={{ position: "absolute", right: "1rem", bottom: "1.1rem", pointerEvents: "none", opacity: 0.5 }} />
                                </div>
                                <div style={{ position: "relative" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 850, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Financial Cost</label>
                                    <div style={{ position: "relative" }}>
                                        <IndianRupee size={16} style={{ position: "absolute", left: "1.15rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                        <input
                                            className="auth-input"
                                            type="number"
                                            placeholder="50000"
                                            value={newExpense.cost}
                                            onChange={e => setNewExpense({ ...newExpense, cost: e.target.value })}
                                            style={{ padding: "1.1rem 1.1rem 1.1rem 2.8rem", borderRadius: "16px", border: "1.5px solid var(--border-subtle)" }}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ width: "100%", padding: "1.25rem", borderRadius: "16px", fontWeight: 900, marginTop: "1rem", fontSize: "1.1rem", boxShadow: "0 15px 30px -10px rgba(var(--accent-primary-rgb), 0.4)" }}>Update Ledger</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
