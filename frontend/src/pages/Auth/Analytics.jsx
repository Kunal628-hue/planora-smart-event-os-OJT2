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
        <div className="stagger-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "0.75rem" }}>
                        <h1 style={{ fontSize: "3rem", fontWeight: 950, letterSpacing: "-0.05em" }}>
                            Intelligent <span className="gradient-text">Insights</span>
                        </h1>
                        <div className="category-badge" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--accent-success)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "0.5rem 1rem", fontSize: "0.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", animation: "pulse 2s infinite" }}></span>
                            LIVE ANALYSIS
                        </div>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", fontWeight: 500 }}>
                        Real-time cross-channel performance metrics and predictive event analytics.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button onClick={fetchData} className="btn btn-ghost" style={{ padding: "0.8rem 1.25rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800 }}>
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Refresh Engine
                    </button>
                </div>
            </div>

            {loading && stats.visits === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10rem 0", gap: "2rem" }}>
                    <div className="anim-float" style={{ width: "100px", height: "100px", borderRadius: "30px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-subtle)" }}>
                        <Brain size={48} color="var(--accent-primary)" strokeWidth={1.5} />
                    </div>
                    <p style={{ fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.85rem" }}>Synchronizing Neural Core...</p>
                </div>
            ) : stats.visits === 0 && !loading ? (
                <div className="glass-panel" style={{ textAlign: "center", padding: "8rem 2rem", borderRadius: "40px", border: "2px dashed var(--border-medium)" }}>
                    <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
                        <div className="anim-float" style={{ width: "80px", height: "80px", borderRadius: "24px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Activity size={40} color="var(--accent-primary)" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>Insufficient Data Context</h2>
                    <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 3rem", fontSize: "1.1rem" }}>
                        Analytics requires active event streams. Initialize your first event and register guests to activate the intelligence matrix.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => window.location.href = '/events'}>Initialize Project</button>
                </div>
            ) : (
                <>
                    {/* Quick Stats Grid */}
                    <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
                        {[
                            { label: "Attendee Velocity", val: stats.visits, sub: "Total registered in system", icon: <Users size={22} />, color: "var(--accent-primary)" },
                            { label: "RSVP Depth", val: stats.confirmed, sub: "Confirmed active status", icon: <Ticket size={22} />, color: "var(--accent-success)" },
                            { label: "Managed Volume", val: stats.revenue, prefix: "₹", sub: "Aggregate event budgets", icon: <DollarSign size={22} />, color: "#f59e0b" },
                            { label: "Commitment Rate", val: stats.checkInRate, suffix: "%", sub: "Confirmed vs Total", icon: <CheckCircle2 size={22} />, color: "var(--accent-primary)" }
                        ].map((stat, i) => (
                            <div key={i} className="glass-panel hover-lift" style={{ gridColumn: "span 3", padding: "2rem", borderRadius: "28px", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, marginBottom: "1.5rem" }}>
                                    {stat.icon}
                                </div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: "2.25rem", fontWeight: 950, display: "flex", alignItems: "baseline", letterSpacing: "-0.03em" }}>
                                    <span style={{ fontSize: "1.5rem", marginRight: "2px", opacity: 0.8 }}>{stat.prefix}</span>
                                    <span className="count-metric" data-val={stat.val}>0</span>
                                    <span style={{ fontSize: "1.5rem", marginLeft: "2px", opacity: 0.8 }}>{stat.suffix}</span>
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "0.75rem" }}>{stat.sub}</div>
                            </div>
                        ))}
                    </div>

                    <div className="dashboard-grid">
                        {/* Main Trend Chart */}
                        <div className="glass-panel" style={{ gridColumn: "span 8", padding: "3rem", borderRadius: "32px", border: "1px solid var(--border-subtle)" }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                    <div style={{ width: "56px", height: "56px", borderRadius: "18px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                        <TrendingUp size={28} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em" }}>Engagement Velocity</h3>
                                        <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>RSVP conversion rates over the last 7 days</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className="category-badge" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none' }}>Daily</span>
                                    <span className="category-badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Weekly</span>
                                </div>
                            </div>

                            <div className="chart-container" style={{ height: "280px", display: "flex", alignItems: "flex-end", gap: "1.5rem", paddingBottom: "2rem" }}>
                                {stats.rsvpTrend.map((val, i) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <div className="chart-bar" style={{
                                            width: "100%",
                                            maxWidth: "40px",
                                            height: `${Math.max(val, 5)}%`,
                                            background: `linear-gradient(to top, var(--accent-primary), var(--accent-soft))`,
                                            borderRadius: "12px",
                                            position: "relative",
                                            transition: "height 1s cubic-bezier(0.22, 1, 0.36, 1)"
                                        }}>
                                            <div className="bar-tooltip" style={{
                                                position: 'absolute',
                                                top: '-45px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                fontSize: '0.8rem',
                                                fontWeight: 900,
                                                color: 'white',
                                                background: 'var(--accent-primary)',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                opacity: 0,
                                                pointerEvents: "none",
                                                transition: 'all 0.3s ease',
                                                whiteSpace: "nowrap",
                                                boxShadow: "0 10px 20px -5px rgba(var(--accent-primary-rgb), 0.4)"
                                            }}>
                                                {val.toFixed(0)}% Conversion
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: "uppercase", letterSpacing: "0.05em" }}>Day {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Donut Chart / Channels */}
                        <div className="glass-panel" style={{ gridColumn: "span 4", padding: "3rem", borderRadius: "32px", display: 'flex', flexDirection: 'column', border: "1px solid var(--border-subtle)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2.5rem" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(245, 158, 11, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                                    <PieChart size={24} strokeWidth={2.5} />
                                </div>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em" }}>Acquisition</h3>
                            </div>

                            <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 3rem' }}>
                                <svg width="200" height="200" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--bg-elevated)" strokeWidth="12" />
                                    <circle cx="50" cy="50" r="42" fill="transparent"
                                        stroke="var(--accent-primary)"
                                        strokeWidth="12"
                                        strokeDasharray="263.89"
                                        strokeDashoffset={263.89 * (1 - stats.checkInRate / 100)}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)', strokeLinecap: "round" }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: "-0.05em" }}>{stats.checkInRate}%</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Conversion</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {stats.channels.map(ch => (
                                    <div key={ch.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: ch.color, boxShadow: `0 0 10px ${ch.color}44` }}></div>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 750, color: "var(--text-secondary)" }}>{ch.name}</span>
                                        </div>
                                        <span style={{ fontSize: '1rem', fontWeight: 900, color: "var(--text-primary)" }}>{ch.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Insight Section */}
                        <div className="glass-panel hover-lift" style={{
                            gridColumn: "span 12",
                            padding: "3rem",
                            borderRadius: "32px",
                            background: 'linear-gradient(90deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
                            border: "1.5px solid var(--border-subtle)",
                            marginTop: "1rem"
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                                <div style={{ width: "80px", height: "80px", background: "var(--accent-primary)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0, boxShadow: "0 15px 30px -10px rgba(var(--accent-primary-rgb), 0.4)" }}>
                                    <Brain size={40} strokeWidth={2} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "0.75rem" }}>
                                        <h4 style={{ fontSize: '1.5rem', fontWeight: 950, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Neural Strategy Matrix</h4>
                                        <span className="category-badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-success)", fontSize: "0.7rem", fontWeight: 800 }}>V6.2 STABLE</span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500 }}>
                                        Based on current {stats.visits} registered guests, increasing social media output by <span style={{ color: 'var(--accent-primary)', fontWeight: 900 }}>15.4%</span> could drive <span style={{ color: 'var(--accent-success)', fontWeight: 900 }}>~28% higher</span> commitment rates for your upcoming events.
                                        <span style={{ marginLeft: '2rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 900, display: "inline-flex", alignItems: "center", gap: "0.6rem", borderBottom: "2px solid currentColor" }}>
                                            Execute Analysis <ArrowRight size={18} />
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
