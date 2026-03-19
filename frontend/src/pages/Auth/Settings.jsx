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
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>
                        Core <span style={{ color: "#2563eb" }}>Configuration</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                        Calibrate your operational workspace and personal identity parameters.
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2.5rem" }}>
                <div style={{
                    gridColumn: "span 7",
                    background: "#fff",
                    padding: "2.5rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Identity Profile</h3>
                            <p style={{ color: "#64748b", fontSize: "0.95rem", fontWeight: 500, margin: "2px 0 0" }}>Global identifiers for your collaborative sessions.</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Universal Name</label>
                            <div style={{ position: "relative" }}>
                                <User size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                <input style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600, color: "#0f172a" }} defaultValue={user?.displayName || "Planora Architect"} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Communication Node</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                <input style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", borderRadius: "14px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600, color: "#94a3b8", background: "#f8fafc" }} defaultValue={user?.email} disabled />
                            </div>
                        </div>
                        <button style={{ alignSelf: "flex-start", background: "#2563eb", color: "#fff", padding: "0.85rem 1.75rem", borderRadius: "14px", border: "none", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", boxShadow: "0 8px 15px rgba(37, 99, 235, 0.2)" }}>
                            <RefreshCw size={18} />
                            <span>Synchronize Profile</span>
                        </button>
                    </div>
                </div>

                <div style={{
                    gridColumn: "span 5",
                    background: "#fff",
                    padding: "2.5rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
                            <SettingsIcon size={24} />
                        </div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Workspace Meta</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[
                            { label: "Neural Animations", status: true, icon: <Zap size={18} /> },
                            { label: "Analytical Overlays", status: true, icon: <Search size={18} /> },
                            { label: "Dark Mode Matrix", status: false, icon: <Moon size={18} /> }
                        ].map((pref, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", background: "#f8fafc", borderRadius: "20px", border: "1px solid #f1f5f9" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ color: "#2563eb" }}>{pref.icon}</div>
                                    <span style={{ fontWeight: 700, fontSize: "15px", color: "#475569" }}>{pref.label}</span>
                                </div>
                                <div style={{
                                    width: "40px",
                                    height: "22px",
                                    background: pref.status ? "#2563eb" : "#e2e8f0",
                                    borderRadius: "100px",
                                    position: "relative",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}>
                                    <div style={{
                                        position: "absolute",
                                        left: pref.status ? "20px" : "3px",
                                        top: "3px",
                                        width: "16px",
                                        height: "16px",
                                        background: "white",
                                        borderRadius: "50%",
                                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "3.5rem", paddingTop: "2.5rem", borderTop: "1px solid #f1f5f9" }}>
                        <button style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            color: "#ef4444",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            fontSize: "12px",
                            cursor: "pointer",
                            letterSpacing: "0.05em"
                        }}>
                            <Trash2 size={18} />
                            <span>Terminate Workspace Instance</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
