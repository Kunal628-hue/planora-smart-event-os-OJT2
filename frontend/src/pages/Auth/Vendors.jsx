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
        eventId: ""
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
                setNewVendor(prev => ({ ...prev, eventId: eventsData[0].id }));
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
                setNewVendor({ name: "", service: "Catering", contact: "", cost: "", eventId: events[0]?.id || "" });
                fetchData();
            }
        } catch (err) {
            console.error("Failed to add vendor:", err);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Vendors & Partners</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Manage contracts and spending for each event.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    disabled={events.length === 0}
                    style={{ background: "var(--accent-primary)", borderRadius: "50px" }}
                >
                    Add Vendor
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : vendors.length === 0 ? (
                <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>No vendors found</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>{events.length === 0 ? "Create an event first to add vendors." : "Track your catering, venue, and more."}</p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {vendors.map(vendor => (
                        <div key={vendor._id} className="card hover-lift" style={{ gridColumn: "span 4", padding: "1.5rem", position: "relative" }}>
                            <div style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.25rem 0.5rem", background: "var(--bg-elevated)", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800, color: "var(--text-muted)" }}>
                                {vendor.status}
                            </div>
                            <h3 style={{ fontWeight: 850, fontSize: "1.1rem" }}>{vendor.name}</h3>
                            <p style={{ color: "var(--accent-primary)", fontSize: "0.85rem", fontWeight: 700, marginTop: "0.25rem" }}>{vendor.service}</p>

                            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--bg-base)", borderRadius: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Budget impact</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 900 }}>₹{parseInt(vendor.cost).toLocaleString()}</span>
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                    Event: {events.find(e => e.id === vendor.event)?.name || "Unassigned"}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "1.5rem" }}>Add New Vendor</h2>
                        <form onSubmit={handleCreateVendor} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Vendor Name</label>
                                <input className="auth-input" placeholder="e.g. Royal Caterers" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} required />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Associate with Event</label>
                                <select
                                    className="auth-input"
                                    value={newVendor.eventId}
                                    onChange={e => setNewVendor({ ...newVendor, eventId: e.target.value })}
                                    required
                                >
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Service Category</label>
                                    <select className="auth-input" value={newVendor.service} onChange={e => setNewVendor({ ...newVendor, service: e.target.value })}>
                                        <option>Catering</option>
                                        <option>Decor</option>
                                        <option>Photography</option>
                                        <option>Venue</option>
                                        <option>Entertainment</option>
                                        <option>Logistics</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Estimated Cost</label>
                                    <input className="auth-input" type="number" placeholder="50000" value={newVendor.cost} onChange={e => setNewVendor({ ...newVendor, cost: e.target.value })} required />
                                </div>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: "1rem", background: "var(--accent-primary)" }}>Add Vendor</button>
                            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ width: "100%" }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
