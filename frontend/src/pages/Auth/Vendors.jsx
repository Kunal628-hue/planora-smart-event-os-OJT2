import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";

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

    useEffect(() => {
        if (!loading && vendors.length > 0) {
            animate('.vendor-card', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                easing: 'easeOutExpo',
                duration: 800
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
        <div className="stagger-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                        Strategic <span className="gradient-text">Partners</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                        Manage contractual obligations and financial impact per event context.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-lg"
                    disabled={events.length === 0}
                    style={{ borderRadius: "14px", padding: "1rem 2rem" }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "8px" }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Register Vendor
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 0", gap: "1.25rem" }}>
                    <div style={{ width: "48px", height: "48px", border: "5px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Synchronizing Ledger...</p>
                </div>
            ) : vendors.length === 0 ? (
                <div className="glass-panel" style={{ padding: "6rem 2rem", textAlign: "center", borderRadius: "32px", border: "2px dashed var(--border-medium)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🤝</div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 850 }}>No active partnerships found</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem", maxWidth: "450px", margin: "1rem auto", fontSize: "1.1rem" }}>
                        {events.length === 0 ? "You need an active event context before registering vendors. Create an event first." : "Start tracking your catering, venue, and technical partners to see financial analytics."}
                    </p>
                    {events.length > 0 && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: "1rem" }}>Add Your First Vendor</button>
                    )}
                </div>
            ) : (
                <div className="dashboard-grid">
                    {vendors.map(vendor => (
                        <div key={vendor._id} className="glass-panel vendor-card" style={{ gridColumn: "span 4", padding: "2rem", display: "flex", flexDirection: "column", borderRadius: "28px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                <div style={{
                                    width: "54px",
                                    height: "54px",
                                    borderRadius: "16px",
                                    background: "var(--accent-soft)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.75rem"
                                }}>
                                    {vendor.service === "Catering" ? "🍽️" : vendor.service === "Decor" ? "✨" : vendor.service === "Photography" ? "📸" : "🤝"}
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
                                        }}
                                    >
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></span>
                                        {vendor.status === "Paid" ? "Paid" : "Due"}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteVendor(vendor._id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "var(--text-muted)",
                                            cursor: "pointer",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px"
                                        }}
                                    >
                                        Remove 🗑️
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <h3 style={{ fontWeight: 900, fontSize: "1.4rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{vendor.name}</h3>
                                <p style={{ color: "var(--accent-primary)", fontSize: "0.9rem", fontWeight: 750, marginTop: "0.25rem" }}>{vendor.service} Specialist</p>
                            </div>

                            <div style={{ marginTop: "auto", padding: "1.5rem", background: "var(--bg-elevated)", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "baseline" }}>
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Agreed Valuation</span>
                                    <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>₹{parseInt(vendor.cost).toLocaleString()}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--border-subtle)" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>📍</div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Active Context</span>
                                        <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 700 }}>
                                            {events.find(e => (e.id || e._id) === vendor.event)?.name || "Analytical Context"}
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
                    <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "3rem", borderRadius: "32px", boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>Register Partner</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "var(--bg-elevated)", border: "none", color: "var(--text-primary)", width: "36px", height: "36px", borderRadius: "12px", cursor: "pointer", fontWeight: 900 }}
                            >✕</button>
                        </div>
                        <form onSubmit={handleCreateVendor} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Entity Name</label>
                                <input className="auth-input" placeholder="e.g. Royal Caterers & Events" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} required style={{ borderRadius: "14px", padding: "1rem" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Event Attribution</label>
                                <select
                                    className="auth-input"
                                    value={newVendor.eventId}
                                    onChange={e => setNewVendor({ ...newVendor, eventId: e.target.value })}
                                    required
                                    style={{ borderRadius: "14px", padding: "1rem", fontWeight: 700 }}
                                >
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Expertise</label>
                                    <select className="auth-input" value={newVendor.service} onChange={e => setNewVendor({ ...newVendor, service: e.target.value })} style={{ borderRadius: "14px", padding: "1rem", fontWeight: 700 }}>
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Entertainment</option>
                                        <option>Logistics</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Valuation (₹)</label>
                                    <input className="auth-input" type="number" placeholder="50000" value={newVendor.cost} onChange={e => setNewVendor({ ...newVendor, cost: e.target.value })} required style={{ borderRadius: "14px", padding: "1rem" }} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ flex: 1, borderRadius: "14px", fontWeight: 700 }}>Cancel</button>
                                <button className="btn btn-primary" type="submit" style={{ flex: 2, borderRadius: "14px", fontWeight: 900 }}>Confirm Registration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
