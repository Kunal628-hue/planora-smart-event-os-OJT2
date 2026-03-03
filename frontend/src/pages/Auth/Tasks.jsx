import { useOutletContext } from "react-router-dom";

export default function Tasks() {
    const { user } = useOutletContext();
    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Tasks / Timeline</h1>
                <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Stay on top of your event planning checklist.</p>
            </div>
            <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                <div style={{ width: 80, height: 80, background: "var(--accent-soft)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "var(--accent-primary)" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "0.75rem" }}>All caught up!</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>Create tasks manually or use our smart timeline generator to get started.</p>
                <button className="btn btn-primary" style={{ background: "var(--accent-primary)" }}>Create New Task</button>
            </div>
        </div>
    );
}
