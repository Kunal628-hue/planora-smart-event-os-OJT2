import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
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
    PlusCircle,
    TrendingDown,
    Layers,
    Wand2,
    Shield
} from "lucide-react";

/**
 * Premium Neon Chart Placeholder
 */
const CyberChartIllustration = ({ prompt, icon: Icon }) => (
    <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        background: "rgba(15, 23, 42, 0.02)",
        borderRadius: "24px",
        border: "1px dashed rgba(37, 99, 235, 0.2)"
    }}>
        <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(37, 99, 235, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            color: "#2563eb"
        }}>
            {Icon ? <Icon size={28} /> : <PieChart size={28} />}
        </div>
        <p style={{
            fontSize: "12px",
            fontWeight: 800,
            color: "#64748b",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            maxWidth: "200px",
            lineHeight: 1.5
        }}>{prompt}</p>
    </div>
);

export default function Analytics() {
    const navigate = useNavigate();
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

            const trend = filteredGuests.length > 0 ? [24, 52, 38, 71, 55, 88, 82] : [0, 0, 0, 0, 0, 0, 0];

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

    const sparklinePoints = stats.rsvpTrend.map((v, i) => `${(i / 6) * 100},${100 - v}`).join(' ');

    const handleExecute = () => {
        // Since it mentions Catering Protocol, navigate to Vendors
        navigate("/vendors");
    };

    const handleRisk = () => {
        // Navigate to Dashboard where risks are primary
        navigate("/dashboard");
    };

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2rem",
            background: "#fff",
            minHeight: "100vh",
            color: "#0f172a",
            backgroundImage: "radial-gradient(circle at 50% -20%, #eff6ff 0%, #ffffff 50%)"
        }}>
            {/* Ultra-Premium Header - Scaled Down */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ width: "24px", height: "3px", background: "#2563eb", borderRadius: "10px" }}></div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.2em" }}>Strategic Intelligence</span>
                    </div>
                    <h1 style={{ fontSize: "2.25rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0, color: "#0f172a" }}>
                        Tactical <span style={{ color: "#2563eb" }}>Analytics</span>
                    </h1>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={fetchData} className="premium-btn-secondary">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        <span>Resync</span>
                    </button>
                    <button className="premium-btn-primary">
                        <Share2 size={14} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* KPI Executive Strip - Compact */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { label: "Guest Velocity", val: stats.visits.toLocaleString(), icon: Users, color: "#2563eb", trend: "+12%" },
                    { label: "RSVP Conversion", val: stats.confirmed.toLocaleString(), icon: Ticket, color: "#10b981", trend: "+5.2%" },
                    { label: "Strategic Capital", val: `₹${(stats.revenue / 1000).toFixed(1)}k`, icon: DollarSign, color: "#f59e0b", trend: "Target" },
                    { label: "Operational Grip", val: `${stats.checkInRate}%`, icon: Activity, color: "#7e22ce", trend: "Stable" }
                ].map((stat, i) => (
                    <div key={i} className="kpi-card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: `${stat.color}10`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                                <stat.icon size={16} fontWeight={800} />
                            </div>
                            <div style={{ fontSize: "9px", fontWeight: 800, color: stat.color === "#10b981" ? "#059669" : "#64748b", background: stat.color === "#10b981" ? "#d1fae5" : "#f1f5f9", padding: "3px 6px", borderRadius: "4px" }}>{stat.trend}</div>
                        </div>
                        <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", marginBottom: "2px" }}>{stat.val}</div>
                        <div style={{ fontSize: "10px", fontWeight: 750, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Real-time Trajectory Chart - Smaller */}
                <div style={{ gridColumn: "span 8" }} className="analytics-module">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 className="module-title">
                            <TrendingUp size={16} />
                            Strategic Trajectory
                        </h3>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <span className="chart-legend"><div style={{ background: "#2563eb" }}></div> RSVPs</span>
                            <span className="chart-legend"><div style={{ background: "#e2e8f0" }}></div> Projected</span>
                        </div>
                    </div>

                    {stats.visits > 0 ? (
                        <div style={{ flex: 1, position: "relative", minHeight: "200px" }}>
                            <svg width="100%" height="200" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                                <defs>
                                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={`M 0,100 L 0,${100 - stats.rsvpTrend[0]} ${stats.rsvpTrend.map((v, i) => `L ${(i / 6) * 100},${100 - v}`).join(' ')} L 100,100 Z`} fill="url(#chartFill)" />
                                <polyline points={sparklinePoints} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                {stats.rsvpTrend.map((v, i) => (
                                    <g key={i}>
                                        <circle cx={(i / 6) * 100} cy={100 - v} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2" style={{ transition: "all 0.3s ease", cursor: "pointer" }} />
                                    </g>
                                ))}
                            </svg>
                        </div>
                    ) : (
                        <CyberChartIllustration prompt="Awaiting project data for trajectory calculation" icon={TrendingUp} />
                    )}
                </div>

                {/* Distribution Matrix - Smaller */}
                <div style={{ gridColumn: "span 4" }} className="analytics-module">
                    <h3 className="module-title">
                        <PieChart size={16} />
                        Segment Distribution
                    </h3>

                    {stats.checkInRate > 0 ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '1.5rem' }}>
                                <svg width="140" height="140" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 * (1 - stats.checkInRate / 100)}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: "stroke-dashoffset 1s ease-out" }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 900, color: "#0f172a", letterSpacing: "-0.05em" }}>{stats.checkInRate}%</span>
                                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Engagement</span>
                                </div>
                            </div>
                            <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                                {stats.channels.map(ch => (
                                    <div key={ch.name} className="segment-badge">
                                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: ch.color }}></div>
                                        <span>{ch.name}: {ch.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <CyberChartIllustration prompt="Execute guest outreach to populate matrix" icon={Layers} />
                    )}
                </div>
            </div>

            {/* Immersive Tactical Action Card - Scaled Down */}
            <div className="tactical-matrix-card">
                <div style={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "sweep 4s linear infinite" }}></div>
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.1)", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Brain size={24} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0, color: "#fff", letterSpacing: "-0.03em" }}>Neural Strategy Vector</h3>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }}></div>
                                <span style={{ fontSize: "9px", fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live AI Optimization Active</span>
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.5, maxWidth: "700px", fontWeight: 500, marginBottom: "2rem" }}>
                        Planora AI has detected a <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: "5px", fontWeight: 800 }}>+18.2% conversion opportunity</span> in your guest retention pipeline. We recommend initiating the <span style={{ color: "#fff", fontWeight: 900, textDecoration: "underline" }}>Catering Selection Protocol</span>.
                    </p>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button onClick={handleExecute} className="execute-btn">
                            <Wand2 size={16} />
                            Execute Strategy Protocol
                        </button>
                        <button onClick={handleRisk} className="tactical-secondary-btn">
                            <Shield size={16} />
                            Risk Assessment
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .premium-btn-primary {
                    background: #2563eb;
                    color: #fff;
                    padding: 0.85rem 1.75rem;
                    border-radius: 14px;
                    border: none;
                    font-weight: 800;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .premium-btn-secondary {
                    background: #fff;
                    color: #0f172a;
                    padding: 0.85rem 1.75rem;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    font-weight: 800;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .kpi-card {
                    background: #fff;
                    padding: 2rem;
                    border-radius: 28px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.015);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }
                .kpi-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.04);
                    border-color: #2563eb30;
                }
                .analytics-module {
                    background: #fff;
                    padding: 2.5rem;
                    border-radius: 36px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 25px rgba(0,0,0,0.02);
                    display: flex;
                    flex-direction: column;
                }
                .module-title {
                    font-size: 14px;
                    fontWeight: 900;
                    color: #0f172a;
                    margin: 0 0 2.5rem;
                    display: flex;
                    alignHeight: center;
                    gap: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .chart-legend {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748b;
                }
                .chart-legend div {
                    width: 8px;
                    height: 8px;
                    border-radius: 2px;
                }
                .segment-badge {
                    background: #f8fafc;
                    padding: 8px 14px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 11px;
                    font-weight: 800;
                    color: #475569;
                    border: 1px solid #f1f5f9;
                }
                .tactical-matrix-card {
                    grid-column: span 12;
                    padding: 4rem;
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
                    border-radius: 44px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 30px 60px rgba(15, 23, 42, 0.2);
                }
                .execute-btn {
                    background: #fff;
                    color: #1e3a8a;
                    padding: 1.25rem 2.5rem;
                    border-radius: 18px;
                    border: none;
                    font-weight: 900;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }
                .execute-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 20px 45px rgba(0,0,0,0.15);
                }
                .tactical-secondary-btn {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 1.25rem 2rem;
                    border-radius: 18px;
                    border: 1px solid rgba(255,255,255,0.2);
                    font-weight: 800;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }
                .tactical-secondary-btn:hover {
                    background: rgba(255,255,255,0.15);
                }
                @keyframes sweep {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 2s linear infinite; }
            `}</style>
        </div>
    );
}
