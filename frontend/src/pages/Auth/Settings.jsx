import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
    User,
    Mail,
    RefreshCw,
    Search as ChartIcon,
    Moon,
    Flame,
    ChevronRight,
    Edit3,
    Zap,
    Settings as SettingsIcon,
} from "lucide-react";

export default function Settings() {
    const { user } = useOutletContext();
    const [name, setName] = useState(user?.displayName || "Kunal Singhi");

    // Mock states for the meta toggles
    const [neuralAnims, setNeuralAnims] = useState(true);
    const [analyticOverlays, setAnalyticOverlays] = useState(true);
    const [darkModeMatrix, setDarkModeMatrix] = useState(false);
    // Mock handlers
    const handleSynchronize = () => {
        // Simulate a save action
        const btn = document.querySelector('.premium-btn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '↻ Synchronizing...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.innerHTML = '✓ Synchronized';
                btn.style.background = '#10b981';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = 'linear-gradient(135deg, #6C5CE7 0%, #E84393 100%)';
                    btn.style.opacity = '1';
                }, 2000);
            }, 1000);
        }
    };

    const handleTerminate = () => {
        if (window.confirm("CRITICAL ALERT: You are about to terminate this workspace instance. This action is irreversible. All session data will be purged. Proceed?")) {
            alert("Termination protocol engaged. Purging data...");
        }
    };

    return (
        <div style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#0f172a",
            animation: "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
            {/* Page Header */}
            <div style={{ marginBottom: "2.5rem" }}>
                <h1 style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    margin: "0 0 4px 0",
                    color: "#1e293b"
                }}>
                    Account Settings
                </h1>
                <p style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, margin: 0 }}>
                    Manage your personal profile, workspace preferences, and security.
                </p>
            </div>

            {/* 2-Column Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "2.5rem",
                alignItems: "start"
            }}>

                {/* Identity Profile Card (Left Panel) */}
                <div className="settings-card" style={{
                    background: "#fff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    padding: "2rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2.5rem" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px", background: "#f1f5f9",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "#475569"
                        }}>
                            <User size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#1e293b" }}>Public Profile</h3>
                            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Manage how you appear across the platform</p>
                        </div>
                    </div>

                    {/* Avatar Section */}
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "2.5rem" }}>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                width: "64px", height: "64px", borderRadius: "12px",
                                background: "#1e293b",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontSize: "22px", fontWeight: 700
                            }}>
                                {name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <button style={{
                                position: "absolute", bottom: "-6px", right: "-6px",
                                width: "24px", height: "24px", borderRadius: "50%",
                                background: "#fff", border: "1px solid #e2e8f0",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#64748b", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                            }}>
                                <Edit3 size={12} />
                            </button>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "18px", color: "#1e293b" }}>{name}</div>
                            <div style={{
                                display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: "4px",
                                background: "#f1f5f9", color: "#475569", fontSize: "11px", fontWeight: 700,
                                marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.02em"
                            }}>Workspace Admin</div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Full Name</label>
                            <div style={{ position: "relative" }}>
                                <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: "100%", padding: "10px 12px 10px 38px",
                                        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
                                        fontSize: "14px", fontWeight: 500, color: "#1e293b", outline: "none",
                                        transition: "border-color 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px" }}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                <input
                                    readOnly
                                    value={user?.email || "lmsinghI2016@gmail.com"}
                                    style={{
                                        width: "100%", padding: "10px 12px 10px 38px",
                                        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px",
                                        fontSize: "14px", fontWeight: 500, color: "#64748b", outline: "none", cursor: "not-allowed"
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSynchronize}
                            style={{
                                marginTop: "1rem", width: "100%", padding: "12px",
                                background: "#1e293b",
                                border: "none", borderRadius: "8px", color: "#fff",
                                fontSize: "14px", fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                cursor: "pointer", transition: "all 0.2s"
                            }} className="save-btn"
                        >
                            <RefreshCw size={16} />
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Workspace Meta Card (Right Panel) */}
                <div className="settings-card" style={{
                    background: "#fff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    padding: "2rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2.5rem" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px", background: "#fff7ed",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b"
                        }}>
                            <SettingsIcon size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#1e293b" }}>Preferences</h3>
                            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Configure workspace behavior</p>
                        </div>
                    </div>

                    {/* Toggles List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {[
                            { id: "notify", label: "Smart Notifications", desc: "AI-driven alerts for project risks", icon: <Zap size={16} />, color: "#f1f5f9", iconColor: "#475569", state: neuralAnims, setter: setNeuralAnims },
                            { id: "visibility", label: "Team Visibility", desc: "Allow colleagues to see your activity", icon: <User size={16} />, color: "#f1f5f9", iconColor: "#475569", state: analyticOverlays, setter: setAnalyticOverlays }
                        ].map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex", alignItems: "center",
                                    justifyContent: "space-between"
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "36px", height: "36px", borderRadius: "8px",
                                        background: item.color, color: item.iconColor,
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>{item.label}</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>{item.desc}</div>
                                    </div>
                                </div>
                                <div
                                    onClick={() => item.setter(!item.state)}
                                    style={{
                                        width: "36px", height: "20px", borderRadius: "100px",
                                        background: item.state ? "#1e293b" : "#e2e8f0",
                                        position: "relative", cursor: "pointer", transition: "all 0.2s"
                                    }}
                                >
                                    <div style={{
                                        position: "absolute",
                                        top: "2px",
                                        left: item.state ? "18px" : "2px",
                                        width: "16px", height: "16px", borderRadius: "50%",
                                        background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                        transition: "all 0.2s"
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Danger Zone */}
                    <div
                        onClick={handleTerminate}
                        style={{
                            marginTop: "3rem", padding: "1.25rem", borderRadius: "12px",
                            background: "#fff", border: "1px solid #fee2e2",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            cursor: "pointer", transition: "all 0.2s"
                        }} className="danger-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#ef4444"
                            }}>
                                <Flame size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#991b1b" }}>Delete Workspace</div>
                                <div style={{ fontSize: "12px", color: "#ef4444", opacity: 0.8 }}>This action is irreversible</div>
                            </div>
                        </div>
                        <ChevronRight size={16} color="#ef4444" />
                    </div>
                </div>
            </div>

            <style>{`
                .settings-card { border-color: #e2e8f0; transition: all 0.2s; }
                .settings-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .save-btn:hover { background: #334155 !important; transform: translateY(-1px); }
                .save-btn:active { transform: translateY(0); }
                .danger-row:hover { border-color: #fecaca; background: #fffafb; }
            `}</style>
        </div>
    );
}
