import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
    Plus,
    Trash2,
    X,
    Building2,
    Search,
    MoreVertical,
    Filter,
    ChevronDown,
    UserCircle,
    Handshake,
    Activity
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Vendors() {
    const { user, events, selectedEventId } = useOutletContext();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [activeMenu, setActiveMenu] = useState(null);

    const [newVendor, setNewVendor] = useState({
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
            const res = await fetch(`${API_URL}/vendors?user=${user.uid}`);
            const data = await res.json();
            setVendors(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    useEffect(() => {
        if (selectedEventId) {
            setNewVendor(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    useEffect(() => {
        if (!loading && vendors.length > 0) {
            animate('.vendor-row', {
                translateX: [-10, 0],
                opacity: [0, 1],
                delay: stagger(40),
                duration: 500,
                easing: 'easeOutQuad'
            });
        }
    }, [loading, vendors.length, searchTerm, categoryFilter, statusFilter]);

    const handleCreateVendor = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/vendors`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newVendor,
                    user: user.uid,
                    event: newVendor.eventId
                })
            });
            if (response.ok) {
                setShowModal(false);
                setNewVendor({
                    name: "",
                    service: "Catering",
                    contact: "",
                    cost: "",
                    eventId: selectedEventId,
                    status: "Unpaid"
                });
                fetchData();
            }
        } catch (err) {
            console.error("Failed to add vendor:", err);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        if (!window.confirm("Are you sure you want to remove this vendor partnership?")) return;
        try {
            const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setVendors(vendors.filter(v => v._id !== vendorId));
                setActiveMenu(null);
            }
        } catch (err) {
            console.error("Failed to delete vendor:", err);
        }
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getAvatarColor = (name) => {
        const colors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.service.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || v.service === categoryFilter;

        // Map UI status filters to data status
        // Data has "Paid" / "Unpaid"
        // UI has "All" / "Active" / "Pending" / "Removed"
        let matchesStatus = true;
        if (statusFilter === "Active") matchesStatus = v.status === "Paid";
        if (statusFilter === "Pending") matchesStatus = v.status === "Unpaid";

        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            {/* Header Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>
                        Vendor <span style={{ color: "#2563eb" }}>Ecosystem</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                        Manage strategic partnerships and service-level agreements across your portfolio.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    disabled={events.length === 0}
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
                    <span>Register Partner</span>
                </button>
            </div>

            {/* Filter Row */}
            <div style={{
                display: "flex",
                gap: "1.25rem",
                marginBottom: "2rem",
                background: "#fff",
                padding: "1.25rem",
                borderRadius: "24px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                    <Search size={18} style={{ position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                        type="text"
                        placeholder="Search by name or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.85rem 1rem 0.85rem 3rem",
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            background: "#fcfdff",
                            fontSize: "14px",
                            fontWeight: 600,
                            outline: "none",
                            transition: "all 0.2s"
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{
                                appearance: "none",
                                padding: "0.85rem 2.5rem 0.85rem 1.25rem",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                                background: "#fcfdff",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475569",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        >
                            <option value="All">All Categories</option>
                            <option value="Catering">Catering</option>
                            <option value="Decor">Decor</option>
                            <option value="AV">AV / Sound</option>
                            <option value="Photography">Photography</option>
                            <option value="Venue">Venue</option>
                            <option value="Logistics">Logistics</option>
                        </select>
                        <ChevronDown size={16} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                    </div>

                    <div style={{ position: "relative" }}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                appearance: "none",
                                padding: "0.85rem 2.5rem 0.85rem 1.25rem",
                                borderRadius: "14px",
                                border: "1px solid #e2e8f0",
                                background: "#fcfdff",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#475569",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active / Paid</option>
                            <option value="Pending">Pending / Unpaid</option>
                        </select>
                        <ChevronDown size={16} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div style={{
                background: "#fff",
                borderRadius: "32px",
                border: "1px solid #f1f5f9",
                overflow: "hidden",
                boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
            }}>
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10rem 0", gap: "1.5rem" }}>
                        <div style={{ width: "48px", height: "48px", border: "5px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Synchronizing Ledger...</p>
                    </div>
                ) : filteredVendors.length === 0 ? (
                    <div style={{ padding: "8rem 2rem", textAlign: "center" }}>
                        <Handshake size={48} color="#94a3b8" style={{ marginBottom: "1.5rem" }} />
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem" }}>No partners matching criteria</h3>
                        <p style={{ color: "#64748b", fontWeight: 500 }}>Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "left", fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Partner</th>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "left", fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "left", fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned Event</th>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "right", fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contract Value</th>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "right", width: "80px" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.map((vendor, idx) => (
                                    <tr
                                        key={vendor._id}
                                        className="vendor-row"
                                        style={{
                                            background: idx % 2 === 0 ? "#fff" : "#fafaf9",
                                            transition: "background 0.2s ease"
                                        }}
                                    >
                                        <td style={{ padding: "1.25rem 2rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <div style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "12px",
                                                    background: getAvatarColor(vendor.name),
                                                    color: "#fff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 800,
                                                    fontSize: "14px"
                                                }}>
                                                    {getInitials(vendor.name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{vendor.name}</div>
                                                    <div style={{ fontSize: "12px", color: vendor.status === "Paid" ? "#10b981" : "#f59e0b", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></span>
                                                        {vendor.status === "Paid" ? "Verified Partner" : "Payment Pending"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem" }}>
                                            <span style={{
                                                padding: "6px 12px",
                                                borderRadius: "8px",
                                                background: "#eff6ff",
                                                color: "#2563eb",
                                                fontSize: "12px",
                                                fontWeight: 800,
                                                textTransform: "uppercase"
                                            }}>
                                                {vendor.service}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem" }}>
                                            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 600 }}>
                                                {events.find(e => (e.id || e._id) === vendor.event)?.name || "External Portfolio"}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem", textAlign: "right" }}>
                                            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                                                ₹{parseInt(vendor.cost).toLocaleString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem", textAlign: "right", position: "relative" }}>
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === vendor._id ? null : vendor._id)}
                                                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "8px", borderRadius: "10px" }}
                                                className="action-btn"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenu === vendor._id && (
                                                <div style={{
                                                    position: "absolute",
                                                    right: "2rem",
                                                    top: "3.5rem",
                                                    background: "#fff",
                                                    borderRadius: "16px",
                                                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                                                    border: "1px solid #f1f5f9",
                                                    zIndex: 10,
                                                    padding: "0.5rem",
                                                    minWidth: "160px"
                                                }}>
                                                    <button onClick={() => handleDeleteVendor(vendor._id)} style={{ width: "100%", padding: "0.75rem 1rem", background: "none", border: "none", display: "flex", alignItems: "center", gap: "0.75rem", color: "#ef4444", fontWeight: 700, fontSize: "13px", cursor: "pointer", borderRadius: "10px" }} className="menu-item">
                                                        <Trash2 size={16} />
                                                        <span>Terminate</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal - Same as before but beautified header */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(6px)" }}>
                    <div style={{ background: "#fff", width: "100%", maxWidth: "540px", padding: "3rem", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", animation: "modalIn 0.3s ease-out" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Building2 size={24} />
                                </div>
                                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Register Partner</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: "#f8fafc", border: "none", color: "#64748b", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer" }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateVendor} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Business Name</label>
                                <input style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600 }} placeholder="e.g. Apex Productions" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} required />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Service Type</label>
                                    <select style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }} value={newVendor.service} onChange={e => setNewVendor({ ...newVendor, service: e.target.value })}>
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option value="AV">AV / Sound</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Logistics</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Contract Value (₹)</label>
                                    <input style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 800 }} type="number" placeholder="0" value={newVendor.cost} onChange={e => setNewVendor({ ...newVendor, cost: e.target.value })} required />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase" }}>Assigned Project</label>
                                <select
                                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }}
                                    value={newVendor.eventId}
                                    onChange={e => setNewVendor({ ...newVendor, eventId: e.target.value })}
                                    required
                                >
                                    <option value="">Select an Event</option>
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "1rem", borderRadius: "14px", border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" style={{ flex: 1.5, padding: "1rem", borderRadius: "14px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 950, cursor: "pointer", boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)" }}>Register Partner</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes modalIn { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                
                .vendor-row:hover {
                    background: #fdfdfd !important;
                }
                .action-btn:hover {
                    background: #f1f5f9 !important;
                    color: #2563eb !important;
                }
                .menu-item:hover {
                    background: #fff1f2 !important;
                }
                
                @media (max-width: 768px) {
                    table thead { display: none; }
                    table, tbody, tr, td { display: block; width: 100%; }
                    tr { 
                        margin-bottom: 1.5rem; 
                        padding: 1.5rem; 
                        border-radius: 24px; 
                        border: 1px solid #f1f5f9;
                        background: #fff !important; 
                        box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                    }
                    td { 
                        padding: 0.5rem 0 !important; 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center; 
                    }
                    td:last-child { justify-content: flex-end; }
                    td::after {
                        content: attr(data-label);
                        font-size: 11px;
                        font-weight: 800;
                        color: #94a3b8;
                        text-transform: uppercase;
                    }
                }
            `}</style>
        </div>
    );
}
