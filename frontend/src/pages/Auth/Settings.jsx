import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { Skeleton } from "../../components/ui/Skeleton";
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
    Unlock,
    MoreVertical,
    UserPlus,
    Info,
    CreditCard,
    Cpu,
    Webhook,
    Key,
    Trash2,
    RefreshCw,
    Search,
    Copy
} from "lucide-react";

import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

const API_URL_ENV = import.meta.env.VITE_API_URL;

export default function Settings() {
    const { user, updateUserProfile, addNotification, selectedEventId, events } = useOutletContext();
    const { showAlert, showConfirm, showPrompt } = useDialog();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Organization");
    const [name, setName] = useState(user?.displayName || "Planner");
    const [originalName, setOriginalName] = useState(user?.displayName || "Planner");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [showAuditModal, setShowAuditModal] = useState(false);
    
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    
    // Clipboard hook integration for secure copy functionality
    const { isCopied, copyToClipboard } = useCopyToClipboard();

    // Fetch Team
    useEffect(() => {
        const fetchTeam = async () => {
            const eventId = selectedEventId || (events && events[0]?.id);
            if (!eventId) return;
            
            setLoadingTeam(true);
            try {
                const res = await fetch(`${API_URL_ENV}/collaborators?eventId=${eventId}`);
                const data = await res.json();
                
                let fetchedTeam = [];
                if (data.owner) {
                    fetchedTeam = [data.owner, ...(data.collaborators || [])];
                } else {
                    const owner = {
                        _id: 'owner',
                        name: user?.displayName || "Workspace Owner",
                        email: user?.email || "owner@planora.os",
                        role: "Event Lead",
                        isOwner: true
                    };
                    fetchedTeam = [owner, ...data];
                }
                setTeamMembers(fetchedTeam);
            } catch(err) {
                console.error("Failed to fetch team:", err);
            } finally {
                setLoadingTeam(false);
            }
        };
        
        if (user) fetchTeam();
    }, [selectedEventId, events, user]);

    // Simulated historical logs + session logs
    const [logs, setLogs] = useState([
        { id: 1, event: "System Authentication", status: "success", geo: "Mumbai, IN", time: "2 hours ago", icon: <Fingerprint size={14} /> },
        { id: 2, event: "PDF Intelligence Export", status: "success", geo: "Mumbai, IN", time: "5 hours ago", icon: <Database size={14} /> },
        { id: 3, event: "Security Protocol Update", status: "info", geo: "System", time: "Yesterday", icon: <Shield size={14} /> },
        { id: 4, event: "Event Parameter Change", status: "warn", geo: "Mumbai, IN", time: "2 days ago", icon: <Zap size={14} /> },
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
            setOriginalName(name); // Update reference for change tracking
            setSaveStatus('success');
            if (addNotification) {
                addNotification("Configuration Synchronized", "System parameters updated successfully.", "success");
            }
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (err) {
            console.error("Save error:", err);
            setSaveStatus('error');
            showAlert("Synchronization Failed", "We couldn't propagate your configuration changes. Please verify connectivity.");
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

    const hasChanges = name !== originalName;

    const handleDiscard = () => {
        setName(originalName);
    };

    const handleCheckAvailability = () => {
        setIsCheckingDomain(true);
        setTimeout(() => {
            setIsCheckingDomain(false);
            addNotification("Domain Available", "The domain 'global-ops' is currently available.", "success");
        }, 1200);
    };

    const tabs = [
        { id: "Organization", icon: <SettingsIcon size={14} /> },
        { id: "Billing", icon: <CreditCard size={14} /> },
        { id: "Security", icon: <Shield size={14} /> }
    ];

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            color: "var(--text-primary)",
            paddingBottom: "4rem"
        }}>
            {/* Settings Navigation Tabs */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "2px", overflowX: "auto" }} className="hide-scrollbar">
                {tabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)}
                        style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            padding: "0.75rem 1rem", 
                            background: "none", 
                            border: "none", 
                            color: activeTab === tab.id ? "var(--accent-primary)" : "var(--text-secondary)", 
                            fontSize: "13px", 
                            fontWeight: 700, 
                            cursor: "pointer", 
                            position: "relative",
                            transition: "all 0.2s"
                        }}
                    >
                        {tab.icon}
                        {tab.id}
                        {activeTab === tab.id && (
                            <div style={{ position: "absolute", bottom: "-2px", left: 0, right: 0, height: "2px", background: "var(--accent-primary)", borderRadius: "2px 2px 0 0" }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Page Header */}
            <div style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ fontSize: "21px", fontWeight: 800, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>{activeTab} Settings</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, margin: 0, maxWidth: "600px" }}>
                    {activeTab === "Organization" && "Manage your global enterprise settings, team hierarchies, and system-wide operational preferences."}
                    {activeTab === "Billing" && "Manage your subscription plan, billing history, and payment methods."}
                    {activeTab === "Security" && "Configure authentication protocols, session timeouts, and audit logging."}
                    {activeTab === "Integrations" && "Connect third-party tools and synchronize your event data ecosystem."}
                    {activeTab === "Notifications" && "Configure global communication triggers and personalized alert thresholds."}
                    {activeTab === "API Keys" && "Generate and manage secure access tokens for programmatic infrastructure."}
                </p>
            </div>

            {activeTab === "Organization" && (
                <>
                {/* Organization Profile */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Organization Profile</h3>
                        <div style={{ padding: "4px 10px", background: "rgba(249, 115, 22, 0.1)", borderRadius: "6px", color: "var(--accent-primary)", fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em" }}>OPERATIONAL ENTITY</div>
                    </div>
                    
                    <div className="settings-split-layout" style={{ gap: "3rem" }}>
                        {/* LEFT COLUMN: USER PROFILE CARD */}
                        <div style={{
                            position: "relative",
                            background: "var(--bg-elevated)",
                            borderRadius: "16px",
                            padding: "2.5rem 1.5rem 1.5rem",
                            border: "1px solid var(--border-subtle)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                            overflow: "hidden"
                        }}>
                            {/* Ribbon */}
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "32px",
                                height: "36px",
                                background: "var(--accent-primary)",
                                borderBottomLeftRadius: "6px",
                                borderBottomRightRadius: "6px",
                                boxShadow: "0 4px 10px rgba(249, 115, 22, 0.4)"
                            }}></div>

                            {/* 'Free' Badge Removed */}

                            {/* Alphabet Logo */}
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-subtle)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "28px",
                                fontWeight: 800,
                                color: "var(--accent-primary)",
                                marginTop: "0.5rem",
                                marginBottom: "1.25rem"
                            }}>
                                {name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : user?.email?.[0].toUpperCase() || "AH"}
                            </div>

                            {/* Name & Details */}
                            <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 0.25rem" }}>
                                {name || "User Name"}
                            </h4>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 0.25rem" }}>
                                Event Administrator
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 1.5rem" }}>
                                {user?.email || "alexishillprados@gmail.com"}
                            </p>

                            {/* Button */}
                            <button style={{
                                width: "100%",
                                padding: "0.75rem",
                                background: "#0c0c0c",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "10px",
                                color: "var(--text-primary)",
                                fontSize: "13px",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-primary)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}>
                                Upgrade to <span style={{ background: "var(--accent-primary)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", color: "#000" }}>PRO</span>
                            </button>
                        </div>
                        
                        {/* RIGHT COLUMN: FIELDS */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Organization Name</label>
                                        <Info size={12} color="var(--text-muted)" style={{ cursor: "help" }} title="The primary name used throughout your workspace." />
                                    </div>
                                    <input value={name} onChange={e => setName(e.target.value)} className="premium-input-style" style={{ width: "100%", padding: "1rem", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, outline: "none" }} />
                                </div>

                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Public Domain Subdomain</label>
                                        <Info size={12} color="var(--text-muted)" style={{ cursor: "help" }} title="Your unique URL prefix for public event pages." />
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <div style={{ flex: 1, display: "flex", alignItems: "stretch", overflow: "hidden", borderRadius: "12px", border: "1px solid var(--border-subtle)", position: "relative" }}>
                                            <div style={{ padding: "0 1rem", background: "var(--bg-surface)", borderRight: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center" }}>planora.app/</div>
                                            <input value="global-ops" readOnly style={{ flex: 1, padding: "1rem", background: "var(--bg-elevated)", border: "none", color: "var(--text-primary)", fontSize: "14px", fontWeight: 700, outline: "none", paddingRight: "3rem" }} />
                                            <button 
                                                onClick={() => copyToClipboard("planora.app/global-ops")}
                                                style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: isCopied ? "var(--accent-primary)" : "var(--text-muted)", cursor: "pointer" }}
                                                title="Copy domain link securely"
                                            >
                                                {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2-col" style={{ gap: "2rem" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Timezone</label>
                                        <Info size={12} color="var(--text-muted)" style={{ cursor: "help" }} title="Sets the default timezone for all new events." />
                                    </div>
                                    <select style={{ width: "100%", padding: "1rem", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, outline: "none" }}>
                                        <option>(GMT+05:30) India Standard Time</option>
                                        <option>(GMT+00:00) UTC</option>
                                        <option>(GMT-08:00) Pacific Standard Time</option>
                                    </select>
                                </div>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Currency</label>
                                        <Info size={12} color="var(--text-muted)" style={{ cursor: "help" }} title="The primary currency used for budget monitoring." />
                                    </div>
                                    <select style={{ width: "100%", padding: "1rem", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, outline: "none" }}>
                                        <option>INR (₹) - Indian Rupee</option>
                                        <option>USD ($) - US Dollar</option>
                                        <option>EUR (€) - Euro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Management */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>Team Management</h3>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>Control access levels and manage workspace collaborators across all paradigms.</p>
                        </div>
                        <button style={{ padding: "0.75rem 1.25rem", background: "var(--accent-primary)", border: "none", borderRadius: "12px", color: "#000", fontSize: "13px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", transition: "all 0.2s", boxShadow: "0 8px 20px rgba(249, 115, 22, 0.2)" }} onMouseEnter={e => {e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 25px rgba(249, 115, 22, 0.3)"}} onMouseLeave={e => {e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(249, 115, 22, 0.2)"}}>
                            <UserPlus size={16} strokeWidth={3} /> Invite Collaborator
                        </button>
                    </div>

                    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "14px", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead style={{ background: "var(--bg-elevated)" }}>
                                <tr>
                                    <th style={{ padding: "1rem", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Collaborator</th>
                                    <th style={{ padding: "1rem", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Role</th>
                                    <th style={{ padding: "1rem", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Active</th>
                                    <th style={{ padding: "1rem", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Permissions</th>
                                    <th style={{ padding: "1rem", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingTeam ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "2rem", textAlign: "center" }}><Loader2 size={24} className="animate-spin" color="var(--accent-primary)" /></td>
                                    </tr>
                                ) : teamMembers.map((member, i) => {
                                    const isOwner = member.isOwner || i === 0;
                                    const roleColor = isOwner ? "var(--accent-primary)" : "var(--text-secondary)";
                                    const lastActive = i === 0 ? "Active Now" : "2 hours ago";
                                    
                                    return (
                                        <tr key={member._id || i} style={{ borderTop: "1px solid var(--border-subtle)", background: isOwner ? "rgba(249, 115, 22, 0.02)" : "transparent" }}>
                                            <td style={{ padding: "1.25rem 1rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                    <div style={{ position: "relative" }}>
                                                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: isOwner ? "var(--accent-primary)" : "var(--bg-elevated)", color: isOwner ? "#000" : "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                                                            {member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "UN"}
                                                        </div>
                                                        {isOwner && (
                                                            <div style={{ position: "absolute", bottom: "-4px", right: "-4px", background: "#f59e0b", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-surface)" }}>
                                                                <CheckCircle2 size={10} color="#fff" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{member.name || "Unknown User"}</span>
                                                            {isOwner && <span style={{ padding: "2px 6px", background: "rgba(245, 158, 11, 0.15)", borderRadius: "4px", color: "#f59e0b", fontSize: "9px", fontWeight: 900, textTransform: "uppercase" }}>Owner</span>}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{member.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <Shield size={12} color={roleColor} />
                                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{member.role || "Collaborator"}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500 }}>
                                                    <Clock size={12} /> {lastActive}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <div style={{ display: "flex", gap: "4px" }}>
                                                    {["READ", "WRITE", "DELETE"].map(p => (
                                                        <span key={p} style={{ padding: "2px 6px", background: "var(--bg-elevated)", borderRadius: "4px", fontSize: "8px", fontWeight: 900, color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: "1rem", textAlign: "right" }}>
                                                <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color="var(--text-muted)"}>
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Preference Matrices */}
                <div className="grid-2-col" style={{ gap: "1.5rem", marginBottom: "1.5rem" }}>
                    {/* Notification Preferences */}
                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "2rem" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 2rem", color: "var(--text-primary)" }}>Communication Protocol</h3>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {/* EMAIL GROUP */}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
                                    <Mail size={16} color="var(--accent-primary)" />
                                    <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Email Channels</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingLeft: "1.5rem" }}>
                                    {[
                                        { label: "Daily Enterprise Digest", state: true },
                                        { label: "Critical Incident Alerts", state: true }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</span>
                                            <div style={{ width: "32px", height: "18px", borderRadius: "9px", background: item.state ? "var(--accent-primary)" : "var(--bg-elevated)", position: "relative", cursor: "pointer" }}>
                                                <div style={{ position: "absolute", top: "2px", left: item.state ? "16px" : "2px", width: "14px", height: "14px", borderRadius: "50%", background: item.state ? "#000" : "var(--text-muted)", transition: "all 0.2s" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* IN-APP GROUP */}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
                                    <Bell size={16} color="var(--accent-primary)" />
                                    <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>In-App Infrastructure</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingLeft: "1.5rem" }}>
                                    {[
                                        { label: "Collaborator Activity", state: true },
                                        { label: "System Maintenance", state: true }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</span>
                                            <div style={{ width: "32px", height: "18px", borderRadius: "9px", background: item.state ? "var(--accent-primary)" : "var(--bg-elevated)", position: "relative", cursor: "pointer" }}>
                                                <div style={{ position: "absolute", top: "2px", left: item.state ? "16px" : "2px", width: "14px", height: "14px", borderRadius: "50%", background: item.state ? "#000" : "var(--text-muted)", transition: "all 0.2s" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Hub */}
                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Security Intelligence</h3>
                            <button onClick={() => setShowAuditModal(true)} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "11px", fontWeight: 800, color: "var(--text-primary)", cursor: "pointer" }}>VIEW FULL LOG</button>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {[
                                { event: "Login from new IP: 192.168.1.45", ip: "192.168.1.45", time: "Oct 24 · 14:32", icon: <Fingerprint size={14} />, color: "var(--accent-primary)" },
                                { event: "Strategic Budget Update", ip: "104.22.7.12", time: "Oct 23 · 09:15", icon: <Lock size={14} />, color: "#6366f1" },
                                { event: "Member Access Revoked", ip: "172.67.13.4", time: "Oct 22 · 18:45", icon: <User size={14} />, color: "#ef4444" },
                                { event: "Integrity Sync Active", ip: "System", time: "Oct 21 · 12:00", icon: <RefreshCw size={14} />, color: "#10b981" }
                            ].map((log, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--bg-elevated)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", color: log.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {log.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{log.event}</div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{log.ip} • {log.time}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Infrastructure Risk Management (Danger Zone) */}
                <div style={{ background: "rgba(239, 68, 68, 0.02)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "16px", padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <AlertTriangle size={18} />
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#fca5a5" }}>Infrastructure Risk Hub (Danger Zone)</h3>
                    </div>

                    <div className="grid-2-col" style={{ gap: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)", borderRadius: "14px" }}>
                            <div style={{ maxWidth: "70%" }}>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Transfer Primary Ownership</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>Designate a new operational lead. This action will revoke your administrative sovereignty.</div>
                            </div>
                            <button style={{ padding: "0.6rem 1rem", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Execute Transfer</button>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "14px" }}>
                            <div style={{ maxWidth: "70%" }}>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: "#fca5a5", marginBottom: "4px" }}>Terminate Organization</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>Permanently erase all event data, financial ledgers, and operational logs. Irreversible.</div>
                            </div>
                            <button onClick={handleDeleteWorkspace} style={{ padding: "0.6rem 1rem", background: "#ef4444", border: "none", borderRadius: "10px", color: "#fff", fontSize: "12px", fontWeight: 900, cursor: "pointer" }}>Delete Organization</button>
                        </div>
                    </div>
                </div>
                </>
            )}

            {activeTab === "Billing" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "scale-up 0.3s ease-out" }}>
                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "20px", padding: "3rem", textAlign: "center" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(249, 115, 22, 0.1)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                            <Zap size={32} />
                        </div>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.5rem", color: "var(--text-primary)" }}>Enterprise Tier Active</h2>
                        <p style={{ color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto 2rem", fontSize: "14px", lineHeight: 1.6 }}>You are currently on the professional workspace tier with unlimited events, premium AI capabilities, and advanced team hierarchy controls.</p>
                        <div className="grid-2-col" style={{ gap: "1.5rem", maxWidth: "500px", margin: "0 auto" }}>
                            <div style={{ background: "var(--bg-elevated)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Next Renewal</div>
                                <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>June 12, 2026</div>
                            </div>
                            <div style={{ background: "var(--bg-elevated)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Monthly Cost</div>
                                <div style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>₹14,999</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "20px", padding: "2rem" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "1.5rem", color: "var(--text-primary)" }}>Payment Methods</h3>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem", background: "var(--bg-elevated)", borderRadius: "14px", border: "1px solid var(--border-subtle)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ width: "48px", height: "32px", borderRadius: "6px", background: "#1a1f2e", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <CreditCard size={20} color="#fff" />
                                </div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>•••• •••• •••• 4242</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Visa • Expires 12/28</div>
                                </div>
                            </div>
                            <button style={{ background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", padding: "0.6rem 1.25rem", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Change Method</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "Security" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "scale-up 0.3s ease-out" }}>
                    <div className="grid-2-col" style={{ gap: "1.5rem" }}>
                        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "20px", padding: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.1)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Lock size={20} />
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Two-Factor Auth</h3>
                            </div>
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "2rem" }}>Add an extra layer of protection to your account by requiring more than just a password to log in.</p>
                            <button style={{ width: "100%", padding: "1rem", background: "var(--accent-primary)", border: "none", borderRadius: "12px", color: "#000", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 20px rgba(249, 115, 22, 0.2)" }}>Configure Authenticator</button>
                        </div>
                        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "20px", padding: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Shield size={20} />
                                </div>
                                <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Session Control</h3>
                            </div>
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "2rem" }}>Automatically terminate inactive sessions and manage active logins across devices and IP nodes.</p>
                            <button style={{ width: "100%", padding: "1rem", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", color: "var(--text-primary)", fontWeight: 800, cursor: "pointer" }}>Revoke Global Sessions</button>
                        </div>
                    </div>
                </div>
            )}



            {/* STICKY FOOTER: SAVE CHANGES */}
            {hasChanges && (
                <div style={{
                    position: "fixed",
                    bottom: "2rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "fit-content",
                    minWidth: "400px",
                    background: "#0f172a",
                    border: "1px solid var(--accent-primary)",
                    borderRadius: "16px",
                    padding: "1rem 2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "2rem",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    zIndex: 1000,
                    animation: "slide-up-footer 0.4s cubic-bezier(0.19, 1, 0.22, 1)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(249, 115, 22, 0.1)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <AlertTriangle size={16} />
                        </div>
                        <div style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>Unsaved configuration changes detected.</div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button onClick={handleDiscard} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Discard</button>
                        <button 
                            onClick={handleSaveProfile} 
                            disabled={isSaving}
                            style={{ 
                                background: "var(--accent-primary)", 
                                border: "none", 
                                color: "#000", 
                                padding: "0.5rem 1.5rem", 
                                borderRadius: "8px", 
                                fontSize: "13px", 
                                fontWeight: 900, 
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Synchronize Changes
                        </button>
                    </div>
                </div>
            )}

            {/* Security Audit Log Modal */}
            {showAuditModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(12px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2000, padding: "2rem"
                }} onClick={() => setShowAuditModal(false)}>
                    <div 
                        style={{
                            width: "100%", maxWidth: "720px", background: "var(--bg-surface)",
                            borderRadius: "32px", overflow: "hidden",
                            border: "1px solid var(--border-subtle)",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                            animation: "scale-up 0.4s cubic-bezier(0.19, 1, 0.22, 1)"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            padding: "2.5rem", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                            color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center",
                            borderBottom: "1px solid var(--border-subtle)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.05)",
                                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)"
                                }}>
                                    <Shield size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
                                        Security <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>Audit Hub</span>
                                    </h2>
                                    <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Operational Activity Intelligence • Real-time Monitoring</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowAuditModal(false)}
                                style={{ 
                                    background: "rgba(255,255,255,0.05)", border: "none", color: "#fff",
                                    width: "40px", height: "40px", borderRadius: "12px", 
                                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: "1.5rem", maxHeight: "500px", overflowY: "auto" }} className="hide-scrollbar">
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {logs.map(log => (
                                    <div key={log.id} style={{
                                        padding: "1.25rem", borderRadius: "20px", background: "var(--bg-elevated)",
                                        border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center",
                                        transition: "all 0.2s"
                                    }} onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-primary)"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ 
                                                width: "40px", height: "40px", borderRadius: "12px", 
                                                background: log.status === 'success' ? "rgba(16, 185, 129, 0.1)" : log.status === 'warn' ? "rgba(239, 68, 68, 0.1)" : "rgba(249, 115, 22, 0.1)",
                                                color: log.status === 'success' ? "#10b981" : log.status === 'warn' ? "#ef4444" : "var(--accent-primary)",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                {log.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{log.event}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                                                    <Globe size={10} /> {log.geo} • <Clock size={10} style={{ marginLeft: "4px" }} /> {log.time}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            padding: "6px 12px", borderRadius: "8px", fontSize: "10px", fontWeight: 900,
                                            background: log.status === 'success' ? "rgba(16, 185, 129, 0.1)" : log.status === 'warn' ? "rgba(239, 68, 68, 0.1)" : "rgba(249, 115, 22, 0.1)",
                                            color: log.status === 'success' ? "#10b981" : log.status === 'warn' ? "#ef4444" : "var(--accent-primary)",
                                            textTransform: "uppercase", letterSpacing: "0.05em"
                                        }}>
                                            {log.status === 'success' ? "Verified" : log.status === 'warn' ? "Alert" : "Info"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: "1.5rem 2.5rem", background: "var(--bg-elevated)", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "12px", fontWeight: 600 }}>
                                <Fingerprint size={16} color="var(--accent-primary)" /> <span style={{ color: "var(--text-secondary)" }}>System Node:</span> Active-Alpha-01
                            </div>
                            <button 
                                onClick={() => showAlert("Exporting Logs", "Historical audit logs are being archived for secure download.")}
                                style={{ background: "none", border: "none", color: "var(--accent-primary)", fontWeight: 800, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                                <Database size={14} /> Export Log Archive
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
                @keyframes slide-up-footer {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
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
