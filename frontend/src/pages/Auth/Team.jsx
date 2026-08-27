import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { 
    Plus, User, Mail, Shield, Check, ChevronRight, LayoutGrid, Users2, 
    MoreHorizontal, Trash2, Edit3, X, Calendar, Phone, Search, 
    RefreshCw, UserCheck, Sparkles, Copy, ExternalLink, ShieldCheck, 
    AlertCircle, Filter, ArrowUpDown, CheckCircle2, MessageSquare,
    Upload, FileSpreadsheet, Loader2
} from "lucide-react";
import { validateEmail, validatePhone } from "../../utils/validation";
import { useUpload } from "../../context/UploadContext";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const API_URL = import.meta.env.VITE_API_URL;
const FRONTEND_URL = window.location.origin;

export default function Team() {
    const { user, events = [], selectedEventId, hasFullAccess, hasEditorAccess } = useOutletContext();
    const { showAlert, showConfirm } = useDialog();
    const { startUpload, completeUpload, cancelUpload } = useUpload();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Members");
    const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
    const [sortBy, setSortBy] = useState("name"); // "name", "role", "permissions"
    const [sortOrder, setSortOrder] = useState("asc");

    const [inviteData, setInviteData] = useState({ 
        name: "", 
        email: "", 
        role: "Editor", 
        event: selectedEventId || events[0]?.id || events[0]?._id || "", 
        whatsapp: "" 
    });

    const [editData, setEditData] = useState({ name: "", role: "", email: "", whatsapp: "" });
    const [leadWhatsApp, setLeadWhatsApp] = useState(localStorage.getItem(`lead_wa_${user?.uid}`) || "");
    const [copiedId, setCopiedId] = useState(null);

    // Initial access renewals state
    const [renewals, setRenewals] = useState([
        { id: 1, title: "Workspace Admin Privileges", sub: "Annual workspace access renewal. Pending security certificate update.", due: "5 days", status: "pending", date: "2026-08-04" },
        { id: 2, title: "Editor Permissions Update", sub: "Reviewing new access logs for Q3/Q4 event collective.", due: "14 days", status: "pending", date: "2026-08-13" },
        { id: 3, title: "OAuth & API Integration Security Audit", sub: "Automated session key validation and protocol compliance.", due: "30 days", status: "verified", date: "2026-07-28" }
    ]);

    useEffect(() => {
        if (user?.uid) {
            localStorage.setItem(`lead_wa_${user?.uid}`, leadWhatsApp);
        }
    }, [leadWhatsApp, user?.uid]);

    useEffect(() => {
        setInviteData(prev => ({ ...prev, event: selectedEventId || prev.event || events[0]?.id || events[0]?._id || "" }));
        fetchMembers();
    }, [selectedEventId]);

    const fetchMembers = async () => {
        if (!selectedEventId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/collaborators?eventId=${selectedEventId}`);
            const data = await res.json();

            if (data.owner) {
                const team = [data.owner, ...(data.collaborators || [])];
                setMembers(team);
            } else if (Array.isArray(data)) {
                // Fallback for owned events
                const owner = {
                    _id: 'owner',
                    name: user?.displayName || "Workspace Owner",
                    email: user?.email || "owner@planora.os",
                    role: "Event Lead",
                    status: "Active",
                    permissions: "Full administrative control over workspace",
                    isOwner: true,
                    userId: user?.uid
                };
                setMembers([owner, ...data]);
            } else {
                setMembers([]);
            }
        } catch (err) {
            console.error("[Team] Fetch error:", err);
            // Construct fallback owner
            const owner = {
                _id: 'owner',
                name: user?.displayName || "Workspace Owner",
                email: user?.email || "owner@planora.os",
                role: "Event Lead",
                status: "Active",
                permissions: "Full administrative control over workspace",
                isOwner: true,
                userId: user?.uid
            };
            setMembers([owner]);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteData.name || !inviteData.email) return;

        // Validation
        const emailCheck = validateEmail(inviteData.email, true);
        if (!emailCheck.valid) {
            showAlert("Invalid Email Address", emailCheck.message);
            return;
        }

        if (inviteData.whatsapp) {
            const phoneCheck = validatePhone(inviteData.whatsapp, false);
            if (!phoneCheck.valid) {
                showAlert("Invalid Phone Number", phoneCheck.message);
                return;
            }
        }

        try {
            const inviter = members.find(m => m.email === user?.email) || { name: user?.displayName || "Workspace Owner" };

            const response = await fetch(`${API_URL}/collaborators`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...inviteData,
                    user: user.uid,
                    inviterName: inviter.name,
                    status: "Active",
                    permissions: inviteData.role === "Editor" ? "Can modify core modules" : inviteData.role === "Event Lead" ? "Full administrative control" : "Read-only access"
                })
            });

            if (response.ok) {
                const event = events.find(e => (e.id || e._id) === inviteData.event);
                const eventName = event?.name || event?.title || 'Upcoming Event';
                const senderName = user?.displayName || "Workspace Owner";
                
                if (inviteData.whatsapp) {
                    const location = event?.location || '';
                    const mapsUrl = location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : '';
                    
                    let msg = `━━━━━━━━━━━━━━━━━━━━━\n`;
                    msg += `🐝 *PLANORA HIVE ACTIVATION* 🐝\n`;
                    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
                    msg += `Hi *${inviteData.name}*,\n\n`;
                    msg += `You have been added as a collaborator for *${eventName}*!\n\n`;
                    msg += `👤 *Invited By:* ${senderName}\n`;
                    msg += `⚙️ *Your Role:* ${inviteData.role}\n`;
                    msg += `🔒 *Permissions:* ${inviteData.role === "Editor" ? "Can modify core modules" : inviteData.role === "Event Lead" ? "Full administrative control" : "Read-only access"}\n\n`;
                    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
                    if (location) {
                        msg += `📍 *Venue:* ${location}\n`;
                        msg += `🗺️ *Directions:* ${mapsUrl}\n`;
                    }
                    msg += `💻 *Log In to Workspace:* ${FRONTEND_URL}/login\n`;
                    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
                    msg += `Your dashboard is now active. Let's execute!`;
                    
                    const waUrl = `https://api.whatsapp.com/send?phone=${inviteData.whatsapp.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(msg)}`;
                    window.open(waUrl, "_blank");
                }

                setIsInviting(false);
                setInviteData({ name: "", email: "", role: "Editor", event: selectedEventId, whatsapp: "" });
                fetchMembers();
                showAlert("Invitation Transmitted", `${inviteData.name} has been synchronized with the team directory.`);
            } else {
                showAlert("Transmission Failed", "Could not complete collaborator invitation. Please try again.");
            }
        } catch (err) {
            console.error("Failed to add collaborator:", err);
            showAlert("Error", "An unexpected error occurred while inviting collaborator.");
        }
    };

    const handleDelete = async (memberId, isOwner) => {
        if (isOwner) {
            await showAlert("Security Policy", "Cannot terminate the primary owner's session. The workspace requires at least one administrative lead.");
            return;
        }
        const confirmed = await showConfirm("Revoke Access", "Permanently revoke workspace access for this collaborator? They will lose all permissions immediately.");
        if (confirmed) {
            try {
                const response = await fetch(`${API_URL}/collaborators/${memberId}`, {
                    method: "DELETE"
                });
                if (response.ok) {
                    setMembers(prev => prev.filter(m => m._id !== memberId));
                    showAlert("Access Revoked", "Collaborator has been removed from the collective.");
                }
            } catch (err) {
                console.error("Failed to delete collaborator:", err);
            }
        }
    };

    const startEditing = (member) => {
        if (member.isOwner) return;
        setEditingMember(member);
        setEditData({ 
            name: member.name, 
            role: member.role,
            email: member.email || "",
            whatsapp: member.whatsapp || ""
        });
    };

    const saveEdit = async () => {
        if (!editingMember) return;

        if (editData.email) {
            const emailCheck = validateEmail(editData.email, true);
            if (!emailCheck.valid) {
                showAlert("Invalid Email Address", emailCheck.message);
                return;
            }
        }

        if (editData.whatsapp) {
            const phoneCheck = validatePhone(editData.whatsapp, false);
            if (!phoneCheck.valid) {
                showAlert("Invalid Phone Number", phoneCheck.message);
                return;
            }
        }

        try {
            const response = await fetch(`${API_URL}/collaborators/${editingMember._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editData.name,
                    role: editData.role,
                    email: editData.email,
                    whatsapp: editData.whatsapp,
                    permissions: editData.role === "Editor" ? "Can modify core modules" : editData.role === "Event Lead" ? "Full administrative control" : "Read-only access"
                })
            });
            if (response.ok) {
                setEditingMember(null);
                fetchMembers();
                showAlert("Collaborator Updated", "Role and permissions synchronized successfully.");
            }
        } catch (err) {
            console.error("Failed to update collaborator:", err);
        }
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedEventId) return;

        startUpload(file);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("eventId", selectedEventId);
        formData.append("user", user?.uid || "");
        formData.append("inviterName", user?.displayName || "Workspace Owner");

        setBulkLoading(true);
        try {
            const response = await fetch(`${API_URL}/collaborators/bulk-upload`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                completeUpload();
                showAlert("Bulk Team Onboarding Complete", data.message || `Successfully onboarded ${data.count || 0} team member(s).`);
                fetchMembers();
            } else {
                cancelUpload();
                showAlert("Onboarding Error", data.message || "Failed to process team spreadsheet.");
            }
        } catch (err) {
            cancelUpload();
            console.error("Team bulk upload failed:", err);
            showAlert("Upload Failed", "An error occurred while uploading team spreadsheet.");
        } finally {
            setBulkLoading(false);
            e.target.value = "";
        }
    };

    const downloadSampleCSV = () => {
        const headers = ["Full Name", "Email", "Role (Event Lead / Editor / Viewer)", "Phone / WhatsApp"];
        const rows = [
            ["Sarah Jenkins", "sarah.j@example.com", "Editor", "+919876543210"],
            ["David Miller", "david.m@example.com", "Event Lead", "+918765432109"],
            ["Elena Rostova", "elena.r@example.com", "Viewer", "+917654321098"]
        ];
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Sample_Team_Members_Template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRenewal = async (renewalId, title) => {
        const confirmed = await showConfirm("Initiate Renewal", `Authorize the administrative security renewal for '${title}'? This will re-certify the access session.`);
        if (confirmed) {
            setRenewals(prev => prev.map(item => item.id === renewalId ? { ...item, status: "verified", due: "Renewed" } : item));
            showAlert("Renewal Synchronized", `Session for '${title}' has been successfully extended and recorded in audit history.`);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "Event Lead":
                return { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", text: "#f97316", shadow: "rgba(249, 115, 22, 0.2)" };
            case "Editor":
                return { bg: "rgba(14, 165, 233, 0.15)", border: "rgba(14, 165, 233, 0.3)", text: "#0ea5e9", shadow: "rgba(14, 165, 233, 0.2)" };
            default:
                return { bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.3)", text: "#a78bfa", shadow: "rgba(139, 92, 246, 0.2)" };
        }
    };

    // Filter & Sort members
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            // Search filter
            const matchesSearch = searchQuery.trim() === "" ||
                m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.role?.toLowerCase().includes(searchQuery.toLowerCase());

            // Role filter
            if (!matchesSearch) return false;
            if (roleFilter === "All Members") return true;
            if (roleFilter === "Event Leads") return m.role === "Event Lead";
            if (roleFilter === "Editors") return m.role === "Editor";
            if (roleFilter === "Viewers") return m.role === "Viewer";
            return true;
        }).sort((a, b) => {
            let valA = a[sortBy] || "";
            let valB = b[sortBy] || "";
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [members, searchQuery, roleFilter, sortBy, sortOrder]);

    const leadCount = useMemo(() => members.filter(m => m.role === "Event Lead").length, [members]);
    const editorCount = useMemo(() => members.filter(m => m.role === "Editor").length, [members]);
    const viewerCount = useMemo(() => members.filter(m => m.role === "Viewer").length, [members]);

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            color: "var(--text-primary)",
            paddingBottom: "4rem",
            width: "100%",
            minHeight: "100%",
            boxSizing: "border-box"
        }}>
            {/* Header Section */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.25rem",
                marginBottom: "2rem",
                padding: "1.5rem",
                background: "linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(18, 18, 20, 0.7) 100%)",
                borderRadius: "20px",
                border: "1px solid var(--border-medium)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)"
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--accent-primary)",
                            background: "rgba(249, 115, 22, 0.12)",
                            padding: "3px 10px",
                            borderRadius: "100px",
                            border: "1px solid rgba(249, 115, 22, 0.25)"
                        }}>
                            Planora Collective OS
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>•</span>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                            {events.find(e => (e.id || e._id) === selectedEventId)?.name || "Active Event Workspace"}
                        </span>
                    </div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.35rem", color: "#fff", letterSpacing: "-0.02em" }}>
                        Team Directory
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500, margin: 0, maxWidth: "550px", lineHeight: 1.5 }}>
                        Manage collaborators, synchronize access control, and dispatch team invitations for your active event.
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button
                        onClick={fetchMembers}
                        title="Refresh Team List"
                        style={{
                            padding: "0.65rem",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-medium)",
                            borderRadius: "12px",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                    >
                        <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
                    </button>

                    <button 
                        onClick={downloadSampleCSV}
                        title="Download sample Excel/CSV template for team members"
                        style={{ 
                            padding: "0.75rem 1.1rem", 
                            background: "rgba(255,255,255,0.06)", 
                            border: "1px solid var(--border-medium)", 
                            borderRadius: "12px", 
                            color: "var(--text-secondary)", 
                            fontWeight: 700, 
                            fontSize: "13px", 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.5rem",
                            transition: "all 0.2s"
                        }}
                    >
                        <FileSpreadsheet size={16} /> Sample CSV
                    </button>

                    {hasFullAccess && (
                        <>
                            <button 
                                onClick={() => document.getElementById('team-bulk-upload-input').click()}
                                disabled={bulkLoading}
                                title="Upload Excel or CSV sheet of team members"
                                style={{ 
                                    padding: "0.75rem 1.25rem", 
                                    background: "rgba(255,255,255,0.08)", 
                                    border: "1px solid var(--border-medium)", 
                                    borderRadius: "12px", 
                                    color: "#fff", 
                                    fontWeight: 800, 
                                    fontSize: "13px", 
                                    cursor: "pointer", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "0.5rem",
                                    transition: "all 0.2s"
                                }}
                            >
                                {bulkLoading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                Upload Excel/CSV
                                <input 
                                    id="team-bulk-upload-input" 
                                    type="file" 
                                    accept=".csv, .xlsx, .xls" 
                                    hidden 
                                    onChange={handleBulkUpload} 
                                />
                            </button>

                            <button 
                                onClick={() => setIsInviting(true)} 
                                style={{ 
                                    padding: "0.75rem 1.4rem", 
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                                    border: "none", 
                                    borderRadius: "12px", 
                                    color: "#000", 
                                    fontWeight: 800, 
                                    fontSize: "13px", 
                                    cursor: "pointer", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "0.6rem",
                                    boxShadow: "0 8px 25px rgba(249, 115, 22, 0.35)",
                                    transition: "all 0.2s transform cubic-bezier(0.4, 0, 0.2, 1)"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                <Plus size={18} strokeWidth={3} /> Invite Collaborator
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Top Cards KPI Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.25rem",
                marginBottom: "2rem"
            }}>
                {/* Total Members */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Members</span>
                        <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.1)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users2 size={16} />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                        <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{members.length}</span>
                        <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700, background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: "100px" }}>+1 this quarter</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "0.75rem" }}>
                        {leadCount} Leads • {editorCount} Editors • {viewerCount} Viewers
                    </span>
                </div>

                {/* Active Sessions */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Sessions</span>
                        <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <UserCheck size={16} />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                        <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{members.length}</span>
                        <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span> Online
                        </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "0.75rem" }}>0 awaiting approval</span>
                </div>

                {/* Security Health */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Security Health</span>
                        <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                        <span style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", lineHeight: 1 }}>100%</span>
                        <span style={{ fontSize: "11px", color: "#3b82f6", fontWeight: 700 }}>Optimal</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "0.75rem" }}>All protocols active</span>
                </div>
            </div>

            {/* Toolbar Row: Search, Role Filters, View Switcher */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-surface)",
                padding: "0.75rem 1rem",
                borderRadius: "14px",
                border: "1px solid var(--border-subtle)"
            }}>
                {/* Search Bar */}
                <div style={{
                    position: "relative",
                    flex: "1 1 280px",
                    maxWidth: "400px"
                }}>
                    <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input 
                        type="text"
                        placeholder="Search team by name, email, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.6rem 2.2rem 0.6rem 2.2rem",
                            borderRadius: "10px",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-elevated)",
                            color: "var(--text-primary)",
                            fontSize: "12px",
                            outline: "none",
                            transition: "border-color 0.2s"
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "transparent",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer"
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Role Tabs */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    {[
                        { id: "All Members", count: members.length },
                        { id: "Event Leads", count: leadCount },
                        { id: "Editors", count: editorCount },
                        { id: "Viewers", count: viewerCount }
                    ].map(filter => {
                        const isActive = roleFilter === filter.id;
                        return (
                            <button 
                                key={filter.id}
                                onClick={() => setRoleFilter(filter.id)}
                                style={{ 
                                    padding: "0.45rem 0.9rem", 
                                    borderRadius: "8px", 
                                    background: isActive ? "var(--accent-primary)" : "rgba(255,255,255,0.03)", 
                                    color: isActive ? "#000" : "var(--text-secondary)", 
                                    border: isActive ? "none" : "1px solid var(--border-subtle)", 
                                    fontSize: "12px", 
                                    fontWeight: 800, 
                                    cursor: "pointer", 
                                    whiteSpace: "nowrap", 
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}
                            >
                                {filter.id}
                                <span style={{ 
                                    background: isActive ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)", 
                                    padding: "2px 6px", 
                                    borderRadius: "4px", 
                                    fontSize: "10px",
                                    fontWeight: 900
                                }}>
                                    {filter.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* View Switcher */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "var(--bg-elevated)", padding: "3px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                    <button 
                        onClick={() => setViewMode("list")}
                        title="List View"
                        style={{ 
                            background: viewMode === "list" ? "rgba(255,255,255,0.1)" : "transparent", 
                            border: "none", 
                            color: viewMode === "list" ? "#fff" : "var(--text-muted)", 
                            cursor: "pointer", 
                            display: "flex", 
                            padding: "0.45rem", 
                            borderRadius: "7px",
                            transition: "all 0.2s" 
                        }}
                    >
                        <Users2 size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode("grid")}
                        title="Grid Cards View"
                        style={{ 
                            background: viewMode === "grid" ? "rgba(255,255,255,0.1)" : "transparent", 
                            border: "none", 
                            color: viewMode === "grid" ? "#fff" : "var(--text-muted)", 
                            cursor: "pointer", 
                            display: "flex", 
                            padding: "0.45rem", 
                            borderRadius: "7px",
                            transition: "all 0.2s" 
                        }}
                    >
                        <LayoutGrid size={16} />
                    </button>
                </div>
            </div>

            {/* Main Content Area: Table / List Mode */}
            {viewMode === "list" ? (
                <div style={{
                    background: "var(--bg-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                    overflowX: "auto",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.02)" }}>
                                <th style={{ padding: "1.1rem 1.5rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Collaborator & Role
                                </th>
                                <th style={{ padding: "1.1rem 1.5rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Status
                                </th>
                                <th style={{ padding: "1.1rem 1.5rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Lead Contact
                                </th>
                                <th style={{ padding: "1.1rem 1.5rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Permissions
                                </th>
                                <th style={{ padding: "1.1rem 1.5rem", textAlign: "right", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", width: "120px" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from(new Array(3)).map((_, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <td colSpan="5" style={{ padding: "1.5rem" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Skeleton animation="wave" height={20} width="30%" sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                                    <Skeleton animation="wave" height={16} width="50%" sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                                </Box>
                                            </Box>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-muted)" }}>
                                        <Users2 size={36} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" }}>No collaborators found</div>
                                        <div style={{ fontSize: "12px", marginTop: "4px" }}>
                                            {searchQuery ? `No members match "${searchQuery}"` : "Try adding collaborators to this event."}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => {
                                    const roleStyle = getRoleColor(member.role);
                                    const isOwner = member.isOwner || member._id === 'owner';
                                    const permPercent = member.role === "Event Lead" ? "100%" : member.role === "Editor" ? "60%" : "30%";

                                    return (
                                        <tr 
                                            key={member._id} 
                                            style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }}
                                            className="team-row"
                                        >
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                    {/* Avatar Icon */}
                                                    <div style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        borderRadius: "12px",
                                                        background: roleStyle.bg,
                                                        border: `1px solid ${roleStyle.border}`,
                                                        color: roleStyle.text,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "13px",
                                                        fontWeight: 900,
                                                        boxShadow: `0 4px 12px ${roleStyle.shadow}`
                                                    }}>
                                                        {getInitials(member.name)}
                                                    </div>

                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ fontSize: "14px", fontWeight: 750, color: "#fff" }}>
                                                                {member.name}
                                                            </span>
                                                            {isOwner && (
                                                                <span style={{
                                                                    fontSize: "9px",
                                                                    fontWeight: 900,
                                                                    background: "rgba(249, 115, 22, 0.2)",
                                                                    color: "#f97316",
                                                                    padding: "1px 6px",
                                                                    borderRadius: "4px",
                                                                    border: "1px solid rgba(249, 115, 22, 0.4)",
                                                                    textTransform: "uppercase"
                                                                }}>
                                                                    Owner
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: "11px", 
                                                            color: roleStyle.text, 
                                                            fontWeight: 800, 
                                                            textTransform: "uppercase", 
                                                            letterSpacing: "0.04em", 
                                                            marginTop: "2px" 
                                                        }}>
                                                            {member.role}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Dot */}
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    background: "rgba(16, 185, 129, 0.08)",
                                                    color: "#10b981",
                                                    padding: "4px 10px",
                                                    borderRadius: "100px",
                                                    fontSize: "11px",
                                                    fontWeight: 800,
                                                    border: "1px solid rgba(16, 185, 129, 0.2)"
                                                }}>
                                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></span>
                                                    Active
                                                </div>
                                            </td>

                                            {/* Contact Email & Copy */}
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 500 }}>
                                                        {member.email}
                                                    </span>
                                                    {member.email && (
                                                        <button 
                                                            onClick={() => copyToClipboard(member.email, member._id)}
                                                            title="Copy email"
                                                            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
                                                        >
                                                            {copiedId === member._id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                                                        </button>
                                                    )}
                                                </div>
                                                {member.whatsapp && (
                                                    <div style={{ fontSize: "11px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                                        <Phone size={11} /> wa.me/{member.whatsapp}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Permissions Bar */}
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{ width: "100%", maxWidth: "160px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                        <span style={{ fontSize: "9px", fontWeight: 800, color: "var(--text-secondary)" }}>PERMISSIONS</span>
                                                        <span style={{ fontSize: "9px", fontWeight: 900, color: roleStyle.text }}>{permPercent}</span>
                                                    </div>
                                                    <div 
                                                        title={member.permissions || "Access level"} 
                                                        style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", width: "100%", overflow: "hidden" }}
                                                    >
                                                        <div style={{ width: permPercent, background: roleStyle.text, height: "100%", transition: "width 0.3s" }}></div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem" }}>
                                                    {member.whatsapp && (
                                                        <a
                                                            href={`https://api.whatsapp.com/send?phone=${member.whatsapp.replace(/[^0-9]/g, "")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Chat on WhatsApp"
                                                            style={{
                                                                background: "rgba(16, 185, 129, 0.1)",
                                                                border: "1px solid rgba(16, 185, 129, 0.2)",
                                                                color: "#10b981",
                                                                width: "32px",
                                                                height: "32px",
                                                                borderRadius: "8px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                textDecoration: "none"
                                                            }}
                                                        >
                                                            <MessageSquare size={14} />
                                                        </a>
                                                    )}

                                                    {(!isOwner && hasFullAccess) && (
                                                        <>
                                                            <button 
                                                                onClick={() => startEditing(member)} 
                                                                title="Edit Member"
                                                                style={{ 
                                                                    background: "rgba(255,255,255,0.03)", 
                                                                    border: "1px solid var(--border-subtle)", 
                                                                    color: "var(--text-secondary)", 
                                                                    cursor: "pointer", 
                                                                    width: "32px", 
                                                                    height: "32px", 
                                                                    borderRadius: "8px", 
                                                                    display: "flex", 
                                                                    alignItems: "center", 
                                                                    justifyContent: "center",
                                                                    transition: "all 0.2s"
                                                                }}
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>

                                                            <button 
                                                                onClick={() => handleDelete(member._id, isOwner)} 
                                                                title="Revoke Access"
                                                                style={{ 
                                                                    background: "rgba(239, 68, 68, 0.1)", 
                                                                    border: "1px solid rgba(239, 68, 68, 0.2)", 
                                                                    color: "#ef4444", 
                                                                    cursor: "pointer", 
                                                                    width: "32px", 
                                                                    height: "32px", 
                                                                    borderRadius: "8px", 
                                                                    display: "flex", 
                                                                    alignItems: "center", 
                                                                    justifyContent: "center",
                                                                    transition: "all 0.2s"
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Grid View Mode */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                    {loading ? (
                        Array.from(new Array(6)).map((_, idx) => (
                            <div key={idx} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "1.5rem" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "1rem", mb: 2 }}>
                                    <Skeleton animation="wave" variant="circular" width={48} height={48} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton animation="wave" height={24} width="70%" sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                        <Skeleton animation="wave" height={16} width="40%" sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                    </Box>
                                </Box>
                                <Skeleton animation="wave" height={16} width="100%" sx={{ bgcolor: 'var(--bg-elevated)' }} />
                            </div>
                        ))
                    ) : filteredMembers.map((member) => {
                        const roleStyle = getRoleColor(member.role);
                        const isOwner = member.isOwner || member._id === 'owner';
                        const permPercent = member.role === "Event Lead" ? "100%" : member.role === "Editor" ? "60%" : "30%";

                        return (
                            <div 
                                key={member._id} 
                                style={{ 
                                    background: "var(--bg-surface)", 
                                    border: "1px solid var(--border-subtle)", 
                                    borderRadius: "16px", 
                                    padding: "1.5rem", 
                                    transition: "all 0.2s transform cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                                    position: "relative"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                                        <div style={{
                                            width: "46px",
                                            height: "46px",
                                            borderRadius: "14px",
                                            background: roleStyle.bg,
                                            border: `1px solid ${roleStyle.border}`,
                                            color: roleStyle.text,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "15px",
                                            fontWeight: 900
                                        }}>
                                            {getInitials(member.name)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>{member.name}</div>
                                            <div style={{ fontSize: "11px", color: roleStyle.text, fontWeight: 800, textTransform: "uppercase" }}>{member.role}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        background: "rgba(16, 185, 129, 0.1)",
                                        color: "#10b981",
                                        padding: "3px 8px",
                                        borderRadius: "10px",
                                        fontSize: "10px",
                                        fontWeight: 800
                                    }}>
                                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#10b981" }}></span>
                                        Active
                                    </div>
                                </div>

                                <div style={{ marginBottom: "1.25rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--text-secondary)", fontSize: "12px", marginBottom: "0.4rem" }}>
                                        <Mail size={14} color="var(--text-muted)" />
                                        <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.email}</span>
                                    </div>
                                    {member.whatsapp && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#10b981", fontSize: "12px" }}>
                                            <Phone size={14} />
                                            <span>wa.me/{member.whatsapp}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: "0.85rem", background: "var(--bg-elevated)", borderRadius: "12px", marginBottom: "1.25rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                                        <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)" }}>PERMISSIONS</span>
                                        <span style={{ fontSize: "10px", fontWeight: 900, color: roleStyle.text }}>{permPercent}</span>
                                    </div>
                                    <div style={{ height: "4px", background: "var(--bg-surface)", borderRadius: "2px", width: "100%", overflow: "hidden" }}>
                                        <div style={{ width: permPercent, background: roleStyle.text, height: "100%" }}></div>
                                    </div>
                                </div>

                                {(!isOwner && hasFullAccess) && (
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.85rem" }}>
                                        <button onClick={() => startEditing(member)} style={{ background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><Edit3 size={14} /></button>
                                        <button onClick={() => handleDelete(member._id, isOwner)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}



            {/* Invite Collaborator Modal */}
            {isInviting && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0,0,0,0.75)", 
                    zIndex: 1000, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    backdropFilter: "blur(8px)",
                    padding: "1rem"
                }}>
                    <div style={{ 
                        background: "#121214", 
                        width: "100%", 
                        maxWidth: "480px", 
                        borderRadius: "24px", 
                        padding: "2rem", 
                        border: "1px solid var(--border-medium)", 
                        boxShadow: "0 25px 50px rgba(0,0,0,0.8)" 
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#fff" }}>Invite Collaborator</h2>
                                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0" }}>Grant access permissions for event planning</p>
                            </div>
                            <button 
                                onClick={() => setIsInviting(false)} 
                                style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "var(--text-secondary)", cursor: "pointer", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Full Name *</label>
                                <input 
                                    autoFocus 
                                    required 
                                    placeholder="e.g. Alex Morgan" 
                                    value={inviteData.name} 
                                    onChange={e => setInviteData({ ...inviteData, name: e.target.value })} 
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none" }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Email Address *</label>
                                <input 
                                    required 
                                    type="email" 
                                    placeholder="colleague@domain.com" 
                                    value={inviteData.email} 
                                    onChange={e => setInviteData({ ...inviteData, email: e.target.value })} 
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none" }} 
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Assigned Role</label>
                                    <select 
                                        value={inviteData.role} 
                                        onChange={e => setInviteData({ ...inviteData, role: e.target.value })} 
                                        style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none", cursor: "pointer" }}
                                    >
                                        <option value="Editor">Editor (60% Access)</option>
                                        <option value="Viewer">Viewer (30% Access)</option>
                                        <option value="Event Lead">Event Lead (100% Access)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Target Event *</label>
                                    <select 
                                        required 
                                        value={inviteData.event} 
                                        onChange={e => setInviteData({ ...inviteData, event: e.target.value })} 
                                        style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none", cursor: "pointer" }}
                                    >
                                        <option value="" disabled>Select Event</option>
                                        {events.map((ev) => (
                                            <option key={ev.id || ev._id} value={ev.id || ev._id}>{ev.name || ev.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>WhatsApp Dispatch (Optional)</label>
                                <input 
                                    placeholder="+1234567890 (Triggers WhatsApp payload)" 
                                    value={inviteData.whatsapp} 
                                    onChange={e => setInviteData({ ...inviteData, whatsapp: e.target.value })} 
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none" }} 
                                />
                            </div>

                            <button 
                                type="submit" 
                                style={{ 
                                    width: "100%", 
                                    padding: "1rem", 
                                    borderRadius: "12px", 
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                                    color: "#000", 
                                    border: "none", 
                                    fontWeight: 900, 
                                    fontSize: "14px", 
                                    marginTop: "0.5rem", 
                                    cursor: "pointer",
                                    boxShadow: "0 8px 25px rgba(249, 115, 22, 0.35)"
                                }}
                            >
                                Transmit Invitation
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Collaborator Modal */}
            {editingMember && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0,0,0,0.75)", 
                    zIndex: 1000, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    backdropFilter: "blur(8px)",
                    padding: "1rem"
                }}>
                    <div style={{ 
                        background: "#121214", 
                        width: "100%", 
                        maxWidth: "440px", 
                        borderRadius: "24px", 
                        padding: "2rem", 
                        border: "1px solid var(--border-medium)", 
                        boxShadow: "0 25px 50px rgba(0,0,0,0.8)" 
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "#fff" }}>Edit Collaborator</h2>
                            <button 
                                onClick={() => setEditingMember(null)} 
                                style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "var(--text-secondary)", cursor: "pointer", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Name</label>
                                <input 
                                    value={editData.name} 
                                    onChange={e => setEditData({ ...editData, name: e.target.value })} 
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none" }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Email</label>
                                <input 
                                    value={editData.email} 
                                    onChange={e => setEditData({ ...editData, email: e.target.value })} 
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none" }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Role</label>
                                <select 
                                    value={editData.role} 
                                    onChange={e => setEditData({ ...editData, role: e.target.value })} 
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none", cursor: "pointer" }}
                                >
                                    <option value="Event Lead">Event Lead (100% Access)</option>
                                    <option value="Editor">Editor (60% Access)</option>
                                    <option value="Viewer">Viewer (30% Access)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.4rem" }}>WhatsApp Number</label>
                                <input 
                                    value={editData.whatsapp} 
                                    onChange={e => setEditData({ ...editData, whatsapp: e.target.value })} 
                                    style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "#fff", fontSize: "13px", outline: "none" }} 
                                />
                            </div>

                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                                <button 
                                    onClick={() => setEditingMember(null)}
                                    style={{ flex: 1, padding: "0.85rem", borderRadius: "10px", background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={saveEdit}
                                    style={{ flex: 1, padding: "0.85rem", borderRadius: "10px", background: "var(--accent-primary)", border: "none", color: "#000", fontWeight: 800, cursor: "pointer" }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .team-row:hover { background: rgba(255, 255, 255, 0.03) !important; }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spin-icon {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
