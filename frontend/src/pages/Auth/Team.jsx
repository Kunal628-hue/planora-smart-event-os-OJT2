import { useOutletContext } from "react-router-dom";
import { UserPlus, UserCircle, Briefcase, Share2, Crown, Activity } from "lucide-react";

export default function Team() {
    const { user } = useOutletContext();
    const teammates = [
        { name: user?.displayName || user?.email?.split('@')[0] || "Owner", role: "Event Lead", status: "Active", icon: <Crown size={20} /> }
    ];

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                    Neural <span className="gradient-text">Hive</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                    Orchestrate your planning collective and manage permission boundaries.
                </p>
            </div>

            <div className="dashboard-grid">
                <div className="glass-panel" style={{ gridColumn: "span 8", padding: "2.5rem", borderRadius: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 850 }}>Active Collaborators</h3>
                        <span className="category-badge" style={{ background: "var(--accent-soft)", color: "var(--accent-primary)" }}>1 Member</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {teammates.map((member, i) => (
                            <div key={i} className="hover-lift" style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1.25rem 1.5rem",
                                background: "var(--bg-elevated)",
                                borderRadius: "20px",
                                border: "1px solid var(--border-subtle)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                    <div style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "14px",
                                        background: member.role === "Event Lead" ? "rgba(245, 158, 11, 0.1)" : "var(--bg-card)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: member.role === "Event Lead" ? "#d97706" : "var(--accent-primary)",
                                        border: member.role === "Event Lead" ? "1.5px solid rgba(245, 158, 11, 0.2)" : "1.5px solid var(--border-subtle)"
                                    }}>
                                        {member.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 800, fontSize: "1.1rem" }}>{member.name}</h4>
                                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{member.role}</p>
                                    </div>
                                </div>
                                <div className="category-badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-success)" }}>
                                    {member.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel hover-lift" style={{ gridColumn: "span 4", padding: "3rem", borderRadius: "32px", background: "linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)", color: "white", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ width: "64px", height: "64px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", backdropFilter: "blur(4px)" }}>
                            <Share2 size={32} strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: "1.75rem", fontWeight: 950, marginBottom: "1rem", letterSpacing: "-0.04em" }}>Expand the Hive</h3>
                        <p style={{ opacity: 0.9, marginBottom: "2.5rem", lineHeight: 1.6, fontWeight: 500, fontSize: "1.1rem" }}>
                            Invite multi-disciplinary partners to synchronize on your event trajectory in real-time.
                        </p>
                    </div>
                    <button className="btn" style={{
                        background: "white",
                        color: "var(--accent-primary)",
                        width: "100%",
                        padding: "1.1rem",
                        borderRadius: "16px",
                        fontWeight: 950,
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem"
                    }}>
                        <UserPlus size={20} /> Expand Team
                    </button>
                </div>
            </div>
        </div>
    );
}
