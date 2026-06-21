import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { Plus, User, Mail, Shield, Check, ChevronRight, LayoutGrid, Users2, MoreHorizontal, Trash2, Edit2, X, Calendar, Phone } from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
const API_URL = import.meta.env.VITE_API_URL;

export default function Team() {
    const { user, events = [], selectedEventId, hasFullAccess, hasEditorAccess } = useOutletContext();
    
    console.log(`[Team Access Context] User: ${user?.email} | Full Access: ${hasFullAccess} | Editor Access: ${hasEditorAccess}`);

    const { showAlert, showConfirm } = useDialog();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [inviteData, setInviteData] = useState({ name: "", email: "", role: "Editor", event: selectedEventId || events[0]?.id || "", whatsapp: "" });
    const [editData, setEditData] = useState({ name: "", role: "" });
    const [leadWhatsApp, setLeadWhatsApp] = useState(localStorage.getItem(`lead_wa_${user?.uid}`) || "");
    const [viewMode, setViewMode] = useState("list");
    const [roleFilter, setRoleFilter] = useState("All Members");

    useEffect(() => {
        if (user?.uid) {
            localStorage.setItem(`lead_wa_${user?.uid}`, leadWhatsApp);
        }
    }, [leadWhatsApp, user?.uid]);

    useEffect(() => {
        setInviteData(prev => ({ ...prev, event: selectedEventId }));
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
            } else {
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
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            // Find who is inviting (could be owner or an Event Lead collaborator)
            const inviter = members.find(m => m.email === user?.email) || { name: user.displayName || "Workspace Owner" };

            const response = await fetch(`${API_URL}/collaborators`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...inviteData,
                    user: user.uid, // This logic assumes the UID is passed for the one who CREATES the record
                    inviterName: inviter.name,
                    status: "Active",
                    permissions: inviteData.role === "Editor" ? "Limited Access: Guests Only" : inviteData.role === "Event Lead" ? "Full administrative control" : "Read-only access"
                })
            });
            if (response.ok) {
                const event = events.find(e => (e.id || e._id) === inviteData.event);
                const eventName = event?.name || event?.title || 'Upcoming Event';
                const senderName = user.displayName || "Workspace Owner";
                
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
                    msg += `🔒 *Permissions:* ${inviteData.role === "Editor" ? "Limited Access: Guests Only" : inviteData.role === "Event Lead" ? "Full administrative control" : "Read-only access"}\n\n`;
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
                showAlert("Invitation Transmitted", `${inviteData.name} has been synchronized with the collective.`);
            }
        } catch (err) {
            console.error("Failed to add collaborator:", err);
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
                    setMembers(members.filter(m => m._id !== memberId));
                }
            } catch (err) {
                console.error("Failed to delete collaborator:", err);
            }
        }
    };

    const startEditing = (member) => {
        if (member.isOwner) return;
        setEditingId(member._id);
        setEditData({ name: member.name, role: member.role });
    };

    const saveEdit = async (memberId) => {
        try {
            const response = await fetch(`${API_URL}/collaborators/${memberId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editData.name,
                    role: editData.role,
                    permissions: editData.role === "Editor" ? "Can modify core modules" : editData.role === "Event Lead" ? "Full administrative control" : "Read-only access"
                })
            });
            if (response.ok) {
                setEditingId(null);
                fetchMembers();
            }
        } catch (err) {
            console.error("Failed to update collaborator:", err);
        }
    };

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const handleRenewal = async (title) => {
        const confirmed = await showConfirm("Initiate Renewal", `Authorize the administrative renewal for '${title}'? This will extend the current security session.`);
        if (confirmed) {
            showAlert("Renewal Synchronized", `Session for '${title}' has been successfully extended and logged in the audit history.`);
        }
    };

    const filteredMembers = members.filter(m => {
        if (roleFilter === "All Members") return true;
        if (roleFilter === "Event Leads" && m.role === "Event Lead") return true;
        if (roleFilter === "Editors" && m.role === "Editor") return true;
        if (roleFilter === "Viewers" && m.role === "Viewer") return true;
        return false;
    });

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            color: "var(--text-primary)",
            paddingBottom: "4rem"
        }}>
            <div className="events-header" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 0.25rem", color: "#fff" }}>Team Directory</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, margin: 0 }}>
                        Manage and synchronize your planning collective.
                    </p>
                </div>
                {hasFullAccess && (
                    <button onClick={() => setIsInviting(true)} style={{ padding: "0.6rem 1.25rem", background: "var(--accent-primary)", border: "none", borderRadius: "8px", color: "#000", fontWeight: 800, fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Plus size={16} /> Invite Collaborator
                    </button>
                )}
            </div>

            {/* Top Cards Grid */}
            <div className="dashboard-kpi-grid" style={{ gap: "1.25rem", marginBottom: "2rem" }}>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Total Members</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{members.length}</span>
                    <span style={{ fontSize: "10px", color: "#10b981", marginTop: "0.5rem", fontWeight: 700 }}>+1 this quarter</span>
                </div>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Active Sessions</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{members.length}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "0.5rem" }}>0 awaiting approval</span>
                </div>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Security Health</span>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", lineHeight: 1 }}>100%</span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "0.5rem" }}>All protocols active</span>
                </div>
            </div>

            {/* Filter Row */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {[
                    { id: "All Members", count: members.length },
                    { id: "Event Leads", count: members.filter(m => m.role === "Event Lead").length },
                    { id: "Editors", count: members.filter(m => m.role === "Editor").length },
                    { id: "Viewers", count: members.filter(m => m.role === "Viewer").length }
                ].map(filter => (
                    <button 
                        key={filter.id}
                        onClick={() => setRoleFilter(filter.id)}
                        style={{ 
                            padding: "0.4rem 1rem", 
                            borderRadius: "8px", 
                            background: roleFilter === filter.id ? "var(--accent-primary)" : "rgba(255,255,255,0.02)", 
                            color: roleFilter === filter.id ? "#000" : "var(--text-secondary)", 
                            border: roleFilter === filter.id ? "none" : "1px solid var(--border-subtle)", 
                            fontSize: "11px", 
                            fontWeight: 700, 
                            cursor: "pointer", 
                            whiteSpace: "nowrap", 
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        {filter.id}
                        <span style={{ 
                            background: roleFilter === filter.id ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.05)", 
                            padding: "1px 6px", borderRadius: "4px", fontSize: "10px" 
                        }}>{filter.count}</span>
                    </button>
                ))}
                
                <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                    <button 
                        onClick={() => setViewMode("grid")}
                        style={{ background: "transparent", border: "none", color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-secondary)", cursor: "pointer", display: "flex", padding: "0.5rem", transition: "color 0.2s" }}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode("list")}
                        style={{ background: "transparent", border: "none", color: viewMode === "list" ? "var(--text-primary)" : "var(--text-secondary)", cursor: "pointer", display: "flex", padding: "0.5rem", transition: "color 0.2s" }}
                    >
                        <Users2 size={18} />
                    </button>
                </div>
            </div>

            {/* Table or Grid Area */}
            {viewMode === "list" ? (
                <div style={{
                    background: "var(--bg-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                    overflowX: "auto"
                }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                <th style={{ padding: "1.25rem 1.5rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Collaborator & Role</th>
                                <th style={{ padding: "1.25rem 1.5rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                <th style={{ padding: "1.25rem 1.5rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Lead Contact</th>
                                <th style={{ padding: "1.25rem 1.5rem", textAlign: "left", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Permissions</th>
                                <th style={{ padding: "1.25rem 1.5rem", textAlign: "right", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", width: "100px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from(new Array(3)).map((_, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <td colSpan="5" style={{ padding: "1.5rem" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                                <Box>
                                                    <Skeleton animation="wave" height={20} width={100} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                                    <Skeleton animation="wave" height={16} width={140} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                                </Box>
                                            </Box>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredMembers.map((member) => {
                                const isEditing = editingId === member._id;
                                const roleColor = member.role === "Event Lead" ? "#f97316" : member.role === "Editor" ? "#3b82f6" : "#64748b";

                                return (
                                    <tr key={member._id} style={{ borderBottom: "1px solid var(--border-subtle)" }} className="member-row">
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <div style={{
                                                    width: "36px",
                                                    height: "36px",
                                                    borderRadius: "10px",
                                                    background: `linear-gradient(135deg, ${roleColor}22, ${roleColor}44)`,
                                                    border: `1px solid ${roleColor}33`,
                                                    color: roleColor,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "12px",
                                                    fontWeight: 900
                                                }}>
                                                    {getInitials(member.name)}
                                                </div>
                                                {isEditing ? (
                                                    <input
                                                        style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid var(--accent-primary)", background: "transparent", color: "var(--text-primary)", fontSize: "13px", fontWeight: 700, width: "180px", outline: "none" }}
                                                        value={editData.name}
                                                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div>
                                                        <div style={{ fontSize: "13px", fontWeight: 750, color: "#fff" }}>
                                                            {member.name}
                                                        </div>
                                                        <div style={{ fontSize: "10px", color: roleColor, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>{member.role}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <div style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                background: "rgba(16, 185, 129, 0.05)",
                                                color: "#10b981",
                                                padding: "4px 10px",
                                                borderRadius: "100px",
                                                fontSize: "10px",
                                                fontWeight: 800,
                                                border: "1px solid rgba(16, 185, 129, 0.1)"
                                            }}>
                                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }}></div>
                                                Active
                                            </div>
                                        </td>
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            <div style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 500 }}>{member.email}</div>
                                        </td>
                                        <td style={{ padding: "1rem 1.5rem" }}>
                                            {isEditing ? (
                                                <select
                                                    style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid var(--accent-primary)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 700, outline: "none" }}
                                                    value={editData.role}
                                                    onChange={e => setEditData({ ...editData, role: e.target.value })}
                                                >
                                                    <option>Event Lead</option>
                                                    <option>Editor</option>
                                                    <option>Viewer</option>
                                                </select>
                                            ) : (
                                                <div style={{ width: "100%", maxWidth: "160px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                        <span style={{ fontSize: "9px", fontWeight: 800, color: "var(--text-secondary)" }}>PERMISSIONS</span>
                                                        <span style={{ fontSize: "9px", fontWeight: 900, color: "#fff" }}>{member.role === "Event Lead" ? "100%" : member.role === "Editor" ? "60%" : "30%"}</span>
                                                    </div>
                                                    <div title={member.permissions} style={{ height: "4px", background: "rgba(255,255,255,0.03)", borderRadius: "2px", width: "100%", overflow: "hidden" }}>
                                                        <div style={{ width: member.role === "Event Lead" ? "100%" : member.role === "Editor" ? "60%" : "30%", background: "var(--accent-primary)", height: "100%" }}></div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                            {(!member.isOwner && hasFullAccess) && (
                                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.25rem" }}>
                                                    {isEditing ? (
                                                        <>
                                                            <button onClick={() => saveEdit(member._id)} style={{ background: "var(--accent-primary)", color: "#000", border: "none", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Check size={14} strokeWidth={3} /></button>
                                                            <button onClick={() => setEditingId(null)} style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={14} /></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => startEditing(member)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "6px", borderRadius: "6px" }}><Edit2 size={14} /></button>
                                                            <button onClick={() => handleDelete(member._id, member.isOwner)} style={{ background: "transparent", border: "none", color: "var(--accent-danger)", cursor: "pointer", padding: "6px", borderRadius: "6px" }}><Trash2 size={14} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                    </tbody>
                </table>
                {filteredMembers.length > 8 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
                            Showing 1-{filteredMembers.length} of {filteredMembers.length} members
                        </div>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                            <button style={{ padding: "0.25rem 0.75rem", background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>Previous</button>
                            <button style={{ padding: "0.25rem 0.75rem", background: "var(--accent-primary)", border: "none", color: "#000", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>1</button>
                            <button style={{ padding: "0.25rem 0.75rem", background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>Next</button>
                        </div>
                    </div>
                )}
            </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                    {loading ? (
                        Array.from(new Array(6)).map((_, idx) => (
                            <div key={idx} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "1.5rem" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "1rem", mb: 2 }}>
                                    <Skeleton animation="wave" variant="circular" width={48} height={48} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                    <Box>
                                        <Skeleton animation="wave" height={24} width={120} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                        <Skeleton animation="wave" height={16} width={80} sx={{ bgcolor: 'var(--bg-elevated)' }} />
                                    </Box>
                                </Box>
                                <Skeleton animation="wave" height={16} width="100%" sx={{ bgcolor: 'var(--bg-elevated)', mb: 1 }} />
                                <Skeleton animation="wave" height={16} width="80%" sx={{ bgcolor: 'var(--bg-elevated)' }} />
                            </div>
                        ))
                    ) : filteredMembers.map((member) => {
                        const isEditing = editingId === member._id;

                        return (
                            <div key={member._id} className="member-row" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "1.5rem", transition: "all 0.2s" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "12px",
                                            background: "var(--bg-elevated)",
                                            border: "1px solid var(--border-subtle)",
                                            color: "var(--text-primary)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "16px",
                                            fontWeight: 800
                                        }}>
                                            {getInitials(member.name)}
                                        </div>
                                        <div>
                                            {isEditing ? (
                                                <input
                                                    style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", border: "1px solid var(--accent-primary)", background: "transparent", color: "var(--text-primary)", fontSize: "14px", fontWeight: 750, width: "100%", outline: "none", marginBottom: "4px" }}
                                                    value={editData.name}
                                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)" }}>{member.name}</div>
                                            )}
                                            
                                            {isEditing ? (
                                                <select
                                                    style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", border: "1px solid var(--accent-primary)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "12px", fontWeight: 600, outline: "none", width: "100%" }}
                                                    value={editData.role}
                                                    onChange={e => setEditData({ ...editData, role: e.target.value })}
                                                >
                                                    <option>Event Lead</option>
                                                    <option>Editor</option>
                                                    <option>Viewer</option>
                                                </select>
                                            ) : (
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>{member.role}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        background: "rgba(16, 185, 129, 0.1)",
                                        color: "#10b981",
                                        padding: "4px 8px",
                                        borderRadius: "10px",
                                        fontSize: "10px",
                                        fontWeight: 800
                                    }}>
                                        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#10b981" }}></div>
                                        Active
                                    </div>
                                </div>

                                <div style={{ marginBottom: "1.25rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "13px" }}>
                                        <Mail size={14} />
                                        <span style={{ fontWeight: 500 }}>{member.email}</span>
                                    </div>
                                    {member.whatsapp && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-secondary)", fontSize: "13px" }}>
                                            <Phone size={14} />
                                            <span style={{ fontWeight: 500 }}>wa.me/{member.whatsapp}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: "1rem", background: "var(--bg-elevated)", borderRadius: "10px", marginBottom: "1.25rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>ACCESS PERMISSIONS</span>
                                        <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-primary)" }}>
                                            {member.role === "Event Lead" ? "100%" : member.role === "Editor" ? "60%" : "30%"}
                                        </span>
                                    </div>
                                    <div style={{ height: "4px", background: "var(--bg-surface)", borderRadius: "2px", width: "100%", overflow: "hidden" }}>
                                        <div style={{ width: member.role === "Event Lead" ? "100%" : member.role === "Editor" ? "60%" : "30%", background: "var(--accent-primary)", height: "100%" }}></div>
                                    </div>
                                </div>

                                {(!member.isOwner && hasFullAccess) && (
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
                                        {isEditing ? (
                                            <>
                                                <button onClick={() => saveEdit(member._id)} style={{ background: "var(--accent-primary)", color: "#000", border: "none", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Check size={14} strokeWidth={3} /></button>
                                                <button onClick={() => setEditingId(null)} style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={14} /></button>
                                            </>
                                        ) : (
                                            <button onClick={() => startEditing(member)} style={{ background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><MoreHorizontal size={14} /></button>
                                        )}
                                        {!isEditing && (
                                            <button onClick={() => handleDelete(member._id, member.isOwner)} style={{ background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--accent-danger)", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bottom Audit Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginTop: "2rem" }}>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", overflow: "hidden" }}>
                    <div style={{ padding: "1rem 1.5rem", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <Shield size={16} color="var(--accent-primary)" />
                        <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Access Renewals</h3>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {[
                            { title: "Workspace Admin Privileges", sub: "Annual workspace access renewal. Pending security certificate update.", due: "5 days" },
                            { title: "Editor Permissions Update", sub: "Reviewing new access logs for Q3/Q4 events.", due: "14 days" }
                        ].map((renewal, idx) => (
                            <div key={idx} style={{ padding: "1.25rem 1.5rem", borderBottom: idx === 0 ? "1px solid var(--border-subtle)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: idx === 0 ? "var(--accent-primary)" : "var(--text-muted)", marginTop: "6px" }}></div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{renewal.title}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>{renewal.sub}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", paddingLeft: "1.5rem" }}>
                                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>Due in {renewal.due}</div>
                                    <button 
                                        onClick={() => handleRenewal(renewal.title)}
                                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", color: "#fff", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                                    >
                                        Renew Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invite Modal Overlay */}
            {isInviting && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
                    <div style={{ background: "var(--bg-surface)", width: "100%", maxWidth: "450px", borderRadius: "24px", padding: "2rem", border: "1px solid var(--border-subtle)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Invite Collaborator</h2>
                            <button onClick={() => setIsInviting(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}><X size={20} /></button>
                        </div>
                        
                        {/* Lead WhatsApp Configuration inline for modal */}
                        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--bg-elevated)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                            <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Your Sender WhatsApp (Optional)</label>
                            <input 
                                placeholder="Your WA Number" 
                                value={leadWhatsApp}
                                onChange={(e) => setLeadWhatsApp(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }} 
                            />
                        </div>

                        <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <input autoFocus required placeholder="Full Name" value={inviteData.name} onChange={e => setInviteData({ ...inviteData, name: e.target.value })} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }} />
                            </div>
                            <div>
                                <input required type="email" placeholder="Email Address" value={inviteData.email} onChange={e => setInviteData({ ...inviteData, email: e.target.value })} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }} />
                            </div>
                            <div>
                                <input placeholder="Invitee WhatsApp Number (Triggers Message)" value={inviteData.whatsapp} onChange={e => setInviteData({ ...inviteData, whatsapp: e.target.value })} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none" }} />
                            </div>
                            <div className="grid-2-col" style={{ gap: "1rem" }}>
                                <select value={inviteData.role} onChange={e => setInviteData({ ...inviteData, role: e.target.value })} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none", cursor: "pointer" }}>
                                    <option>Editor</option>
                                    <option>Viewer</option>
                                    <option>Event Lead</option>
                                </select>
                                <select required value={inviteData.event} onChange={e => setInviteData({ ...inviteData, event: e.target.value })} style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: "13px", outline: "none", cursor: "pointer" }}>
                                    <option value="" disabled>Select Event</option>
                                    {events.map((ev) => (
                                        <option key={ev.id || ev._id} value={ev.id || ev._id}>{ev.name || ev.title}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "var(--accent-primary)", color: "#000", border: "none", fontWeight: 800, fontSize: "14px", marginTop: "0.5rem", cursor: "pointer" }}>
                                Transmit Invitation
                            </button>
                        </form>
                    </div>
                </div>
            )}
            
            <style>{`
                .member-row:hover { background: var(--bg-elevated) !important; }
            `}</style>
        </div>
    );
}
