import { useOutletContext } from "react-router-dom";

export default function Settings() {
    const { user } = useOutletContext();
    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Settings</h1>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Manage your preferences and account security.</p>
            </div>
            <div className="card" style={{ maxWidth: "800px", padding: "2rem" }}>
                <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>Profile Information</h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Update your personal details and how others see you.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Display Name</label>
                        <input className="auth-input" defaultValue={user?.displayName} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Email Address</label>
                        <input className="auth-input" defaultValue={user?.email} disabled />
                    </div>
                    <button className="btn btn-primary" style={{ alignSelf: "flex-start", background: "var(--accent-primary)" }}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}
