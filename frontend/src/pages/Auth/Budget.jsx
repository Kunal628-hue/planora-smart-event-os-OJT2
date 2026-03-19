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
    CircleSlash,
    Sparkles
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
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>
                        Financial <span style={{ color: "#2563eb" }}>Studio</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                        {activeEvent ? `Optimizing budget for ${activeEvent.name}` : "Initialize an event context to start tracking."}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    disabled={!selectedEventId}
                    style={{
                        borderRadius: "16px",
                        padding: "1rem 2rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        fontWeight: 800,
                        fontSize: "15px",
                        cursor: "pointer",
                        boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
                        transition: "all 0.2s ease"
                    }}
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>Log Expense</span>
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2.5rem" }}>
                {/* Main Overview */}
                <div style={{
                    gridColumn: "span 4",
                    background: "#fff",
                    padding: "2.5rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2.5rem"
                }}>
                    {!activeEvent ? (
                        <div style={{ textAlign: "center", padding: "4rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                            <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                                <CircleSlash size={32} />
                            </div>
                            <p style={{ fontWeight: 800, color: "#64748b", fontSize: "1.1rem" }}>No active context selected</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <svg width="200" height="200" viewBox="0 0 200 200">
                                    <circle cx="100" cy="100" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r={radius}
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
                                        transform="rotate(-90 100 100)"
                                    />
                                </svg>
                                <div style={{ position: "absolute", textAlign: "center" }}>
                                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{Math.round(percentUsed)}%</div>
                                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>Utilized</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                <div style={{
                                    padding: "1.5rem",
                                    background: "#f8fafc",
                                    borderRadius: "24px",
                                    border: "1px solid #f1f5f9",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <div>
                                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>Available Balance</div>
                                        <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>₹{(totalAllocated - totalSpent).toLocaleString()}</div>
                                    </div>
                                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                        <Wallet size={24} />
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                    <div style={{ padding: "1.25rem", background: "#f0fdf4", borderRadius: "20px", border: "1px solid #dcfce7" }}>
                                        <div style={{ fontSize: "11px", color: "#10b981", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Budget</div>
                                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>₹{totalAllocated.toLocaleString()}</div>
                                    </div>
                                    <div style={{ padding: "1.25rem", background: "#fdf2f8", borderRadius: "20px", border: "1px solid #fce7f3" }}>
                                        <div style={{ fontSize: "11px", color: "#ec4899", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>Spent</div>
                                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>₹{totalSpent.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Categories Breakdown */}
                <div style={{
                    gridColumn: "span 8",
                    background: "#fff",
                    padding: "2.5rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.85rem" }}>
                            <PieChart size={24} color="#2563eb" strokeWidth={2.5} />
                            Category Distribution
                        </h3>
                        <span style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontWeight: 800,
                            fontSize: "11px",
                            padding: "6px 12px",
                            borderRadius: "100px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>Live Analysis</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {categoryStats.filter(c => c.spent > 0).length === 0 ? (
                            <div style={{ textAlign: "center", padding: "5rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                                    <History size={32} />
                                </div>
                                <div>
                                    <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem" }}>No categorical data</p>
                                    <p style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 500, margin: 0 }}>Log your first expense to see the visual breakdown.</p>
                                </div>
                            </div>
                        ) : (
                            categoryStats.map((cat) => (
                                <div key={cat.name}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", alignItems: "flex-end" }}>
                                        <div>
                                            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{cat.name}</span>
                                            <span style={{ marginLeft: "1rem", fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                                                ₹{cat.spent.toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "13px", fontWeight: 800, color: cat.color }}>
                                            {totalSpent > 0 ? Math.round((cat.spent / totalSpent) * 100) : 0}%
                                        </div>
                                    </div>
                                    <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "100px", overflow: "hidden" }}>
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${totalSpent > 0 ? (cat.spent / totalSpent) * 100 : 0}%`,
                                                background: cat.color,
                                                borderRadius: "100px",
                                                transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)"
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Transaction Ledger */}
                <div style={{
                    gridColumn: "span 12",
                    background: "#fff",
                    padding: "2.5rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                            <History size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Transaction Ledger</h3>
                            <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500, margin: "0.25rem 0 0" }}>Chronological record of operational commitments.</p>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        {eventVendors.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8", background: "#f8fafc", borderRadius: "24px", border: "1px dashed #e2e8f0" }}>
                                <CreditCard size={40} style={{ opacity: 0.5, marginBottom: "1rem" }} />
                                <p style={{ fontWeight: 800, margin: 0 }}>No transaction history found.</p>
                            </div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ textAlign: "left", borderBottom: "1px solid #f1f5f9" }}>
                                        <th style={{ padding: "0 1.5rem 1rem", fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Entity</th>
                                        <th style={{ padding: "0 1.5rem 1rem", fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                                        <th style={{ padding: "0 1.5rem 1rem", fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                        <th style={{ padding: "0 1.5rem 1rem", fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Financial Impact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventVendors.map((v) => (
                                        <tr key={v._id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.2s" }} className="transaction-row">
                                            <td style={{ padding: "1.5rem", fontWeight: 800, color: "#0f172a" }}>{v.name}</td>
                                            <td style={{ padding: "1.5rem" }}>
                                                <span style={{
                                                    padding: "4px 10px",
                                                    borderRadius: "8px",
                                                    background: "#f1f5f9",
                                                    fontSize: "11px",
                                                    fontWeight: 800,
                                                    color: "#64748b",
                                                    textTransform: "uppercase"
                                                }}>{v.service}</span>
                                            </td>
                                            <td style={{ padding: "1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "13px", fontWeight: 800 }}>
                                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></div>
                                                    Settled
                                                </div>
                                            </td>
                                            <td style={{ padding: "1.5rem", textAlign: "right", fontWeight: 800, fontSize: "1.1rem" }}>
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
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "#fff", width: "100%", maxWidth: "520px", padding: "3rem", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", animation: "modalIn 0.3s ease-out" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Wallet size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Log Expense</h2>
                                    <p style={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 500, margin: "0.25rem 0 0" }}>Update the transaction ledger with a new entry.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "#f1f5f9", border: "none", color: "#64748b", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            ><X size={20} strokeWidth={3} /></button>
                        </div>
                        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Entity / Item Name</label>
                                <input style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600 }} placeholder="e.g. Venue Booking Deposit" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} required />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
                                    <select style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }} value={newExpense.service} onChange={e => setNewExpense({ ...newExpense, service: e.target.value })}>
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Logistics</option>
                                        <option>Entertainment</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount (₹)</label>
                                    <input type="number" style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 800 }} placeholder="50000" value={newExpense.cost} onChange={e => setNewExpense({ ...newExpense, cost: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "1.1rem", borderRadius: "14px", border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" style={{ flex: 1.5, padding: "1.1rem", borderRadius: "14px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)" }}>Update Ledger</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalIn {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .transaction-row:hover {
                    background: #f8fafc !important;
                }
            `}</style>
        </div>
    );
}
