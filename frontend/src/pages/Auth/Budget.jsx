import { useOutletContext } from "react-router-dom";

export default function Budget() {
    const { user } = useOutletContext();
    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Budget</h1>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Monitor expenses and manage your event finances.</p>
            </div>
            <div className="dashboard-grid">
                <div className="card" style={{ gridColumn: "span 4", padding: "1.5rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>Total Budget</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0" }}>₹0</div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <div style={{ height: "4px", flex: 1, background: "var(--border-subtle)", borderRadius: "2px" }}></div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>0% used</span>
                    </div>
                </div>
                <div className="card" style={{ gridColumn: "span 8", padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>No expenses tracked</h3>
                    <p style={{ color: "var(--text-secondary)" }}>Link vendors or add line items to start managing your budget.</p>
                </div>
            </div>
        </div>
    );
}
