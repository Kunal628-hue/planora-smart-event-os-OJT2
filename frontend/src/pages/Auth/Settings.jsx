import { useOutletContext } from "react-router-dom";
import {
    User,
    Mail,
    Settings as SettingsIcon,
    Shield,
    Zap,
    Search,
    Moon,
    Trash2,
    RefreshCw,
    ToggleLeft,
    ToggleRight
} from "lucide-react";

export default function Settings() {
    const { user } = useOutletContext();

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: "3rem" }}>
                <h1 style={{ fontSize: "2.75rem", fontWeight: 950, letterSpacing: "-0.04em", marginBottom: "0.75rem" }}>
                    Core <span className="gradient-text">Configuration</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: 500 }}>
                    Calibrate your operational workspace and personal identity parameters.
                </p>
            </div>

            <div className="dashboard-grid">
                <div className="glass-panel" style={{ gridColumn: "span 7", padding: "3rem", borderRadius: "32px", border: "1.5px solid var(--border-subtle)" }}>
                    <div style={{ marginBottom: "3rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.25rem" }}>Identity Profile</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>Global identifiers for your collaborative interactions.</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 850, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Universal Name</label>
                            <div style={{ position: "relative" }}>
                                <User size={18} style={{ position: "absolute", left: "1.15rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input className="auth-input" defaultValue={user?.displayName || "Planora Architect"} style={{ borderRadius: "16px", padding: "1.1rem 1.1rem 1.1rem 3rem", border: "1.5px solid var(--border-subtle)" }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 850, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Communication Node</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={18} style={{ position: "absolute", left: "1.15rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input className="auth-input" defaultValue={user?.email} disabled style={{ borderRadius: "16px", padding: "1.1rem 1.1rem 1.1rem 3rem", opacity: 0.6, border: "1.5px solid var(--border-subtle)", background: "var(--bg-elevated)" }} />
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ alignSelf: "flex-start", padding: "1.1rem 2.5rem", borderRadius: "16px", fontWeight: 900, marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 10px 20px -5px rgba(var(--accent-primary-rgb), 0.3)" }}>
                            <RefreshCw size={18} />
                            Synchronize Profile
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ gridColumn: "span 5", padding: "3rem", borderRadius: "32px", border: "1.5px solid var(--border-subtle)" }}>
                    <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--bg-elevated)", border: "1.5px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}>
                            <SettingsIcon size={24} />
                        </div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0 }}>Workspace Meta</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {[
                            { label: "Neural Animations", status: "Active", icon: <Zap size={18} /> },
                            { label: "Analytical Overlays", status: "Active", icon: <Search size={18} /> },
                            { label: "Dark Mode Matrix", status: "Forced", icon: <Moon size={18} /> }
                        ].map((pref, i) => (
                            <div key={i} className="hover-lift" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", background: "var(--bg-elevated)", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ color: "var(--accent-primary)" }}>{pref.icon}</div>
                                    <span style={{ fontWeight: 800, fontSize: "1rem" }}>{pref.label}</span>
                                </div>
                                <div style={{ width: "44px", height: "24px", background: "var(--accent-primary)", borderRadius: "24px", position: "relative", cursor: "pointer" }}>
                                    <div style={{ position: "absolute", right: "4px", top: "4px", width: "16px", height: "16px", background: "white", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "3.5rem", paddingTop: "2.5rem", borderTop: "1.5px solid var(--border-subtle)" }}>
                        <button style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            color: "var(--accent-danger)",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            letterSpacing: "0.05em"
                        }} className="hover-lift">
                            <Trash2 size={18} />
                            Terminate Workspace Instance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
