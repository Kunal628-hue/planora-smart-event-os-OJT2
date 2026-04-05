import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, User, Mail, Shield, Check, ChevronRight, LayoutGrid, Users2, MoreHorizontal, Trash2, Edit2, X } from "lucide-react";
import { NeuralLoader } from "../../components/ui/Loader";

const API_URL = import.meta.env.VITE_API_URL;

export default function Team() {
    const { user } = useOutletContext();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [inviteData, setInviteData] = useState({ name: "", email: "", role: "Editor" });
    const [editData, setEditData] = useState({ name: "", role: "" });

    const fetchMembers = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/collaborators?user=${user.uid}`);
            const data = await res.json();

            // The owner is always implicitly part of the team, but we might want to store them too?
            // For now, let's keep the owner as a virtual first record if they aren't in the DB.
            const owner = {
                _id: 'owner',
                name: user?.displayName || "Workspace Owner",
                email: user?.email || "owner@planora.os",
                role: "Event Lead",
                status: "Active",
                permissions: "Full administrative control over workspace",
                isOwner: true
            };

            setMembers([owner, ...data]);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [user]);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/collaborators`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...inviteData,
                    user: user.uid,
                    status: "Active",
                    permissions: inviteData.role === "Editor" ? "Can modify core modules" : inviteData.role === "Event Lead" ? "Full administrative control" : "Read-only access"
                })
            });
            if (response.ok) {
                setIsInviting(false);
                setInviteData({ name: "", email: "", role: "Editor" });
                fetchMembers();
            }
        } catch (err) {
            console.error("Failed to add collaborator:", err);
        }
    };

    const handleDelete = async (memberId, isOwner) => {
        if (isOwner) {
            alert("Cannot terminate the primary owner's session.");
            return;
        }
        if (window.confirm("Permanently revoke workspace access for this collaborator?")) {
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

    const getRoleColor = (role) => {
        switch (role) {
            case 'Event Lead': return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' };
            case 'Editor': return { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' };
            case 'Viewer': return { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9' };
            default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
        }
    };

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            <div style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 850, letterSpacing: "-0.04em", margin: "0 0 0.25rem" }}>
                    Neural <span style={{ color: "#2563eb" }}>Hive</span>
                </h1>
                <p style={{ color: "#64748b", fontSize: "0.95rem", fontWeight: 500, margin: 0 }}>
                    Manage and synchronize your planning collective.
                </p>
            </div>

            <div style={{
                background: "#fff",
                borderRadius: "24px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 20px rgba(0,0,0,0.015)",
                overflow: "hidden"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                            <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "11px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Collaborator</th>
                            <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "11px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                            <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "11px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Access Logic</th>
                            <th style={{ padding: "1rem 1.5rem", textAlign: "right", width: "100px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" style={{ padding: "4rem", textAlign: "center" }}>
                                    <NeuralLoader text="Synchronizing Hive Mind..." />
                                </td>
                            </tr>
                        ) : members.map((member) => {
                            const colors = getRoleColor(member.role);
                            const isEditing = editingId === member._id;

                            return (
                                <tr key={member._id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.2s" }} className="member-row">
                                    <td style={{ padding: "0.85rem 1.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "50%",
                                                background: colors.bg,
                                                color: colors.text,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "12px",
                                                fontWeight: 800,
                                                border: `1.5px solid ${colors.border}`
                                            }}>
                                                {getInitials(member.name)}
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1.5px solid #2563eb", fontSize: "13px", fontWeight: 700, width: "180px" }}
                                                    value={editData.name}
                                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div>
                                                    <div style={{ fontSize: "14px", fontWeight: 750, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                                                        {member.name}
                                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} title="Active"></div>
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{member.email}</div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: "0.85rem 1.5rem" }}>
                                        {isEditing ? (
                                            <select
                                                style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1.5px solid #2563eb", fontSize: "12px", fontWeight: 700 }}
                                                value={editData.role}
                                                onChange={e => setEditData({ ...editData, role: e.target.value })}
                                            >
                                                <option>Event Lead</option>
                                                <option>Editor</option>
                                                <option>Viewer</option>
                                            </select>
                                        ) : (
                                            <span style={{
                                                background: colors.bg,
                                                color: colors.text,
                                                padding: "3px 10px",
                                                borderRadius: "8px",
                                                fontSize: "10px",
                                                fontWeight: 900,
                                                border: `1px solid ${colors.border}`,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.02em"
                                            }}>
                                                {member.role}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: "0.85rem 1.5rem" }}>
                                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 550 }}>
                                            {member.permissions}
                                        </span>
                                    </td>
                                    <td style={{ padding: "0.85rem 1.5rem", textAlign: "right" }}>
                                        {!member.isOwner && (
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => saveEdit(member._id)} style={{ background: "#2563eb", color: "#fff", border: "none", width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Check size={16} /></button>
                                                        <button onClick={() => setEditingId(null)} style={{ background: "#f1f5f9", color: "#64748b", border: "none", width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEditing(member)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "6px", borderRadius: "8px" }} className="action-btn"><Edit2 size={16} /></button>
                                                        <button onClick={() => handleDelete(member._id, member.isOwner)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "6px", borderRadius: "8px" }} className="action-btn-danger"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Integrated Invite Section */}
                        {!isInviting ? (
                            <tr
                                onClick={() => setIsInviting(true)}
                                style={{ cursor: "pointer", borderTop: "1px dashed #e2e8f0" }}
                                className="invite-trigger"
                            >
                                <td colSpan="4" style={{ padding: "1.1rem 1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#94a3b8" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1.5px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Plus size={16} />
                                        </div>
                                        <span style={{ fontSize: "14px", fontWeight: 600 }}>Invite a collaborator...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr style={{ background: "#fcfdff", borderTop: "1px solid #e2e8f0" }}>
                                <td colSpan="4" style={{ padding: "1.5rem" }}>
                                    <form onSubmit={handleInvite} style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                                        <div style={{ position: "relative", minWidth: "150px" }}>
                                            <User size={14} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                            <input
                                                autoFocus
                                                required
                                                placeholder="Full Name"
                                                value={inviteData.name}
                                                onChange={e => setInviteData({ ...inviteData, name: e.target.value })}
                                                style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: 600, outline: "none" }}
                                            />
                                        </div>
                                        <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
                                            <Mail size={14} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                            <input
                                                required
                                                type="email"
                                                placeholder="Email Address"
                                                value={inviteData.email}
                                                onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                                style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: 600, outline: "none" }}
                                            />
                                        </div>
                                        <select
                                            value={inviteData.role}
                                            onChange={e => setInviteData({ ...inviteData, role: e.target.value })}
                                            style={{ padding: "0.6rem 1rem", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "13px", fontWeight: 700, background: "#fff", cursor: "pointer" }}
                                        >
                                            <option>Editor</option>
                                            <option>Viewer</option>
                                            <option>Event Lead</option>
                                        </select>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button type="button" onClick={() => setIsInviting(false)} style={{ padding: "0.6rem 1.25rem", borderRadius: "10px", border: '1px solid #e2e8f0', background: "#fff", fontSize: "13px", fontWeight: 750, cursor: "pointer" }}>Cancel</button>
                                            <button type="submit" style={{ padding: "0.6rem 1.25rem", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontSize: "13px", fontWeight: 850, cursor: "pointer", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)" }}>Invite Member</button>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .member-row:hover { background: #fafafc !important; }
                .action-btn:hover { background: #f1f5f9 !important; }
                .action-btn-danger:hover { background: #fef2f2 !important; }
                .invite-trigger:hover { background: #fcfdff !important; }
                .invite-trigger:hover span { color: #2563eb !important; }
                .invite-trigger:hover div { border-color: #2563eb !important; color: #2563eb !important; }
            `}</style>
        </div>
    );
}
