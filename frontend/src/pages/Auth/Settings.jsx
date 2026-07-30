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
    EyeOff,
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
    Copy,
    Download,
    Check,
    Plus,
    ExternalLink,
    Sparkles,
    Sliders,
    Layers,
    Server,
    Smartphone
} from "lucide-react";

import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

const API_URL_ENV = import.meta.env.VITE_API_URL;

export default function Settings() {
    const { user, updateUserProfile, addNotification, selectedEventId, events } = useOutletContext();
    const { showAlert, showConfirm, showPrompt } = useDialog();
    const navigate = useNavigate();
    
    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState("Organization");
    
    // Organization Profile State
    const [name, setName] = useState(user?.displayName || "Planora Admin");
    const [originalName, setOriginalName] = useState(user?.displayName || "Planora Admin");
    const [subdomain, setSubdomain] = useState("global-ops");
    const [timezone, setTimezone] = useState("(GMT+05:30) India Standard Time");
    const [currency, setCurrency] = useState("INR (₹)");
    
    // Saving State
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    
    // Security Passwords State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    
    // Modals
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Editor");
    const [isSendingInvite, setIsSendingInvite] = useState(false);
    
    // Team Members
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingTeam, setLoadingTeam] = useState(false);
    
    // Integrations State
    const [integrations, setIntegrations] = useState([
        { id: "slack", name: "Slack Workflow Hub", icon: "💬", connected: true, desc: "Instant channel alerts for RSVP changes and vendor milestones." },
        { id: "gcal", name: "Google Calendar Sync", icon: "📅", connected: true, desc: "Bidirectional sync for event agendas, tasks, and speaker holds." },
        { id: "zoom", name: "Zoom Video Meetings", icon: "📹", connected: false, desc: "Auto-generate virtual event links for hybrid attendees." },
        { id: "stripe", name: "Stripe Billing & Ticket Sales", icon: "💳", connected: true, desc: "Process registration fees and track invoice revenue." },
        { id: "mailchimp", name: "Mailchimp Campaigns", icon: "📧", connected: false, desc: "Sync guest rosters to automated email marketing flows." }
    ]);
    
    // API Keys State
    const [apiKeys, setApiKeys] = useState([
        { id: 1, name: "Production Gateway Token", key: "pl_live_99f82a17b019c4d...", created: "Jan 15, 2026", lastUsed: "Just now" },
        { id: 2, name: "Staging Testing Key", key: "pl_test_44e11c99021da8f...", created: "Feb 02, 2026", lastUsed: "3 days ago" }
    ]);

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
                    fetchedTeam = Array.isArray(data) ? [owner, ...data] : [owner];
                }
                setTeamMembers(fetchedTeam);
            } catch(err) {
                console.error("Failed to fetch team:", err);
                setTeamMembers([
                    { _id: '1', name: user?.displayName || "Kunal Singhi", email: user?.email || "imsinghi2016@gmail.com", role: "Event Lead", isOwner: true },
                    { _id: '2', name: "Aarav Sharma", email: "aarav@techsummit.io", role: "Editor", isOwner: false },
                    { _id: '3', name: "Priya Patel", email: "priya@eventpros.in", role: "Viewer", isOwner: false }
                ]);
            } finally {
                setLoadingTeam(false);
            }
        };
        
        if (user) fetchTeam();
    }, [selectedEventId, events, user]);

    // Historical security audit logs
    const [logs, setLogs] = useState([
        { id: 1, event: "System Authentication (SSO)", status: "success", geo: "Mumbai, IN (192.168.1.45)", time: "10 mins ago", icon: <Fingerprint size={14} /> },
        { id: 2, event: "Public Domain Subdomain Updated", status: "info", geo: "Mumbai, IN", time: "2 hours ago", icon: <Globe size={14} /> },
        { id: 3, event: "API Secret Key Generated", status: "success", geo: "System Gateway", time: "Yesterday", icon: <Key size={14} /> },
        { id: 4, event: "Security Protocol 2FA Prompted", status: "info", geo: "Mumbai, IN", time: "2 days ago", icon: <Shield size={14} /> },
        { id: 5, event: "Workspace Initialized", status: "success", geo: "Cloud Infrastructure", time: "Jan 12, 2026", icon: <Activity size={14} /> }
    ]);

    // Preferences from localStorage
    const [smartNotifications, setSmartNotifications] = useState(() => {
        return localStorage.getItem("planora_pref_smart_notif") !== "false";
    });
    const [teamVisibility, setTeamVisibility] = useState(() => {
        return localStorage.getItem("planora_pref_team_vis") !== "false";
    });
    const [digestEmail, setDigestEmail] = useState(true);
    const [incidentAlerts, setIncidentAlerts] = useState(true);
    const [inAppActivity, setInAppActivity] = useState(true);

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
            setOriginalName(name);
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

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            showAlert("Weak Password", "Please enter a new password at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert("Password Mismatch", "New password and confirm password do not match.");
            return;
        }
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            addNotification("Security Updated", "Your account password has been updated securely.", "success");
        }, 1000);
    };

    const handleToggleIntegration = (id) => {
        setIntegrations(prev => prev.map(item => {
            if (item.id === id) {
                const nextState = !item.connected;
                addNotification(
                    nextState ? "Integration Connected" : "Integration Disconnected",
                    `${item.name} has been ${nextState ? 'enabled' : 'disabled'}.`,
                    nextState ? "success" : "info"
                );
                return { ...item, connected: nextState };
            }
            return item;
        }));
    };

    const handleCreateApiKey = async () => {
        const keyName = await showPrompt("Generate API Key", "Enter a descriptive label for this new API token:");
        if (!keyName || !keyName.trim()) return;

        const newKey = {
            id: Date.now(),
            name: keyName.trim(),
            key: `pl_live_${Math.random().toString(36).substring(2, 18)}...`,
            created: "Just now",
            lastUsed: "Never"
        };
        setApiKeys([newKey, ...apiKeys]);
        addNotification("API Key Generated", `New access key '${keyName}' created successfully.`, "success");
    };

    const handleDeleteApiKey = async (id, name) => {
        const confirmed = await showConfirm("Revoke API Key", `Are you sure you want to permanently revoke '${name}'?`);
        if (confirmed) {
            setApiKeys(apiKeys.filter(k => k.id !== id));
            addNotification("Key Revoked", `API key '${name}' has been deleted.`, "info");
        }
    };

    const handleSendInvite = (e) => {
        e.preventDefault();
        if (!inviteEmail || !inviteEmail.includes("@")) {
            showAlert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        setIsSendingInvite(true);
        setTimeout(() => {
            setIsSendingInvite(false);
            setShowInviteModal(false);
            const newMember = {
                _id: Date.now().toString(),
                name: inviteEmail.split("@")[0],
                email: inviteEmail,
                role: inviteRole,
                isOwner: false
            };
            setTeamMembers([...teamMembers, newMember]);
            setInviteEmail("");
            addNotification("Invitation Sent", `Invitation sent to ${inviteEmail} as ${inviteRole}.`, "success");
        }, 1200);
    };

    const handleDeleteWorkspace = async () => {
        const confirmMsg = "CRITICAL ALERT: You are about to delete your workspace and all associated data. This action is irreversible. Type 'DELETE' to confirm.";
        const userInput = await showPrompt("Confirm Workspace Deletion", confirmMsg);
        
        if (userInput === "DELETE") {
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

    const tabs = [
        { id: "Organization", label: "Organization", icon: <SettingsIcon size={15} /> },
        { id: "Security", label: "Security & Access", icon: <Shield size={15} /> }
    ];

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            color: "var(--text-primary)",
            paddingBottom: "5rem"
        }}>
            {/* Top Navigation Tabs */}
            <div style={{ 
                display: "flex", 
                gap: "0.5rem", 
                marginBottom: "2rem", 
                borderBottom: "1px solid rgba(255,255,255,0.08)", 
                paddingBottom: "8px", 
                overflowX: "auto" 
            }} className="hide-scrollbar">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)}
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "8px", 
                                padding: "0.65rem 1.25rem", 
                                background: isActive ? "rgba(249, 115, 22, 0.12)" : "transparent", 
                                border: isActive ? "1px solid rgba(249, 115, 22, 0.3)" : "1px solid transparent", 
                                borderRadius: "12px", 
                                color: isActive ? "#f97316" : "rgba(255,255,255,0.6)", 
                                fontSize: "13px", 
                                fontWeight: isActive ? 800 : 600, 
                                cursor: "pointer", 
                                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                            }}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Header Header Info Banner */}
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-end", 
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem"
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.25rem" }}>
                        <h1 style={{ fontSize: "22px", fontWeight: 900, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
                            {activeTab === "Organization" && "Organization Settings"}
                            {activeTab === "Billing" && "Billing & Subscription"}
                            {activeTab === "Security" && "Security & Authentication"}
                            {activeTab === "Notifications" && "Notification Channels"}
                            {activeTab === "Integrations" && "Ecosystem Integrations"}
                            {activeTab === "API Keys" && "API Tokens & Webhooks"}
                        </h1>
                        <span style={{ 
                            padding: "3px 10px", 
                            background: "rgba(249, 115, 22, 0.15)", 
                            border: "1px solid rgba(249, 115, 22, 0.3)",
                            borderRadius: "20px", 
                            color: "#f97316", 
                            fontSize: "11px", 
                            fontWeight: 800,
                            letterSpacing: "0.03em"
                        }}>
                            PRO ENTERPRISE
                        </span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 500, margin: 0, maxWidth: "620px" }}>
                        {activeTab === "Organization" && "Manage your global enterprise settings, team hierarchies, and system-wide operational preferences."}
                        {activeTab === "Billing" && "Manage workspace plans, active payment cards, and auto-generated financial receipts."}
                        {activeTab === "Security" && "Configure 2FA authentication protocols, user credentials, active login nodes, and audit trails."}
                        {activeTab === "Notifications" && "Customize real-time dispatch alerts across Email, SMS, and in-app feeds."}
                        {activeTab === "Integrations" && "Connect third-party productivity tools to power automated event workflows."}
                        {activeTab === "API Keys" && "Generate programmatically authenticated REST API tokens for custom webhooks and scripts."}
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                        onClick={() => setShowAuditModal(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "0.6rem 1rem",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer"
                        }}
                    >
                        <Shield size={14} color="#f97316" /> Audit Log
                    </button>
                </div>
            </div>

            {/* TAB 1: ORGANIZATION */}
            {activeTab === "Organization" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Organization Profile Card */}
                    <div style={{ 
                        background: "#121118", 
                        border: "1px solid rgba(255,255,255,0.08)", 
                        borderRadius: "20px", 
                        padding: "2rem", 
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)" 
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Globe size={18} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#fff" }}>Organization Profile</h3>
                                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Core identity and global domain routing</p>
                                </div>
                            </div>
                            <span style={{ padding: "4px 10px", background: "rgba(249, 115, 22, 0.1)", borderRadius: "6px", color: "#f97316", fontSize: "10px", fontWeight: 900, letterSpacing: "0.05em" }}>OPERATIONAL ENTITY</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2.5rem" }} className="settings-grid">
                            {/* Left Profile Avatar Box */}
                            <div style={{
                                background: "#181720",
                                borderRadius: "16px",
                                padding: "2rem 1.25rem 1.5rem",
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                position: "relative"
                            }}>
                                <div style={{
                                    width: "76px",
                                    height: "76px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "26px",
                                    fontWeight: 900,
                                    marginBottom: "1rem",
                                    boxShadow: "0 10px 25px rgba(249, 115, 22, 0.3)"
                                }}>
                                    {initials}
                                </div>

                                <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", margin: "0 0 0.25rem" }}>
                                    {name}
                                </h4>
                                <p style={{ fontSize: "11px", color: "#f97316", fontWeight: 700, margin: "0 0 0.25rem" }}>
                                    Event Administrator
                                </p>
                                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 1.25rem" }}>
                                    {user?.email || "imsinghi2016@gmail.com"}
                                </p>

                                <button style={{
                                    width: "100%",
                                    padding: "0.65rem",
                                    background: "rgba(249, 115, 22, 0.15)",
                                    border: "1px solid rgba(249, 115, 22, 0.3)",
                                    borderRadius: "10px",
                                    color: "#f97316",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    cursor: "pointer"
                                }}>
                                    <Sparkles size={14} /> Upgrade to PRO
                                </button>
                            </div>

                            {/* Right Form Fields */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Organization Name
                                    </label>
                                    <input 
                                        type="text"
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        style={{ 
                                            width: "100%", 
                                            padding: "0.85rem 1rem", 
                                            background: "rgba(255,255,255,0.03)", 
                                            border: "1px solid rgba(255,255,255,0.08)", 
                                            borderRadius: "12px", 
                                            color: "#fff", 
                                            fontSize: "14px", 
                                            fontWeight: 600, 
                                            outline: "none",
                                            boxSizing: "border-box"
                                        }} 
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Public Domain Subdomain
                                    </label>
                                    <div style={{ display: "flex", alignItems: "stretch", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
                                        <div style={{ padding: "0.85rem 1rem", background: "rgba(255,255,255,0.05)", borderRight: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center" }}>
                                            planora.app/
                                        </div>
                                        <input 
                                            type="text"
                                            value={subdomain} 
                                            onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            style={{ flex: 1, padding: "0.85rem 1rem", background: "transparent", border: "none", color: "#fff", fontSize: "14px", fontWeight: 700, outline: "none" }} 
                                        />
                                        <button 
                                            onClick={() => copyToClipboard(`https://planora.app/${subdomain}`)}
                                            style={{ padding: "0 1.25rem", background: "none", border: "none", color: isCopied ? "#10b981" : "#f97316", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 800 }}
                                        >
                                            {isCopied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Link</>}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Timezone
                                        </label>
                                        <select 
                                            value={timezone}
                                            onChange={e => setTimezone(e.target.value)}
                                            style={{ width: "100%", padding: "0.85rem 1rem", background: "#181720", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                        >
                                            <option>(GMT+05:30) India Standard Time</option>
                                            <option>(GMT+00:00) UTC Universal Time</option>
                                            <option>(GMT-08:00) Pacific Standard Time</option>
                                            <option>(GMT+01:00) Central European Time</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                            Currency Symbol
                                        </label>
                                        <select 
                                            value={currency}
                                            onChange={e => setCurrency(e.target.value)}
                                            style={{ width: "100%", padding: "0.85rem 1rem", background: "#181720", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: 600, outline: "none", boxSizing: "border-box" }}
                                        >
                                            <option>INR (₹) - Indian Rupee</option>
                                            <option>USD ($) - US Dollar</option>
                                            <option>EUR (€) - Euro</option>
                                            <option>GBP (£) - British Pound</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Management */}
                    <div style={{ background: "#121118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 0.25rem", color: "#fff" }}>Team Management & Roles</h3>
                                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Collaborator access controls and security permissions.</p>
                            </div>
                            <button 
                                onClick={() => setShowInviteModal(true)}
                                style={{ padding: "0.65rem 1.25rem", background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "13px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                            >
                                <UserPlus size={15} /> Invite Collaborator
                            </button>
                        </div>

                        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead style={{ background: "#181720" }}>
                                    <tr>
                                        <th style={{ padding: "0.85rem 1rem", fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Collaborator</th>
                                        <th style={{ padding: "0.85rem 1rem", fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Operational Role</th>
                                        <th style={{ padding: "0.85rem 1rem", fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Permissions</th>
                                        <th style={{ padding: "0.85rem 1rem", fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingTeam ? (
                                        <tr>
                                            <td colSpan="4" style={{ padding: "2rem", textAlign: "center" }}><Loader2 size={22} className="animate-spin" color="#f97316" /></td>
                                        </tr>
                                    ) : (
                                        teamMembers.map((member, idx) => (
                                            <tr key={member._id || idx} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                                <td style={{ padding: "1rem" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: member.isOwner ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" : "rgba(255,255,255,0.06)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800 }}>
                                                            {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                                                                {member.name} {member.isOwner && <span style={{ marginLeft: "6px", padding: "2px 6px", background: "rgba(249, 115, 22, 0.2)", color: "#f97316", borderRadius: "4px", fontSize: "9px", fontWeight: 900 }}>OWNER</span>}
                                                            </div>
                                                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{member.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "1rem" }}>
                                                    <span style={{ padding: "4px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                                                        {member.role || "Collaborator"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "1rem" }}>
                                                    <div style={{ display: "flex", gap: "4px" }}>
                                                        <span style={{ padding: "2px 6px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "4px", fontSize: "9px", fontWeight: 800 }}>READ</span>
                                                        <span style={{ padding: "2px 6px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", borderRadius: "4px", fontSize: "9px", fontWeight: 800 }}>WRITE</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: "1rem", textAlign: "right" }}>
                                                    {!member.isOwner && (
                                                        <button 
                                                            onClick={() => setTeamMembers(teamMembers.filter(m => m._id !== member._id))}
                                                            style={{ background: "none", border: "none", color: "rgba(239, 68, 68, 0.7)", cursor: "pointer", padding: "4px" }}
                                                            title="Remove Team Member"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Infrastructure Risk Management (Danger Zone) */}
                    <div style={{ background: "rgba(239, 68, 68, 0.03)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "20px", padding: "1.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
                            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <AlertTriangle size={18} />
                            </div>
                            <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#ef4444" }}>Infrastructure Risk Hub (Danger Zone)</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                            <div style={{ padding: "1.25rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff", marginBottom: "2px" }}>Transfer Workspace Sovereignty</div>
                                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Re-assign primary ownership to another lead.</div>
                                </div>
                                <button style={{ padding: "0.5rem 0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Transfer</button>
                            </div>

                            <div style={{ padding: "1.25rem", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#ef4444", marginBottom: "2px" }}>Terminate Organization</div>
                                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Permanently erase workspace & operational logs.</div>
                                </div>
                                <button onClick={handleDeleteWorkspace} style={{ padding: "0.5rem 0.85rem", background: "#ef4444", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px", fontWeight: 900, cursor: "pointer" }}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === "Security" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="settings-grid">
                        {/* Change Password Card */}
                        <div style={{ background: "#121118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Lock size={18} />
                                </div>
                                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#fff" }}>Update Password</h3>
                            </div>

                            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>CURRENT PASSWORD</label>
                                    <input 
                                        type={showPasswords ? "text" : "password"} 
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>NEW PASSWORD</label>
                                    <input 
                                        type={showPasswords ? "text" : "password"} 
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>CONFIRM NEW PASSWORD</label>
                                    <input 
                                        type={showPasswords ? "text" : "password"} 
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    style={{ padding: "0.85rem", background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 800, fontSize: "12px", cursor: "pointer", marginTop: "0.5rem" }}
                                >
                                    Update Credentials
                                </button>
                            </form>
                        </div>

                        {/* Two-Factor Auth */}
                        <div style={{ background: "#121118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Smartphone size={18} />
                                    </div>
                                    <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#fff" }}>2FA Authenticator App</h3>
                                </div>
                                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                                    Secure your account using Google Authenticator or Authy.
                                </p>
                            </div>

                            <button 
                                onClick={() => {
                                    setIs2FAEnabled(!is2FAEnabled);
                                    addNotification("2FA Settings Updated", `Two-factor authentication is now ${!is2FAEnabled ? 'enabled' : 'disabled'}.`, "info");
                                }}
                                style={{ padding: "0.85rem", background: is2FAEnabled ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", border: `1px solid ${is2FAEnabled ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: "10px", color: is2FAEnabled ? "#ef4444" : "#10b981", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}
                            >
                                {is2FAEnabled ? "Disable 2FA Protection" : "Enable 2FA Protection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STICKY FLOATING SYNC BAR */}
            {hasChanges && (
                <div style={{
                    position: "fixed",
                    bottom: "2rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "fit-content",
                    minWidth: "400px",
                    background: "#181720",
                    border: "1px solid #f97316",
                    borderRadius: "16px",
                    padding: "0.85rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "2rem",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                    zIndex: 1000,
                    animation: "fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <AlertTriangle size={16} color="#f97316" />
                        <div style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>Unsaved configuration changes detected.</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button onClick={handleDiscard} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Discard</button>
                        <button 
                            onClick={handleSaveProfile} 
                            disabled={isSaving}
                            style={{ 
                                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                                border: "none", 
                                color: "#fff", 
                                padding: "0.5rem 1.25rem", 
                                borderRadius: "8px", 
                                fontSize: "12px", 
                                fontWeight: 900, 
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Synchronize
                        </button>
                    </div>
                </div>
            )}

            {/* Invite Collaborator Modal */}
            {showInviteModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(12px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 10000, padding: "1rem"
                }}>
                    <div style={{ width: "100%", maxWidth: "480px", background: "#121118", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "1.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#fff" }}>Invite Collaborator</h3>
                            <button onClick={() => setShowInviteModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSendInvite} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>EMAIL ADDRESS</label>
                                <input 
                                    type="email" 
                                    placeholder="colleague@domain.com"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>ROLE & PERMISSIONS</label>
                                <select 
                                    value={inviteRole}
                                    onChange={e => setInviteRole(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", background: "#181720", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                >
                                    <option value="Editor">Editor (Can edit events & budgets)</option>
                                    <option value="Viewer">Viewer (Read-only access)</option>
                                    <option value="Event Lead">Event Lead (Full management)</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSendingInvite}
                                style={{ padding: "0.85rem", background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 800, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "0.5rem" }}
                            >
                                {isSendingInvite ? <Loader2 size={16} className="animate-spin" /> : "Send Invitation"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Audit Log Modal */}
            {showAuditModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(12px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 10000, padding: "1rem"
                }}>
                    <div style={{ width: "100%", maxWidth: "620px", background: "#121118", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "20px", padding: "1.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#fff" }}>Security Audit Logs</h3>
                            <button onClick={() => setShowAuditModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "400px", overflowY: "auto" }}>
                            {logs.map(log => (
                                <div key={log.id} style={{ padding: "0.85rem 1rem", background: "#181720", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>{log.event}</div>
                                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{log.geo} • {log.time}</div>
                                    </div>
                                    <span style={{ padding: "2px 8px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", borderRadius: "4px", fontSize: "10px", fontWeight: 900 }}>VERIFIED</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
