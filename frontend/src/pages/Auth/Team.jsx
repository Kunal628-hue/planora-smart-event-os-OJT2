import { useOutletContext } from "react-router-dom";
import { UserPlus, UserCircle, Briefcase, Share2, Crown, Activity } from "lucide-react";

export default function Team() {
    const { user } = useOutletContext();
    const teammates = [
        { name: user?.displayName || user?.email?.split('@')[0] || "Owner", role: "Event Lead", status: "Active", icon: <Crown size={20} /> }
    ];

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>
                        Neural <span style={{ color: "#2563eb" }}>Hive</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                        Orchestrate your planning collective and manage permission boundaries.
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2.5rem" }}>
                <div style={{
                    gridColumn: "span 8",
                    background: "#fff",
                    padding: "2.5rem",
                    borderRadius: "40px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Active Collaborators</h3>
                        <span style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontWeight: 800,
                            fontSize: "12px",
                            padding: "6px 14px",
                            borderRadius: "100px",
                            textTransform: "uppercase"
                        }}>1 Member</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {teammates.map((member, i) => (
                            <div key={i} className="member-row" style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1.25rem 1.75rem",
                                background: "#f8fafc",
                                borderRadius: "24px",
                                border: "1px solid #f1f5f9",
                                transition: "all 0.2s ease"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                    <div style={{
                                        width: "52px",
                                        height: "52px",
                                        borderRadius: "16px",
                                        background: member.role === "Event Lead" ? "#fffbeb" : "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: member.role === "Event Lead" ? "#f59e0b" : "#2563eb",
                                        border: "1px solid #f1f5f9",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.03)"
                                    }}>
                                        {member.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 800, fontSize: "1.15rem", color: "#0f172a", margin: 0 }}>{member.name}</h4>
                                        <p style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, margin: "2px 0 0" }}>{member.role}</p>
                                    </div>
                                </div>
                                <div style={{
                                    background: "#f0fdf4",
                                    color: "#10b981",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    textTransform: "uppercase"
                                }}>
                                    {member.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    gridColumn: "span 4",
                    padding: "3rem",
                    borderRadius: "40px",
                    background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ width: "64px", height: "64px", background: "rgba(255,255,255,0.15)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Share2 size={32} strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>Expand the Hive</h3>
                        <p style={{ opacity: 0.8, marginBottom: "3rem", lineHeight: 1.6, fontWeight: 500, fontSize: "1.1rem" }}>
                            Invite multi-disciplinary partners to synchronize on your event trajectory in real-time.
                        </p>
                    </div>
                    <button style={{
                        background: "white",
                        color: "#2563eb",
                        width: "100%",
                        padding: "1.1rem",
                        borderRadius: "18px",
                        fontWeight: 800,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.75rem",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        zIndex: 1
                    }}>
                        <UserPlus size={20} />
                        <span>Expand Team</span>
                    </button>

                    {/* Decorative blobs */}
                    <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
                </div>
            </div>

            <style>{`
                .member-row:hover {
                    background: #fff !important;
                    transform: translateX(8px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
            `}</style>
        </div>
    );
}
