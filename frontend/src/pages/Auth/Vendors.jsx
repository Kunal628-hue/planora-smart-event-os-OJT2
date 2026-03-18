import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
    Plus,
    Utensils,
    Sparkles,
    Camera,
    Handshake,
    Trash2,
    MapPin,
    Loader2,
    X,
    Building2,
    Music,
    Truck,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Vendors() {
    const { user, events, selectedEventId } = useOutletContext();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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
            animate('.vendor-card', {
                translateY: [15, 0],
                opacity: [0, 1],
                delay: stagger(60),
                easing: 'cubicBezier(.22, 1, .36, 1)',
                duration: 600
            });
        }
    }, [loading, vendors.length]);

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

    const toggleStatus = async (vendorId, currentStatus) => {
        const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
        try {
            const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setVendors(vendors.map(v => v._id === vendorId ? { ...v, status: newStatus } : v));
            }
        } catch (err) {
            console.error("Failed to update status:", err);
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
            }
        } catch (err) {
            console.error("Failed to delete vendor:", err);
        }
    };

    const getServiceIcon = (service) => {
        switch (service) {
            case "Catering": return <Utensils size={24} />;
            case "Decor": return <Sparkles size={24} />;
            case "Photography": return <Camera size={24} />;
            case "Venue": return <Building2 size={24} />;
            case "Entertainment": return <Music size={24} />;
            case "Logistics": return <Truck size={24} />;
            default: return <Handshake size={24} />;
        }
    };

    const filteredVendors = vendors.filter(v => v.event === selectedEventId);

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                        <h1 style={{ fontSize: "2.75rem", fontWeight: 900, letterSpacing: "-0.04em" }}>
                            Vendor <span className="gradient-text">Ecosystem</span>
                        </h1>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: 500 }}>
                        Orchestrate partnerships and financial commitments across your portfolio.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-lg"
                    disabled={events.length === 0}
                    style={{ borderRadius: "14px", padding: "0.85rem 1.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>Register Partner</span>
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 0", gap: "1.5rem" }}>
                    <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Synchronizing Global Ledger...</p>
                </div>
            ) : filteredVendors.length === 0 ? (
                <div className="premium-dark-panel modal-reveal" style={{ padding: "6rem 2rem", textAlign: "center", margin: "2rem 0" }}>
                    <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.1)" }}>
                            <Handshake size={40} color="var(--accent-primary)" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 850, color: "#fff" }}>No active partnerships found</h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "1rem", maxWidth: "480px", margin: "1rem auto", fontSize: "1.1rem", lineHeight: 1.6 }}>
                        {events.length === 0 ? "Establish an event context before onboarding vendor partners to begin financial tracking." : "Commence tracking your catering, venue, and technical partners to unlock advanced fiscal analytics."}
                    </p>
                    {events.length > 0 && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: "1.5rem", padding: "0.8rem 2rem", borderRadius: "12px" }}>
                            Onboard First Vendor
                        </button>
                    )}
                </div>
            ) : (
                <div className="dashboard-grid">
                    {filteredVendors.map(vendor => (
                        <div key={vendor._id} className="glass-panel vendor-card" style={{ gridColumn: "span 4", padding: "2rem", display: "flex", flexDirection: "column", borderRadius: "28px", border: "1px solid var(--border-subtle)", position: "relative", overflow: "hidden" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "18px",
                                    background: "var(--accent-soft)",
                                    color: "var(--accent-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid var(--border-accent)"
                                }}>
                                    {getServiceIcon(vendor.service)}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                                    <div
                                        onClick={() => toggleStatus(vendor._id, vendor.status)}
                                        className="category-badge"
                                        style={{
                                            background: vendor.status === "Paid" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                            color: vendor.status === "Paid" ? "var(--accent-success)" : "var(--accent-danger)",
                                            cursor: "pointer",
                                            border: `1px solid ${vendor.status === "Paid" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                                            fontWeight: 800,
                                            padding: "0.4rem 0.8rem"
                                        }}
                                    >
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></span>
                                        {vendor.status === "Paid" ? "Settled" : "Payment Due"}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteVendor(vendor._id)}
                                        className="hover-lift"
                                        style={{
                                            background: "rgba(239, 68, 68, 0.05)",
                                            border: "none",
                                            color: "var(--accent-danger)",
                                            cursor: "pointer",
                                            fontSize: "0.7rem",
                                            fontWeight: 800,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            padding: "0.4rem 0.75rem",
                                            borderRadius: "8px",
                                            textTransform: "uppercase"
                                        }}
                                    >
                                        <Trash2 size={12} strokeWidth={3} />
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.75rem" }}>
                                <h3 style={{ fontWeight: 900, fontSize: "1.5rem", color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>{vendor.name}</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span style={{
                                        padding: "0.25rem 0.6rem",
                                        borderRadius: "6px",
                                        background: "var(--bg-elevated)",
                                        fontSize: "0.75rem",
                                        fontWeight: 800,
                                        color: "var(--accent-primary)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.02em"
                                    }}>
                                        {vendor.service} Specialist
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: "auto", padding: "1.5rem", background: "var(--bg-elevated)", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem", alignItems: "baseline" }}>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Contract Value</span>
                                    <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>₹{parseInt(vendor.cost).toLocaleString()}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--border-medium)" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                                        <MapPin size={18} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>Assigned Event</span>
                                        <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 750 }}>
                                            {events.find(e => (e.id || e._id) === vendor.event)?.name || "Unassigned context"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(12px)" }}>
                    <div className="glass-panel-dark modal-reveal" style={{ width: "100%", maxWidth: "540px", padding: "3.5rem", borderRadius: "32px", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "var(--accent-soft)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Handshake size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: "1.75rem", fontWeight: 950, letterSpacing: "-0.04em", margin: 0 }}>Register Business Partner</h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600, margin: 0, marginTop: "0.25rem" }}>Onboard a new vendor into the ecosystem.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="hover-lift"
                                style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-subtle)", color: "var(--text-primary)", width: "40px", height: "40px", borderRadius: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateVendor} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Legal Trading Name</label>
                                <div style={{ position: "relative" }}>
                                    <Building2 size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8 }} />
                                    <input className="auth-input" placeholder="e.g. Paramount Global Services" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} required style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 3.25rem", fontSize: "1rem", fontWeight: 600 }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Context (Event)</label>
                                <div style={{ position: "relative" }}>
                                    <MapPin size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8 }} />
                                    <select
                                        className="auth-input"
                                        value={newVendor.eventId}
                                        onChange={e => setNewVendor({ ...newVendor, eventId: e.target.value })}
                                        required
                                        style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 3.25rem", fontWeight: 750, fontSize: "1rem" }}
                                    >
                                        {events.map(event => (
                                            <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Core Competency</label>
                                    <select className="auth-input" value={newVendor.service} onChange={e => setNewVendor({ ...newVendor, service: e.target.value })} style={{ borderRadius: "14px", padding: "1.1rem", fontWeight: 750, fontSize: "1rem" }}>
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Entertainment</option>
                                        <option>Logistics</option>
                                    </select>
                                </div>
                                <div >
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Project Valuation (₹)</label>
                                    <div style={{ position: "relative" }}>
                                        <Sparkles size={16} style={{ position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent-primary)", opacity: 0.8 }} />
                                        <input className="auth-input" type="number" placeholder="0.00" value={newVendor.cost} onChange={e => setNewVendor({ ...newVendor, cost: e.target.value })} required style={{ borderRadius: "14px", padding: "1.1rem 1.1rem 1.1rem 2.8rem", fontSize: "1rem", fontWeight: 850 }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
                                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ flex: 1, borderRadius: "16px", fontWeight: 750, padding: "1.1rem" }}>Cancel</button>
                                <button className="btn btn-primary shadow-glow hover-lift" type="submit" style={{ flex: 1.5, borderRadius: "16px", fontWeight: 900, padding: "1.1rem", fontSize: "1.05rem" }}>Execute Registration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
