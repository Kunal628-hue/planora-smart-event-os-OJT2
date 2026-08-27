import { useState, useEffect, useMemo } from "react";
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
    RefreshCw,
    Search,
    Download,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Receipt,
    Filter,
    DollarSign
} from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useUpload } from "../../context/UploadContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Budget() {
    const { user, events, selectedEventId, addNotification, hasFullAccess, refreshEvents, syncTimestamp } = useOutletContext();
    const { showConfirm, showAlert } = useDialog();
    const { startUpload, completeUpload, cancelUpload } = useUpload();
    
    // State
    const [vendors, setVendors] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
    const [newBudgetValue, setNewBudgetValue] = useState("");
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [newExpense, setNewExpense] = useState({
        name: "",
        service: "Catering",
        cost: "",
        receiptUrl: ""
    });
    
    // Category management state
    const DEFAULT_CATEGORIES = useMemo(() => [
        { name: "Venue", ratio: 0.30, color: "#ec4899" },
        { name: "Catering", ratio: 0.25, color: "#6366f1" },
        { name: "Decor", ratio: 0.15, color: "#10b981" },
        { name: "Photography", ratio: 0.10, color: "#f59e0b" },
        { name: "Logistics", ratio: 0.08, color: "#3b82f6" },
        { name: "Entertainment", ratio: 0.07, color: "#a855f7" },
        { name: "Operations", ratio: 0.05, color: "#64748b" }
    ], []);

    const [customCategories, setCustomCategories] = useState(() => {
        try {
            const saved = localStorage.getItem(`planora_categories_${selectedEventId || "default"}`);
            return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
        } catch {
            return DEFAULT_CATEGORIES;
        }
    });

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: "", allocated: "" });

    useEffect(() => {
        try {
            const saved = localStorage.getItem(`planora_categories_${selectedEventId || "default"}`);
            if (saved) {
                setCustomCategories(JSON.parse(saved));
            } else {
                setCustomCategories(DEFAULT_CATEGORIES);
            }
        } catch {
            setCustomCategories(DEFAULT_CATEGORIES);
        }
    }, [selectedEventId, DEFAULT_CATEGORIES]);

    const saveCategories = (newList) => {
        setCustomCategories(newList);
        try {
            localStorage.setItem(`planora_categories_${selectedEventId || "default"}`, JSON.stringify(newList));
        } catch (e) {
            console.error("Error saving categories to localStorage", e);
        }
    };

    const [filterCategory, setFilterCategory] = useState("All");
    const [aiPlan, setAiPlan] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const vendorUrl = `${API_URL}/vendors${selectedEventId ? `?eventId=${selectedEventId}` : ""}`;
            const taskUrl = `${API_URL}/tasks${selectedEventId ? `?eventId=${selectedEventId}` : ""}`;
            const headers = { "x-user-id": user.uid, "x-user-email": user.email || "" };
            
            const [vRes, tRes] = await Promise.all([
                fetch(vendorUrl, { headers }),
                fetch(taskUrl, { headers })
            ]);
            
            const [vData, tData] = await Promise.all([
                vRes.json(),
                tRes.json()
            ]);
            
            setVendors(Array.isArray(vData) ? vData : []);
            setTasks(Array.isArray(tData) ? tData : []);
        } catch (err) {
            console.error("Fetch error:", err);
            setVendors([]);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedEventId, syncTimestamp]);

    const activeEvent = useMemo(() => {
        return events.find(e => (e.id || e._id) === selectedEventId) || events[0] || null;
    }, [events, selectedEventId]);

    const eventVendors = useMemo(() => {
        return selectedEventId
            ? vendors.filter(v => String(v.event?._id || v.event) === String(selectedEventId))
            : vendors;
    }, [vendors, selectedEventId]);

    // Financial Metrics
    const totalAllocated = activeEvent ? (activeEvent.budget || 0) : 0;
    const totalSpent = useMemo(() => {
        return eventVendors.reduce((sum, v) => sum + (Number(v.cost) || 0), 0);
    }, [eventVendors]);

    const remaining = totalAllocated - totalSpent;
    const remainingPercent = totalAllocated > 0 ? (remaining / totalAllocated) * 100 : 0;
    const remainingColor = remainingPercent > 30 ? "#10b981" : remainingPercent >= 10 ? "#f59e0b" : "#ef4444";

    // 6-Month Burn Rate Data
    const burnRateData = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = new Date().getMonth();
        const data = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(currentMonth - 5 + i);
            return { name: monthNames[d.getMonth()], monthIndex: d.getMonth(), year: d.getFullYear(), Actual: 0 };
        });

        eventVendors.forEach(v => {
            const d = v.createdAt ? new Date(v.createdAt) : new Date();
            const m = d.getMonth();
            const y = d.getFullYear();
            const monthData = data.find(lm => lm.monthIndex === m && lm.year === y);
            if (monthData) {
                monthData.Actual += (Number(v.cost) || 0);
            }
        });

        return data;
    }, [eventVendors]);

    // Filter & Categories
    const activeCategoriesList = useMemo(() => {
        const list = [...customCategories];
        const existingNames = new Set(list.map(c => c.name));
        
        eventVendors.forEach(v => {
            if (v.service && !existingNames.has(v.service)) {
                existingNames.add(v.service);
                list.push({
                    name: v.service,
                    allocated: 0,
                    color: "#f97316"
                });
            }
        });
        return list;
    }, [customCategories, eventVendors]);

    const getCategoryAllocated = (cat) => {
        if (cat.allocated !== undefined && cat.allocated !== null && cat.allocated !== "") {
            return Number(cat.allocated);
        }
        if (cat.ratio !== undefined) {
            return Math.round(totalAllocated * cat.ratio);
        }
        return Math.round(totalAllocated * 0.1);
    };

    const uniqueCategories = ["All", ...new Set(activeCategoriesList.map(c => c.name))];
    
    const filteredVendors = useMemo(() => {
        return eventVendors.filter(v => {
            const matchesSearch = !searchQuery || 
                v.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                v.service?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === "All" || v.service === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [eventVendors, searchQuery, filterCategory]);

    const categoryStats = useMemo(() => {
        return activeCategoriesList.map(cat => {
            const spent = eventVendors
                .filter(v => v.service === cat.name || v.service?.startsWith(`${cat.name}:`))
                .reduce((sum, v) => sum + (Number(v.cost) || 0), 0);
            return {
                name: cat.name,
                color: cat.color || "#f97316",
                spent,
                allocated: getCategoryAllocated(cat)
            };
        });
    }, [activeCategoriesList, eventVendors, totalAllocated]);

    const openAddCategoryModal = () => {
        setEditingCategory(null);
        setCategoryForm({ name: "", allocated: "" });
        setShowCategoryModal(true);
    };

    const openEditCategoryModal = (cat) => {
        setEditingCategory(cat);
        const currentAllocated = cat.allocated !== undefined && cat.allocated !== null ? cat.allocated : getCategoryAllocated(cat);
        setCategoryForm({ name: cat.name, allocated: String(currentAllocated) });
        setShowCategoryModal(true);
    };

    const handleSaveCategory = (e) => {
        e.preventDefault();
        const trimmedName = categoryForm.name.trim();
        if (!trimmedName) return;

        const allocVal = categoryForm.allocated !== "" ? Math.max(0, Number(categoryForm.allocated)) : 0;

        if (editingCategory) {
            const oldName = editingCategory.name;
            const updated = activeCategoriesList.map(c => {
                if (c.name === oldName) {
                    return {
                        ...c,
                        name: trimmedName,
                        allocated: allocVal
                    };
                }
                return c;
            });
            saveCategories(updated);

            if (oldName !== trimmedName) {
                const vendorsToUpdate = eventVendors.filter(v => v.service === oldName);
                vendorsToUpdate.forEach(async (v) => {
                    try {
                        const headers = { 
                            "Content-Type": "application/json",
                            "x-user-id": user.uid, 
                            "x-user-email": user.email || "" 
                        };
                        await fetch(`${API_URL}/vendors/${v._id || v.id}`, {
                            method: "PATCH",
                            headers,
                            body: JSON.stringify({ service: trimmedName })
                        });
                    } catch (err) {
                        console.error("Error updating vendor service name:", err);
                    }
                });
                if (vendorsToUpdate.length > 0) {
                    fetchData();
                }
            }

            addNotification("Category Updated", `Category "${trimmedName}" updated successfully.`);
        } else {
            if (activeCategoriesList.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
                showAlert("Category Exists", `A category named "${trimmedName}" already exists.`);
                return;
            }
            const palette = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#a855f7", "#64748b", "#06b6d4", "#f97316"];
            const randomColor = palette[activeCategoriesList.length % palette.length];
            const newCat = {
                name: trimmedName,
                allocated: allocVal,
                color: randomColor
            };
            saveCategories([...activeCategoriesList, newCat]);
            addNotification("Category Added", `Category "${trimmedName}" created successfully.`);
        }

        setShowCategoryModal(false);
    };

    const handleDeleteCategory = async (catName) => {
        const confirmed = await showConfirm(
            "Delete Category",
            `Are you sure you want to delete category "${catName}"? Existing logged expenses under this category will remain unaffected.`
        );
        if (confirmed) {
            const updated = activeCategoriesList.filter(c => c.name !== catName);
            saveCategories(updated);
            addNotification("Category Removed", `Category "${catName}" was removed.`);
        }
    };

    // Handlers
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        startUpload(file);
        setIsUploading(true);
        const formData = new FormData();
        formData.append("receipt", file);

        try {
            const res = await fetch(`${API_URL}/upload/receipt`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                completeUpload();
                setNewExpense(prev => ({ ...prev, receiptUrl: data.url }));
                addNotification("Receipt Attached", "Digital financial proof uploaded successfully.");
            } else {
                cancelUpload();
                addNotification("Upload Failed", "Could not process receipt file.");
            }
        } catch (err) {
            cancelUpload();
            console.error("Upload failed:", err);
            addNotification("Upload Protocol Failed", "Could not synchronize receipt upload.");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.name || !newExpense.cost || isNaN(newExpense.cost) || Number(newExpense.cost) <= 0) {
            await showAlert("Validation Error", "Please enter a valid expense title and positive valuation amount.");
            return;
        }

        try {
            const method = editingExpense ? "PATCH" : "POST";
            const url = editingExpense
                ? `${API_URL}/vendors/${editingExpense._id}`
                : `${API_URL}/vendors`;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newExpense,
                    cost: Number(newExpense.cost),
                    event: selectedEventId,
                    user: user.uid,
                    status: "Paid"
                })
            });

            if (response.ok) {
                setShowModal(false);
                setEditingExpense(null);
                setNewExpense({ name: "", service: "Catering", cost: "", receiptUrl: "" });
                fetchData();
                addNotification(editingExpense ? "Ledger Updated" : "Expense Logged", `Financial entry for '${newExpense.name}' processed.`);
            } else {
                const errData = await response.json();
                await showAlert("Ledger Error", errData.message || "Failed to log expense entry.");
            }
        } catch (err) {
            console.error("Add expense failed:", err);
        }
    };

    const handleDeleteExpense = async (id) => {
        const confirmed = await showConfirm("Purge Expense", "Are you sure you want to permanently remove this transaction from the ledger?");
        if (!confirmed) return;
        try {
            const response = await fetch(`${API_URL}/vendors/${id}`, { method: "DELETE" });
            if (response.ok) {
                fetchData();
                addNotification("Entry Purged", "Transaction detached from financial ledger.");
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setNewExpense({
            name: expense.name,
            service: expense.service || "Catering",
            cost: expense.cost,
            receiptUrl: expense.receiptUrl || ""
        });
        setShowModal(true);
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();
        if (!newBudgetValue || isNaN(newBudgetValue) || Number(newBudgetValue) <= 0) {
            await showAlert("Invalid Amount", "Please enter a valid positive target budget amount.");
            return;
        }

        setIsUpdatingBudget(true);
        try {
            const res = await fetch(`${API_URL}/events/${selectedEventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ budget: Number(newBudgetValue) })
            });

            if (res.ok) {
                addNotification("Budget Synchronized", `Target budget updated to ₹${Number(newBudgetValue).toLocaleString('en-IN')}.`);
                setShowBudgetModal(false);
                refreshEvents();
            } else {
                throw new Error("Synchronization failure");
            }
        } catch (error) {
            addNotification("Update Failed", "Could not synchronize target budget boundaries.");
        } finally {
            setIsUpdatingBudget(false);
        }
    };

    const handleGeneratePlan = async () => {
        if (!selectedEventId) {
            await showAlert("Event Required", "Please select an active event to synthesize an AI financial plan.");
            return;
        }
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_URL}/ai/strategic-plan/${selectedEventId}`);
            const data = await res.json();
            if (res.ok) {
                setAiPlan(data);
                addNotification("Strategy Synthesized", "AI has generated a granular budget allocation breakdown.");
            } else {
                throw new Error(data.message || "Failed to generate plan");
            }
        } catch (err) {
            console.error("Plan generation failed:", err);
            addNotification("AI Engine Notice", "Strategic plan generator requires an active event context.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApplyPlan = async () => {
        if (!aiPlan || !selectedEventId || !user) return;
        
        const confirmed = await showConfirm("Apply AI Strategy", "This will automatically populate suggested category tasks and update the financial ledger. Proceed?");
        if (!confirmed) return;

        setIsApplying(true);
        try {
            const res = await fetch(`${API_URL}/ai/apply-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: selectedEventId,
                    plan: aiPlan,
                    userId: user.uid
                })
            });
            if (res.ok) {
                addNotification("Plan Implemented", "Strategic plan successfully synchronized into workflow ledger.");
                setAiPlan(null);
                fetchData();
            } else {
                const data = await res.json();
                throw new Error(data.message || "Failed to apply plan");
            }
        } catch (err) {
            console.error("Apply plan failed:", err);
            addNotification("Sync Error", "Could not apply the strategic plan.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleExportCSV = () => {
        if (eventVendors.length === 0) {
            addNotification("Export Warning", "No financial entries available in current ledger.");
            return;
        }
        
        const headers = ["Entity / Item Name", "Category", "Date Logged", "Cost (INR)", "Status"];
        const rows = eventVendors.map(v => [
            `"${v.name || ''}"`,
            `"${v.service || ''}"`,
            `"${new Date(v.createdAt || Date.now()).toLocaleDateString('en-GB')}"`,
            v.cost || 0,
            "APPROVED"
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Financial_Ledger_${activeEvent ? activeEvent.name.replace(/\s+/g, '_') : 'event'}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Export Complete", "Financial ledger CSV downloaded.");
    };

    const inputStyle = {
        width: "100%",
        padding: "0.7rem 0.85rem",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-medium)",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "var(--text-primary)",
        outline: "none"
    };

    const labelStyle = {
        display: "block",
        fontSize: "10px",
        fontWeight: "700",
        color: "var(--text-secondary)",
        marginBottom: "0.4rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em"
    };

    if (loading) {
        return (
            <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: "1.25rem", mb: "1.75rem" }}>
                    <Skeleton animation="wave" variant="rounded" height={160} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton animation="wave" variant="rounded" height={160} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton animation="wave" variant="rounded" height={160} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: "1.5rem" }}>
                    <Skeleton animation="wave" variant="rounded" height={320} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton animation="wave" variant="rounded" height={320} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                </Box>
            </div>
        );
    }

    return (
        <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
            {/* Header Bar */}
            <div className="events-header">
                <div className="events-header-left">
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                            Financial Studio
                        </h1>
                    </div>

                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(249, 115, 22, 0.1)",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        border: "1px solid rgba(249, 115, 22, 0.25)"
                    }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", animation: "pulseDot 2s infinite" }}></div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {activeEvent ? activeEvent.name : "Event Stream Ledger"}
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button 
                        onClick={() => {
                            if (!hasFullAccess) {
                                addNotification("Access Restricted", "Only the Event Lead can modify strategic budget boundaries.");
                                return;
                            }
                            setNewBudgetValue(totalAllocated);
                            setShowBudgetModal(true);
                        }} 
                        style={{ 
                            background: "rgba(255,255,255,0.04)", 
                            border: "1px solid var(--border-subtle)", 
                            color: "var(--text-primary)", 
                            padding: "0.55rem 1rem", 
                            borderRadius: "10px", 
                            fontWeight: 700, 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "12px",
                            height: "40px",
                            transition: "all 0.2s"
                        }}
                    >
                        <ArrowUpRight size={15} />
                        Set Budget
                    </button>

                    <button 
                        onClick={handleExportCSV} 
                        style={{ 
                            background: "rgba(255,255,255,0.04)", 
                            border: "1px solid var(--border-subtle)", 
                            color: "var(--text-secondary)", 
                            padding: "0.55rem 1rem", 
                            borderRadius: "10px", 
                            fontWeight: 700, 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "12px",
                            height: "40px",
                            transition: "all 0.2s"
                        }}
                    >
                        <Download size={15} />
                        Export Ledger CSV
                    </button>

                    <button 
                        onClick={() => {
                            setEditingExpense(null);
                            setNewExpense({ name: "", service: "Catering", cost: "", receiptUrl: "" });
                            setShowModal(true);
                        }} 
                        style={{ 
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                            color: "#fff", 
                            border: "none", 
                            padding: "0.6rem 1.35rem", 
                            borderRadius: "10px", 
                            fontWeight: 800, 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "13px", 
                            height: "40px",
                            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                            transition: "all 0.2s"
                        }}
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* 3-Column KPI Stat Cards Grid */}
            <div className="budget-kpi-grid">
                {/* Total Budget Card */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Total Budget Target
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.1)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Wallet size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            ₹{totalAllocated.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            Synchronized target limit
                        </div>
                    </div>
                </div>

                {/* Total Spent Card */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Total Spent
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <IndianRupee size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            ₹{totalSpent.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}% of target allocated
                        </div>
                    </div>
                </div>

                {/* Remaining Buffer Card */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Remaining Buffer
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${remainingColor}18`, color: remainingColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <History size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: remainingColor, letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            ₹{remaining.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            {remainingPercent > 30 ? "Healthy strategic buffer" : remainingPercent >= 10 ? "Moderate reserve remaining" : "Budget overrun warning"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Unified Allocation Coverage Bar */}
            <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "16px",
                padding: "1.25rem 1.5rem",
                marginBottom: "1.75rem"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                    <span>ALLOCATED COVERAGE</span>
                    <span>{totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}% UTILIZATION</span>
                </div>
                <div style={{ height: "10px", background: "rgba(255,255,255,0.06)", borderRadius: "6px", display: "flex", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min((totalSpent / (totalAllocated || 1)) * 100, 100)}%`, background: "var(--accent-primary)", height: "100%", transition: "width 0.8s ease" }}></div>
                    <div style={{ width: `${Math.max(0, Math.min((remaining / (totalAllocated || 1)) * 100, 100))}%`, background: "rgba(16, 185, 129, 0.25)", height: "100%", transition: "width 0.8s ease" }}></div>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--accent-primary)" }}></div> Spent (₹{totalSpent.toLocaleString('en-IN')})
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "rgba(16, 185, 129, 0.4)" }}></div> Available Reserve (₹{remaining.toLocaleString('en-IN')})
                    </div>
                </div>
            </div>

            {/* AI STRATEGIC PLANNING ENGINE CARD */}
            {!aiPlan && (
                <div style={{
                    background: "var(--bg-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                    padding: "1.5rem",
                    marginBottom: "1.75rem",
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: "rgba(249, 115, 22, 0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--accent-primary)",
                            flexShrink: 0
                        }}>
                            <Sparkles size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 2px" }}>
                                AI Strategic Planning Engine
                            </h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: 0, fontWeight: 500 }}>
                                Synthesize a scale-aware financial roadmap optimized for {activeEvent?.type || 'your event'} with automated safety buffers.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleGeneratePlan}
                        disabled={isGenerating || !selectedEventId}
                        style={{
                            background: "var(--accent-primary)",
                            color: "#fff",
                            padding: "0.6rem 1.25rem",
                            borderRadius: "10px",
                            fontSize: "12px",
                            fontWeight: 800,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                            transition: "all 0.2s"
                        }}
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={15} /> : <Activity size={15} strokeWidth={2.5} />}
                        {isGenerating ? "Synthesizing Strategy..." : "Apply Strategic AI Plan"}
                    </button>
                </div>
            )}

            {/* AI STRATEGY DRAFT VIEW */}
            {aiPlan && (
                <div style={{ background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border-subtle)", padding: "1.5rem", marginBottom: "1.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
                        <div>
                            <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Strategy Draft</span>
                            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)", margin: "2px 0 0" }}>Financial Optimization Plan</h2>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button onClick={() => setAiPlan(null)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 700, background: "transparent", cursor: "pointer" }}>Discard</button>
                            <button 
                                onClick={handleApplyPlan} 
                                disabled={isApplying}
                                style={{ 
                                    padding: "0.5rem 1.25rem", 
                                    borderRadius: "8px", 
                                    border: "none", 
                                    background: "var(--accent-primary)", 
                                    color: "#fff", 
                                    fontSize: "12px", 
                                    fontWeight: 800, 
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}
                            >
                                {isApplying ? <RefreshCw className="animate-spin" size={15} /> : <CheckCircle2 size={15} />}
                                Apply Plan to Roster
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                            <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Strategic Rationale</span>
                            <p style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, margin: "4px 0 0", lineHeight: 1.5 }}>{aiPlan.rationale}</p>
                        </div>
                        <div style={{ background: "rgba(249, 115, 22, 0.08)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(249, 115, 22, 0.2)" }}>
                            <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--accent-primary)", textTransform: "uppercase" }}>Safety Buffer (10%)</span>
                            <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--accent-primary)", marginTop: "2px" }}>₹{aiPlan.safetyBuffer?.toLocaleString('en-IN')}</div>
                            <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Reserved for unexpected cost fluctuations.</span>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                        {aiPlan.categories?.map((cat, idx) => (
                            <div key={idx} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--border-subtle)", padding: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
                                    <h4 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>{cat.name}</h4>
                                    <span style={{ fontSize: "12px", fontWeight: 900, color: "var(--accent-primary)" }}>₹{cat.allocated?.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {cat.tasks?.map((task, tidx) => (
                                        <div key={tidx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>{task.name}</span>
                                            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>₹{task.price?.toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Visual Analytics Split */}
            <div className="responsive-split" style={{ gap: "1.5rem", marginBottom: "1.75rem" }}>
                {/* Monthly Burn Rate */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                            Monthly Burn Rate
                        </span>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <span style={{ fontSize: "10px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700 }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: "var(--accent-primary)" }}></div> ACTUAL
                            </span>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "8px", height: "130px" }}>
                        {burnRateData.map((d, i) => {
                            const max = Math.max(...burnRateData.map(v => v.Actual), 10000);
                            const actualHeight = (d.Actual / max) * 100;
                            
                            return (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                    <div style={{ width: "100%", background: "rgba(255,255,255,0.06)", height: "100px", borderRadius: "6px", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                                        <div style={{ width: "100%", background: "linear-gradient(180deg, #f97316 0%, #ea580c 100%)", height: `${Math.max(actualHeight, 6)}%`, transition: "height 0.5s ease" }}></div>
                                    </div>
                                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)" }}>{d.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Category Allocation Breakdown */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                            Expense Distribution
                        </span>
                        <PieChart size={15} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        {categoryStats.map((cat, idx) => {
                            const percent = totalSpent > 0 ? Math.round((cat.spent / totalSpent) * 100) : 0;
                            return (
                                <div key={idx}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11px" }}>
                                        <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{cat.name}</span>
                                        <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>₹{cat.spent.toLocaleString('en-IN')} ({percent}%)</span>
                                    </div>
                                    <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                                        <div style={{ width: `${percent}%`, height: "100%", background: cat.color, borderRadius: "3px", transition: "width 0.5s ease" }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Category Granular Breakdown Table */}
            <div style={{
                background: "var(--bg-surface)",
                borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
                padding: "1.25rem 1.5rem",
                marginBottom: "1.75rem"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Category Utilization
                    </h3>
                    <button 
                        onClick={openAddCategoryModal}
                        style={{ 
                            background: "var(--accent-primary)", 
                            color: "#fff", 
                            border: "none", 
                            padding: "0.45rem 0.9rem", 
                            borderRadius: "8px", 
                            fontWeight: 700, 
                            cursor: "pointer", 
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                    >
                        <Plus size={14} /> Add Category
                    </button>
                </div>
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CATEGORY</th>
                                <th style={{ textAlign: "right", padding: "0.75rem 1rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>ALLOCATED (EST)</th>
                                <th style={{ textAlign: "right", padding: "0.75rem 1rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>SPENT</th>
                                <th style={{ textAlign: "right", padding: "0.75rem 1rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>REMAINING</th>
                                <th style={{ textAlign: "right", padding: "0.75rem 1rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", width: "180px" }}>UTILIZATION</th>
                                <th style={{ textAlign: "center", padding: "0.75rem 1rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", width: "90px" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeCategoriesList.map(cat => {
                                const spent = eventVendors.filter(v => v.service === cat.name || v.service?.startsWith(`${cat.name}:`)).reduce((s, v) => s + (v.cost || 0), 0);
                                const allocated = getCategoryAllocated(cat);
                                const rem = allocated - spent;
                                const util = allocated > 0 ? (spent / allocated) * 100 : 0;
                                
                                return (
                                    <tr key={cat.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <td style={{ padding: "0.85rem 1rem", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{cat.name}</td>
                                        <td style={{ padding: "0.85rem 1rem", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>₹{allocated.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: "0.85rem 1rem", textAlign: "right", fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>₹{spent.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: "0.85rem 1rem", textAlign: "right", fontSize: "12px", fontWeight: 600, color: rem < 0 ? "#ef4444" : "#10b981" }}>₹{rem.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-end" }}>
                                                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-primary)" }}>{Math.round(util)}%</span>
                                                <div style={{ width: "90px", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                                                    <div style={{ width: `${Math.min(util, 100)}%`, height: "100%", background: util > 100 ? "#ef4444" : "var(--accent-primary)", borderRadius: "3px" }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                                                <button 
                                                    onClick={() => openEditCategoryModal(cat)} 
                                                    title="Edit Category" 
                                                    style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", padding: "0.35rem", borderRadius: "6px", cursor: "pointer" }}
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCategory(cat.name)} 
                                                    title="Delete Category" 
                                                    style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "0.35rem", borderRadius: "6px", cursor: "pointer" }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Financial Ledger Table */}
            <div style={{ background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border-subtle)", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                        Financial Ledger & Line Items
                    </h3>

                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ position: "relative", minWidth: "200px" }}>
                            <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input 
                                placeholder="Search expense item..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ 
                                    width: "100%", 
                                    background: "rgba(255,255,255,0.03)", 
                                    border: "1px solid var(--border-subtle)", 
                                    borderRadius: "8px", 
                                    padding: "0.45rem 0.75rem 0.45rem 2.25rem", 
                                    color: "var(--text-primary)", 
                                    outline: "none", 
                                    fontSize: "12px",
                                    fontWeight: 600 
                                }}
                            />
                        </div>

                        <div className="custom-select">
                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                                {uniqueCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>

                {filteredVendors.length === 0 ? (
                    <div style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(249, 115, 22, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", marginBottom: "1rem" }}>
                            <Receipt size={28} />
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 0.4rem", color: "var(--text-primary)" }}>
                            No Financial Entries Found
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "12px", maxWidth: "340px", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
                            {searchQuery ? `No expense items matching "${searchQuery}".` : "Log your first expense transaction to begin tracking event budget allocations."}
                        </p>
                        <button 
                            onClick={() => {
                                setEditingExpense(null);
                                setNewExpense({ name: "", service: "Catering", cost: "", receiptUrl: "" });
                                setShowModal(true);
                            }} 
                            style={{ 
                                background: "var(--accent-primary)", 
                                color: "#fff", 
                                border: "none", 
                                padding: "0.6rem 1.25rem", 
                                borderRadius: "8px", 
                                fontWeight: 800, 
                                cursor: "pointer", 
                                fontSize: "12px" 
                            }}
                        >
                            Log Your First Expense
                        </button>
                    </div>
                ) : (
                    <div style={{ width: "100%", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.01)", borderBottom: "1px solid var(--border-subtle)" }}>
                                    <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>EXPENSE ITEM</th>
                                    <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>CATEGORY</th>
                                    <th style={{ textAlign: "center", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>DATE LOGGED</th>
                                    <th style={{ textAlign: "right", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>COST (₹)</th>
                                    <th style={{ textAlign: "center", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>STATUS</th>
                                    <th style={{ textAlign: "right", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.map(v => (
                                    <tr key={v._id} className="event-row" style={{ borderBottom: "1px solid var(--border-subtle)", transition: "all 0.2s" }}>
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Receipt size={16} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-primary)" }}>{v.name}</div>
                                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>{v.notes || "Financial record"}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <span style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", padding: "0.3rem 0.65rem", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>
                                                {v.service || "General"}
                                            </span>
                                        </td>

                                        <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                                            {new Date(v.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>

                                        <td style={{ padding: "1rem 1.5rem", textAlign: "right", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                                            ₹{Number(v.cost || 0).toLocaleString('en-IN')}
                                        </td>

                                        <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                                            <span style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#10b981", padding: "0.25rem 0.65rem", borderRadius: "20px", fontSize: "10px", fontWeight: 900, letterSpacing: "0.04em" }}>
                                                PAID
                                            </span>
                                        </td>

                                        <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                                {v.receiptUrl && (
                                                    <a 
                                                        href={`${API_URL}${v.receiptUrl}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        title="View Uploaded Receipt" 
                                                        style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "#3b82f6", padding: "0.45rem", borderRadius: "8px", cursor: "pointer" }}
                                                    >
                                                        <FileText size={14} />
                                                    </a>
                                                )}

                                                <button 
                                                    onClick={() => openEditModal(v)} 
                                                    title="Edit Expense" 
                                                    style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", padding: "0.45rem", borderRadius: "8px", cursor: "pointer" }}
                                                >
                                                    <Edit2 size={14} />
                                                </button>

                                                <button 
                                                    onClick={() => handleDeleteExpense(v._id)} 
                                                    title="Remove Expense" 
                                                    style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "0.45rem", borderRadius: "8px", cursor: "pointer" }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Expense Modal */}
            {showModal && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0, 0, 0, 0.75)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    zIndex: 2000, 
                    backdropFilter: "blur(12px)" 
                }}>
                    <div className="modal-reveal mobile-full-width" style={{
                        background: "var(--bg-surface)",
                        width: "95%",
                        maxWidth: "460px",
                        padding: "2rem",
                        borderRadius: "20px",
                        border: "1px solid var(--border-medium)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                        position: "relative"
                    }}>
                        <button 
                            onClick={() => setShowModal(false)} 
                            style={{ 
                                position: "absolute", 
                                top: "1.25rem", 
                                right: "1.5rem", 
                                background: "rgba(255,255,255,0.05)", 
                                border: "1px solid var(--border-subtle)", 
                                color: "var(--text-muted)", 
                                cursor: "pointer",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ marginBottom: "1.75rem" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.12)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                <Wallet size={22} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.25rem", color: "var(--text-primary)" }}>
                                {editingExpense ? "Edit Expense Entry" : "Log Expense Entry"}
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>
                                Record transaction valuation in the event financial ledger.
                            </p>
                        </div>

                        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Expense Item / Entity Name</label>
                                <input 
                                    placeholder="e.g. Catering Deposit / Stage Audio" 
                                    style={inputStyle} 
                                    value={newExpense.name} 
                                    onChange={e => setNewExpense({ ...newExpense, name: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Category</label>
                                    <select style={{ ...inputStyle, paddingRight: "0.5rem" }} value={newExpense.service} onChange={e => setNewExpense({ ...newExpense, service: e.target.value })}>
                                        {activeCategoriesList.map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={labelStyle}>Valuation (INR ₹)</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        placeholder="50000" 
                                        style={inputStyle} 
                                        value={newExpense.cost} 
                                        onChange={e => setNewExpense({ ...newExpense, cost: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            {/* File Upload Attachment Dropzone */}
                            <div>
                                <label style={labelStyle}>Attach Receipt / Invoice (Optional)</label>
                                <div style={{
                                    border: "1px dashed var(--border-medium)",
                                    borderRadius: "12px",
                                    padding: "1.25rem",
                                    textAlign: "center",
                                    position: "relative",
                                    background: newExpense.receiptUrl ? "rgba(16, 185, 129, 0.08)" : "rgba(255,255,255,0.02)",
                                    transition: "all 0.2s"
                                }}>
                                    {isUploading ? (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                            <RefreshCw size={18} className="animate-spin" style={{ color: "var(--accent-primary)" }} />
                                            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)" }}>Uploading Proof...</span>
                                        </div>
                                    ) : newExpense.receiptUrl ? (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                            <CheckCircle2 size={18} style={{ color: "#10b981" }} />
                                            <span style={{ fontSize: "12px", fontWeight: 800, color: "#10b981" }}>Receipt File Attached</span>
                                            <input type="file" onChange={handleFileUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} accept="image/*,.pdf" />
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                            <Upload size={18} style={{ color: "var(--text-muted)" }} />
                                            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>Click or drop invoice PNG, JPG or PDF</span>
                                            <input type="file" onChange={handleFileUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} accept="image/*,.pdf" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                style={{ 
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                                    color: "#fff", 
                                    padding: "0.85rem", 
                                    borderRadius: "12px", 
                                    fontWeight: 800, 
                                    fontSize: "0.95rem", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    marginTop: "0.75rem",
                                    boxShadow: "0 10px 20px rgba(249, 115, 22, 0.25)"
                                }}
                            >
                                {editingExpense ? "Update Ledger Record" : "Log Expense Entry"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Set Target Budget Modal */}
            {showBudgetModal && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0, 0, 0, 0.75)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    zIndex: 2000, 
                    backdropFilter: "blur(12px)" 
                }}>
                    <div className="modal-reveal" style={{ 
                        background: "var(--bg-surface)", 
                        width: "90%", 
                        maxWidth: "400px", 
                        padding: "2rem", 
                        borderRadius: "20px", 
                        border: "1px solid var(--border-medium)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                        position: "relative"
                    }}>
                        <button 
                            onClick={() => setShowBudgetModal(false)} 
                            style={{ 
                                position: "absolute", 
                                top: "1.25rem", 
                                right: "1.5rem", 
                                background: "rgba(255,255,255,0.05)", 
                                border: "1px solid var(--border-subtle)", 
                                color: "var(--text-muted)", 
                                cursor: "pointer",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.12)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                <Wallet size={22} />
                            </div>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, margin: "0 0 0.25rem", color: "var(--text-primary)" }}>
                                Set Event Budget
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
                                Redefine target allocation boundaries for {activeEvent ? activeEvent.name : 'this event'}.
                            </p>
                        </div>

                        <form onSubmit={handleUpdateBudget}>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={labelStyle}>Strategic Allocation Target (INR ₹)</label>
                                <input 
                                    type="number" 
                                    autoFocus
                                    placeholder="150000"
                                    style={{ 
                                        width: "100%", 
                                        padding: "0.9rem", 
                                        borderRadius: "12px", 
                                        border: "1px solid var(--border-medium)", 
                                        background: "var(--bg-elevated)", 
                                        color: "var(--text-primary)", 
                                        fontSize: "1.4rem", 
                                        fontWeight: 900, 
                                        textAlign: "center",
                                        outline: "none"
                                    }} 
                                    value={newBudgetValue} 
                                    onChange={e => setNewBudgetValue(e.target.value)} 
                                    required 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isUpdatingBudget}
                                style={{ 
                                    width: "100%",
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                                    color: "#fff", 
                                    padding: "0.85rem", 
                                    borderRadius: "12px", 
                                    fontWeight: 800, 
                                    fontSize: "0.95rem", 
                                    border: "none", 
                                    cursor: "pointer",
                                    boxShadow: "0 10px 20px rgba(249, 115, 22, 0.25)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                            >
                                {isUpdatingBudget ? <RefreshCw size={16} className="animate-spin" /> : "Update Budget Target"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Category Modal */}
            {showCategoryModal && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0, 0, 0, 0.75)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    zIndex: 2000, 
                    backdropFilter: "blur(12px)" 
                }}>
                    <div className="modal-reveal mobile-full-width" style={{
                        background: "var(--bg-surface)",
                        width: "95%",
                        maxWidth: "420px",
                        padding: "2rem",
                        borderRadius: "20px",
                        border: "1px solid var(--border-medium)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                        position: "relative"
                    }}>
                        <button 
                            onClick={() => setShowCategoryModal(false)} 
                            style={{ 
                                position: "absolute", 
                                top: "1.25rem", 
                                right: "1.5rem", 
                                background: "rgba(255,255,255,0.05)", 
                                border: "1px solid var(--border-subtle)", 
                                color: "var(--text-muted)", 
                                cursor: "pointer",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.12)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                {editingCategory ? <Edit2 size={20} /> : <Plus size={22} />}
                            </div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.25rem", color: "var(--text-primary)" }}>
                                {editingCategory ? "Edit Category" : "Add New Category"}
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>
                                {editingCategory ? "Modify category details and budget allocation." : "Create a custom category for expense organization."}
                            </p>
                        </div>

                        <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                            <div>
                                <label style={labelStyle}>Category Name</label>
                                <input 
                                    placeholder="e.g. Stage & Sound, Merch, Travel" 
                                    style={inputStyle} 
                                    value={categoryForm.name} 
                                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Allocated Budget (INR ₹)</label>
                                <input 
                                    type="number" 
                                    min="0" 
                                    placeholder="e.g. 50000" 
                                    style={inputStyle} 
                                    value={categoryForm.allocated} 
                                    onChange={e => setCategoryForm({ ...categoryForm, allocated: e.target.value })} 
                                />
                            </div>

                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowCategoryModal(false)}
                                    style={{ 
                                        flex: 1, 
                                        background: "rgba(255,255,255,0.05)", 
                                        border: "1px solid var(--border-subtle)", 
                                        color: "var(--text-secondary)", 
                                        padding: "0.75rem", 
                                        borderRadius: "10px", 
                                        fontWeight: 700, 
                                        cursor: "pointer", 
                                        fontSize: "13px" 
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    style={{ 
                                        flex: 1, 
                                        background: "var(--accent-primary)", 
                                        color: "#fff", 
                                        border: "none", 
                                        padding: "0.75rem", 
                                        borderRadius: "10px", 
                                        fontWeight: 800, 
                                        cursor: "pointer", 
                                        fontSize: "13px" 
                                    }}
                                >
                                    {editingCategory ? "Save Changes" : "Add Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .custom-select { position: relative; }
                .custom-select select { 
                    background: var(--bg-surface); 
                    border: 1px solid var(--border-subtle); 
                    border-radius: 10px; 
                    padding: 0.55rem 2.25rem 0.55rem 0.85rem; 
                    color: var(--text-primary); 
                    appearance: none; 
                    cursor: pointer; 
                    font-weight: 700; 
                    min-width: 150px; 
                    font-size: 12px; 
                    outline: none;
                }
                .custom-select svg { position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
                select option { background: #121214; color: #ffffff; }
            `}</style>
        </div>
    );
}
