import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
    Plus,
    Wallet,
    TrendingUp,
    History,
    X,
    ChevronDown,
    IndianRupee,
    CreditCard,
    ArrowRight,
    PieChart,
    Calendar,
    ArrowUpRight
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
    const remaining = totalAllocated - totalSpent;
    const remainingPercent = totalAllocated > 0 ? (remaining / totalAllocated) * 100 : 0;

    const remainingColor = remainingPercent > 30 ? "#10b981" : remainingPercent >= 10 ? "#f59e0b" : "#ef4444";

    const categoryStats = [
        { name: "Catering", color: "#6366f1" },
        { name: "Decor", color: "#10b981" },
        { name: "Photography", color: "#f59e0b" },
        { name: "Venue", color: "#ec4899" },
        { name: "Logistics", color: "#94a3b8" },
        { name: "Entertainment", color: "#a855f7" }
    ].map(cat => ({
        ...cat,
        spent: eventVendors.filter(v => v.service === cat.name).reduce((sum, v) => sum + (v.cost || 0), 0)
    }));

    const gradientParts = categoryStats
        .filter(c => c.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .reduce((acc, curr) => {
            const percent = (curr.spent / totalSpent) * 100;
            const start = acc.total;
            acc.total += percent;
            acc.styles.push(`${curr.color} ${start}% ${acc.total}%`);
            return acc;
        }, { total: 0, styles: [] }).styles.join(', ');

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

    useEffect(() => {
        if (!loading) {
            animate('.stat-card', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                easing: 'easeOutQuart',
                duration: 600
            });
        }
    }, [loading]);

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            <div style={{ marginBottom: "3rem" }}>
                <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>
                    Financial <span style={{ color: "#2563eb" }}>Studio</span>
                </h1>
                <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                    {activeEvent ? `Managing capital flow for ${activeEvent.name}` : "Connect an event to initialize financial tracking."}
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", marginBottom: "3.5rem" }}>
                <div className="stat-card" style={{ background: "#fff", padding: "2.25rem", borderRadius: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Total Budget</div>
                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#2563eb", letterSpacing: "-0.02em" }}>₹{totalAllocated.toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ background: "#fff", padding: "2.25rem", borderRadius: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ec4899" }}></div>
                        Total Spent
                    </div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>₹{totalSpent.toLocaleString()}</div>
                </div>
                <div className="stat-card" style={{ background: "#fff", padding: "2.25rem", borderRadius: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Remaining Liquidity</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: remainingColor }}>₹{remaining.toLocaleString()}</div>
                </div>
            </div>

            <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
                <div style={{
                    flex: "0 0 38%",
                    minWidth: "350px",
                    background: "#fff",
                    padding: "2.75rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                }}>
                    <h3 style={{ alignSelf: "flex-start", fontSize: "1.35rem", fontWeight: 800, marginBottom: "3rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <PieChart size={22} color="#2563eb" />
                        Spend Distribution
                    </h3>

                    {totalSpent > 0 ? (
                        <>
                            <div style={{
                                position: "relative",
                                width: "220px",
                                height: "220px",
                                background: `conic-gradient(${gradientParts})`,
                                borderRadius: "50%",
                                marginBottom: "3rem",
                                boxShadow: "0 15px 35px rgba(0,0,0,0.08)"
                            }}>
                                <div style={{
                                    position: "absolute",
                                    inset: "45px",
                                    background: "#fff",
                                    borderRadius: "50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "inset 0 4px 15px rgba(0,0,0,0.04)"
                                }}>
                                    <div style={{ fontSize: "11px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Utilization</div>
                                    <div style={{ fontSize: "1.75rem", fontWeight: 850, color: "#0f172a" }}>{Math.round((totalSpent / totalAllocated) * 100)}%</div>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", width: "100%" }}>
                                {categoryStats.filter(c => c.spent > 0).map(cat => (
                                    <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: cat.color }}></div>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ fontSize: "12px", fontWeight: 800, color: "#1e293b" }}>{cat.name}</span>
                                            <span style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8" }}>₹{cat.spent.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontWeight: 700, fontSize: "14px", border: "1px dashed #e2e8f0", width: "100%", borderRadius: "24px" }}>
                            Initialize transactions for visualization.
                        </div>
                    )}
                </div>

                <div style={{
                    flex: 1,
                    minWidth: "500px",
                    background: "#fff",
                    padding: "2.75rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                        <h3 style={{ fontSize: "1.35rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <History size={22} color="#2563eb" />
                            Financial Ledger
                        </h3>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                background: "#0f172a",
                                color: "#fff",
                                border: "none",
                                padding: "0.6rem 1.25rem",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: 850,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)"
                            }}
                        >
                            <Plus size={14} strokeWidth={3} />
                            Log Expense
                        </button>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ textAlign: "left" }}>
                                    <th style={{ padding: "0.85rem 1rem", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Operational Entity</th>
                                    <th style={{ padding: "0.85rem 1rem", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</th>
                                    <th style={{ padding: "0.85rem 1rem", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Timestamp</th>
                                    <th style={{ padding: "0.85rem 1rem", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Valuation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventVendors.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: "6rem", textAlign: "center", color: "#94a3b8", fontWeight: 700, fontStyle: "italic" }}>No transactional logs found in current context.</td>
                                    </tr>
                                ) : (
                                    eventVendors.map((v, idx) => (
                                        <tr key={v._id} style={{
                                            background: idx % 2 !== 0 ? "#fafafc" : "transparent",
                                            height: "36px",
                                            transition: "background 0.2s ease"
                                        }}>
                                            <td style={{ padding: "0 1rem", fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{v.name}</td>
                                            <td style={{ padding: "0 1rem", fontSize: "12px", fontWeight: 700, color: "#64748b" }}>{v.service}</td>
                                            <td style={{ padding: "0 1rem", fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                                            <td style={{ padding: "0 1rem", fontSize: "12px", fontWeight: 850, color: "#0f172a", textAlign: "right" }}>₹{v.cost.toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "#fff", width: "100%", maxWidth: "480px", padding: "3rem", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.18)", animation: "modalIn 0.3s ease-out" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Wallet size={20} strokeWidth={2.5} />
                                </div>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Log Expense</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: "#f8fafc", border: "none", color: "#64748b", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer" }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 850, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Entity / Item Name</label>
                                <input style={{ width: "100%", padding: "0.9rem", borderRadius: "14px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: 600 }} placeholder="e.g. Catering Deposit" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 850, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
                                    <select style={{ width: "100%", padding: "0.9rem", borderRadius: "14px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: 700 }} value={newExpense.service} onChange={e => setNewExpense({ ...newExpense, service: e.target.value })}>
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Logistics</option>
                                        <option>Entertainment</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 850, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Valuation (₹)</label>
                                    <input type="number" style={{ width: "100%", padding: "0.9rem", borderRadius: "14px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: 850 }} placeholder="0" value={newExpense.cost} onChange={e => setNewExpense({ ...newExpense, cost: e.target.value })} required />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "1rem", borderRadius: "14px", border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" style={{ flex: 1.5, padding: "1rem", borderRadius: "14px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)" }}>Execute Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalIn { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                tbody tr:hover { background: #fdfdfd !important; cursor: default; }
            `}</style>
        </div>
    );
}
