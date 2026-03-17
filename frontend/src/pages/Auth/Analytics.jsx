import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";

export default function Analytics() {
    const { user } = useOutletContext();
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
        try {
            const [eventsRes, vendorsRes, guestsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/events?user=${user.uid}`),
                fetch(`${import.meta.env.VITE_API_URL}/vendors?user=${user.uid}`),
                fetch(`${import.meta.env.VITE_API_URL}/guests?user=${user.uid}`)
            ]);
            const eventsData = await eventsRes.json();
            const vendorsData = await vendorsRes.json();
            const guestsData = await guestsRes.json();

            // Calculate metrics
            const totalRevenue = eventsData.reduce((sum, e) => sum + (e.budget || 0), 0);
            const totalConfirmed = guestsData.filter(g => g.status === "Confirmed").length;
            const checkInRate = guestsData.length > 0 ? Math.round((totalConfirmed / guestsData.length) * 100) : 0;

            // Trend based on guest creation (Last 7 days)
            const now = new Date();
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(now.getDate() - (6 - i));
                return d.toISOString().split('T')[0];
            });

            const trendMap = {};
            last7Days.forEach(date => trendMap[date] = 0);
            guestsData.forEach(g => {
                const date = new Date(g.createdAt).toISOString().split('T')[0];
                if (trendMap[date] !== undefined) trendMap[date]++;
            });

            const trend = Object.values(trendMap);
            // Convert trend counts to percentages for the chart mockup
            const max = Math.max(...trend, 1);
            const trendPercent = trend.map(v => (v / max) * 100);

            // Acquisition (by Guest Category)
            const categories = {};
            guestsData.forEach(g => {
                categories[g.category] = (categories[g.category] || 0) + 1;
            });
            const channels = Object.entries(categories).map(([name, count]) => ({
                name,
                value: Math.round((count / guestsData.length) * 100),
                color: name === "VIP" ? "#f59e0b" : name === "Business" ? "#3b82f6" : "#10b981"
            }));

            setStats({
                visits: guestsData.length,
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
    }, [user]);

    useEffect(() => {
        if (!loading) {
            // Simple entrance animation for bars
            animate('.chart-bar', {
                height: [0, (el) => el.getAttribute('data-height') + '%'],
                easing: 'cubicBezier(.16, 1, .3, 1)',
                duration: 1200,
                delay: stagger(100, { start: 400 })
            });

            // Counter for main metrics
            animate('.count-metric', {
                innerHTML: (el) => [0, el.getAttribute('data-val')],
                round: 1,
                easing: 'easeOutExpo',
                duration: 2000
            });
        }
    }, [loading, stats]);

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: "0.5rem" }}>
                    Intelligent <span className="gradient-text">Insights</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                    Real-time cross-channel performance metrics and predictive event analytics.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
                {[
                    { label: "Attendee Velocity", val: stats.visits, sub: "Total registered in system", icon: "👁️" },
                    { label: "RSVP Depth", val: stats.confirmed, sub: "Confirmed active status", icon: "🎫" },
                    { label: "Managed Volume", val: stats.revenue, prefix: "₹", sub: "Aggregate event budgets", icon: "💰" },
                    { label: "Commitment Rate", val: stats.checkInRate, suffix: "%", sub: "Confirmed vs Total", icon: "✅" }
                ].map((stat, i) => (
                    <div key={i} className="glass-panel" style={{ gridColumn: "span 3", padding: "1.75rem", borderRadius: "24px" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{stat.icon}</div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 750, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                            {stat.label}
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 900, display: "flex", alignItems: "baseline" }}>
                            {stat.prefix}
                            <span className="count-metric" data-val={stat.val}>0</span>
                            {stat.suffix}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 700, marginTop: "0.5rem" }}>{stat.sub}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Main Trend Chart */}
                <div className="glass-panel" style={{ gridColumn: "span 8", padding: "2.5rem", borderRadius: "32px" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 850 }}>Engagement Velocity</h3>
                            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>RSVP conversion rates over the last 7 days</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="category-badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}>Daily</span>
                            <span className="category-badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Weekly</span>
                        </div>
                    </div>
                    
                    <div className="chart-container">
                        {stats.rsvpTrend.map((val, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div className="chart-bar" data-height={val} style={{ height: `${val}%` }}>
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '-35px', 
                                        left: '50%', 
                                        transform: 'translateX(-50%)',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: 'var(--text-primary)',
                                        background: 'var(--bg-card)',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-subtle)',
                                        opacity: 0,
                                        transition: 'all 0.3s ease'
                                    }} className="bar-tooltip">
                                        {val}%
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Day {i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Donut Chart / Channels */}
                <div className="glass-panel" style={{ gridColumn: "span 4", padding: "2.5rem", borderRadius: "32px", display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: 850, marginBottom: '2rem' }}>Acquisition</h3>
                    
                    <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 2.5rem' }}>
                        {/* Custom SVG Donut */}
                        <svg width="180" height="180" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--bg-elevated)" strokeWidth="12" />
                            {/* Simple mocked segments */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="62.8" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="188.4" style={{ transform: 'rotate(0deg)', transformOrigin: 'center' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>82%</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Conv.</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.channels.map(ch => (
                            <div key={ch.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ch.color }}></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{ch.name}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{ch.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insight Section */}
                <div className="glass-panel" style={{ gridColumn: "span 12", padding: "2rem", borderRadius: "24px", background: 'linear-gradient(90deg, var(--bg-card) 0%, var(--bg-elevated) 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '60px', height: '60px', background: 'var(--accent-primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                            🤖
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 850, marginBottom: '0.25rem' }}>AI recommendation for your next event</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                Based on current RSVP trends, increasing social media spend by <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>15%</span> could result in <span style={{ color: 'var(--accent-success)', fontWeight: 800 }}>200+ additional guests</span>. 
                                <span style={{ marginLeft: '1rem', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>Apply Strategy →</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
