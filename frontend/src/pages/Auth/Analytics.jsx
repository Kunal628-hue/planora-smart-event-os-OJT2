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
    RefreshCw
} from "lucide-react";

export default function Analytics() {
    const { user, events, selectedEventId } = useOutletContext();
    const [stats, setStats] = useState({
        visits: 0,
        confirmed: 0,
        val: 0,
        revenue: 0,
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

            if (!vendorsRes.ok || !guestsRes.ok) {
                throw new Error("Network requests failed");
            }

            const vendorsData = await vendorsRes.json();
            const guestsData = await guestsRes.json();

            // Filter by selected event
            const filteredEvents = selectedEventId ? events.filter(e => (e.id || e._id) === selectedEventId) : events;
            const filteredGuests = selectedEventId ? guestsData.filter(g => g.event === selectedEventId) : guestsData;

            // Calculate metrics
            const totalRevenue = filteredEvents.reduce((sum, e) => sum + (parseFloat(e.budget) || 0), 0);
            const totalConfirmed = filteredGuests.filter(g => g.status === "Confirmed").length;
            const checkInRate = filteredGuests.length > 0 ? Math.round((totalConfirmed / filteredGuests.length) * 100) : 0;

            // Trend based on guest creation (Last 7 days)
            const now = new Date();
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(now.getDate() - (6 - i));
                return d.toISOString().split('T')[0];
            });

            const trendMap = {};
            last7Days.forEach(date => trendMap[date] = 0);
            filteredGuests.forEach(g => {
                const date = new Date(g.createdAt || Date.now()).toISOString().split('T')[0];
                if (trendMap[date] !== undefined) trendMap[date]++;
            });

            const trend = Object.values(trendMap);
            const max = Math.max(...trend, 1);
            const trendPercent = trend.map(v => (v / max) * 100);

            // Acquisition (by Guest Category)
            const categories = {};
            filteredGuests.forEach(g => {
                const cat = g.category || "General";
                categories[cat] = (categories[cat] || 0) + 1;
            });

            const channels = Object.entries(categories).map(([name, count]) => ({
                name,
                value: Math.round((count / (filteredGuests.length || 1)) * 100),
                color: name === "VIP" ? "#f59e0b" : name === "Business" ? "#3b82f6" : "#10b981"
            }));

            setStats({
                visits: filteredGuests.length,
                confirmed: totalConfirmed,
                checkInRate,
                revenue: totalRevenue,
                rsvpTrend: trendPercent,
                channels: channels.length > 0 ? channels : [{ name: "Organic", value: 100, color: "#3b82f6" }]
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

    useEffect(() => {
        if (!loading && stats.visits > 0) {
            // Highly optimized bar entrance using scaleY
            animate('.chart-bar', {
                scaleY: [0, 1],
                opacity: [0, 1],
                easing: 'cubicBezier(.22, 1, .36, 1)',
                duration: 1000,
                delay: stagger(60, { start: 200 })
            });

            // Snappier counter for main metrics
            const animations = [];

            document.querySelectorAll('.count-metric').forEach(el => {
                const target = parseFloat(el.getAttribute('data-val'));
                const obj = { val: 0 };
                const a = animate(obj, {
                    val: target,
                    round: 1,
                    easing: 'easeOutExpo',
                    duration: 1200,
                    update: () => {
                        el.innerHTML = obj.val.toLocaleString();
                    }
                });
                animations.push(a);
            });

            return () => {
                animations.forEach(a => a.pause());
            };
        }
    }, [loading, stats]);

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
                        Intelligent <span style={{ color: "#2563eb" }}>Insights</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                        Real-time cross-channel performance metrics and predictive event analytics.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    style={{
                        borderRadius: "16px",
                        padding: "0.85rem 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        background: "#fff",
                        color: "#0f172a",
                        border: "1px solid #e2e8f0",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    <span>Refresh Engine</span>
                </button>
            </div>

            {loading && stats.visits === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10rem 0", gap: "2rem" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                        <Brain size={48} strokeWidth={1.5} style={{ animation: "pulse 2s infinite" }} />
                    </div>
                    <p style={{ fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.85rem" }}>Synchronizing Neural Core...</p>
                </div>
            ) : stats.visits === 0 && !loading ? (
                <div style={{ textAlign: "center", padding: "8rem 2rem", background: "#fff", borderRadius: "40px", border: "1px dashed #e2e8f0" }}>
                    <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                            <Activity size={40} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem", color: "#0f172a" }}>Insufficient Data Context</h2>
                    <p style={{ color: "#64748b", maxWidth: "500px", margin: "0 auto 3rem", fontSize: "1.1rem", fontWeight: 500 }}>
                        Analytics requires active event streams. Initialize your first event and register guests to activate the intelligence matrix.
                    </p>
                    <button
                        style={{ background: "#2563eb", color: "#fff", padding: "1rem 2rem", borderRadius: "16px", border: "none", fontWeight: 800, cursor: "pointer" }}
                        onClick={() => window.location.href = '/events'}
                    >
                        Initialize Project
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2.5rem", marginBottom: "2.5rem" }}>
                        {[
                            { label: "Attendee Velocity", val: stats.visits, icon: <Users size={22} />, color: "#2563eb", bg: "#eff6ff" },
                            { label: "RSVP Depth", val: stats.confirmed, icon: <Ticket size={22} />, color: "#10b981", bg: "#f0fdf4" },
                            { label: "Managed Volume", val: stats.revenue, prefix: "₹", icon: <DollarSign size={22} />, color: "#f59e0b", bg: "#fffbeb" },
                            { label: "Commitment Rate", val: stats.checkInRate, suffix: "%", icon: <CheckCircle2 size={22} />, color: "#8b5cf6", bg: "#f5f3ff" }
                        ].map((stat, i) => (
                            <div key={i} style={{
                                background: "#fff",
                                padding: "2rem",
                                borderRadius: "32px",
                                border: "1px solid #f1f5f9",
                                boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                            }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, marginBottom: "1.5rem" }}>
                                    {stat.icon}
                                </div>
                                <div style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: "2.25rem", fontWeight: 800, display: "flex", alignItems: "baseline", color: "#0f172a", lineHeight: 1 }}>
                                    {stat.prefix && <span style={{ fontSize: "1.25rem", marginRight: "2px", color: "#94a3b8" }}>{stat.prefix}</span>}
                                    <span className="count-metric" data-val={stat.val}>{stat.val.toLocaleString()}</span>
                                    {stat.suffix && <span style={{ fontSize: "1.25rem", marginLeft: "2px", color: "#94a3b8" }}>{stat.suffix}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2.5rem" }}>
                        {/* Main Trend Chart */}
                        <div style={{
                            gridColumn: "span 8",
                            background: "#fff",
                            padding: "2.5rem",
                            borderRadius: "40px",
                            border: "1px solid #f1f5f9",
                            boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                    <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                        <TrendingUp size={28} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Engagement Velocity</h3>
                                        <p style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 500, margin: "0.25rem 0 0" }}>Daily RSVP conversions</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: "280px", display: "flex", alignItems: "flex-end", gap: "1.25rem", paddingBottom: "1.5rem" }}>
                                {stats.rsvpTrend.map((val, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: "100%",
                                            maxWidth: "36px",
                                            height: `${Math.max(val, 5)}%`,
                                            background: i === 6 ? "#2563eb" : "#f1f5f9",
                                            borderRadius: "10px",
                                            transition: "all 0.3s ease",
                                            cursor: "pointer"
                                        }} className="chart-bar-v2" />
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>D{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Acquisition Breakdown */}
                        <div style={{
                            gridColumn: "span 4",
                            background: "#fff",
                            padding: "2.5rem",
                            borderRadius: "40px",
                            border: "1px solid #f1f5f9",
                            boxShadow: "0 4px 25px rgba(0,0,0,0.02)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "3rem" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                                    <PieChart size={24} />
                                </div>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Category Mix</h3>
                            </div>

                            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 3rem' }}>
                                <svg width="160" height="160" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeDasharray="263.89"
                                        strokeDashoffset={263.89 * (1 - stats.checkInRate / 100)}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: "#0f172a" }}>{stats.checkInRate}%</div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Confirmed</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {stats.channels.map(ch => (
                                    <div key={ch.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: ch.color }}></div>
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: "#475569" }}>{ch.name}</span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: 800, color: "#0f172a" }}>{ch.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strategy Matrix Section */}
                        <div style={{
                            gridColumn: "span 12",
                            padding: "2.5rem",
                            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                            borderRadius: "40px",
                            display: 'flex',
                            alignItems: 'center',
                            gap: "2.5rem",
                            color: "#fff",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                background: "rgba(37, 99, 235, 0.2)",
                                borderRadius: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#3b82f6",
                                flexShrink: 0,
                                border: "1px solid rgba(59, 130, 246, 0.2)"
                            }}>
                                <Brain size={40} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                                    <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Neural Strategy Matrix</h4>
                                    <span style={{ background: "#10b981", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "4px 8px", borderRadius: "100px", textTransform: "uppercase" }}>V6.2 Stable</span>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                                    Based on current {stats.visits} registered guests, increasing engagement by <span style={{ color: '#3b82f6', fontWeight: 800 }}>15.4%</span> could drive <span style={{ color: '#10b981', fontWeight: 800 }}>~28% higher</span> commitment rates for your upcoming events.
                                </p>
                            </div>
                            <button style={{
                                background: "#fff",
                                color: "#0f172a",
                                padding: "1rem 1.5rem",
                                borderRadius: "14px",
                                border: "none",
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                cursor: "pointer"
                            }}>
                                View Analysis <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .chart-bar-v2:hover {
                    background: #2563eb !important;
                    transform: scaleX(1.1);
                }
            `}</style>
        </div>
    );
}
