import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import {
    User,
    Mail,
    AlertTriangle,
    ChevronRight,
    Edit3,
    Zap,
    Settings as SettingsIcon,
    Loader2,
    CheckCircle2,
    Shield,
    Bell,
    Globe,
    Lock,
    Eye,
    X,
    Clock,
    Activity,
    Database,
    Fingerprint,
    Unlock
} from "lucide-react";

export default function Settings() {
    const { user, updateUserProfile, addNotification } = useOutletContext();
    const { showAlert, showConfirm, showPrompt } = useDialog();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.displayName || "Planner");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const [showAuditModal, setShowAuditModal] = useState(false);

    // Simulated historical logs + session logs
    const [logs, setLogs] = useState([
        { id: 1, event: "System Authentication", status: "success", geo: "Mumbai, IN", time: "2 hours ago", icon: <Fingerprint size={14} /> },
        { id: 2, event: "PDF Intelligence Export", status: "success", geo: "Mumbai, IN", time: "5 hours ago", icon: <Database size={14} /> },
        { id: 3, event: "Security Protocol Update", status: "info", geo: "System", time: "Yesterday", icon: <Shield size={14} /> },
        { id: 4, event: "Project Parameter Change", status: "warn", geo: "Mumbai, IN", time: "2 days ago", icon: <Zap size={14} /> },
        { id: 5, event: "Workspace Initialized", status: "success", geo: "Cloud", time: "Jan 12, 2024", icon: <Activity size={14} /> }
    ]);

    // Preferences from localStorage
    const [smartNotifications, setSmartNotifications] = useState(() => {
        return localStorage.getItem("planora_pref_smart_notif") !== "false";
    });
    const [teamVisibility, setTeamVisibility] = useState(() => {
        return localStorage.getItem("planora_pref_team_vis") !== "false";
    });

    useEffect(() => {
        localStorage.setItem("planora_pref_smart_notif", smartNotifications);
    }, [smartNotifications]);

    useEffect(() => {
        localStorage.setItem("planora_pref_team_vis", teamVisibility);
    }, [teamVisibility]);

    const handleSaveProfile = async () => {
        if (!name.trim()) return;
        setIsSaving(true);
        setSaveStatus(null);
        try {
            await updateUserProfile({ displayName: name });
            setSaveStatus('success');
            if (addNotification) {
                addNotification("Profile Updated", "Your profile changes have been saved successfully.");
            }
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error("Save error:", err);
            setSaveStatus('error');
            showAlert("Update Failed", "We couldn't synchronize your profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteWorkspace = async () => {
        const confirmMsg = "CRITICAL ALERT: You are about to delete your workspace and all associated data. This action is irreversible. Type 'DELETE' to confirm.";
        const userInput = await showPrompt("Confirm Workspace Deletion", confirmMsg);
        
        if (userInput === "DELETE") {
            // In a real app, this would be an API call
            await showAlert("Protocol Engaged", "Workspace deletion protocol engaged. Purging all data and logging out...");
            localStorage.clear();
            navigate("/login");
        } else if (userInput !== null) {
            await showAlert("Security Verification Failed", "Invalid input. The workspace deletion protocol has been safely cancelled.");
        }
    };

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : "PL";

    const hasChanges = name !== user?.displayName;

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            color: "#0f172a",
            background: "#fff",
            minHeight: "100vh",
            backgroundImage: "radial-gradient(circle at 50% -20%, #eff6ff 0%, #ffffff 50%)"
        }}>
            {/* Page Header */}
            <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ width: "24px", height: "3px", background: "#2563eb", borderRadius: "10px" }}></div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.2em" }}>Workspace Ops</span>
                    </div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0, color: "#0f172a" }}>
                        Account <span style={{ color: "#2563eb" }}>Settings</span>
                    </h1>
                </div>
                
                {saveStatus === 'success' && (
                    <div style={{ 
                        display: "flex", alignItems: "center", gap: "8px", 
                        color: "#10b981", fontSize: "13px", fontWeight: 800,
                        animation: "fade-in 0.3s ease"
                    }}>
                        <CheckCircle2 size={16} />
                        Context Synchronized
                    </div>
                )}
            </div>

            {/* Main Content Layout */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 400px", 
                gap: "2.5rem",
                alignItems: "start"
            }} className="settings-grid">

                {/* Left Column: Identity & Access */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    
                    {/* Public Profile Card */}
                    <div className="premium-card" style={{
                        background: "#fff",
                        borderRadius: "32px",
                        padding: "2.5rem",
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 4px 25px rgba(0,0,0,0.02)",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    width: "48px", height: "48px", borderRadius: "14px", 
                                    background: "rgba(37, 99, 235, 0.05)", color: "#2563eb",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <User size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "18px", fontWeight: 850, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>Public Identity</h3>
                                    <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0", fontWeight: 500 }}>Global presence parameters</p>
                                </div>
                            </div>
                            <div style={{ 
                                background: "#f8fafc", padding: "6px 14px", borderRadius: "100px",
                                border: "1px solid #f1f5f9", fontSize: "11px", fontWeight: 800,
                                color: "#64748b", display: "flex", alignItems: "center", gap: "6px"
                            }}>
                                <Shield size={12} />
                                Verified Admin
                            </div>
                        </div>

                        {/* Profile Presence */}
                        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "3.5rem" }}>
                            <div style={{ position: "relative" }}>
                                <div style={{
                                    width: "80px", height: "80px", borderRadius: "24px",
                                    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#fff", fontSize: "28px", fontWeight: 900,
                                    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
                                    border: "4px solid #fff"
                                }}>
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "20px", objectFit: "cover" }} />
                                    ) : initials}
                                </div>
                                <button 
                                    onClick={() => showAlert("Feature Update", "Advanced avatar management and AI-generated portraits are coming in the next release.")}
                                    style={{
                                        position: "absolute", bottom: "-4px", right: "-4px",
                                        width: "32px", height: "32px", borderRadius: "10px",
                                        background: "#fff", border: "1px solid #f1f5f9",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "#2563eb", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1) rotate(10deg)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1) rotate(0)"}
                                >
                                    <Edit3 size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                            <div>
                                <div style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>{name}</div>
                                <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 550, marginTop: "2px" }}>{user?.email}</div>
                            </div>
                        </div>

                        {/* Interactive Form */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div className="input-field">
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 900, color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Legal Identity</label>
                                <div style={{ position: "relative" }}>
                                    <User size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#2563eb", opacity: 0.6 }} />
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={handleSaveProfile}
                                        placeholder="Enter full name"
                                        style={{
                                            width: "100%", padding: "1.1rem 3.5rem 1.1rem 3rem",
                                            background: "#fcfdff", border: "1.5px solid #f1f5f9", borderRadius: "16px",
                                            fontSize: "15px", fontWeight: 800, color: "#0f172a", outline: "none",
                                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                        }}
                                        className="premium-input-style"
                                    />
                                    {isSaving && (
                                        <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }}>
                                            <Loader2 size={18} className="animate-spin" color="#2563eb" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="input-field">
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Operational Email</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        readOnly
                                        value={user?.email || ""}
                                        style={{
                                            width: "100%", padding: "1.1rem 1.1rem 1.1rem 3rem",
                                            background: "#f8fafc", border: "1.5px solid #f1f5f9", borderRadius: "16px",
                                            fontSize: "15px", fontWeight: 750, color: "#94a3b8", outline: "none", cursor: "not-allowed"
                                        }}
                                    />
                                    <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }}>
                                        <Lock size={14} color="#cbd5e1" />
                                    </div>
                                </div>
                                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "10px", fontWeight: 500 }}>Email identification is linked to your SSO provider.</p>
                            </div>
                        </div>
                    </div>

                    {/* Security & Access Summary */}
                    <div style={{ 
                        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", 
                        padding: "2.5rem", borderRadius: "32px", color: "#fff",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        boxShadow: "0 15px 35px rgba(15, 23, 42, 0.1)"
                    }}>
                        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Lock size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: "#fff" }}>Security Protocol</h4>
                                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Global identity sync active.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowAuditModal(true)}
                            style={{ 
                                background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
                                padding: "12px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 800,
                                cursor: "pointer", transition: "all 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                        >Audit Logs</button>
                    </div>
                </div>

                {/* Right Column: Preferences & Danger Zone */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    
                    {/* Preferences Module */}
                    <div className="premium-card" style={{
                        background: "#fff",
                        borderRadius: "32px",
                        padding: "2.5rem",
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "3rem" }}>
                            <div style={{ 
                                width: "48px", height: "48px", borderRadius: "14px", 
                                background: "rgba(245, 158, 11, 0.05)", color: "#f59e0b",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <SettingsIcon size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "18px", fontWeight: 850, margin: 0, color: "#0f172a", letterSpacing: "-0.02em" }}>Preferences</h3>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0", fontWeight: 500 }}>Operational behavior</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                            {[
                                { 
                                    id: "notify", 
                                    label: "Neural Notifications", 
                                    desc: "AI-driven real-time alert vectors", 
                                    icon: <Bell size={18} />, 
                                    state: smartNotifications, 
                                    setter: setSmartNotifications 
                                },
                                { 
                                    id: "visibility", 
                                    label: "Team Presence", 
                                    desc: "Global visibility in peer directory", 
                                    icon: <Eye size={18} />, 
                                    state: teamVisibility, 
                                    setter: setTeamVisibility 
                                }
                            ].map((item) => (
                                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ 
                                            width: "44px", height: "44px", borderRadius: "12px", 
                                            background: "#f8fafc", color: "#475569",
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>{item.label}</div>
                                            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{item.desc}</div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => item.id !== "analytics" ? item.setter(!item.state) : item.setter()}
                                        style={{
                                            width: "48px", height: "26px", borderRadius: "100px",
                                            background: item.state ? "#2563eb" : "#e2e8f0",
                                            position: "relative", cursor: "pointer",
                                            transition: "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
                                            boxShadow: item.state ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none"
                                        }}
                                    >
                                        <div style={{
                                            position: "absolute",
                                            top: "4px",
                                            left: item.state ? "26px" : "4px",
                                            width: "18px", height: "18px", borderRadius: "50%",
                                            background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            transition: "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)"
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Module */}
                    <div className="premium-card danger-card" style={{
                        background: "#fff",
                        borderRadius: "32px",
                        padding: "2rem",
                        border: "1px solid #fee2e2",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ 
                                width: "40px", height: "40px", borderRadius: "12px", 
                                background: "#fef2f2", color: "#ef4444",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <AlertTriangle size={20} />
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 850, margin: 0, color: "#991b1b", letterSpacing: "-0.02em" }}>Terminal Operations</h3>
                        </div>
                        
                        <p style={{ margin: 0, fontSize: "13px", color: "#b91c1c", fontWeight: 500, lineHeight: 1.5 }}>
                            Purging the workspace will permanently terminate all event contexts, vendor contracts, and analytics history.
                        </p>

                        <button 
                            onClick={handleDeleteWorkspace}
                            style={{ 
                                background: "#fff", border: "1.5px solid #fee2e2", color: "#ef4444",
                                padding: "12px", borderRadius: "14px", fontSize: "14px", fontWeight: 900,
                                cursor: "pointer", transition: "all 0.2s",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
                        >
                            Delete Entire Workspace
                            <ChevronRight size={16} />
                        </button>
                    </div>

                </div>
            </div>

            {/* Security Audit Log Modal */}
            {showAuditModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000, padding: "2rem"
                }} onClick={() => setShowAuditModal(false)}>
                    <div 
                        style={{
                            width: "100%", maxWidth: "700px", background: "#fff",
                            borderRadius: "32px", overflow: "hidden",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
                            animation: "scale-up 0.4s cubic-bezier(0.19, 1, 0.22, 1)"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: "2rem", background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                            color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center" 
                                }}>
                                    <Shield size={22} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#fff" }}>
                                        Security <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Audit Hub</span>
                                    </h2>
                                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Operational Activity Intelligence</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowAuditModal(false)}
                                style={{ 
                                    background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
                                    width: "36px", height: "36px", borderRadius: "10px", 
                                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: "1.5rem", maxHeight: "500px", overflowY: "auto" }} className="hide-scrollbar">
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {logs.map(log => (
                                    <div key={log.id} style={{
                                        padding: "1.25rem", borderRadius: "20px", background: "#f8fafc",
                                        border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center",
                                        transition: "all 0.2s"
                                    }} onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ 
                                                width: "36px", height: "36px", borderRadius: "10px", 
                                                background: log.status === 'success' ? "rgba(16, 185, 129, 0.1)" : log.status === 'warn' ? "rgba(239, 68, 68, 0.1)" : "rgba(37, 99, 235, 0.1)",
                                                color: log.status === 'success' ? "#10b981" : log.status === 'warn' ? "#ef4444" : "#2563eb",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                {log.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{log.event}</div>
                                                <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                                    <Globe size={10} /> {log.geo} • <Clock size={10} style={{ marginLeft: "4px" }} /> {log.time}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800,
                                            background: log.status === 'success' ? "#dcfce7" : log.status === 'warn' ? "#fee2e2" : "#dbeafe",
                                            color: log.status === 'success' ? "#166534" : log.status === 'warn' ? "#991b1b" : "#1e40af",
                                            textTransform: "uppercase"
                                        }}>
                                            {log.status === 'success' ? "Verified" : log.status === 'warn' ? "Alert" : "Info"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: "1.5rem", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "12px", fontWeight: 500 }}>
                                <Fingerprint size={14} /> System Node: Active-Alpha-01
                            </div>
                            <button 
                                onClick={() => showAlert("Exporting Logs", "Historical audit logs are being archived for secure download.")}
                                style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}
                            >
                                Export Log Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .premium-input-style:focus {
                    border-color: #2563eb !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08) !important;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes scale-up {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                @media (max-width: 1100px) {
                    .settings-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
