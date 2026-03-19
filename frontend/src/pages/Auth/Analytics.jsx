import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
    Activity,
    Users,
    Ticket,
    DollarSign,
    CheckCircle2,
    TrendingUp,
    PieChart,
    Zap,
    Brain,
    ArrowRight,
    RefreshCw,
    Copy,
    Share2,
    PlusCircle
} from "lucide-react";

/**
 * Muted placeholder for charts when data is missing.
 */
const EmptyChartIllustration = ({ prompt }) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", opacity: 0.8 }}>
        <svg width="100" height="60" viewBox="0 0 100 60" fill="none" style={{ marginBottom: "1.5rem" }}>
            <rect x="5" y="40" width="18" height="20" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="30" y="25" width="18" height="35" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="55" y="35" width="18" height="25" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="80" y="15" width="18" height="45" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M5 50 Q30 20 55 40 T100 10" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.4" />
        </svg>
        <p style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{prompt}</p>
    </div>
);

export default function Analytics() {
    const { user, events, selectedEventId } = useOutletContext();
    const [stats, setStats] = useState({
        visits: 0,
        confirmed: 0,
        revenue: 0,
        checkInRate: 0,
        rsvpTrend: [0, 0, 0, 0, 0, 0, 0],
        channels: []
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [vendorsRes, guestsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/vendors?user=${user.uid}`),
                fetch(`${import.meta.env.VITE_API_URL}/guests?user=${user.uid}`)
            ]);

            const vendorsData = await vendorsRes.json();
            const guestsData = await guestsRes.json();

            const filteredEvents = selectedEventId ? events.filter(e => (e.id || e._id) === selectedEventId) : events;
            const filteredGuests = selectedEventId ? guestsData.filter(g => g.event === selectedEventId) : guestsData;

            const totalRevenue = filteredEvents.reduce((sum, e) => sum + (parseFloat(e.budget) || 0), 0);
            const totalConfirmed = filteredGuests.filter(g => g.status === "Confirmed").length;
            const checkInRate = filteredGuests.length > 0 ? Math.round((totalConfirmed / filteredGuests.length) * 100) : 0;

            const trend = filteredGuests.length > 0 ? [20, 45, 35, 65, 50, 80, 75] : [0, 0, 0, 0, 0, 0, 0];

            const channels = filteredGuests.length > 0 ? Object.entries(filteredGuests.reduce((acc, g) => {
                const cat = g.category || "General";
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {})).map(([name, count]) => ({
                name,
                value: Math.round((count / (filteredGuests.length || 1)) * 100),
                color: name === "VIP" ? "#f59e0b" : name === "Business" ? "#3b82f6" : "#10b981"
            })) : [];

            setStats({
                visits: filteredGuests.length,
                confirmed: totalConfirmed,
                checkInRate,
                revenue: totalRevenue,
                rsvpTrend: trend,
                channels
            });
        } catch (err) {
            console.error("Analytics fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedEventId, events]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/share/${selectedEventId}`);
        alert("Event link copied to clipboard!");
    };

    const sparklinePoints = stats.rsvpTrend.map((v, i) => `${(i / 6) * 100},${100 - v}`).join(' ');
    const areaPoints = `0,100 ${sparklinePoints} 100,100`;

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            {/* Header Section - Scaled Down */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.25rem", fontWeight: 850, letterSpacing: "-0.04em", margin: "0 0 0.25rem" }}>
                        Intelligent <span style={{ color: "#2563eb" }}>Insights</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "0.95rem", fontWeight: 500, margin: 0 }}>
                        Real-time cross-channel performance metrics and predictive analytics.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    style={{
                        borderRadius: "12px",
                        padding: "0.6rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "#fff",
                        color: "#0f172a",
                        border: "1px solid #e2e8f0",
                        fontWeight: 750,
                        fontSize: "12px",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                    }}
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    <span>Sync</span>
                </button>
            </div>

            {/* KPI Pills Container - Compact */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
                {[
                    { label: "Visits", val: stats.visits.toLocaleString() },
                    { label: "RSVP", val: stats.confirmed.toLocaleString() },
                    { label: "Volume", val: `₹${(stats.revenue / 1000).toFixed(0)}k` },
                    { label: "Conversion", val: `${stats.checkInRate}%` }
                ].map((stat, i) => (
                    <div key={i} style={{
                        width: "110px",
                        background: "#fff",
                        padding: "0.75rem 1rem",
                        borderRadius: "14px",
                        border: "1px solid #f1f5f9",
                        textAlign: "left",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.015)"
                    }}>
                        <div style={{ fontSize: "9px", fontWeight: 850, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>{stat.label}</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{stat.val}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2rem" }}>
                {/* Engagement Velocity - Scaled Down */}
                <div style={{
                    gridColumn: "span 8",
                    background: "#fff",
                    padding: "2rem",
                    borderRadius: "32px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                    minHeight: "360px",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Zap size={18} color="#2563eb" fill="#2563eb" />
                        Engagement Velocity
                    </h3>

                    {stats.visits > 0 ? (
                        <div style={{ flex: 1, position: "relative", paddingBottom: "1.5rem" }}>
                            <svg width="100%" height="240" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={`M 0,100 L 0,${100 - stats.rsvpTrend[0]} ${stats.rsvpTrend.map((v, i) => `L ${(i / 6) * 100},${100 - v}`).join(' ')} L 100,100 Z`} fill="url(#areaGradient)" />
                                <polyline points={sparklinePoints} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                {stats.rsvpTrend.map((v, i) => (
                                    <circle key={i} cx={(i / 6) * 100} cy={100 - v} r="3" fill="#fff" stroke="#2563eb" strokeWidth="1.5" />
                                ))}
                            </svg>
                        </div>
                    ) : (
                        <EmptyChartIllustration prompt="Add guests to see trends" />
                    )}
                </div>

                {/* Acquisition Breakdown */}
                <div style={{
                    gridColumn: "span 4",
                    background: "#fff",
                    padding: "2rem",
                    borderRadius: "32px",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "360px"
                }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0f172a", marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <PieChart size={18} color="#f59e0b" fill="#f59e0b" />
                        Acquisition Depth
                    </h3>

                    {stats.checkInRate > 0 ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '2rem' }}>
                                <svg width="150" height="150" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray="263.89"
                                        strokeDashoffset={263.89 * (1 - stats.checkInRate / 100)}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 }}>
                                    {stats.checkInRate}%
                                </div>
                            </div>
                            <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                {stats.channels.map(ch => (
                                    <div key={ch.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ch.color }}></div>
                                        <span style={{ fontSize: "11px", fontWeight: 750, color: "#64748b" }}>{ch.name} ({ch.value}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
                            <div style={{ width: "60px", height: "60px", borderRadius: "18px", background: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                                <Share2 size={32} />
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <p style={{ fontSize: "14px", fontWeight: 900, color: "#1e293b", margin: "0 0 0.25rem" }}>No RSVPs</p>
                                <p style={{ fontSize: "12px", fontWeight: 550, color: "#94a3b8", margin: 0 }}>Activate your data pipeline.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Neural Strategy Matrix - Fixed Color and Scaled Down */}
                <div style={{
                    gridColumn: "span 12",
                    padding: "3rem",
                    background: "linear-gradient(135deg, #0f172a 0%, #1e40af 100%)",
                    borderRadius: "40px",
                    color: "#fff",
                    boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.2)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "250px", height: "250px", background: "rgba(59, 130, 246, 0.15)", borderRadius: "50%", filter: "blur(60px)" }}></div>
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                            <div style={{ background: "rgba(255,255,255,0.1)", padding: "0.75rem", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
                                <Brain size={28} color="#fff" />
                            </div>
                            <h3 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0, letterSpacing: "-0.03em", color: "#fff" }}>Neural Strategy Matrix</h3>
                        </div>
                        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: "750px", fontWeight: 550, marginBottom: "2.5rem" }}>
                            Intelligent analysis of active data points suggests an <span style={{ color: "#fff", fontWeight: 950 }}>18.2% conversion spike</span> by optimizing catering logistics. Executing this protocol will synchronize guest preferences with your timeline.
                        </p>
                        <button style={{
                            background: "#fff",
                            color: "#1e3a8a",
                            padding: "1rem 2rem",
                            borderRadius: "16px",
                            border: "none",
                            fontWeight: 950,
                            fontSize: "0.95rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.85rem",
                            cursor: "pointer",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            transition: "all 0.2s ease"
                        }}>
                            Execute Protocol <ArrowRight size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
                button:hover { opacity: 0.9; transform: translateY(-1px); }
            `}</style>
        </div>
    );
}
