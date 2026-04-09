import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import { useDialog } from "../../context/DialogContext";
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
    Activity,
    Edit2,
    Check,
    AlertCircle
} from "lucide-react";

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
    const [activeMenu, setActiveMenu] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingVendor ? "PATCH" : "POST";
        const url = editingVendor ? `${API_URL}/vendors/${editingVendor._id}` : `${API_URL}/vendors`;

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formVendor,
                    user: user.uid,
                    event: formVendor.eventId
                })
            });
            if (response.ok) {
                setShowModal(false);
                setEditingVendor(null);
                setFormVendor({
                    name: "",
                    service: "Catering",
                    contact: "",
                    cost: "",
                    eventId: selectedEventId || "",
                    status: "Unpaid"
                });
                fetchData();
                addNotification(editingVendor ? "Vendor Updated" : "Vendor Onboarded", `${formVendor.name} has been ${editingVendor ? "updated" : "added"} to your event logistics.`);
            }
        } catch (err) {
            console.error("Failed to save vendor:", err);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        const confirmed = await showConfirm("Terminate Partnership", "Are you sure you want to permanently remove this strategic partner from your ecosystem?");
        if (!confirmed) return;
        try {
            const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setVendors(vendors.filter(v => v._id !== vendorId));
                addNotification("Vendor Removed", "Service provider has been detached from your session.");
                setActiveMenu(null);
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
        setActiveMenu(null);
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
        let matchesStatus = true;
        if (statusFilter === "Active") matchesStatus = v.status === "Paid";
        if (statusFilter === "Pending") matchesStatus = v.status === "Unpaid" || v.status === "Inquiry";
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const currentEventName = events.find(e => (e.id || e._id) === selectedEventId)?.name || "Entire Portfolio";

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            {/* Header Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", gap: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "280px" }}>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 850, letterSpacing: "-0.05em", margin: "0 0 0.5rem" }}>
                        Vendor <span style={{ color: "#2563eb" }}>Registry</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 550, margin: 0 }}>
                        {selectedEventId ? (
                            <>Strategic partners assigned to <span style={{ color: "#0f172a", fontWeight: 750 }}>{currentEventName}</span></>
                        ) : (
                            "Synchronize strategic partnerships across your global event streams."
                        )}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingVendor(null);
                        setFormVendor({
                            name: "",
                            service: "Catering",
                            contact: "",
                            cost: "",
                            eventId: selectedEventId || "",
                            status: "Unpaid"
                        });
                        setShowModal(true);
                    }}
                    style={{
                        borderRadius: "16px",
                        padding: "1rem 2rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        fontWeight: 900,
                        fontSize: "15px",
                        cursor: "pointer",
                        boxShadow: "0 8px 25px rgba(37, 99, 235, 0.25)",
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
                boxShadow: "0 4px 15px rgba(0,0,0,0.015)",
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                    <Search size={18} style={{ position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                        type="text"
                        placeholder="Search by name or service code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.85rem 1rem 0.85rem 3rem",
                            borderRadius: "14px",
                            border: "1px solid #e2e8f0",
                            background: "#fcfdff",
                            fontSize: "14px",
                            fontWeight: 650,
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
                                fontWeight: 800,
                                color: "#475569",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        >
                            <option value="All">All Paradigms</option>
                            <option value="Catering">Catering</option>
                            <option value="Decor">Visual Design</option>
                            <option value="AV">Technical Ops</option>
                            <option value="Photography">Digital Capture</option>
                            <option value="Venue">Physical Space</option>
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
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
                                fontWeight: 800,
                                color: "#475569",
                                cursor: "pointer",
                                outline: "none"
                            }}
                        >
                            <option value="All">Operational Status</option>
                            <option value="Active">Operational / Paid</option>
                            <option value="Pending">Negotiation / Unpaid</option>
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div style={{
                background: "#fff",
                borderRadius: "32px",
                border: "1px solid #f1f5f9",
                overflow: "hidden",
                boxShadow: "0 4px 25px rgba(0,0,0,0.015)"
            }}>
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10rem 0", gap: "1.5rem" }}>
                        <div style={{ width: "40px", height: "40px", border: "4px solid #f1f5f9", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                        <p style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em" }}>Matrix Sync in Progress...</p>
                    </div>
                ) : filteredVendors.length === 0 ? (
                    <div style={{ padding: "8rem 2rem", textAlign: "center" }}>
                        <div style={{ width: "64px", height: "64px", background: "#f8fafc", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "#cbd5e1" }}>
                            <Handshake size={32} />
                        </div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 850, color: "#0f172a", margin: "0 0 0.5rem" }}>Ecosystem Null</h3>
                        <p style={{ color: "#64748b", fontWeight: 600 }}>No partners assigned to this stream yet.</p>
                    </div>
                ) : (
                    <div className="table-wrapper" style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "left", fontSize: "11px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Partner</th>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "left", fontSize: "11px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Paradigm</th>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "left", fontSize: "11px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Stream Context</th>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "right", fontSize: "11px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Contract Value</th>
                                    <th style={{ padding: "1.25rem 2rem", textAlign: "right", width: "120px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.map((vendor, idx) => (
                                    <tr
                                        key={vendor._id}
                                        className="vendor-row"
                                        style={{
                                            borderBottom: "1px solid #f8fafc",
                                            transition: "background 0.2s ease"
                                        }}
                                    >
                                        <td style={{ padding: "1.25rem 2rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <div style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "14px",
                                                    background: getAvatarColor(vendor.name),
                                                    color: "#fff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 900,
                                                    fontSize: "13px"
                                                }}>
                                                    {getInitials(vendor.name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{vendor.name}</div>
                                                    <div style={{ fontSize: "11px", color: vendor.status === "Paid" ? "#10b981" : "#f59e0b", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                                        <Activity size={10} />
                                                        {vendor.status === "Paid" ? "Operational" : "Pending Negotiation"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem" }}>
                                            <span style={{
                                                padding: "4px 10px",
                                                borderRadius: "8px",
                                                background: "#eff6ff",
                                                color: "#2563eb",
                                                fontSize: "11px",
                                                fontWeight: 900,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.03em"
                                            }}>
                                                {vendor.service}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem" }}>
                                            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
                                                {events.find(e => (e.id || e._id) === (vendor.event?._id || vendor.event))?.name || "Global Strategy"}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem", textAlign: "right" }}>
                                            <div style={{ fontSize: "15px", fontWeight: 950, color: "#0f172a", letterSpacing: "-0.02em" }}>
                                                ₹{parseInt(vendor.cost).toLocaleString('en-IN')}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1.25rem 2rem", textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                                <button
                                                    onClick={() => openEditModal(vendor)}
                                                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                                                    className="action-btn-edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVendor(vendor._id)}
                                                    style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#ef4444", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                                                    className="action-btn-delete"
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

            {/* Modal - CRUD */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)" }}>
                    <div className="modal-reveal" style={{
                        background: "#fff",
                        width: "100%",
                        maxWidth: "500px",
                        padding: "2.5rem",
                        borderRadius: "32px",
                        boxShadow: "0 25px 60px -12px rgba(0,0,0,0.15)",
                        position: "relative"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(37, 99, 235, 0.08)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {editingVendor ? <Edit2 size={22} strokeWidth={3} /> : <Plus size={22} strokeWidth={3} />}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0, color: "#0f172a", letterSpacing: "-0.03em" }}>{editingVendor ? "Modify Partner" : "Register Partner"}</h2>
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Operational stream parameters.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", color: "#64748b", width: "32px", height: "32px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 900, color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Business Entity</label>
                                <input
                                    style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1.5px solid #f1f5f9", fontSize: "14px", fontWeight: 700, background: "#fcfdff", outline: "none" }}
                                    className="modal-input"
                                    placeholder="e.g. Paramount Logistics"
                                    value={formVendor.name}
                                    onChange={e => setFormVendor({ ...formVendor, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 900, color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Paradigm</label>
                                    <select style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "1.5px solid #f1f5f9", fontSize: "14px", fontWeight: 800, background: "#fcfdff", cursor: "pointer" }} value={formVendor.service} onChange={e => setFormVendor({ ...formVendor, service: e.target.value })}>
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option value="AV">AV / Sound</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 900, color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contract Value (₹)</label>
                                    <input style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", border: "1.5px solid #f1f5f9", fontSize: "14px", fontWeight: 950, background: "#fcfdff", outline: "none" }} type="number" placeholder="0" value={formVendor.cost} onChange={e => setFormVendor({ ...formVendor, cost: e.target.value })} required />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 900, color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Associated Strategic Stream</label>
                                <select
                                    style={{ width: "100%", padding: "0.85rem", borderRadius: "12px", border: "1.5px solid #f1f5f9", fontSize: "14px", fontWeight: 800, background: "#fcfdff", cursor: "pointer" }}
                                    value={formVendor.eventId}
                                    onChange={e => setFormVendor({ ...formVendor, eventId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Portfolio Context</option>
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 900, color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Operational Status</label>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {["Paid", "Unpaid"].map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setFormVendor({ ...formVendor, status })}
                                            style={{
                                                flex: 1,
                                                padding: "0.6rem",
                                                borderRadius: "10px",
                                                border: "1.5px solid",
                                                borderColor: formVendor.status === status ? "#2563eb" : "#f1f5f9",
                                                background: formVendor.status === status ? "#eff6ff" : "transparent",
                                                color: formVendor.status === status ? "#2563eb" : "#64748b",
                                                fontSize: "12px",
                                                fontWeight: 800,
                                                cursor: "pointer",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                                <button type="submit" style={{ flex: 1, padding: "1rem", borderRadius: "14px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 950, cursor: "pointer", boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)", fontSize: "15px" }}>
                                    {editingVendor ? "Apply Changes" : "Confirm Partnership"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .action-btn-edit:hover { background: #eff6ff !important; color: #2563eb !important; border-color: #dbeafe !important; }
                .action-btn-delete:hover { background: #fee2e2 !important; color: #ef4444 !important; border-color: #fecaca !important; }
                .modal-input:focus { border-color: #2563eb !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08); }
            `}</style>
        </div>
    );
}
