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
    ExternalLink,
    Activity,
    RefreshCw
} from "lucide-react";
import { LogoLoader, PlanoraSpinner } from "../../components/ui/Loader";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Budget() {
    const { user, events, selectedEventId, addNotification, hasFullAccess, refreshEvents } = useOutletContext();
    const { showConfirm } = useDialog();
    const [vendors, setVendors] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
    const [newBudgetValue, setNewBudgetValue] = useState("");
    const [editingExpense, setEditingExpense] = useState(null);
    const [newExpense, setNewExpense] = useState({
        name: "",
        service: "Catering",
        cost: "",
        receiptUrl: ""
    });
    const [filterCategory, setFilterCategory] = useState("All");
    const [aiPlan, setAiPlan] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const vendorUrl = `${import.meta.env.VITE_API_URL}/vendors?user=${user.uid}&email=${user.email}${selectedEventId ? `&eventId=${selectedEventId}` : ""}`;
            const taskUrl = `${import.meta.env.VITE_API_URL}/tasks?user=${user.uid}${selectedEventId ? `&eventId=${selectedEventId}` : ""}`;
            
            const [vRes, tRes] = await Promise.all([
                fetch(vendorUrl),
                fetch(taskUrl)
            ]);
            
            const [vData, tData] = await Promise.all([
                vRes.json(),
                tRes.json()
            ]);
            
            setVendors(Array.isArray(vData) ? vData : []);
            setTasks(Array.isArray(tData) ? tData : []);
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

    // AI Visibility Logic: Enabled as a live strategy tool for active monitoring
    const showGenerator = true;

    // 6-Month Burn Rate Logic
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const burnRateData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(currentMonth - 5 + i);
        return { name: monthNames[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear(), Actual: 0 };
    });

    eventVendors.forEach(v => {
        const d = v.createdAt ? new Date(v.createdAt) : new Date();
        const m = d.getMonth();
        const y = d.getFullYear();
        const monthData = burnRateData.find(lm => lm.monthIndex === m && lm.year === y);
        if (monthData) {
            monthData.Actual += (v.cost || 0);
        }
    });

    const uniqueCategories = ["All", ...new Set(eventVendors.map(v => v.service))];
    const filteredVendors = filterCategory === "All" ? eventVendors : eventVendors.filter(v => v.service === filterCategory);

    const baseCategories = ["Catering", "Decor", "Photography", "Venue", "Logistics", "Entertainment", "Operations"];
    
    const categoryStats = baseCategories.map(name => {
        const colors = {
            "Catering": "#6366f1",
            "Decor": "#10b981",
            "Photography": "#f59e0b",
            "Venue": "#ec4899",
            "Logistics": "#94a3b8",
            "Entertainment": "#a855f7",
            "Operations": "#64748b"
        };
        return {
            name,
            color: colors[name] || "#94a3b8",
            spent: eventVendors
                .filter(v => v.service === name || v.service.startsWith(`${name}:`))
                .reduce((sum, v) => sum + (v.cost || 0), 0)
        };
    });

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

    const handleUpdateBudget = async (e) => {
        e.preventDefault();
        if (!newBudgetValue || isNaN(newBudgetValue) || newBudgetValue <= 0) {
            addNotification("Invalid Amount", "Please enter a valid budget valuation.", "warning");
            return;
        }

        setIsUpdatingBudget(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${selectedEventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ budget: Number(newBudgetValue) })
            });

            if (res.ok) {
                addNotification("Budget Synchronized", `Event valuation updated to ₹${Number(newBudgetValue).toLocaleString()}.`, "success");
                setShowBudgetModal(false);
                refreshEvents(); // Sync global state
            } else {
                throw new Error("Synchronization failure");
            }
        } catch (error) {
            addNotification("Update Failed", "Could not synchronize budget boundaries with the server.", "warning");
        } finally {
            setIsUpdatingBudget(false);
        }
    };

    const handleGeneratePlan = async () => {
        if (!selectedEventId) return;
        setIsGenerating(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/strategic-plan/${selectedEventId}`);
            const data = await res.json();
            if (res.ok) {
                setAiPlan(data);
                addNotification("Strategy Synthesized", "AI has generated a granular budget division plan.");
            } else {
                throw new Error(data.message || "Failed to generate plan");
            }
        } catch (err) {
            console.error("Plan generation failed:", err);
            addNotification("Engine Error", "Failed to generate strategic plan.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApplyPlan = async () => {
        if (!aiPlan || !selectedEventId || !user) return;
        
        const confirmed = await showConfirm("Apply Strategic Plan", "This will automatically add all suggested tasks to your workflow and synchronize the financial ledger. Proceed?");
        if (!confirmed) return;

        setIsApplying(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/apply-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: selectedEventId,
                    plan: aiPlan,
                    userId: user.uid
                })
            });
            if (res.ok) {
                addNotification("Plan Implemented", "Workflow and Ledger have been synchronized.");
                setAiPlan(null); // Clear plan after applying
                fetchData(); // Refresh data
            } else {
                const data = await res.json();
                throw new Error(data.message || "Failed to apply plan");
            }
        } catch (err) {
            console.error("Apply plan failed:", err);
            addNotification("Sync Failed", "Could not apply the strategic plan.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleExportCSV = () => {
        if (eventVendors.length === 0) return;
        
        const headers = ["Entity Name", "Category", "Date", "Cost", "Status"];
        const rows = eventVendors.map(v => [
            `"${v.name}"`,
            `"${v.service}"`,
            `"${new Date(v.createdAt || Date.now()).toLocaleDateString('en-GB')}"`,
            v.cost,
            "APPROVED"
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeEvent ? activeEvent.name.replace(/\s+/g, '_') : 'event'}_expenses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Export Complete", "Ledger downloaded successfully.");
    };

    if (loading) {
        return (
            <div className="responsive-container" style={{ padding: "2rem", minHeight: "100vh" }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: "minmax(350px, 1.5fr) 1fr 1fr", gap: "1.5rem", mb: "1.5rem" }}>
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '16px', bgcolor: 'var(--bg-elevated)' }} />
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '16px', bgcolor: 'var(--bg-elevated)' }} />
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '16px', bgcolor: 'var(--bg-elevated)' }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
                    <Skeleton animation="wave" variant="rounded" height={400} sx={{ borderRadius: '16px', bgcolor: 'var(--bg-elevated)' }} />
                    <Skeleton animation="wave" variant="rounded" height={400} sx={{ borderRadius: '16px', bgcolor: 'var(--bg-elevated)' }} />
                </Box>
            </div>
        );
    }

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            background: "transparent",
            minHeight: "100vh",
            padding: "2rem",
            color: "var(--text-primary)"
        }}>
            {/* Header Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" }}>Financial Studio</h1>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>Strategic budget allocation and expense monitoring.</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                        onClick={() => {
                            if (!hasFullAccess) {
                                addNotification("Access Restricted", "Only the Event Lead can modify strategic budget boundaries.", "warning");
                                return;
                            }
                            setNewBudgetValue(totalAllocated);
                            setShowBudgetModal(true);
                        }} 
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "0.5rem 1.25rem", borderRadius: "10px", fontSize: "12px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <ArrowUpRight size={14} />
                        Set Budget
                    </button>
                    <button onClick={() => setShowModal(true)} style={{ background: "var(--accent-primary)", border: "none", color: "#000", padding: "0.5rem 1.25rem", borderRadius: "10px", fontSize: "12px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 20px rgba(249, 115, 22, 0.2)" }}>
                        <Plus size={16} strokeWidth={3} />
                        Add Expense
                    </button>
                </div>
            </div>

            <div style={{
                background: "var(--bg-surface)",
                padding: "2rem",
                borderRadius: "24px",
                border: "1px solid var(--border-subtle)",
                marginBottom: "2rem"
            }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "2rem",
                    marginBottom: "2rem"
                }}>
                    {/* Total Budget Card */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.1)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Wallet size={16} />
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Budget</span>
                        </div>
                        <div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>₹{totalAllocated.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Synchronized Target</div>
                        </div>
                    </div>

                    {/* Spent Card */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <IndianRupee size={16} />
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Spent</span>
                        </div>
                        <div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>₹{totalSpent.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>{totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}% of allocation</div>
                        </div>
                    </div>

                    {/* Remaining Card */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <History size={16} />
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Remaining</span>
                        </div>
                        <div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: remainingColor, letterSpacing: "-0.03em" }}>₹{remaining.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Strategic Buffer Available</div>
                        </div>
                    </div>
                </div>

                {/* Unified Stacked Bar Visualization */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <span>Allocated Coverage</span>
                        <span>{totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}% Utilization</span>
                    </div>
                    <div style={{ height: "12px", background: "var(--bg-elevated)", borderRadius: "6px", display: "flex", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ width: `${Math.min((totalSpent / totalAllocated) * 100, 100)}%`, background: "var(--accent-primary)", height: "100%", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
                        <div style={{ width: `${Math.min((remaining / totalAllocated) * 100, 100)}%`, background: "rgba(16, 185, 129, 0.2)", height: "100%", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}></div>
                    </div>
                    <div style={{ display: "flex", gap: "1.5rem", marginTop: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--accent-primary)" }}></div> Spent
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "rgba(16, 185, 129, 0.2)" }}></div> Remaining
                        </div>
                    </div>
                </div>
            </div>

            {/* AI STRATEGIC PLANNING ENGINE TRIGGER */}
            {!aiPlan && showGenerator && (
                <div className="ai-engine-card" style={{
                    background: "rgba(249, 115, 22, 0.02)",
                    borderRadius: "24px",
                    padding: "2rem",
                    textAlign: "left",
                    marginBottom: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            background: "rgba(249, 115, 22, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--accent-primary)",
                            flexShrink: 0
                        }}>
                            <TrendingUp size={24} strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>AI Strategic Planning Engine</h2>
                            <p style={{ color: "var(--text-secondary)", maxWidth: "600px", marginTop: "4px", fontSize: "13px", fontWeight: 500, lineHeight: "1.5" }}>
                                Synthesize a scale-aware financial roadmap. Optimized for {activeEvent?.type || 'your event'} with automated safety buffers.
                            </p>
                        </div>
                        <button
                            onClick={handleGeneratePlan}
                            disabled={isGenerating || !selectedEventId}
                            style={{
                                background: "var(--accent-primary)",
                                color: "#000",
                                padding: "0.6rem 1.5rem",
                                borderRadius: "10px",
                                fontSize: "12px",
                                fontWeight: 900,
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                boxShadow: "0 8px 20px rgba(249, 115, 22, 0.2)",
                                transition: "all 0.2s"
                            }}
                        >
                            {isGenerating ? <PlanoraSpinner size={16} color="#000" /> : <Activity size={16} strokeWidth={3} />}
                            {isGenerating ? "Synthesizing..." : "Apply Strategic AI Plan"}
                        </button>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "4px" }}>
                        {["Optimize Vendor Spend", "Reallocate Reserves", "Forecast Overruns"].map((chip) => (
                            <button 
                                key={chip}
                                onClick={() => addNotification("Strategy Locked", `Recalculating ${chip.toLowerCase()} logic based on latest ledger entries.`)}
                                style={{
                                    background: "rgba(255, 255, 255, 0.03)",
                                    border: "1px solid var(--border-subtle)",
                                    color: "var(--text-secondary)",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* FINANCIAL STUDIO - AI PLAN DISPLAY */}
            {aiPlan && (
                <div style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
                        <div>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent-primary)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Financial Studio</span>
                            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: "0.25rem 0" }}>AI Strategy Draft</h2>
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button onClick={() => setAiPlan(null)} style={{ padding: "0.75rem 1.5rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 700, background: "transparent", cursor: "pointer" }}>Discard</button>
                            <button 
                                onClick={handleApplyPlan} 
                                disabled={isApplying}
                                style={{ 
                                    padding: "0.75rem 2rem", 
                                    borderRadius: "12px", 
                                    border: "none", 
                                    background: "var(--accent-primary)", 
                                    color: "#000", 
                                    fontSize: "13px", 
                                    fontWeight: 900, 
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    boxShadow: "0 8px 20px rgba(249, 115, 22, 0.3)"
                                }}
                            >
                                {isApplying ? <PlanoraSpinner size={16} color="#000" /> : <Plus size={16} strokeWidth={3} />}
                                Apply Strategic Plan
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                        {/* Rationale Card */}
                        <div style={{ background: "var(--bg-surface)", padding: "2rem", borderRadius: "24px", border: "1px solid var(--border-subtle)", display: "flex", gap: "1.5rem", alignItems: "center" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Strategic Rationale</h4>
                                <p style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 500, lineHeight: "1.6", margin: 0 }}>{aiPlan.rationale}</p>
                            </div>
                        </div>

                        {/* Safety Reserve Card */}
                        <div style={{ background: "rgba(249, 115, 22, 0.05)", padding: "2rem", borderRadius: "24px", border: "1px solid rgba(249, 115, 22, 0.2)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-primary)" }}></div>
                                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent-primary)", textTransform: "uppercase" }}>Safety Buffer (10%)</span>
                            </div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)" }}>₹{aiPlan.safetyBuffer.toLocaleString('en-IN')}</div>
                            <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>Reserved for unforeseen expenses.</p>
                        </div>
                    </div>

                    {/* Itemized Categories */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                        {aiPlan.categories.map((cat, idx) => (
                            <div key={idx} style={{ background: "var(--bg-surface)", borderRadius: "24px", border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
                                <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{cat.name}</h4>
                                    <span style={{ fontSize: "13px", fontWeight: 900, color: "var(--accent-primary)" }}>₹{cat.allocated.toLocaleString()}</span>
                                </div>
                                <div style={{ padding: "1.25rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        {cat.tasks.map((task, tidx) => (
                                            <div key={tidx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{task.name}</span>
                                                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 700 }}>₹{task.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                {/* Monthly Burn Rate Chart */}
                <div style={{
                    background: "var(--bg-surface)",
                    padding: "2rem",
                    borderRadius: "24px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "0.02em" }}>Monthly Burn Rate</h3>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <span style={{ fontSize: "10px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--accent-primary)" }}></div> ACTUAL
                            </span>
                            <span style={{ fontSize: "10px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "2px", border: "1px solid var(--accent-primary)", background: "transparent" }}></div> FORECAST
                            </span>
                        </div>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "12px", minHeight: "200px", paddingBottom: "1.5rem" }}>
                        {burnRateData.map((d, i) => {
                            const max = Math.max(...burnRateData.map(v => v.Actual), 10000);
                            const actualHeight = (d.Actual / max) * 160;
                            const forecastHeight = actualHeight * 1.15; // Simulated forecast
                            
                            return (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: "4px", height: "160px", position: "relative" }}>
                                        <div style={{ flex: 1, background: "var(--accent-primary)", height: `${actualHeight}px`, borderRadius: "4px 4px 0 0", transition: "height 1s ease" }}></div>
                                        <div style={{ flex: 1, border: "1px solid var(--accent-primary)", borderBottom: "none", height: `${forecastHeight}px`, borderRadius: "4px 4px 0 0", background: "rgba(249, 115, 22, 0.05)" }}></div>
                                    </div>
                                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)" }}>{d.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Allocation Donut */}
                <div style={{
                    background: "var(--bg-surface)",
                    padding: "2rem",
                    borderRadius: "24px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2rem", margin: 0, letterSpacing: "0.02em" }}>Allocation Distribution</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "2rem", flex: 1 }}>
                        <div style={{ width: "140px", height: "140px", position: "relative", flexShrink: 0 }}>
                            <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%" }}>
                                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-elevated)" strokeWidth="3.5" />
                                {categoryStats.filter(c => c.spent > 0).map((cat, i, arr) => {
                                    const total = arr.reduce((s, c) => s + c.spent, 0);
                                    const percentage = (cat.spent / total) * 100;
                                    const prevPercentages = arr.slice(0, i).reduce((s, c) => s + (c.spent / total) * 100, 0);
                                    
                                    return (
                                        <circle 
                                            key={cat.name}
                                            cx="18" cy="18" r="16" fill="none" 
                                            stroke={cat.color} 
                                            strokeWidth="4" 
                                            strokeDasharray={`${percentage} 100`} 
                                            strokeDashoffset={-prevPercentages} 
                                            strokeLinecap="butt"
                                        />
                                    );
                                })}
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)" }}>{categoryStats.filter(c => c.spent > 0).length}</div>
                                <div style={{ fontSize: "8px", fontWeight: 800, color: "var(--text-muted)" }}>PARADIGMS</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
                            {categoryStats.filter(c => c.spent > 0).slice(0, 5).map(cat => (
                                <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: cat.color }}></div>
                                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>{cat.name}</span>
                                    </div>
                                    <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-primary)" }}>{totalSpent > 0 ? Math.round((cat.spent / totalSpent) * 100) : 0}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown Table */}
            <div style={{
                background: "var(--bg-surface)",
                padding: "2rem",
                borderRadius: "24px",
                border: "1px solid var(--border-subtle)",
                marginBottom: "2rem"
            }}>
                <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem", margin: 0, letterSpacing: "0.02em" }}>Category Breakdown</h3>
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <th style={{ textAlign: "left", padding: "1rem", fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Category</th>
                                <th style={{ textAlign: "right", padding: "1rem", fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Allocated</th>
                                <th style={{ textAlign: "right", padding: "1rem", fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Spent</th>
                                <th style={{ textAlign: "right", padding: "1rem", fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Remaining</th>
                                <th style={{ textAlign: "right", padding: "1rem", fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", width: "200px" }}>Utilization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {["Venue", "Catering", "Marketing", "Vendors", "Other"].map(cat => {
                                const spent = eventVendors.filter(v => v.service === cat).reduce((s, v) => s + (v.cost || 0), 0);
                                const allocated = (totalAllocated * (cat === 'Venue' ? 0.35 : cat === 'Catering' ? 0.3 : 0.1)); // Simulated allocation
                                const rem = allocated - spent;
                                const util = allocated > 0 ? (spent / allocated) * 100 : 0;
                                
                                return (
                                    <tr key={cat} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <td style={{ padding: "1rem", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{cat}</td>
                                        <td style={{ padding: "1rem", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>₹{allocated.toLocaleString()}</td>
                                        <td style={{ padding: "1rem", textAlign: "right", fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>₹{spent.toLocaleString()}</td>
                                        <td style={{ padding: "1rem", textAlign: "right", fontSize: "13px", fontWeight: 600, color: rem < 0 ? "var(--accent-danger)" : "var(--text-muted)" }}>₹{rem.toLocaleString()}</td>
                                        <td style={{ padding: "1rem", textAlign: "right" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end" }}>
                                                <span style={{ fontSize: "10px", fontWeight: 900, color: "var(--text-muted)" }}>{Math.round(util)}%</span>
                                                <div style={{ width: "100px", height: "4px", background: "var(--bg-elevated)", borderRadius: "2px", overflow: "hidden" }}>
                                                    <div style={{ width: `${Math.min(util, 100)}%`, height: "100%", background: util > 90 ? "var(--accent-danger)" : "var(--accent-primary)" }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Row - Table */}
            <div style={{
                background: "var(--bg-surface)",
                padding: "2rem",
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                position: "relative"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Recent Line Items</h3>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <button onClick={handleExportCSV} style={{ padding: "0.5rem 1rem", background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", borderRadius: "8px", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>Export CSV</button>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={{
                                padding: "0.5rem 1rem",
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--text-primary)",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: 600,
                                cursor: "pointer",
                                outline: "none",
                                WebkitAppearance: "none",
                                paddingRight: "2rem",
                                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>')`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 0.5rem center"
                            }}
                        >
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat === "All" ? "Filter" : cat}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)", borderTop: "1px solid var(--border-subtle)" }}>
                                <th style={{ padding: "1rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Item</th>
                                <th style={{ padding: "1rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                                <th style={{ padding: "1rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cost</th>
                                <th style={{ padding: "1rem", textAlign: "right", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No recent line items.</td>
                                </tr>
                            ) : (
                                filteredVendors.map((v) => (
                                    <tr key={v._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <td style={{ padding: "1rem", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{ color: "var(--accent-primary)" }}>{v.service === 'Equipment' || v.service === 'Decor' || v.service === 'Photography' ? <PieChart size={16} /> : <CreditCard size={16} />}</div>
                                            {v.name}
                                        </td>
                                        <td style={{ padding: "1rem", fontSize: "13px", color: "var(--text-secondary)" }}>{v.service}</td>
                                        <td style={{ padding: "1rem", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>₹{v.cost.toLocaleString()}</td>
                                        <td style={{ padding: "1rem", textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem" }}>
                                                <span style={{ fontSize: "10px", fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "4px 8px", borderRadius: "4px" }}>APPROVED</span>
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    {v.receiptUrl && (
                                                        <a href={`${import.meta.env.VITE_API_URL}${v.receiptUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", padding: "4px", display: "flex" }} title="View Receipt">
                                                            <FileText size={14} />
                                                        </a>
                                                    )}
                                                    <button onClick={() => openEditModal(v)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDeleteExpense(v._id)} style={{ background: "none", border: "none", color: "var(--accent-danger)", cursor: "pointer", padding: "4px" }}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: "flex", justifyContent: "center", padding: "1rem 0" }}>
                    <button style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>View full history <ArrowRight size={14} /></button>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            background: "var(--accent-primary)",
                            color: "#000",
                            border: "none",
                            padding: "0.75rem 1.25rem",
                            borderRadius: "12px",
                            fontSize: "13px",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 8px 20px rgba(249, 115, 22, 0.3)"
                        }}
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Expense
                    </button>
                </div>
            </div>

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)", padding: "1rem" }}>
                    <div className="modal-reveal mobile-full-width" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", width: "100%", maxWidth: "480px", padding: "2rem", borderRadius: "24px", boxShadow: "0 25px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--bg-elevated)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Wallet size={20} strokeWidth={2.5} />
                                </div>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Log Expense</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: "var(--bg-elevated)", border: "none", color: "var(--text-secondary)", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border-subtle)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 850, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Entity / Item Name</label>
                                <input style={{ width: "100%", padding: "0.9rem", borderRadius: "14px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600 }} placeholder="e.g. Catering Deposit" value={newExpense.name} onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 850, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
                                    <select style={{ width: "100%", padding: "0.9rem", borderRadius: "14px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 700 }} value={newExpense.service} onChange={e => setNewExpense({ ...newExpense, service: e.target.value })}>
                                        <option value="Catering">Catering</option>
                                        <option value="Decor">Decor</option>
                                        <option value="Photography">Photography</option>
                                        <option value="Venue">Venue</option>
                                        <option value="Logistics">Logistics</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Operations">Operations</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 850, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Valuation (₹)</label>
                                    <input type="number" style={{ width: "100%", padding: "0.9rem", borderRadius: "14px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "14px", fontWeight: 850 }} placeholder="0" value={newExpense.cost} onChange={e => setNewExpense({ ...newExpense, cost: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{
                                border: "1px dashed var(--border-subtle)",
                                borderRadius: "20px",
                                padding: "1.5rem",
                                textAlign: "center",
                                position: "relative",
                                background: newExpense.receiptUrl ? "var(--accent-soft)" : "transparent",
                                transition: "all 0.2s"
                            }}>
                                {isUploading ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                        <div className="animate-spin"><Upload size={20} color="var(--accent-primary)" /></div>
                                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>Uploading Digital Proof...</span>
                                    </div>
                                ) : newExpense.receiptUrl ? (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                            <FileText size={16} />
                                        </div>
                                        <div style={{ textAlign: "left" }}>
                                            <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>Proof Attached</div>
                                            <div style={{ fontSize: "10px", color: "var(--accent-primary)", fontWeight: 600 }}>Click to replace file</div>
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
                                        <Upload size={20} color="var(--text-muted)" />
                                        <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)" }}>Attach Receipt / Bill</div>
                                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>PNG, JPG or PDF up to 5MB</div>
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
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "1rem", borderRadius: "14px", border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-primary)", fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>Cancel</button>
                                <button type="submit" style={{ flex: 1.5, padding: "1rem", borderRadius: "14px", border: "none", background: "var(--accent-primary)", color: "#000", fontWeight: 900, cursor: "pointer", boxShadow: "0 10px 20px rgba(249, 115, 22, 0.2)" }}>{editingExpense ? "Update Entry" : "Execute Entry"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showBudgetModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)", padding: "1rem" }}>
                    <div className="modal-reveal" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", width: "100%", maxWidth: "400px", padding: "2rem", borderRadius: "24px", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.1)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Wallet size={20} />
                                </div>
                                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Set Budget</h2>
                            </div>
                            <button onClick={() => setShowBudgetModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpdateBudget}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>Strategic Allocation (₹)</label>
                                <input 
                                    type="number" 
                                    autoFocus
                                    style={{ width: "100%", padding: "1rem", borderRadius: "14px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 900, textAlign: "center" }} 
                                    value={newBudgetValue} 
                                    onChange={e => setNewBudgetValue(e.target.value)} 
                                    required 
                                />
                                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px", textAlign: "center", lineHeight: "1.5" }}>
                                    This will redefine the financial boundaries for the current event. All burn rate projections will be recalculated.
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button type="button" onClick={() => setShowBudgetModal(false)} style={{ flex: 1, padding: "0.8rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-primary)", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" disabled={isUpdatingBudget} style={{ flex: 1.5, padding: "0.8rem", borderRadius: "12px", border: "none", background: "var(--accent-primary)", color: "#000", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    {isUpdatingBudget ? <RefreshCw size={16} className="animate-spin" /> : "Update Budget"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .ai-engine-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border: 2px dashed var(--accent-primary);
                    border-radius: 24px;
                    opacity: 0.4;
                    animation: rotateBorder 30s linear infinite;
                    pointer-events: none;
                }
                @keyframes rotateBorder {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes modalReveal {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .modal-reveal {
                    animation: modalReveal 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
}
