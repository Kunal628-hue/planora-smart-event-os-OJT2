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
    CheckCircle2
} from "lucide-react";

export default function Settings() {
    const { user, updateUserProfile, addNotification } = useOutletContext();
    const { showAlert, showConfirm, showPrompt } = useDialog();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.displayName || "Planner");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

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

    return (
        <div style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#0f172a",
            animation: "fade-in 0.5s ease-out"
        }}>
            {/* Page Header */}
            <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
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
                
                <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || name === user?.displayName}
                    style={{
                        padding: "0.75rem 1.5rem",
                        background: saveStatus === 'success' ? "#10b981" : "var(--accent-primary, #2563eb)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: (isSaving || name === user?.displayName) ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                        opacity: (name === user?.displayName && !isSaving) ? 0.6 : 1,
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
                    }}
                >
                    {isSaving ? <Loader2 size={18} className="spin" /> : saveStatus === 'success' ? <CheckCircle2 size={18} /> : null}
                    {isSaving ? "Saving..." : saveStatus === 'success' ? "Saved" : "Save Changes"}
                </button>
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
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
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
                                width: "64px", height: "64px", borderRadius: "16px",
                                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontSize: "22px", fontWeight: 700,
                                boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                            }}>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "16px", objectFit: "cover" }} />
                                ) : initials}
                            </div>
                            <button 
                                onClick={() => showAlert("Feature Update", "Advanced avatar management and AI-generated portraits are coming in the next release.")}
                                style={{
                                    position: "absolute", bottom: "-6px", right: "-6px",
                                    width: "28px", height: "28px", borderRadius: "50%",
                                    background: "#fff", border: "1px solid #e2e8f0",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#64748b", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                    transition: "transform 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                            >
                                <Edit3 size={14} />
                            </button>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "18px", color: "#1e293b" }}>{name}</div>
                            <div style={{
                                display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "6px",
                                background: "#f1f5f9", color: "#475569", fontSize: "11px", fontWeight: 700,
                                marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.05em"
                            }}>Workspace Admin</div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</label>
                            <div style={{ position: "relative" }}>
                                <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    style={{
                                        width: "100%", padding: "12px 14px 12px 42px",
                                        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px",
                                        fontSize: "14px", fontWeight: 500, color: "#1e293b", outline: "none",
                                        transition: "border-color 0.2s"
                                    }}
                                    onFocus={e => e.target.style.borderColor = "var(--accent-primary)"}
                                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                <input
                                    readOnly
                                    value={user?.email || ""}
                                    style={{
                                        width: "100%", padding: "12px 14px 12px 42px",
                                        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                                        fontSize: "14px", fontWeight: 500, color: "#64748b", outline: "none", cursor: "not-allowed"
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>Email cannot be changed for security reasons.</p>
                        </div>

                    </div>
                </div>

                {/* Workspace Preferences Card (Right Panel) */}
                <div className="settings-card" style={{
                    background: "#fff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    padding: "2rem",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
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
                            { 
                                id: "notify", 
                                label: "Smart Notifications", 
                                desc: "AI-driven alerts for project risks", 
                                icon: <Zap size={16} />, 
                                color: "#f1f5f9", 
                                iconColor: "#475569", 
                                state: smartNotifications, 
                                setter: setSmartNotifications 
                            },
                            { 
                                id: "visibility", 
                                label: "Team Visibility", 
                                desc: "Allow colleagues to see your activity", 
                                icon: <User size={16} />, 
                                color: "#f1f5f9", 
                                iconColor: "#475569", 
                                state: teamVisibility, 
                                setter: setTeamVisibility 
                            }
                        ].map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex", alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0.5rem 0"
                                }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "40px", height: "40px", borderRadius: "10px",
                                        background: item.color, color: item.iconColor,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
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
                                        width: "44px", height: "24px", borderRadius: "100px",
                                        background: item.state ? "#1e293b" : "#e2e8f0",
                                        position: "relative", cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }}
                                >
                                    <div style={{
                                        position: "absolute",
                                        top: "4px",
                                        left: item.state ? "24px" : "4px",
                                        width: "16px", height: "16px", borderRadius: "50%",
                                        background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Danger Zone */}
                    <div style={{ marginTop: "3rem" }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
                            Danger Zone
                        </div>
                        <div
                            onClick={handleDeleteWorkspace}
                            style={{
                                padding: "1.25rem", borderRadius: "12px",
                                background: "#fff", border: "1px solid #fee2e2",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }} 
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "#fff1f1";
                                e.currentTarget.style.borderColor = "#fecaca";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "#fff";
                                e.currentTarget.style.borderColor = "#fee2e2";
                            }}
                            className="danger-row">
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "10px",
                                    background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#ef4444"
                                }}>
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#991b1b" }}>Delete Workspace</div>
                                    <div style={{ fontSize: "12px", color: "#ef4444", opacity: 0.8 }}>This action is irreversible and purges all data.</div>
                                </div>
                            </div>
                            <ChevronRight size={18} color="#ef4444" />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
