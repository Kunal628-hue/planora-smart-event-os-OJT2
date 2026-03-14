import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Vendors() {
    const { user } = useOutletContext();
    const [vendors, setVendors] = useState([]);
    const [events, setEvents] = useState([]);
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
        try {
            const [vendorsRes, eventsRes] = await Promise.all([
                fetch(`${API_URL}/vendors?user=${user.uid}`),
                fetch(`${API_URL}/events?user=${user.uid}`)
            ]);
            const vendorsData = await vendorsRes.json();
            const eventsData = await eventsRes.json();
            setVendors(vendorsData);
            setEvents(eventsData);
            if (eventsData.length > 0) {
                setNewVendor(prev => ({ ...prev, eventId: eventsData[0].id || eventsData[0]._id }));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

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
                setNewVendor({ name: "", service: "Catering", contact: "", cost: "", eventId: events[0]?.id || events[0]?._id || "", status: "Unpaid" });
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

    return (
        <div style={{ animation: "fade-up 0.5s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 850, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Vendors & Strategic Partners</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.25rem" }}>Manage contractual obligations and financial impact per event.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    disabled={events.length === 0}
                    style={{ borderRadius: "14px", padding: "0.8rem 1.5rem", fontWeight: 700 }}
                >
                    + Register New Vendor
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 0", gap: "1rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>Synchronizing Ledger...</p>
                </div>
            ) : vendors.length === 0 ? (
                <div style={{ padding: "6rem 2rem", textAlign: "center", background: "#fff", borderRadius: "24px", border: "1.5px dashed var(--border-medium)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤝</div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>No active partnerships</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.75rem", maxWidth: "400px", margin: "0.75rem auto" }}>{events.length === 0 ? "You need an active event context before registering vendors." : "Keep track of catering, venue, and technical partners here."}</p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {vendors.map(vendor => (
                        <div key={vendor._id} className="card" style={{ gridColumn: "span 4", padding: "1.75rem", position: "relative", border: "1.5px solid var(--border-subtle)", transition: "all 0.3s ease", display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                                <div style={{
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "12px",
                                    background: "var(--accent-soft)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.25rem"
                                }}>
                                    {vendor.service === "Catering" ? "🍽️" : vendor.service === "Decor" ? "✨" : vendor.service === "Photography" ? "📸" : "🤝"}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
                                    <div
                                        onClick={() => toggleStatus(vendor._id, vendor.status)}
                                        style={{
                                            padding: "0.35rem 0.75rem",
                                            borderRadius: "100px",
                                            background: vendor.status === "Paid" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                            color: vendor.status === "Paid" ? "var(--accent-success)" : "var(--accent-danger)",
                                            fontSize: "0.65rem",
                                            fontWeight: 900,
                                            cursor: "pointer",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            border: `1px solid ${vendor.status === "Paid" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                                            userSelect: "none",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {vendor.status === "Paid" ? "✓ Fully Paid" : "✕ Unpaid Record"}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteVendor(vendor._id)}
                                        style={{
                                            background: "rgba(239, 68, 68, 0.05)",
                                            border: "1px solid rgba(239, 68, 68, 0.1)",
                                            color: "#ef4444",
                                            cursor: "pointer",
                                            padding: "0.4rem 0.6rem",
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            transition: "all 0.2s"
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
                                            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.1)";
                                        }}
                                        title="Delete Vendor"
                                    >
                                        Remove 🗑️
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ fontWeight: 850, fontSize: "1.15rem", color: "var(--text-primary)" }}>{vendor.name}</h3>
                            <p style={{ color: "var(--accent-primary)", fontSize: "0.85rem", fontWeight: 700, marginTop: "0.2rem" }}>{vendor.service} Specialist</p>

                            <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "var(--bg-elevated)", borderRadius: "14px", border: "1px solid var(--border-subtle)", marginTop: "auto" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Financial Impact</span>
                                    <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "var(--text-primary)" }}>₹{parseInt(vendor.cost).toLocaleString()}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "2px", background: "var(--accent-primary)", opacity: 0.5 }}></div>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                        Event: {events.find(e => (e.id || e._id) === vendor.event)?.name || "Analytical Context"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "2.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", borderRadius: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>Register New Vendor</h2>
                            <span
                                onClick={() => setShowModal(false)}
                                style={{ cursor: "pointer", color: "var(--text-muted)", fontWeight: 800, fontSize: "1.25rem" }}
                            >✕</span>
                        </div>
                        <form onSubmit={handleCreateVendor} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Vendor Entity Name</label>
                                <input className="auth-input" placeholder="e.g. Royal Caterers & Events" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} required style={{ borderRadius: "12px" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Context Attribution</label>
                                <select
                                    className="auth-input"
                                    value={newVendor.eventId}
                                    onChange={e => setNewVendor({ ...newVendor, eventId: e.target.value })}
                                    required
                                    style={{ borderRadius: "12px", fontWeight: 600 }}
                                >
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Expertise</label>
                                    <select className="auth-input" value={newVendor.service} onChange={e => setNewVendor({ ...newVendor, service: e.target.value })} style={{ borderRadius: "12px", fontWeight: 600 }}>
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Entertainment</option>
                                        <option>Logistics</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Agreed Valuation</label>
                                    <input className="auth-input" type="number" placeholder="50000" value={newVendor.cost} onChange={e => setNewVendor({ ...newVendor, cost: e.target.value })} required style={{ borderRadius: "12px" }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ flex: 1, borderRadius: "12px", fontWeight: 700 }}>Cancel</button>
                                <button className="btn btn-primary" type="submit" style={{ flex: 2, borderRadius: "12px", fontWeight: 800 }}>Confirm Registration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
