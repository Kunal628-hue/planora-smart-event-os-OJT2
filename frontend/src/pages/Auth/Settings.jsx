import { useOutletContext } from "react-router-dom";

export default function Settings() {
    const { user } = useOutletContext();
    
    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                    Core <span className="gradient-text">Configuration</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                    Calibrate your operational workspace and personal identity parameters.
                </p>
            </div>

            <div className="dashboard-grid">
                <div className="glass-panel" style={{ gridColumn: "span 7", padding: "3rem", borderRadius: "32px" }}>
                    <div style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{ fontSize: "1.35rem", fontWeight: 850, marginBottom: "0.5rem" }}>Identity Profile</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 500 }}>Global identifiers for your collaborative interactions.</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Universal ID</label>
                            <input className="auth-input" defaultValue={user?.displayName || "Planora Architect"} style={{ borderRadius: "14px", padding: "1.1rem" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Communication Node</label>
                            <input className="auth-input" defaultValue={user?.email} disabled style={{ borderRadius: "14px", padding: "1.1rem", opacity: 0.6 }} />
                        </div>
                        <button className="btn btn-primary" style={{ alignSelf: "flex-start", padding: "1rem 2.5rem", borderRadius: "14px", fontWeight: 900, marginTop: "1rem" }}>
                            Synchronize Profile
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ gridColumn: "span 5", padding: "3rem", borderRadius: "32px" }}>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: 850, marginBottom: "2rem" }}>Workspace Preferences</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {[
                            { label: "Neural Animations", status: "Active" },
                            { label: "Analytical Overlays", status: "Active" },
                            { label: "Dark Mode Matrix", status: "Forced" }
                        ].map((pref, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", background: "var(--bg-elevated)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{pref.label}</span>
                                <div style={{ width: "40px", height: "20px", background: "var(--accent-primary)", borderRadius: "20px", position: "relative" }}>
                                    <div style={{ position: "absolute", right: "2px", top: "2px", width: "16px", height: "16px", background: "white", borderRadius: "50%" }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border-subtle)" }}>
                        <p style={{ fontSize: "0.8rem", color: "var(--accent-danger)", fontWeight: 800, textTransform: "uppercase", cursor: "pointer" }}>
                            Terminate Workspace Instance
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
