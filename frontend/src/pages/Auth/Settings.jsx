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
            <div style={{ marginBottom: "3.5rem" }}>
                <h1 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "42px",
                    fontWeight: 800,
                    letterSpacing: "-2px",
                    margin: "0 0 8px 0",
                    lineHeight: 1
                }}>
                    Core <span style={{
                        background: "linear-gradient(135deg, #6C5CE7 0%, #E84393 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        display: "inline-block"
                    }}>Configuration</span>
                </h1>
                <p style={{ fontSize: "15px", color: "#64748b", fontWeight: 400, margin: 0, opacity: 0.8 }}>
                    Calibrate your operational workspace and personal identity parameters.
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
                    borderRadius: "20px",
                    border: "1px solid #e8e8f5",
                    padding: "24px",
                    transition: "all 0.3s ease"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
                        <div style={{
                            width: "42px", height: "42px", borderRadius: "50%", background: "#f0eeff",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "#6C5CE7"
                        }}>
                            <User size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700, margin: 0 }}>Identity Profile</h3>
                            <p style={{ fontSize: "12px", color: "#a0aec0", margin: 0 }}>Global identifiers for collaborative sessions</p>
                        </div>
                    </div>

                    {/* Avatar Section */}
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "2rem" }}>
                        <div style={{ position: "relative" }}>
                            <div style={{
                                width: "64px", height: "64px", borderRadius: "18px",
                                background: "linear-gradient(135deg, #6C5CE7 0%, #E84393 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontSize: "24px", fontWeight: 800
                            }}>
                                {name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <button style={{
                                position: "absolute", bottom: "-4px", right: "-4px",
                                width: "24px", height: "24px", borderRadius: "50%",
                                background: "#6C5CE7", border: "2px solid #fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", cursor: "pointer"
                            }}>
                                <Edit3 size={11} />
                            </button>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px" }}>{name}</div>
                            <div style={{
                                display: "inline-block", padding: "2px 10px", borderRadius: "20px",
                                background: "#f0eeff", color: "#6C5CE7", fontSize: "10px", fontWeight: 800,
                                marginTop: "4px", textTransform: "uppercase"
                            }}>Core Engine</div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#a0aec0", textTransform: "uppercase", marginBottom: "8px" }}>
                                <User size={12} /> UNIVERSAL NAME
                            </label>
                            <div style={{ position: "relative" }}>
                                <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#cbd5e0" }} />
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: "100%", padding: "12px 12px 12px 42px",
                                        background: "#f7f7fe", border: "1.5px solid #e8e8f5", borderRadius: "12px",
                                        fontSize: "14px", fontWeight: 600, color: "#0f172a", outline: "none"
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#a0aec0", textTransform: "uppercase", marginBottom: "8px" }}>
                                <Mail size={12} /> COMMUNICATION NODE
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#cbd5e0" }} />
                                <input
                                    readOnly
                                    value={user?.email || "lmsinghI2016@gmail.com"}
                                    style={{
                                        width: "100%", padding: "12px 12px 12px 42px",
                                        background: "#f7f7fe", border: "1.5px solid #e8e8f5", borderRadius: "12px",
                                        fontSize: "14px", fontWeight: 600, color: "#718096", outline: "none"
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSynchronize}
                            style={{
                                marginTop: "1rem", width: "100%", padding: "14px",
                                background: "linear-gradient(135deg, #6C5CE7 0%, #E84393 100%)",
                                border: "none", borderRadius: "12px", color: "#fff",
                                fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: 800,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                cursor: "pointer", boxShadow: "0 10px 20px rgba(108, 92, 231, 0.2)",
                                transition: "all 0.2s"
                            }} className="premium-btn"
                        >
                            <RefreshCw size={18} />
                            Synchronize Profile
                        </button>
                    </div>
                </div>

                {/* Workspace Meta Card (Right Panel) */}
                <div className="settings-card" style={{
                    background: "#fff",
                    borderRadius: "20px",
                    border: "1px solid #e8e8f5",
                    padding: "24px",
                    transition: "all 0.3s ease",
                    animationDelay: "0.1s"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
                        <div style={{
                            width: "42px", height: "42px", borderRadius: "50%", background: "#fffbf0",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b"
                        }}>
                            <SettingsIcon size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700, margin: 0 }}>Workspace Meta</h3>
                            <p style={{ fontSize: "12px", color: "#a0aec0", margin: 0 }}>Control operational matrix parameters</p>
                        </div>
                    </div>

                    {/* Toggles List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                            { id: "notify", label: "System Notifications", desc: "Push alerts for event milestones", icon: <Zap size={16} />, color: "#f0eeff", iconColor: "#6C5CE7", state: neuralAnims, setter: setNeuralAnims },
                            { id: "visibility", label: "Collaborator Visibility", desc: "Allow profile discovery in shared logs", icon: <User size={16} />, color: "#e6fff9", iconColor: "#10b981", state: analyticOverlays, setter: setAnalyticOverlays }
                        ].map((item) => (
                            <div
                                key={item.id}
                                onClick={() => item.setter(!item.state)}
                                style={{
                                    display: "flex", alignItems: "center",
                                    padding: "12px", borderRadius: "14px",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    background: item.id === "dark" && darkModeMatrix ? "#f8fafc" : "transparent"
                                }} className="toggle-row">
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "10px",
                                    background: item.color, color: item.iconColor,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginRight: "14px"
                                }}>
                                    {item.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{item.label}</div>
                                    <div style={{ fontSize: "12px", color: "#a0aec0" }}>{item.desc}</div>
                                </div>
                                <div
                                    style={{
                                        width: "42px", height: "22px", borderRadius: "100px",
                                        background: item.state ? "linear-gradient(135deg, #6C5CE7 0%, #E84393 100%)" : "#e2e8f0",
                                        position: "relative", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                                    }}
                                >
                                    <div style={{
                                        position: "absolute",
                                        top: "3px",
                                        left: item.state ? "23px" : "3px",
                                        width: "16px", height: "16px", borderRadius: "50%",
                                        background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Danger Zone */}
                    <div
                        onClick={handleTerminate}
                        style={{
                            marginTop: "2.5rem", padding: "14px", borderRadius: "14px",
                            background: "#fff8f8", border: "1.5px solid #ffe0e0",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            cursor: "pointer", transition: "all 0.2s"
                        }} className="danger-row">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: "#ffe0e0", display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#ef4444"
                            }}>
                                <Flame size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#c0392b" }}>Terminate Workspace Instance</div>
                                <div style={{ fontSize: "11px", color: "#f87171" }}>This action is irreversible</div>
                            </div>
                        </div>
                        <ChevronRight size={16} color="#f87171" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .settings-card:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 15px 35px rgba(0,0,0,0.05); 
                }
                .toggle-row:hover { background: #f8fafc; }
                .danger-row:hover { background: #fff0f0; }
                .premium-btn:active { transform: scale(0.98); }
            `}</style>
        </div>
    );
}
