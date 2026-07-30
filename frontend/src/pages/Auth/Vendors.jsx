import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import {
    Plus, 
    Trash2, 
    X, 
    Search, 
    ChevronDown, 
    Edit2, 
    Activity, 
    Handshake, 
    Users,
    Table as TableIcon,
    Grid as GridIcon,
    Sparkles,
    Loader2,
    DollarSign,
    Phone,
    Mail,
    Building2,
    SlidersHorizontal,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    Store
} from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { validateEmail, validatePhone } from "../../utils/validation";

const API_URL = import.meta.env.VITE_API_URL;

export default function Vendors() {
    const { user, events, selectedEventId, addNotification } = useOutletContext();
    const { showConfirm, showAlert } = useDialog();
    
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

    const [formVendor, setFormVendor] = useState({
        name: "",
        service: "Catering",
        contact: "",
        cost: "",
        eventId: "",
        status: "Unpaid"
    });

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let url = `${API_URL}/vendors?user=${user.uid}&email=${user.email}`;
            if (selectedEventId) {
                url += `&eventId=${selectedEventId}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setVendors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, [user, selectedEventId]);

    useEffect(() => {
        if (selectedEventId) {
            setFormVendor(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Contact validation (if email or phone)
        if (formVendor.contact && formVendor.contact.trim()) {
            const trimmedContact = formVendor.contact.trim();
            if (trimmedContact.includes("@")) {
                const emailCheck = validateEmail(trimmedContact, false);
                if (!emailCheck.valid) {
                    await showAlert("Invalid Email Contact", emailCheck.message);
                    return;
                }
            } else if (/^[\d+\s\-()]+$/.test(trimmedContact)) {
                const phoneCheck = validatePhone(trimmedContact, false);
                if (!phoneCheck.valid) {
                    await showAlert("Invalid Phone Contact", phoneCheck.message);
                    return;
                }
            }
        }

        setSubmitLoading(true);
        const method = editingVendor ? "PATCH" : "POST";
        const url = editingVendor ? `${API_URL}/vendors/${editingVendor._id}` : `${API_URL}/vendors`;
        
        const targetEventId = formVendor.eventId || selectedEventId || (events.length > 0 ? (events[0].id || events[0]._id) : null);
        if (!targetEventId && !editingVendor) {
            await showAlert("Missing Event Context", "Please select an event to link this vendor to.");
            setSubmitLoading(false);
            return;
        }

        const payload = editingVendor ? {
            name: formVendor.name,
            service: formVendor.service,
            contact: formVendor.contact || "",
            cost: parseInt(formVendor.cost) || 0,
            status: formVendor.status || "Unpaid"
        } : {
            name: formVendor.name,
            service: formVendor.service,
            contact: formVendor.contact || "",
            cost: parseInt(formVendor.cost) || 0,
            status: formVendor.status || "Unpaid",
            event: targetEventId,
            user: user?.uid || ""
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                setShowModal(false);
                setEditingVendor(null);
                setFormVendor({ name: "", service: "Catering", contact: "", cost: "", eventId: selectedEventId || "", status: "Unpaid" });
                fetchData();
                addNotification(editingVendor ? "Vendor Updated" : "Vendor Onboarded", `${formVendor.name} has been successfully ${editingVendor ? "updated" : "added"}.`);
            } else {
                const errorData = await response.json();
                const errorMsg = errorData.errors && Array.isArray(errorData.errors) 
                    ? errorData.errors.map(err => `${err.field}: ${err.message}`).join("\n") 
                    : (errorData.message || "Failed to save vendor details.");
                await showAlert("Validation Error", errorMsg);
            }
        } catch (err) {
            console.error("Failed to save vendor:", err);
            await showAlert("Connection Error", "External synchronization failed.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        const confirmed = await showConfirm("Terminate Partnership", "Are you sure you want to permanently remove this strategic partner entity?");
        if (!confirmed) return;
        
        try {
            const response = await fetch(`${API_URL}/vendors/${vendorId}`, { method: "DELETE" });
            if (response.ok) {
                setVendors(vendors.filter(v => v._id !== vendorId));
                addNotification("Vendor Removed", "Service provider has been detached.");
            }
        } catch (err) {
            console.error("Failed to delete vendor:", err);
        }
    };

    const openEditModal = (vendor) => {
        setEditingVendor(vendor);
        setFormVendor({
            name: vendor.name,
            service: vendor.service,
            contact: vendor.contact || "",
            cost: vendor.cost,
            eventId: (vendor.event?._id || vendor.event) || "",
            status: vendor.status
        });
        setShowModal(true);
    };

    const getInitials = (name) => {
        if (!name) return "VP";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getAvatarColor = (name) => {
        const colors = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#eab308"];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.service.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All" || v.service === categoryFilter;
            let matchesStatus = true;
            if (statusFilter === "Active") matchesStatus = v.status === "Paid";
            if (statusFilter === "Pending") matchesStatus = v.status === "Unpaid" || v.status === "Inquiry";
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [vendors, searchTerm, categoryFilter, statusFilter]);

    // Dynamic analytics
    const totalValue = useMemo(() => vendors.reduce((sum, v) => sum + (parseInt(v.cost) || 0), 0), [vendors]);
    const paidValue = useMemo(() => vendors.filter(v => v.status === "Paid").reduce((sum, v) => sum + (parseInt(v.cost) || 0), 0), [vendors]);
    const unpaidValue = totalValue - paidValue;
    const efficiency = useMemo(() => totalValue > 0 ? Math.round((paidValue / totalValue) * 100) : 0, [paidValue, totalValue]);
    
    const vendorPerformance = useMemo(() => {
        if (vendors.length === 0) return "0.0";
        const paidCount = vendors.filter(v => v.status === "Paid").length;
        const contactCount = vendors.filter(v => v.contact && v.contact.trim() !== "").length;
        const score = ((paidCount / vendors.length) * 7) + ((contactCount / vendors.length) * 3);
        return score.toFixed(1);
    }, [vendors]);

    const inputStyle = {
        width: "100%",
        padding: "0.7rem 0.85rem",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-medium)",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "var(--text-primary)",
        outline: "none",
        transition: "border-color 0.2s"
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

    return (
        <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
            {/* Header Bar */}
            <div className="events-header">
                <div className="events-header-left">
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                            Vendor Registry
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
                            Strategic Monitoring
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => { 
                        setEditingVendor(null); 
                        setFormVendor({ name: "", service: "Catering", contact: "", cost: "", eventId: selectedEventId || "", status: "Unpaid" }); 
                        setShowModal(true); 
                    }}
                    style={{
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        color: "#ffffff",
                        borderRadius: "10px",
                        padding: "0.6rem 1.35rem",
                        fontWeight: 800,
                        fontSize: "13px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        border: "none",
                        boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                    <Plus size={16} strokeWidth={3} />
                    Register Partner
                </button>
            </div>

            {/* Quick Stats Grid (3-Column) */}
            <div className="vendors-kpi-grid">
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
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Total Vendors
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.1)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            {vendors.length}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            Registered service entities
                        </div>
                    </div>
                </div>

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
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Active Contracts
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Handshake size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "#10b981", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            {vendors.filter(v => v.status === "Paid").length}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            Operational & settled partners
                        </div>
                    </div>
                </div>

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
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Pending Approvals
                        </span>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Activity size={18} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            {vendors.filter(v => v.status !== "Paid").length}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                            In negotiations / unpaid status
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Controls Row */}
            <div className="vendors-filters" style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "16px",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem"
            }}>
                <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                    <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input 
                        placeholder="Search partner or service..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ 
                            width: "100%", 
                            background: "rgba(255,255,255,0.04)", 
                            border: "1px solid var(--border-subtle)", 
                            borderRadius: "10px", 
                            padding: "0.55rem 1rem 0.55rem 2.5rem", 
                            color: "var(--text-primary)", 
                            outline: "none", 
                            fontWeight: 600, 
                            fontSize: "13px" 
                        }} 
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div className="v-custom-select">
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="All">All Categories</option>
                            <option value="Catering">Catering</option>
                            <option value="Decor">Visual Design / Decor</option>
                            <option value="AV">Technical Ops / AV</option>
                            <option value="Photography">Digital Capture</option>
                            <option value="Venue">Physical Space / Venue</option>
                            <option value="Logistics">Logistics & Security</option>
                        </select>
                        <ChevronDown size={14} />
                    </div>

                    <div className="v-custom-select">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Operational Statuses</option>
                            <option value="Active">Operational / Paid</option>
                            <option value="Pending">Negotiation / Unpaid</option>
                        </select>
                        <ChevronDown size={14} />
                    </div>

                    {/* View Mode Switcher */}
                    <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "2px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <button
                            onClick={() => setViewMode("table")}
                            style={{
                                background: viewMode === "table" ? "var(--bg-elevated)" : "transparent",
                                border: "none",
                                color: viewMode === "table" ? "var(--accent-primary)" : "var(--text-muted)",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                            }}
                            title="Table View"
                        >
                            <TableIcon size={15} />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            style={{
                                background: viewMode === "grid" ? "var(--bg-elevated)" : "transparent",
                                border: "none",
                                color: viewMode === "grid" ? "var(--accent-primary)" : "var(--text-muted)",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                            }}
                            title="Grid View"
                        >
                            <GridIcon size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Vendor Directory Main Table / Grid */}
            <div style={{ 
                background: "var(--bg-surface)", 
                borderRadius: "16px", 
                border: "1px solid var(--border-subtle)", 
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
            }}>
                {loading ? (
                    <Box sx={{ padding: '2rem' }}>
                        {Array.from(new Array(4)).map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 3 }}>
                                <Skeleton animation="wave" variant="rounded" width={40} height={40} sx={{ borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                                <Skeleton animation="wave" height={20} width="25%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                <Skeleton animation="wave" height={20} width="15%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                <Skeleton animation="wave" height={20} width="20%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                <Skeleton animation="wave" height={20} width="15%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                            </Box>
                        ))}
                    </Box>
                ) : filteredVendors.length === 0 ? (
                    <div style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                            <Handshake size={28} style={{ color: "var(--text-muted)" }} />
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 0.4rem", color: "var(--text-primary)" }}>
                            No Partners Found
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "12px", maxWidth: "340px", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
                            {searchTerm ? `No vendor matching "${searchTerm}".` : "Synchronize your event portfolio with top-tier strategic vendors."}
                        </p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "260px" }}>
                            <button 
                                onClick={() => {
                                    setEditingVendor(null);
                                    setFormVendor({ name: "", service: "Catering", contact: "", cost: "", eventId: selectedEventId || "", status: "Unpaid" });
                                    setShowModal(true);
                                }}
                                style={{ 
                                    background: "var(--accent-primary)", 
                                    color: "#fff", 
                                    border: "none", 
                                    padding: "0.7rem 1rem", 
                                    borderRadius: "10px", 
                                    fontWeight: 800, 
                                    fontSize: "12px", 
                                    cursor: "pointer", 
                                    transition: "all 0.2s" 
                                }}
                            >
                                + Register Your First Partner
                            </button>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                 <button 
                                     onClick={() => addNotification("Migration Interface", "Strategic CSV import module is initializing. Prepare dataset.")}
                                     style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                 >
                                     <FileSpreadsheet size={13} />
                                     Import CSV
                                 </button>
                                 <button 
                                     onClick={() => addNotification("Marketplace Sync", "Connecting to Planora Global Vendor Ecosystem... Gateway active.")}
                                     style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                 >
                                     <Store size={13} />
                                     Marketplace
                                 </button>
                             </div>
                        </div>
                    </div>
                ) : viewMode === "table" ? (
                    <div style={{ width: "100%", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(255,255,255,0.01)", borderBottom: "1px solid var(--border-subtle)" }}>
                                    <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>PARTNER ENTITY</th>
                                    <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>SERVICE / PARADIGM</th>
                                    <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>LINKED EVENT</th>
                                    <th style={{ textAlign: "right", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>CONTRACT VALUE</th>
                                    <th style={{ textAlign: "center", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>STATUS</th>
                                    <th style={{ textAlign: "right", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.map(vendor => {
                                    const isPaid = vendor.status === "Paid";
                                    const avatarColor = getAvatarColor(vendor.name);

                                    return (
                                        <tr key={vendor._id} className="event-row" style={{ borderBottom: "1px solid var(--border-subtle)", transition: "all 0.2s" }}>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: avatarColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px", flexShrink: 0 }}>
                                                        {getInitials(vendor.name)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-primary)", marginBottom: "2px" }}>
                                                            {vendor.name}
                                                        </div>
                                                        {vendor.contact && (
                                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                                                                {vendor.contact}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <span style={{ 
                                                    background: "rgba(255,255,255,0.04)", 
                                                    border: "1px solid var(--border-subtle)", 
                                                    padding: "0.3rem 0.65rem", 
                                                    borderRadius: "6px", 
                                                    fontSize: "11px", 
                                                    fontWeight: 700, 
                                                    color: "var(--text-secondary)"
                                                }}>
                                                    {vendor.service}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                                                    {events.find(e => (e.id || e._id) === (vendor.event?._id || vendor.event))?.name || "Portfolio Stream"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                                <span style={{ fontSize: "14px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                                                    ₹{parseInt(vendor.cost || 0).toLocaleString('en-IN')}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                                                <div style={{ 
                                                    display: "inline-flex", 
                                                    alignItems: "center", 
                                                    gap: "6px", 
                                                    padding: "4px 10px", 
                                                    borderRadius: "20px", 
                                                    background: isPaid ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                                                    border: `1px solid ${isPaid ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"}` 
                                                }}>
                                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isPaid ? "#10b981" : "#f59e0b" }}></div>
                                                    <span style={{ fontSize: "10px", fontWeight: 900, color: isPaid ? "#10b981" : "#f59e0b", letterSpacing: "0.05em" }}>
                                                        {isPaid ? "OPERATIONAL" : "PENDING"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                                    <button onClick={() => openEditModal(vendor)} title="Edit Partner" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", color: "#3b82f6", padding: "0.45rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteVendor(vendor._id)} title="Delete Partner" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", padding: "0.45rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Grid View Cards */
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", padding: "1.5rem" }}>
                        {filteredVendors.map(vendor => {
                            const isPaid = vendor.status === "Paid";
                            const avatarColor = getAvatarColor(vendor.name);

                            return (
                                <div 
                                    key={vendor._id} 
                                    className="event-card-hover"
                                    style={{ 
                                        background: "rgba(255,255,255,0.02)", 
                                        border: "1px solid var(--border-subtle)", 
                                        borderRadius: "14px", 
                                        padding: "1.25rem", 
                                        display: "flex", 
                                        flexDirection: "column", 
                                        justifyContent: "space-between" 
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: avatarColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>
                                                    {getInitials(vendor.name)}
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                                                        {vendor.name}
                                                    </h4>
                                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                                                        {vendor.service}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: "4px" }}>
                                                <button onClick={() => openEditModal(vendor)} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: "3px" }}>
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteVendor(vendor._id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "3px" }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {vendor.contact && (
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Phone size={12} />
                                                {vendor.contact}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Contract</div>
                                            <div style={{ fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                                                ₹{parseInt(vendor.cost || 0).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: "10px", fontWeight: 900, color: isPaid ? "#10b981" : "#f59e0b", padding: "3px 8px", borderRadius: "12px", background: isPaid ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)" }}>
                                            {isPaid ? "OPERATIONAL" : "PENDING"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Analytics Dashboard */}
            <div className="vendors-dir-grid" style={{ marginTop: "1.75rem" }}>
                {/* Efficiency Gauge Card */}
                <div style={{
                    background: "var(--bg-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "1rem" }}>
                        Stream Context
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: "0.5rem 0" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
                                {efficiency}%
                            </div>
                            <div style={{ color: "#10b981", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>
                                Settlement Efficiency
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Contract Distribution Progress Card (Spans 2 columns) */}
                <div style={{
                    gridColumn: "span 2",
                    background: "var(--bg-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                            Contract Distribution
                        </span>
                        <span style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>
                            ₹{totalValue.toLocaleString('en-IN')}
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "11px" }}>
                                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Settled / Paid</span>
                                <span style={{ fontWeight: 800, color: "#10b981" }}>₹{paidValue.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ width: `${totalValue > 0 ? (paidValue / totalValue) * 100 : 0}%`, height: "100%", background: "#10b981", borderRadius: "3px" }}></div>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "11px" }}>
                                <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Pending Negotiation</span>
                                <span style={{ fontWeight: 800, color: "#f97316" }}>₹{unpaidValue.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ width: `${totalValue > 0 ? (unpaidValue / totalValue) * 100 : 0}%`, height: "100%", background: "#f97316", borderRadius: "3px" }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vendor Performance Score Card */}
                <div style={{
                    background: "var(--bg-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                        Partner Performance
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80px", position: "relative" }}>
                        <svg width="72" height="72" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                            <circle 
                                cx="18" cy="18" r="16" fill="none" 
                                stroke={parseFloat(vendorPerformance) > 7 ? "#10b981" : parseFloat(vendorPerformance) > 4 ? "#f97316" : "#ef4444"} 
                                strokeWidth="3" 
                                strokeDasharray={`${parseFloat(vendorPerformance) * 10} 100`} 
                                strokeLinecap="round" 
                                transform="rotate(-90 18 18)" 
                                style={{ transition: "stroke-dasharray 1s ease, stroke 1s ease" }}
                            />
                        </svg>
                        <div style={{ position: "absolute", fontSize: "15px", fontWeight: 900, color: "var(--text-primary)" }}>
                            {vendorPerformance}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dialog */}
            {showModal && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0,0,0,0.75)", 
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
                                <Sparkles size={22} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.25rem", color: "var(--text-primary)" }}>
                                {editingVendor ? "Modify Partner Entity" : "Register Strategic Partner"}
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>
                                Configure contract parameters and service details.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Business Entity Name</label>
                                <input 
                                    style={inputStyle} 
                                    placeholder="e.g. Acme Catering & Decor" 
                                    value={formVendor.name} 
                                    onChange={e => setFormVendor({ ...formVendor, name: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Service Category</label>
                                    <select style={{ ...inputStyle, paddingRight: "0.5rem" }} value={formVendor.service} onChange={e => setFormVendor({ ...formVendor, service: e.target.value })}>
                                        <option value="Catering">Catering</option>
                                        <option value="Decor">Visual Design / Decor</option>
                                        <option value="AV">Technical Ops / AV</option>
                                        <option value="Photography">Digital Capture</option>
                                        <option value="Venue">Physical Space / Venue</option>
                                        <option value="Logistics">Logistics & Security</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Contract Value (₹)</label>
                                    <input 
                                        style={inputStyle} 
                                        type="number" 
                                        placeholder="150000" 
                                        value={formVendor.cost} 
                                        onChange={e => setFormVendor({ ...formVendor, cost: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Contact Info (Phone / Email)</label>
                                <input 
                                    style={inputStyle} 
                                    placeholder="partner@company.com / +91 9876543210" 
                                    value={formVendor.contact} 
                                    onChange={e => setFormVendor({ ...formVendor, contact: e.target.value })} 
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Linked Event Stream</label>
                                <select style={inputStyle} value={formVendor.eventId} onChange={e => setFormVendor({ ...formVendor, eventId: e.target.value })} required>
                                    <option value="">Select Event Context</option>
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>
                                            {event.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Operational Status</label>
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    {[
                                        { status: "Paid", label: "Paid / Settled" },
                                        { status: "Unpaid", label: "Pending Negotiation" }
                                    ].map(({ status, label }) => (
                                        <button 
                                            key={status} 
                                            type="button" 
                                            onClick={() => setFormVendor({ ...formVendor, status })}
                                            style={{
                                                flex: 1, 
                                                padding: "0.65rem", 
                                                borderRadius: "10px", 
                                                cursor: "pointer", 
                                                fontWeight: 800, 
                                                fontSize: "0.8rem",
                                                border: formVendor.status === status ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                                                background: formVendor.status === status ? "rgba(249, 115, 22, 0.12)" : "rgba(255,255,255,0.03)",
                                                color: formVendor.status === status ? "var(--accent-primary)" : "var(--text-secondary)",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitLoading}
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
                                    boxShadow: "0 10px 20px rgba(249, 115, 22, 0.25)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem"
                                }}
                            >
                                {submitLoading ? <Loader2 size={18} className="animate-spin" /> : (editingVendor ? "Apply Changes" : "Confirm Partnership")}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .v-custom-select { position: relative; }
                .v-custom-select select { 
                    background: rgba(255,255,255,0.04); 
                    border: 1px solid var(--border-subtle); 
                    border-radius: 10px; 
                    padding: 0.55rem 2.25rem 0.55rem 0.85rem; 
                    color: var(--text-primary); 
                    appearance: none; 
                    cursor: pointer; 
                    font-weight: 700; 
                    min-width: 160px; 
                    font-size: 12px; 
                    outline: none;
                }
                .v-custom-select svg { position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
                select option { background: #121214; color: #ffffff; }
            `}</style>
        </div>
    );
}
