import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Vendors() {
    const { user } = useOutletContext();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: "",
        service: "Catering",
        contact: "",
        cost: ""
    });

    const fetchVendors = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/vendors?user=${user.uid}`);
            const data = await response.json();
            setVendors(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, [user]);

    const handleCreateVendor = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/vendors`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newVendor, user: user.uid, event: "000000000000000000000000" }) // Temporary placeholder for global vendor list
            });
            if (response.ok) {
                setShowModal(false);
                setNewVendor({ name: "", service: "Catering", contact: "", cost: "" });
                fetchVendors();
            }
        } catch (err) {
            console.error("Failed to add vendor:", err);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Vendors</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Manage your partners and contracts.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">Add Vendor</button>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : vendors.length === 0 ? (
                <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>No vendors added yet</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Keep track of catering, decor, photography and more.</p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {vendors.map(vendor => (
                        <div key={vendor._id} className="card" style={{ gridColumn: "span 4", padding: "1.5rem" }}>
                            <h3 style={{ fontWeight: 800 }}>{vendor.name}</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{vendor.service}</p>
                            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>₹{vendor.cost}</span>
                                <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem", background: "var(--bg-elevated)", borderRadius: "4px" }}>{vendor.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
                        <h2>Add New Vendor</h2>
                        <form onSubmit={handleCreateVendor} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                            <input className="auth-input" placeholder="Vendor Name" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} required />
                            <select className="auth-input" value={newVendor.service} onChange={e => setNewVendor({ ...newVendor, service: e.target.value })}>
                                <option>Catering</option>
                                <option>Decor</option>
                                <option>Photography</option>
                                <option>Venue</option>
                            </select>
                            <input className="auth-input" placeholder="Cost" type="number" value={newVendor.cost} onChange={e => setNewVendor({ ...newVendor, cost: e.target.value })} />
                            <button className="btn btn-primary" type="submit">Save Vendor</button>
                            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
