import useReveal from "../../hooks/useReveal";

const SECURITY_FEATURES = [
    {
        title: "Role-Based Access Control (RBAC)",
        desc: "Define granular permissions for committee members, volunteers, and vendors to ensure data integrity.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        )
    },
    {
        title: "Secure Cloud Infrastructure",
        desc: "Hosted on encrypted, enterprise-grade cloud servers with automatic threat detection and mitigation.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
        )
    },
    {
        title: "Real-Time Data Backup",
        desc: "Your event data is backed up instantly across multiple regions, ensuring zero data loss under any condition.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
        )
    },
    {
        title: "Scalable Microservice Architecture",
        desc: "Designed to handle high-traffic spikes seamlessly, from small workshops to massive multi-day festivals.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6" y2="6.01" />
                <line x1="6" y1="18" x2="6" y2="18.01" />
            </svg>
        )
    }
];

export default function Security() {
    const revealScale = useReveal("scale-up");

    return (
        <section id="security" className="section-pad" style={{ background: "var(--bg-base)" }}>
            <div className="page-container">
                <div style={{
                    background: "rgba(59, 130, 246, 0.03)",
                    border: "1px solid rgba(59, 130, 246, 0.1)",
                    borderRadius: "2rem",
                    padding: "4rem 3rem",
                    position: "relative",
                    overflow: "hidden"
                }} className={revealScale}>
                    {/* Background Decorative Element */}
                    <div style={{
                        position: "absolute",
                        top: "-10%",
                        right: "-5%",
                        width: "300px",
                        height: "300px",
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
                        filter: "blur(40px)",
                        pointerEvents: "none"
                    }} />

                    <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 4rem" }}>
                        <p className="overline" style={{ marginBottom: "1rem", color: "#3b82f6" }}>Enterprise-Grade Reliability</p>
                        <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.6rem)", marginBottom: "1.5rem" }}>
                            Secure Infrastructure for Strategic Operations
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                            Because operational clarity requires operational security. Planora is built on a foundation of trust.
                        </p>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "2.5rem"
                    }}>
                        {SECURITY_FEATURES.map((feature, i) => (
                            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    background: "rgba(59, 130, 246, 0.1)",
                                    border: "1px solid rgba(59, 130, 246, 0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#3b82f6"
                                }}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem", color: "white" }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
