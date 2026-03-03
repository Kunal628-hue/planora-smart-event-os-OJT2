import { useOutletContext } from "react-router-dom";

export default function Analytics() {
    const { user } = useOutletContext();
    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Analytics</h1>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Insights and reports for your event performance.</p>
            </div>
            <div className="dashboard-grid">
                <div className="card" style={{ gridColumn: "span 12", padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                    <div style={{ width: 80, height: 80, background: "var(--accent-soft)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--accent-primary)" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "0.75rem" }}>Analytics is warming up</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>Create your first event and add some data to see insights here.</p>
                </div>
            </div>
        </div>
    );
}
