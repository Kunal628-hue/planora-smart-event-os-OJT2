import { useOutletContext } from "react-router-dom";

export default function Guests() {
    const { user } = useOutletContext();
    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Guests</h1>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Track RSVPs, meal preferences, and seating.</p>
            </div>
            <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                <div style={{ width: 80, height: 80, background: "var(--accent-soft)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--accent-primary)" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "0.75rem" }}>Your guest list is empty</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>Import guests from contacts or add them manually to start tracking invitations.</p>
                <button className="btn btn-primary" style={{ background: "var(--accent-primary)" }}>Add First Guest</button>
            </div>
        </div>
    );
}
