import { useOutletContext } from "react-router-dom";

export default function Vendors() {
    const { user } = useOutletContext();
    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Vendors</h1>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Manage your event partners and contracts.</p>
            </div>
            <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                <div style={{ width: 80, height: 80, background: "var(--accent-soft)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--accent-primary)" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "0.75rem" }}>No vendors added yet</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>Keep track of catering, decor, photography and more in one place.</p>
                <button className="btn btn-primary" style={{ background: "var(--accent-primary)" }}>Add Your First Vendor</button>
            </div>
        </div>
    );
}
