import { useOutletContext } from "react-router-dom";

export default function Team() {
    const { user } = useOutletContext();
    const teammates = [
        { name: user?.displayName || user?.email?.split('@')[0] || "Owner", role: "Event Lead", status: "Active", avatar: "👑" }
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
                                        background: "var(--bg-card)", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center",
                                        fontSize: "1.5rem",
                                        border: "1px solid var(--border-subtle)"
                                    }}>
                                        {member.avatar}
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

                <div className="glass-panel" style={{ gridColumn: "span 4", padding: "2.5rem", borderRadius: "32px", background: "linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)", color: "white" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>📡</div>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "1rem" }}>Expand the Hive</h3>
                    <p style={{ opacity: 0.9, marginBottom: "2rem", lineHeight: 1.6, fontWeight: 500 }}>
                        Invite multi-disciplinary partners to synchronize on your event trajectory in real-time.
                    </p>
                    <button className="btn" style={{ 
                        background: "white", 
                        color: "var(--accent-primary)", 
                        width: "100%", 
                        padding: "1rem", 
                        borderRadius: "12px", 
                        fontWeight: 900,
                        boxShadow: "0 10px 20px -5px rgba(0,0,0,0.2)"
                    }}>
                        Expand Team
                    </button>
                </div>
            </div>
        </div>
    );
}
