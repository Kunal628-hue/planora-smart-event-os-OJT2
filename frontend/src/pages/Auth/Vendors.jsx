import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import {
    Plus, Trash2, X, Search, ChevronDown, Edit2, Activity, Handshake, Users
} from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const API_URL = import.meta.env.VITE_API_URL;

export default function Vendors() {
    const { user, events, selectedEventId, addNotification } = useOutletContext();
    const { showConfirm } = useDialog();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

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

    useEffect(() => { fetchData(); }, [user, selectedEventId]);

    useEffect(() => {
        if (selectedEventId) {
            setFormVendor(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingVendor ? "PATCH" : "POST";
        const url = editingVendor ? `${API_URL}/vendors/${editingVendor._id}` : `${API_URL}/vendors`;
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formVendor, user: user.uid, event: formVendor.eventId })
            });
            if (response.ok) {
                setShowModal(false);
                setEditingVendor(null);
                setFormVendor({ name: "", service: "Catering", contact: "", cost: "", eventId: selectedEventId || "", status: "Unpaid" });
                fetchData();
                addNotification(editingVendor ? "Vendor Updated" : "Vendor Onboarded", `${formVendor.name} has been ${editingVendor ? "updated" : "added"}.`);
            }
        } catch (err) {
            console.error("Failed to save vendor:", err);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        const confirmed = await showConfirm("Terminate Partnership", "Are you sure you want to permanently remove this strategic partner?");
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

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const getAvatarColor = (name) => {
        const colors = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.service.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || v.service === categoryFilter;
        let matchesStatus = true;
        if (statusFilter === "Active") matchesStatus = v.status === "Paid";
        if (statusFilter === "Pending") matchesStatus = v.status === "Unpaid" || v.status === "Inquiry";
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const currentEventName = events.find(e => (e.id || e._id) === selectedEventId)?.name || "Entire Portfolio";

    // Dynamic analytics
    const totalValue = useMemo(() => vendors.reduce((sum, v) => sum + (parseInt(v.cost) || 0), 0), [vendors]);
    const paidValue = useMemo(() => vendors.filter(v => v.status === "Paid").reduce((sum, v) => sum + (parseInt(v.cost) || 0), 0), [vendors]);
    const unpaidValue = totalValue - paidValue;
    const efficiency = useMemo(() => totalValue > 0 ? Math.round((paidValue / totalValue) * 100) : 0, [paidValue, totalValue]);
    
    const vendorPerformance = useMemo(() => {
        if (vendors.length === 0) return "0.0";
        const paidCount = vendors.filter(v => v.status === "Paid").length;
        const contactCount = vendors.filter(v => v.contact && v.contact.trim() !== "").length;
        // Calculation: 70% based on payment/operational status, 30% on data completeness (contact info)
        const score = ((paidCount / vendors.length) * 7) + ((contactCount / vendors.length) * 3);
        return score.toFixed(1);
    }, [vendors]);

    const thStyle = { padding: "1.25rem 1.5rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "left" };
    const tdStyle = { padding: "1.25rem 1.5rem" };
    const inputStyle = { width: "100%", padding: "0.85rem 1rem", borderRadius: "10px", background: "#1a1a1a", border: "1px solid #222", color: "#fff", outline: "none", fontSize: "14px", fontWeight: 600 };

    return (
        <div style={{
            padding: "1.25rem 1.5rem",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            maxWidth: "1400px",
            margin: "0 auto",
            minHeight: "100vh",
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
        }}>
            {/* Header */}
            <div className="events-header">
                <div className="events-header-left">
                    <h1 style={{ fontSize: "1.35rem", fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>Vendor Registry</h1>
                    <div style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(259, 115, 22, 0.1)", color: "#f97316", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>Strategic Monitoring</div>
                    </div>
                </div>
                <button onClick={() => { setEditingVendor(null); setFormVendor({ name: "", service: "Catering", contact: "", cost: "", eventId: selectedEventId || "", status: "Unpaid" }); setShowModal(true); }}
                    style={{ background: "#f97316", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "12px", height: "36px" }}>
                    <Plus size={14} strokeWidth={4} />
                    Register Partner
                </button>
            </div>

            {/* Quick Stats Row */}
            <div className="vendors-kpi-grid">
                {[
                    { label: "Total Vendors", value: vendors.length, icon: <Users size={16} /> },
                    { label: "Active Contracts", value: vendors.filter(v => v.status === "Paid").length, icon: <Handshake size={16} /> },
                    { label: "Pending Approvals", value: vendors.filter(v => v.status !== "Paid").length, icon: <Activity size={16} /> }
                ].map((stat, i) => (
                    <div key={i} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{stat.label}</div>
                            <div style={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>{stat.value}</div>
                        </div>
                        <div style={{ color: "#f97316", opacity: 0.8 }}>{stat.icon}</div>
                    </div>
                ))}
            </div>

            {/* Filters - Sticky */}
            <div className="vendors-filters">
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input placeholder="Search partners..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: "100%", background: "#111", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.6rem 1rem 0.6rem 2.5rem", color: "#fff", outline: "none", fontWeight: 600, fontSize: "14px", height: "40px" }} />
                </div>
                <div className="v-custom-select">
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ height: "40px", borderRadius: "10px" }}>
                        <option value="All">All Paradigms</option>
                        <option value="Catering">Catering</option>
                        <option value="Decor">Visual Design</option>
                        <option value="AV">Technical Ops</option>
                        <option value="Photography">Digital Capture</option>
                        <option value="Venue">Physical Space</option>
                    </select>
                    <ChevronDown size={16} />
                </div>
                <div className="v-custom-select">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ height: "40px", borderRadius: "10px" }}>
                        <option value="All">Operational Status</option>
                        <option value="Active">Operational / Paid</option>
                        <option value="Pending">Negotiation / Unpaid</option>
                    </select>
                    <ChevronDown size={16} />
                </div>
            </div>

            {/* Table */}
            <div style={{ background: "#111", borderRadius: "20px", border: "1px solid #1a1a1a", overflow: "hidden" }}>
                {loading ? (
                    <Box sx={{ padding: '2rem' }}>
                        {Array.from(new Array(4)).map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 3 }}>
                                <Skeleton animation="wave" variant="rounded" width={40} height={40} sx={{ borderRadius: '10px', bgcolor: '#1a1a1a' }} />
                                <Skeleton animation="wave" height={20} width="20%" sx={{ bgcolor: '#1a1a1a' }} />
                                <Skeleton animation="wave" height={20} width="15%" sx={{ bgcolor: '#1a1a1a' }} />
                                <Skeleton animation="wave" height={20} width="20%" sx={{ bgcolor: '#1a1a1a' }} />
                                <Skeleton animation="wave" height={20} width="15%" sx={{ bgcolor: '#1a1a1a' }} />
                            </Box>
                        ))}
                    </Box>
                ) : filteredVendors.length === 0 ? (
                    <div style={{ padding: "3rem 1.5rem", textAlign: "center", minHeight: "280px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                            <Handshake size={32} style={{ color: "#333" }} />
                        </div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 900, margin: "0 0 0.5rem", color: "#fff" }}>No Partners Found</h3>
                        <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "300px", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>Synchronize your event portfolio with top-tier strategic vendors.</p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "240px" }}>
                            <button onClick={() => setShowModal(true)} style={{ background: "#f97316", color: "#fff", border: "none", padding: "0.75rem", borderRadius: "10px", fontWeight: 800, fontSize: "12px", cursor: "pointer", transition: "all 0.2s" }}>
                                + Register Your First Partner
                            </button>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                 <button 
                                     onClick={() => addNotification("Migration Interface", "Strategic CSV import module is initializing. Prepare your dataset.")}
                                     style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#94a3b8", padding: "6px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}
                                 >
                                     Import CSV
                                 </button>
                                 <button 
                                     onClick={() => addNotification("Marketplace Sync", "Connecting to Planora Global Vendor Ecosystem... Gateway active.")}
                                     style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "#94a3b8", padding: "6px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}
                                 >
                                     Browse Marketplace
                                 </button>
                             </div>
                        </div>
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                                <th style={thStyle}>PARTNER</th>
                                <th style={thStyle}>PARADIGM</th>
                                <th style={thStyle}>STREAM CONTEXT</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>CONTRACT VALUE</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map(vendor => (
                                <tr key={vendor._id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: getAvatarColor(vendor.name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px" }}>
                                                {getInitials(vendor.name)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{vendor.name}</div>
                                                <div style={{ fontSize: "0.75rem", color: vendor.status === "Paid" ? "#10b981" : "#f97316", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: vendor.status === "Paid" ? "#10b981" : "#f97316" }}></div>
                                                    {vendor.status === "Paid" ? "Operational" : "Pending Negotiation"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ background: "#1a1a1a", border: "1px solid #222", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            {vendor.service}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                                            {events.find(e => (e.id || e._id) === (vendor.event?._id || vendor.event))?.name || "Global Strategy"}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        <span style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                                            ₹{parseInt(vendor.cost).toLocaleString('en-IN')}.00
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button onClick={() => openEditModal(vendor)} style={{ background: "rgba(59,130,246,0.05)", border: "none", color: "#3b82f6", padding: "0.5rem", borderRadius: "8px", cursor: "pointer" }}>
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => handleDeleteVendor(vendor._id)} style={{ background: "rgba(239,68,68,0.05)", border: "none", color: "#ef4444", padding: "0.5rem", borderRadius: "8px", cursor: "pointer" }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Analytics Dashboard */}
            <div className="vendors-dir-grid" style={{ marginTop: "1.25rem" }}>
                <div className="v-card" style={{ gridColumn: "span 1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>Stream Context</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80px" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em" }}>{efficiency}%</div>
                            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Efficiency</div>
                        </div>
                    </div>
                </div>
                
                <div className="v-card" style={{ gridColumn: "span 2" }}>
                    <h3 style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "1rem", textTransform: "uppercase" }}>Contract Distribution</h3>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1rem" }}>₹{totalValue.toLocaleString('en-IN')}</div>
                    <div style={{ display: "flex", gap: "1.5rem" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "11px" }}>
                                <span style={{ color: "#94a3b8", fontWeight: 600 }}>Allocated</span>
                                <span style={{ fontWeight: 800 }}>₹{paidValue.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ height: "4px", background: "#222", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ width: `${totalValue > 0 ? (paidValue / totalValue) * 100 : 0}%`, height: "100%", background: "#f97316" }}></div>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "11px" }}>
                                <span style={{ color: "#94a3b8", fontWeight: 600 }}>Pending</span>
                                <span style={{ fontWeight: 800, color: "#f97316" }}>₹{unpaidValue.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ height: "4px", background: "#222", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ width: `${totalValue > 0 ? (unpaidValue / totalValue) * 100 : 0}%`, height: "100%", background: "#ef4444" }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="v-card" style={{ gridColumn: "span 1" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>Vendor Performance</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80px", position: "relative" }}>
                        <svg width="70" height="70" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#222" strokeWidth="3" />
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
                        <div style={{ position: "absolute", fontSize: "14px", fontWeight: 900, color: "#fff" }}>{vendorPerformance}</div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(10px)" }}>
                    <div style={{ background: "#0c0c0c", width: "100%", maxWidth: "520px", padding: "2.5rem", borderRadius: "24px", border: "1px solid #1a1a1a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{editingVendor ? "Modify Partner" : "Register Partner"}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <input style={inputStyle} placeholder="Business Entity Name" value={formVendor.name} onChange={e => setFormVendor({ ...formVendor, name: e.target.value })} required />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <select style={inputStyle} value={formVendor.service} onChange={e => setFormVendor({ ...formVendor, service: e.target.value })}>
                                    <option>Catering</option><option>Decor</option><option value="AV">AV / Sound</option><option>Photography</option><option>Venue</option>
                                </select>
                                <input style={inputStyle} type="number" placeholder="Contract Value (₹)" value={formVendor.cost} onChange={e => setFormVendor({ ...formVendor, cost: e.target.value })} required />
                            </div>
                            <input style={inputStyle} placeholder="Contact (Phone / Email)" value={formVendor.contact} onChange={e => setFormVendor({ ...formVendor, contact: e.target.value })} />
                            <select style={inputStyle} value={formVendor.eventId} onChange={e => setFormVendor({ ...formVendor, eventId: e.target.value })} required>
                                <option value="">Select Event</option>
                                {events.map(event => <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>)}
                            </select>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {["Paid", "Unpaid"].map(status => (
                                    <button key={status} type="button" onClick={() => setFormVendor({ ...formVendor, status })}
                                        style={{
                                            flex: 1, padding: "0.7rem", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
                                            border: formVendor.status === status ? "1px solid #f97316" : "1px solid #222",
                                            background: formVendor.status === status ? "rgba(249,115,22,0.1)" : "transparent",
                                            color: formVendor.status === status ? "#f97316" : "#64748b"
                                        }}>
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <button type="submit" style={{ background: "#f97316", color: "#fff", padding: "1rem", borderRadius: "12px", fontWeight: 700, border: "none", cursor: "pointer", marginTop: "0.5rem" }}>
                                {editingVendor ? "Apply Changes" : "Confirm Partnership"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .v-custom-select { position: relative; }
                .v-custom-select select { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; padding: 0.65rem 2.25rem 0.65rem 0.85rem; color: #fff; appearance: none; cursor: pointer; font-weight: 600; min-width: 140px; font-size: 14px; }
                .v-custom-select svg { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }
                .v-card { background: #111; border-radius: 20px; border: 1px solid #1a1a1a; padding: 1.15rem; display: flex; flex-direction: column; }
                select option { background: #0c0c0c; color: #fff; }
            `}</style>
        </div>
    );
}
