import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
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
    ArrowUpRight,
    Edit2,
    Trash2,
    Upload,
    FileText,
    ExternalLink
} from "lucide-react";
import { LogoLoader } from "../../components/ui/Loader";

export default function Budget() {
    const { user, events, selectedEventId, addNotification } = useOutletContext();
    const { showConfirm } = useDialog();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [newExpense, setNewExpense] = useState({
        name: "",
        service: "Catering",
        cost: "",
        receiptUrl: ""
    });

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_API_URL}/vendors?user=${user.uid}&email=${user.email}`;
            if (selectedEventId) {
                url += `&eventId=${selectedEventId}`;
            }
            const res = await fetch(url);
            const vendorsData = await res.json();
            setVendors(Array.isArray(vendorsData) ? vendorsData : []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedEventId]);

    const activeEvent = events.find(e => (e.id || e._id) === selectedEventId);
    const eventVendors = selectedEventId
        ? vendors.filter(v => String(v.event?._id || v.event) === String(selectedEventId))
        : vendors;

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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("receipt", file);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/upload/receipt`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setNewExpense(prev => ({ ...prev, receiptUrl: data.url }));
                addNotification("Document Sanitized", "Your financial proof has been securely uploaded to the registry.");
            }
        } catch (err) {
            console.error("Upload failed:", err);
            addNotification("Upload Protocol Failed", "We couldn't synchronize the evidence folder.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const method = editingExpense ? "PATCH" : "POST";
            const url = editingExpense 
                ? `${import.meta.env.VITE_API_URL}/vendors/${editingExpense._id}`
                : `${import.meta.env.VITE_API_URL}/vendors`;

            const response = await fetch(url, {
                method,
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
                setEditingExpense(null);
                setNewExpense({ name: "", service: "Catering", cost: "" });
                fetchData();
                addNotification(editingExpense ? "Ledger Updated" : "Expense Logged", `Financial entry for '${newExpense.name}' has been processed.`);
            }
        } catch (err) {
            console.error("Add expense failed:", err);
        }
    };

    const handleDeleteExpense = async (id) => {
        const confirmed = await showConfirm("Purge Transaction", "Are you sure you want to permanently remove this financial entry from the ledger?");
        if (!confirmed) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vendors/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                fetchData();
                addNotification("Entry Purged", "The selected transaction has been removed from the ledger.");
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setNewExpense({
            name: expense.name,
            service: expense.service,
            cost: expense.cost,
            receiptUrl: expense.receiptUrl || ""
        });
        setShowModal(true);
    };

    if (loading) {
        return <LogoLoader text="Calculating Financials..." />;
    }

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
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

            <div className="responsive-grid-3" style={{ marginBottom: "3.5rem" }}>
                <div className="stat-card" style={{ background: "#fff", padding: "2.25rem", borderRadius: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Total Budget</div>
                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#2563eb", letterSpacing: "-0.02em" }}>₹{totalAllocated.toLocaleString('en-IN')}</div>
                </div>
                <div className="stat-card" style={{ background: "#fff", padding: "2.25rem", borderRadius: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ec4899" }}></div>
                        Total Spent
                    </div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>₹{totalSpent.toLocaleString('en-IN')}</div>
                </div>
                <div className="stat-card" style={{ background: "#fff", padding: "2.25rem", borderRadius: "32px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Remaining Liquidity</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: remainingColor }}>₹{remaining.toLocaleString('en-IN')}</div>
                </div>
            </div>

            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{
                    flex: "1 1 350px",
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
                    flex: "1 1 450px",
                    background: "#fff",
                    padding: "2.75rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)",
                    overflow: "hidden"
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

                    <div style={{ overflowX: "auto", width: "100%" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ textAlign: "left" }}>
                                    <th style={{ padding: "0.85rem 1rem", minWidth: "140px", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Operational Entity</th>
                                    <th style={{ padding: "0.85rem 1rem", minWidth: "100px", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Category</th>
                                    <th style={{ padding: "0.85rem 1rem", minWidth: "100px", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Timestamp</th>
                                    <th style={{ padding: "0.85rem 1rem", minWidth: "120px", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Valuation</th>
                                    <th style={{ padding: "0.85rem 1rem", minWidth: "100px", fontSize: "10px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventVendors.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "6rem", textAlign: "center", color: "#94a3b8", fontWeight: 700, fontStyle: "italic" }}>No transactional logs found in current context.</td>
                                    </tr>
                                ) : (
                                    eventVendors.map((v, idx) => (
                                        <tr key={v._id} style={{
                                            background: idx % 2 !== 0 ? "#fafafc" : "transparent",
                                            height: "36px"
                                        }}>
                                            <td style={{ padding: "0 1rem", fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>{v.name}</td>
                                            <td style={{ padding: "0 1rem", fontSize: "12px", fontWeight: 700, color: "#64748b" }}>{v.service}</td>
                                            <td style={{ padding: "0 1rem", fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                                            <td style={{ padding: "0 1rem", fontSize: "12px", fontWeight: 850, color: "#0f172a", textAlign: "right" }}>₹{v.cost.toLocaleString()}</td>
                                            <td style={{ padding: "0 1rem", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center" }}>
                                                    {v.receiptUrl && (
                                                        <a 
                                                            href={`${import.meta.env.VITE_API_URL}${v.receiptUrl}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            style={{ color: "#2563eb", padding: "4px", display: "flex" }}
                                                            title="View Receipt"
                                                        >
                                                            <FileText size={14} />
                                                        </a>
                                                    )}
                                                    <button onClick={() => openEditModal(v)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteExpense(v._id)} style={{ background: "none", border: "none", color: "#ef444490", cursor: "pointer", padding: "4px" }}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)", padding: "1rem" }}>
                    <div className="modal-reveal mobile-full-width" style={{ background: "#fff", width: "100%", maxWidth: "480px", padding: "2rem", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
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

                            <div style={{ 
                                border: "2px dashed #e2e8f0", 
                                borderRadius: "20px", 
                                padding: "1.5rem",
                                textAlign: "center",
                                position: "relative",
                                background: newExpense.receiptUrl ? "#f0f9ff" : "transparent",
                                transition: "all 0.2s"
                            }}>
                                {isUploading ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                        <div className="animate-spin"><Upload size={20} color="#2563eb" /></div>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb" }}>Uploading Digital Proof...</span>
                                    </div>
                                ) : newExpense.receiptUrl ? (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                            <FileText size={16} />
                                        </div>
                                        <div style={{ textAlign: "left" }}>
                                            <div style={{ fontSize: "12px", fontWeight: 800, color: "#0369a1" }}>Proof Attached</div>
                                            <div style={{ fontSize: "10px", color: "#0ea5e9", fontWeight: 600 }}>Click to replace file</div>
                                        </div>
                                        <input 
                                            type="file" 
                                            onChange={handleFileUpload}
                                            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                                            accept="image/*,.pdf"
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                        <Upload size={20} color="#94a3b8" />
                                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#64748b" }}>Attach Receipt / Bill</div>
                                        <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>PNG, JPG or PDF up to 5MB</div>
                                        <input 
                                            type="file" 
                                            onChange={handleFileUpload}
                                            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                                            accept="image/*,.pdf"
                                        />
                                    </div>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "1rem", borderRadius: "14px", border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" style={{ flex: 1.5, padding: "1rem", borderRadius: "14px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)" }}>{editingExpense ? "Update Entry" : "Execute Entry"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

</div>
    );
}
