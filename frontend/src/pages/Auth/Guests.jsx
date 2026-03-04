import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Guests() {
    const { user } = useOutletContext();
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGuest, setNewGuest] = useState({
        name: "",
        email: "",
        category: "Friend",
        status: "Pending"
    });

    const fetchGuests = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/guests?user=${user.uid}`);
            const data = await response.json();
            setGuests(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, [user]);

    const handleCreateGuest = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/guests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newGuest, user: user.uid, event: "000000000000000000000000" }) // Temporary placeholder for global guest list
            });
            if (response.ok) {
                setShowModal(false);
                setNewGuest({ name: "", email: "", category: "Friend", status: "Pending" });
                fetchGuests();
            }
        } catch (err) {
            console.error("Failed to add guest:", err);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Guests</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Track RSVPs and invitations.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">Add Guest</button>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : guests.length === 0 ? (
                <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>Your guest list is empty</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Add your first guest to start tracking RSVPs.</p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {guests.map(guest => (
                        <div key={guest._id} className="card" style={{ gridColumn: "span 4", padding: "1.5rem" }}>
                            <h3 style={{ fontWeight: 800 }}>{guest.name}</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{guest.email}</p>
                            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", background: "var(--accent-soft)", borderRadius: "4px" }}>{guest.category}</span>
                                <span style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", background: "var(--bg-elevated)", borderRadius: "4px" }}>{guest.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
                        <h2>Add New Guest</h2>
                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                            <input className="auth-input" placeholder="Name" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} required />
                            <input className="auth-input" placeholder="Email" value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} />
                            <select className="auth-input" value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })}>
                                <option>Friend</option>
                                <option>Family</option>
                                <option>VIP</option>
                                <option>Other</option>
                            </select>
                            <button className="btn btn-primary" type="submit">Save Guest</button>
                            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
